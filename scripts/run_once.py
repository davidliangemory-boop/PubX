# -*- coding: utf-8 -*-
"""单批次编排：检索 → 去重 → PDF → 筛选门 → 25字段分析 → 摘录页码 → 入库 → 生成 data.js。

退出码：0=有更新已入库；10=本时段无更新（工作流据此跳过提交与部署）；
1=硬错误（工作流判失败并保留现场）。
用法：
  python3 scripts/run_once.py            # 当日日批次（北京时间）
  python3 scripts/run_once.py --date 2026-10-22        # 扫描该日北京时间 00:00-24:00
  python3 scripts/run_once.py --backfill-days 20       # 回溯重叠窗口天数（默认 20）
  python3 scripts/run_once.py --dry-run  # 只检索+下载+抽取，不调LLM（本地验证用）
  python3 scripts/run_once.py --rebuild  # 不抓取，仅按 db.json 重建 data.js

批次命名（docs/schema.md §6）：日批次 D-YYYYMMDD；同一自然日多次运行合并进同一
日批次（累加计数、追加说明），不再按 HHMM 另立新批次；回溯批次 B-YYYYMMDD 由
backfill_pull.py 链路产生；出口管制周批 W-YYYYWW。
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

    def argval(flag, default=None):
        if flag in sys.argv:
            i = sys.argv.index(flag)
            if i + 1 < len(sys.argv):
                return sys.argv[i + 1]
        return default

    today = datetime.datetime.now(TZ).date()
    run_date = today
    if argval("--date"):
        run_date = datetime.date.fromisoformat(argval("--date"))
    backfill_days = int(argval("--backfill-days", "20"))
    edate = run_date.isoformat()
    sdate = (run_date - datetime.timedelta(days=backfill_days)).isoformat()
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

    batch_id = "D-" + run_date.strftime("%Y%m%d")
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
    window = f"{edate}（北京时间当日 00:00–24:00；回溯重叠窗口 {sdate} ~ {edate}）"
    existing = next((b for b in db["batches"] if b.get("id") == batch_id), None)
    if existing:
        # 同一自然日多轮运行合并进同一日批次：累加计数、追加说明，不另立批次
        existing["time"] = now_str()
        existing["scanned"] = existing.get("scanned", 0) + len(cands)
        existing["kept"] = existing.get("kept", 0) + len(kept)
        existing["excluded"] = existing.get("excluded", 0) + len(excluded_ids)
        existing["failed"] = existing.get("failed", 0) + len(failed)
        existing["items"] = sorted(set(existing.get("items", [])) | set(kept))
        existing["note"] = (existing.get("note", "").rstrip("。") + f"；{now_str()[11:]} 轮：" + note + "。")
        existing["window"] = window
        if "runs" in existing:
            existing["runs"] += 1
        else:
            existing["runs"] = 2
    else:
        db["batches"].insert(0, {
            "id": batch_id, "time": now_str(), "window": window,
            "source": "巨潮资讯", "scanned": len(cands), "kept": len(kept),
            "excluded": len(excluded_ids), "failed": len(failed),
            "items": kept, "note": note + "。", "runs": 1,
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
