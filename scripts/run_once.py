# -*- coding: utf-8 -*-
"""出海日批次：采集 → 原文缓存 → Kimi Code 三步审核 → 事件归并 → 构建。

python3 scripts/run_once.py --date 2026-10-22
python3 scripts/run_once.py --backfill-days 20
python3 scripts/run_once.py --dry-run  # 仅列候选
python3 scripts/run_once.py --rebuild

无 API key 依赖。审核接口见 docs/collection_pipeline.md。
退出0：本批次完成（可能零新增）；1：错误或尚有待审候选；10：dry-run。
构建前先验证，ops 运行器还会复验构建结果；不提交、不推送。
"""
import json, os, sys, datetime, subprocess
from pathlib import Path

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
    return json.loads(Path(p).read_text(encoding="utf-8"))


def save(db):
    Path(DB_PATH).write_text(json.dumps(db, ensure_ascii=False, indent=1), encoding="utf-8")


def sec_code(item):
    c = item.get("secCode") or ""
    if c.startswith(("6", "9")):
        return c + ".SH"
    if c.startswith(("4", "8")):
        return c + ".BJ"
    return c + ".SZ"


def main():
    import argparse
    parser = argparse.ArgumentParser(description="出海信披日批次：采集、原文缓存、Kimi Code审核结果入库")
    parser.add_argument("--date", type=datetime.date.fromisoformat)
    parser.add_argument("--backfill-days", type=int, default=20)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--rebuild", action="store_true")
    args = parser.parse_args()
    if args.backfill_days < 1: parser.error("--backfill-days 必须大于0")
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
    is_backfill = "--backfill-days" in sys.argv and "--date" not in sys.argv
    if is_backfill:
        edate = (today - datetime.timedelta(days=1)).isoformat()
    sdate = (today - datetime.timedelta(days=backfill_days)).isoformat() if is_backfill else edate
    cursor_path = os.path.join(ROOT, "state/backfill_cursor.json")
    if is_backfill and os.path.exists(cursor_path):
        cursor = load(cursor_path)
        if cursor.get("status") == "pending":
            sdate, edate = cursor["window_start"], cursor["window_end"]
    scanned_before = set(db["collected"]["scanned"])
    search_error = None
    try:
        cands = [c for c in cninfo.search(sdate, edate, cfg["keywords"])
                 if c["announcementId"] not in scanned_before]
    except Exception as e:
        search_error = str(e)
        cands = []
        print(f" [fail] 检索未完成，仍接续本窗口缓存候选：{e}")
    # 已落盘的待审资料不依赖源站再次命中；仅接续本次日期窗口。
    by_id = {c['announcementId']: c for c in cands}
    for pending_file in Path(ROOT, 'state/pending').glob('*.json'):
        pending = load(pending_file)
        c = pending.get('candidate', {})
        aid = c.get('announcementId')
        date = datetime.datetime.fromtimestamp((c.get('time') or 0) / 1000, TZ).date().isoformat()
        if aid and aid not in scanned_before and sdate <= date <= edate:
            by_id.setdefault(aid, c)
    cands = list(by_id.values())
    print(f"窗口 {sdate}~{edate}，命中 {len(cands)} 条新候选")
    if dry:
        for c in cands:
            print(" [候选]", c["announcementId"], c["secName"], c["title"])
        return 10

    batch_id = ("B-" if is_backfill else "D-") + run_date.strftime("%Y%m%d")
    if is_backfill and os.path.exists(cursor_path) and cursor.get("status") == "pending":
        batch_id = cursor.get("batch_id", batch_id)
    kept, excluded_ids, failed = [], [], []
    exceptions = []
    if search_error:
        exceptions.append({"time": now_str(), "type": "检索失败", "detail": search_error,
                           "result": "只接续缓存候选；窗口覆盖未完成，须重跑。"})
    tracked_new = []
    notes_inc, notes_exc = [], {}

    # 下载之前即保存候选；源站短暂消失不应丢失失败重试任务。
    for c in cands:
        aid = c["announcementId"]
        pending_path = Path(ROOT, 'state/pending', aid + '.json')
        pending_path.parent.mkdir(parents=True, exist_ok=True)
        if not pending_path.exists():
            pending_path.write_text(json.dumps({"doc_id": aid, "candidate": c,
                "raw_path": "raw/" + aid + ".txt", "batch_id": batch_id,
                "status": "awaiting_raw"}, ensure_ascii=False, indent=2))
        try:
            raw_path = os.path.join(ROOT, "raw", aid + ".txt")
            got = {"pages": Path(raw_path).read_text(encoding="utf-8").split("\f")} if os.path.exists(raw_path) else cninfo.fetch_announcement(c, WORK)
        except Exception as e:
            failed.append(aid)
            exceptions.append({"time": now_str(), "type": "读取失败",
                               "detail": f"{c['secName']}（{aid}）PDF下载/解析失败：{e}",
                               "result": "记入failed，下一批次重叠窗口自动重试。"})
            print(f" [fail] {aid} {e}")
            continue
        pages = got["pages"]
        pending = load(pending_path)
        pending.update(status='awaiting_analysis', steps=['extract_facts', 'legal_map', 'judge'])
        pending_path.write_text(json.dumps(pending, ensure_ascii=False, indent=2))
        # 默认由 Kimi Code 直接读取原文；结果文件未就绪时保持可重试，不消费主键。
        review_dir = os.path.join(ROOT, "state", "analysis")
        os.makedirs(review_dir, exist_ok=True)
        review_path = os.path.join(review_dir, aid + ".json")
        if not os.path.exists(review_path):
            pending = os.path.join(ROOT, "state", "pending")
            os.makedirs(pending, exist_ok=True)
            json.dump({"doc_id": aid, "candidate": c, "raw_path": "raw/" + aid + ".txt",
                       "batch_id": batch_id, "steps": ["extract_facts", "legal_map", "judge"],
                       "status": "awaiting_analysis"},
                      open(os.path.join(pending, aid + ".json"), "w"), ensure_ascii=False, indent=2)
            failed.append(aid)
            print(" [pending] Kimi Code 请读原文后写入 " + review_path)
            continue
        try:
            analyze.use_review(review_path, pages)
        except Exception as e:
            failed.append(aid)
            print(f" [fail] review {aid}: {e}")
            continue
        head = cninfo.flatten(pages[:2], limit=2500)
        g = analyze.gate(c["title"], head)
        print(f" [gate:{ '收' if g['include'] else '排'}] {c['secName']} {c['title']} — {g['category']}")

        if not g["include"]:
            excluded_ids.append(aid)
            pending_path = Path(ROOT, 'state/pending', aid + '.json')
            if pending_path.exists():
                pending = load(pending_path)
                pending.update(status='excluded', reason=g.get('reason'), reviewed_at=now_str())
                pending_path.write_text(json.dumps(pending, ensure_ascii=False, indent=2))
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
        review = analyze.REVIEW
        if not review.get("event"):
            failed.append(aid)
            print(" [pending] 缺少审核后的 event v2，暂不入库 " + aid)
            continue
        from event_merge import merge
        event_path = os.path.join(ROOT, "state/events.json")
        store = load(event_path)
        try:
            if aid not in {x.get("doc_id") for x in review["event"].get("sources", [])}:
                raise ValueError("event.sources 缺少本条 doc_id")
            merge(store, review["event"], batch_id, review.get("update_type", "new"),
                  review.get("target_id"), review.get("reason"))
        except Exception as e:
            failed.append(aid)
            print(f" [fail] event_merge {aid}: {e}")
            continue
        json.dump(store, open(event_path, "w"), ensure_ascii=False, indent=1)
        rec["analysis_steps"] = analyze.REVIEW["steps"]
        pending_path = os.path.join(ROOT, "state/pending", aid + ".json")
        if os.path.exists(pending_path):
            pending = load(pending_path)
            pending["status"] = "ingested"
            json.dump(pending, open(pending_path, "w"), ensure_ascii=False, indent=2)
        if is_backfill:
            rec["found_by"] = "backfill"
        db["disclosures"].append(rec)
        kept.append(aid)
        notes_inc.append(f"{c['secName']}（{rec['动作类型']}）")
        # 连续案例判断更新：该公司已有历史事件时调用
        current_event = store["docs"][aid]["event_id"]
        priors = [d for d in db["disclosures"][:-1]
                  if store["docs"].get(d.get("_aid"), {}).get("event_id") == current_event]
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

    db["collected"]["scanned"] = sorted(scanned_before | set(kept) | set(excluded_ids))
    db["collected"]["kept"] = sorted(set(db["collected"]["kept"]) | set(kept))
    db["collected"]["excluded"] = sorted(set(db["collected"]["excluded"]) | set(excluded_ids))
    if cands:
        db["cursor"]["last_id"] = max(db["cursor"]["last_id"],
                                      max(c["announcementId"] for c in cands))
    db["tracked"].extend(tracked_new)
    db["exceptions"].extend(exceptions)
    db["exceptions"] = db["exceptions"][-50:]

    exc_note = "；".join(f"{k}{v}条" for k, v in notes_exc.items())
    note = ("收录：" + "、".join(notes_inc) if notes_inc else "本日批次本轮无新增收录")
    if search_error:
        note += "；检索失败，窗口覆盖未完成（仅处理缓存候选，不代表零新增）"
    if exc_note:
        note += f"；排除：{exc_note}"
    if failed:
        note += f"；失败待重试：{len(failed)}条"
    window = f"{sdate} ~ {edate}（北京时间 00:00–24:00）"
    existing = next((b for b in db["batches"] if b.get("id") == batch_id), None)
    if existing:
        # 同一自然日多轮运行合并进同一日批次：累加计数、追加说明，不另立批次
        existing["time"] = now_str()
        # scanned 是去重候选数，attempts 是处理尝试数；不能因待审重跑膨胀。
        previous_ids = set(existing.get("candidate_ids", []))
        existing.setdefault("legacy_scanned", existing.get("scanned", 0) if not previous_ids else 0)
        existing["candidate_ids"] = sorted(previous_ids | {c["announcementId"] for c in cands})
        existing["scanned"] = existing["legacy_scanned"] + len(existing["candidate_ids"])
        existing["candidate_attempts"] = existing.get("candidate_attempts", 0) + len(cands)
        existing["kept"] = existing.get("kept", 0) + len(kept)
        existing["excluded"] = existing.get("excluded", 0) + len(excluded_ids)
        # failed 为当前未解决候选，失败尝试数另列，避免同一资料重跑膨胀。
        existing["failed_attempts"] = existing.get("failed_attempts", existing.get("failed", 0)) + len(failed)
        existing["failed"] = len(failed)
        existing["retry_ids"] = failed
        existing["items"] = sorted(set(existing.get("items", [])) | set(kept))
        existing["note"] = (existing.get("note", "").rstrip("。") + f"；{now_str()[11:]} 轮：" + note + "。")
        existing["window"] = window
        existing["collection_complete"] = not bool(search_error)
        existing["collection_error"] = search_error
        if "runs" in existing:
            existing["runs"] += 1
        else:
            existing["runs"] = 2
    else:
        db["batches"].insert(0, {
            "id": batch_id, "time": now_str(), "window": window,
            "source": "巨潮资讯", "scanned": len(cands), "kept": len(kept),
            "candidate_ids": sorted({c["announcementId"] for c in cands}),
            "candidate_attempts": len(cands), "legacy_scanned": 0,
            "scan_scope": "窗口内去重候选数（含待审及失败）；不是源站全部公告数；旧批无法恢复主键的计数另列legacy_scanned",
            "excluded": len(excluded_ids), "failed": len(failed),
            "items": kept, "note": note + "。", "runs": 1,
            "retry_ids": failed, "failed_attempts": len(failed),
            "collection_complete": not bool(search_error), "collection_error": search_error,
        })
    save(db)
    from pipeline_state import write_manifest
    write_manifest(batch_id, analyze.REVIEW.get("model", "未记录（Kimi Code 直接审核结果）") if kept else None)
    if is_backfill:
        json.dump({"batch_id": batch_id, "window_start": sdate, "window_end": edate,
                   "status": "pending" if failed or search_error else "outbound_completed", "retry_ids": failed,
                   "updated_at": now_str()}, open(os.path.join(ROOT, "state/backfill_cursor.json"), "w"), ensure_ascii=False, indent=2)
    print(f"批次 {batch_id}：收录{len(kept)} 排除{len(excluded_ids)} 失败{len(failed)}")
    rc = rebuild()
    return 1 if failed or search_error else rc


def rebuild():
    validation = subprocess.run([sys.executable, os.path.join(HERE, "validate.py")])
    if validation.returncode:
        print("验证失败：停止构建，工作区保留供修复。")
        return 1
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
