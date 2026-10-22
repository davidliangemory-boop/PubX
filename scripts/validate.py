# -*- coding: utf-8 -*-
"""PubX 全库质检：JSON 可解析、id 唯一、必填字段、三分层约定、金额口径、
quote 回原文子串（有原文缓存时）、前端静态资源完整。
输出 state/validate_report.json；exit code = 1 当存在 ERROR。

用法：python3 scripts/validate.py
"""
import datetime
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import schema  # noqa: E402

REPORT_PATH = os.path.join(ROOT, "state", "validate_report.json")

ISSUES = []  # (check, level, detail)


def add(check, level, detail):
    ISSUES.append((check, level, detail))


def load_json(path, check="JSON 可解析"):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        add(check, "ERROR", f"{os.path.relpath(path, ROOT)}: {e}")
        return None


def check_state_jsons():
    """所有 state/*.json 可解析。"""
    sdir = os.path.join(ROOT, "state")
    for fn in sorted(os.listdir(sdir)):
        if fn.endswith(".json") and fn != "validate_report.json":
            data = load_json(os.path.join(sdir, fn))
            if data is not None:
                add("JSON 可解析", "OK", f"state/{fn}")


def check_events():
    evj = load_json(os.path.join(ROOT, "state", "events.json"))
    if evj is None:
        return None
    events = evj.get("events", [])
    problems, dup = schema.check_events(events)
    for eid in dup:
        add("事件 id 唯一", "ERROR", f"重复 event_id: {eid}")
    for eid, iss in problems.items():
        for lv, field, msg in iss:
            add("事件结构(schema)", lv, f"{eid}.{field}: {msg}")
    add("事件结构(schema)", "OK", f"events.json {len(events)} 条校验完成")
    return evj


def check_disclosures(evj):
    db = load_json(os.path.join(ROOT, "state", "db.json"))
    if db is None:
        return
    discs = db.get("disclosures", [])
    seen = {}
    for d in discs:
        aid = d.get("_aid")
        if not aid:
            add("披露 id 唯一", "ERROR", f"序号 {d.get('序号')}: 缺 _aid")
        elif aid in seen:
            add("披露 id 唯一", "ERROR", f"重复 _aid: {aid}")
        seen[aid] = 1
        for f in ("披露日期与时间", "公司全称", "公告标题", "来源链接"):
            if not d.get(f):
                add("披露必填字段", "ERROR", f"{aid}: 缺 {f}")
    add("披露 id 唯一", "OK", f"db.json {len(discs)} 条校验完成")

    if evj:
        docs = evj.get("docs", {})
        ev_ids = {e.get("event_id") for e in evj.get("events", [])}
        # docs 映射的 event_id 必须存在；事件 sources 的 doc_id 必须在库内
        for aid, m in docs.items():
            if m.get("event_id") not in ev_ids:
                add("事件-披露映射", "ERROR", f"docs[{aid}] 指向不存在的 {m.get('event_id')}")
        for e in evj.get("events", []):
            for s in e.get("sources", []):
                if s.get("doc_id") not in docs and s.get("doc_id") not in seen:
                    add("事件-披露映射", "WARN",
                        f"{e.get('event_id')} 来源 {s.get('doc_id')} 不在 db/events 映射中")


def check_quotes(evj):
    """有原文缓存（raw/<doc_id>.txt）时，quote 必须是原文子串；无缓存如实记 SKIP。"""
    rawdir = os.path.join(ROOT, "raw")
    if not os.path.isdir(rawdir):
        add("引文回原文", "SKIP", "无 raw/ 原文缓存目录，跳过子串比对（采集脚本落地原文后自动启用）")
        return
    n_ok = n_bad = 0
    for e in (evj or {}).get("events", []):
        for s in e.get("sources", []):
            p = os.path.join(rawdir, f"{s.get('doc_id')}.txt")
            if not os.path.exists(p):
                continue
            raw = re.sub(r"\s+", "", open(p, encoding="utf-8", errors="replace").read())
            for q in s.get("quotes") or []:
                if re.sub(r"\s+", "", q.get("text", "")) in raw:
                    n_ok += 1
                else:
                    n_bad += 1
                    add("引文回原文", "ERROR",
                        f"{e.get('event_id')}/{s.get('doc_id')}: 引文非原文子串「{q.get('text', '')[:30]}…」")
    add("引文回原文", "OK" if n_bad == 0 else "ERROR", f"比对 {n_ok + n_bad} 条，命中 {n_ok}")


