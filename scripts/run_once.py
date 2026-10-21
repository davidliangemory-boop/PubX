# -*- coding: utf-8 -*-
"""单批次编排：检索 → 去重 → PDF → 筛选门 → 25字段分析 → 摘录页码 → 入库 → 生成 data.js。

退出码：0=有更新已入库；10=本时段无更新（工作流据此跳过提交与部署）；
1=硬错误（工作流判失败并保留现场）。
用法：
  python3 scripts/run_once.py            # 正常批次
  python3 scripts/run_once.py --dry-run  # 只检索+下载+抽取，不调LLM（本地验证用）
  python3 scripts/run_once.py --rebuild  # 不抓取，仅按 db.json 重建 data.js
"""
import json, os, sys, datetime, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import cninfo, analyze  # noqa: E402

DB_PATH = os.path.join(ROOT, "state", "db.json")
CFG_PATH = os.path.join(ROOT, "state", "config.json")
WORK = os.path.join(ROOT, "state", "tmp")

TZ = datetime.timezone(datetime.timedelta(hours=8))


def now_str():
    return datetime.datetime.now(TZ).strftime("%Y-%m-%d %H:%M")


def load(p):
    return json.load(open(p, encoding="utf-8"))


def save(db):
    json.dump(db, open(DB_PATH, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


def sec_code(item):
    c = item.get("secCode") or ""
    if c.startswith(("6", "9")):
        return c + ".SH"
    if c.startswith(("4", "8")):
        return c + ".BJ"
    return c + ".SZ"


def main():
    db = load(DB_PATH)
    cfg = load(CFG_PATH)
    dry = "--dry-run" in sys.argv
    if "--rebuild" in sys.argv:
        return rebuild()

    today = datetime.datetime.now(TZ).date()
    sdate = (today - datetime.timedelta(days=2)).isoformat()
    edate = today.isoformat()
    scanned_before = set(db["collected"]["scanned"])
    cands = [c for c in cninfo.search(sdate, edate, cfg["keywords"])
             if c["announcementId"] not in scanned_before]
    print(f"窗口 {sdate}~{edate}，命中 {len(cands)} 条新候选")
    if not cands:
        print("本时段无更新")
        return 10
    if dry:
        for c in cands:
            print(" [候选]", c["announcementId"], c["secName"], c["title"])
        return 10

    batch_id = "B-" + datetime.datetime.now(TZ).strftime("%Y%m%d-%H%M")
    kept, excluded_ids, failed = [], [], []
    exceptions = []
    tracked_new = []
    notes_inc, notes_exc = [], {}

    for c in cands:
        aid = c["announcementId"]
        try:
            got = cninfo.fetch_announcement(c, WORK)
        except Exception as e:
            failed.append(aid)
            exceptions.append({"time": now_str(), "type": "读取失败",
                               "detail": f"{c['secName']}（{aid}）PDF下载/解析失败：{e}",
                               "result": "记入failed，下一批次重叠窗口自动重试。"})
            print(f" [fail] {aid} {e}")
            continue
        pages = got["pages"]
        head = cninfo.flatten(pages[:2], limit=2500)
        g = analyze.gate(c["title"], head)
        print(f" [gate:{ '收' if g['include'] else '排'}] {c['secName']} {c['title']} — {g['category']}")

        if not g["include"]:
            excluded_ids.append(aid)
            cat = g["category"]
            notes_exc[cat] = notes_exc.get(cat, 0) + 1
            if cat in ("名称误匹配",):
                exceptions.append({"time": now_str(), "type": "误匹配剔除",
                                   "detail": f"{c['secName']}（{aid}）被'{c['keywords'][0]}'命中：{c['title']}。原因：{g['reason']}",
                                   "result": "已剔除并记入排除清单。"})
            if cat in ("弱信号", "纯制度文件"):
                tracked_new.append({"aid": aid, "company": c["secName"],
                                    "title": c["title"], "reason": f"{g['category']}：{g['reason']}"})
            continue

        try:
            full = cninfo.flatten(pages, limit=30000)
            r = analyze.analyze(c["title"], full)
        except Exception as e:
            failed.append(aid)
            exceptions.append({"time": now_str(), "type": "分析失败",
                               "detail": f"{c['secName']}（{aid}）LLM分析失败：{e}",
                               "result": "未入库；重叠窗口内下批次将重试。"})
            print(f" [fail] analyze {aid} {e}")
            continue

        ts = datetime.datetime.fromtimestamp((c["time"] or 0) / 1000, TZ)
        rec = {
            "序号": "0",  # build_data 统一重排
            "披露日期与时间": ts.strftime("%Y-%m-%d"),
            "公司全称": r["fields"].pop("公司全称", "") or c["secName"],
            "股票代码": sec_code(c),
            "公告标题": c["title"],
            "来源链接": cninfo.pdf_url(c),
            "_aid": aid,
            "摘录": cninfo.locate_quotes(pages, r["quotes"]),
            "未披露事项": r["undisclosed"],
        }
        rec.update(r["fields"])
        db["disclosures"].append(rec)
        kept.append(aid)
        notes_inc.append(f"{c['secName']}（{rec['动作类型']}）")
        # 连续案例判断更新：该公司已有历史事件时调用
        priors = [d for d in db["disclosures"][:-1]
                  if d["公司全称"] == rec["公司全称"]]
        if priors:
            try:
                evs = sorted(priors + [rec], key=lambda d: d["披露日期与时间"])
                cu = analyze.case_update(rec["公司全称"], [{
                    "date": d["披露日期与时间"], "title": d["公告标题"],
                    "stage": d["动作阶段"], "summary": d["对主营业务的战略价值"],
                } for d in evs])
                db.setdefault("case_state", {})[rec["公司全称"]] = cu
            except Exception as e:
                exceptions.append({"time": now_str(), "type": "案例更新失败",
                                   "detail": f"{rec['公司全称']}案例判断更新失败：{e}",
                                   "result": "已入库，案例页待重建时兜底展示。"})

    db["collected"]["scanned"] = sorted(scanned_before | {c["announcementId"] for c in cands})
    db["collected"]["kept"] = sorted(set(db["collected"]["kept"]) | set(kept))
    db["collected"]["excluded"] = sorted(set(db["collected"]["excluded"]) | set(excluded_ids))
    if cands:
        db["cursor"]["last_id"] = max(db["cursor"]["last_id"],
                                      max(c["announcementId"] for c in cands))
    db["tracked"].extend(tracked_new)
    db["exceptions"].extend(exceptions)
    db["exceptions"] = db["exceptions"][-50:]

    exc_note = "；".join(f"{k}{v}条" for k, v in notes_exc.items())
    note = ("收录：" + "、".join(notes_inc) if notes_inc else "本时段无新增收录")
    if exc_note:
        note += f"；排除：{exc_note}"
    if failed:
        note += f"；失败待重试：{len(failed)}条"
    db["batches"].insert(0, {
        "id": batch_id, "time": now_str(), "window": f"{sdate} ~ {edate}（2日重叠窗口）",
        "source": "巨潮资讯", "scanned": len(cands), "kept": len(kept),
        "excluded": len(excluded_ids), "failed": len(failed),
        "items": kept, "note": note + "。",
    })
    save(db)
    print(f"批次 {batch_id}：收录{len(kept)} 排除{len(excluded_ids)} 失败{len(failed)}")
    return rebuild()


def rebuild():
    r = subprocess.run([sys.executable, os.path.join(HERE, "build_data.py")])
    return 0 if r.returncode == 0 else 1


if __name__ == "__main__":
    try:
        sys.exit(main())
    except SystemExit:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        sys.exit(1)