def check_batches():
    """批次命名约定（docs/schema.md §6）：新批次 D-YYYYMMDD（日）/ B-YYYYMMDD（回溯）/
    W-YYYYWW（出口管制周批）。存量旧命名 B-YYYYMMDD-HHMM / B-BF-* 记 WARN 汇总，不算错误。"""
    db = load_json(os.path.join(ROOT, "state", "db.json"))
    if db is None:
        return
    new_ok, legacy = 0, 0
    for b in db.get("batches", []):
        bid = b.get("id", "")
        if re.match(r"^D-\d{8}$", bid) or re.match(r"^B-\d{8}$", bid) or re.match(r"^W-\d{6}$", bid):
            new_ok += 1
        else:
            legacy += 1
    if legacy:
        add("批次命名", "WARN",
            f"{legacy} 条存量批次为旧命名（B-YYYYMMDD-HHMM / B-BF-* 等）；原始记录保留，"
            f"构建层 build_data.py 已聚合为日批次视图 batches_daily")
    add("批次命名", "OK", f"新命名批次 {new_ok} 条（D-/B-/W- 规范）")


def check_frontend():
    """index.html 引用的静态资源存在；data.js 可解析；app.js 语法检查（有 node 时）。"""
    idx = os.path.join(ROOT, "index.html")
    html = open(idx, encoding="utf-8").read()
    for m in re.findall(r'(?:src|href)="(\./[^"#]+)"', html):
        p = os.path.join(ROOT, m[2:])
        if not os.path.exists(p):
            add("前端资源", "ERROR", f"index.html 引用不存在: {m}")
    data_path = os.path.join(ROOT, "assets", "data.js")
    if os.path.exists(data_path):
        raw = open(data_path, encoding="utf-8").read()
        m = re.match(r"^window\.DB\s*=\s*", raw)
        if not m:
            add("前端数据", "ERROR", "assets/data.js 不是 window.DB 赋值")
        else:
            try:
                db = json.loads(raw[m.end():].rstrip().rstrip(";"))
                for k in ("disclosures", "events", "batches"):
                    if k not in db:
                        add("前端数据", "ERROR", f"data.js 缺键 {k}")
                add("前端数据", "OK",
                    f"data.js 可解析：披露 {len(db.get('disclosures', []))} / 事件 {len(db.get('events', []))}")
            except Exception as e:
                add("前端数据", "ERROR", f"data.js JSON 解析失败: {e}")
    else:
        add("前端数据", "ERROR", "assets/data.js 不存在（需先运行 scripts/build_data.py）")
    app = os.path.join(ROOT, "assets", "app.js")
    try:
        r = subprocess.run(["node", "--check", app], capture_output=True, text=True, timeout=30)
        if r.returncode != 0:
            add("前端语法", "ERROR", f"app.js: {r.stderr.strip()[:200]}")
        else:
            add("前端语法", "OK", "node --check assets/app.js 通过")
    except FileNotFoundError:
        add("前端语法", "SKIP", "无 node，跳过 app.js 语法检查")


def main():
    check_state_jsons()
    evj = check_events()
    check_disclosures(evj)
    check_quotes(evj)
    check_batches()
    check_frontend()

    n_err = sum(1 for _, lv, _ in ISSUES if lv == "ERROR")
    n_warn = sum(1 for _, lv, _ in ISSUES if lv == "WARN")
    n_skip = sum(1 for _, lv, _ in ISSUES if lv == "SKIP")
    report = {
        "generated": datetime.datetime.now(
            datetime.timezone(datetime.timedelta(hours=8))).strftime("%Y-%m-%d %H:%M"),
        "summary": {"ERROR": n_err, "WARN": n_warn, "SKIP": n_skip},
        "issues": [{"check": c, "level": lv, "detail": d}
                   for c, lv, d in ISSUES if lv in ("ERROR", "WARN", "SKIP")],
    }
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=1)
    print(f"validate：ERROR {n_err} · WARN {n_warn} · SKIP {n_skip} → state/validate_report.json")
    for c, lv, d in ISSUES:
        if lv == "ERROR":
            print(f"  [ERROR] {c}: {d}")
    return 1 if n_err else 0


if __name__ == "__main__":
    sys.exit(main())
