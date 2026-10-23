# -*- coding: utf-8 -*-
"""PubX 全库质检：JSON 可解析、id 唯一、必填字段、三分层约定、金额口径、
quote 回原文子串（有原文缓存时）、前端静态资源完整。
输出 state/validate_report.json；exit code = 1 当存在 ERROR。

用法：python3 scripts/validate.py
"""
import datetime
import functools
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


# 审批/备案「已完成」类表述：须有原文依据（quote 含审批类字样）才算有支撑
APPROVAL_CLAIM = re.compile(r"(审批|备案|核准|许可).{0,6}(已完成|已通过|已获|已取得|完成)|已获批|已获确认")
APPROVAL_QUOTE = re.compile(r"审批|备案|核准|许可|批准|确认函|批复")
APPROVAL_NEG = re.compile(r"未|不|无|尚需|待|倒推|拟|需")


def approval_claims(text):
    """提取「审批已完成」类肯定表述；否定/未完成/推断语境（含未/不/尚需/倒推等）不算。"""
    for m in APPROVAL_CLAIM.finditer(text or ""):
        span = (text or "")[max(0, m.start() - 5):m.end()]
        if APPROVAL_NEG.search(span):
            continue
        yield m.group(0)


def check_event_consistency(evj):
    """R10：事件一致性 —— stage_chain 按日期排序；changelog 末条与 update_type_latest 一致；
    每 doc 恰挂一个事件（同渠道主键不重复）；external 层必须有 basis 来源；
    「审批已完成」类表述须同事件来源中有审批类引文支撑；null 与 unknown 区分。"""
    if not evj:
        return
    events = evj.get("events", [])
    doc_owner = {}
    for e in events:
        for s in e.get("sources", []):
            did = s.get("doc_id")
            if did:
                doc_owner.setdefault(did, []).append(e.get("event_id"))
    for did, owners in doc_owner.items():
        if len(set(owners)) > 1:
            add("doc 唯一归属", "ERROR", f"来源 {did} 同时挂在多个事件: {sorted(set(owners))}")
    add("doc 唯一归属", "OK", f"{len(doc_owner)} 份来源文件归属校验完成")

    n_chain = n_cl = n_ext = n_appr = n_unk = 0
    for e in events:
        eid = e.get("event_id")
        dates = [c.get("date", "") for c in e.get("stage_chain", []) if c.get("date")]
        if dates != sorted(dates):
            n_chain += 1
            add("阶段链日期排序", "WARN", f"{eid}: stage_chain 未按日期升序 {dates}")
        cl = e.get("changelog", [])
        if cl and e.get("update_type_latest") and cl[-1].get("type") != e.get("update_type_latest"):
            n_cl += 1
            add("changelog 一致", "WARN",
                f"{eid}: changelog 末条 {cl[-1].get('type')} ≠ update_type_latest {e.get('update_type_latest')}")
        # external 层必须有来源依据；unknown 不应出现在叙事文本（未核查的字段应缺失或置 unknown 标记，不写进 text）
        for f in schema.NARRATIVE_FIELDS:
            v = e.get(f)
            if not schema.is_narrative(v):
                continue
            if v.get("layer") == "external" and not str(v.get("basis") or "").strip():
                n_ext += 1
                add("external 层来源", "WARN", f"{eid}.{f}: external 层缺 basis 来源")
            if str(schema.narrative_text(v) or "").strip() == "unknown":
                n_unk += 1
                add("null/unknown 区分", "WARN", f"{eid}.{f}: text 为 unknown 字面量，应置 null 或省略")
        for f in schema.NARRATIVE_LIST_FIELDS:
            for i, item in enumerate(e.get(f) or []):
                if not schema.is_narrative(item):
                    continue
                if item.get("layer") == "external" and not str(item.get("basis") or "").strip():
                    n_ext += 1
                    add("external 层来源", "WARN", f"{eid}.{f}[{i}]: external 层缺 basis 来源")
                if str(item.get("text") or "").strip() == "unknown":
                    n_unk += 1
                    add("null/unknown 区分", "WARN", f"{eid}.{f}[{i}]: text 为 unknown 字面量")
        # 审批类表述支撑：trigger/terms 中出现「已完成审批/备案」类表述时，同事件任一 quote 须含审批类字样
        texts = [t.get("text", "") for t in (e.get("legal_triggers") or []) + (e.get("terms") or [])]
        if any(list(approval_claims(t)) for t in texts):
            quotes = [q.get("text", "") for s in e.get("sources", []) for q in (s.get("quotes") or [])]
            if not any(APPROVAL_QUOTE.search(q or "") for q in quotes):
                n_appr += 1
                add("审批表述依据", "WARN", f"{eid}: 含「审批/备案完成」类表述但来源无审批类引文支撑")
    add("阶段链日期排序", "OK" if not n_chain else "WARN", f"{len(events)} 事件校验，{n_chain} 条乱序")
    add("changelog 一致", "OK" if not n_cl else "WARN", f"{n_cl} 条不一致")
    add("external 层来源", "OK" if not n_ext else "WARN", f"{n_ext} 条缺来源")
    add("审批表述依据", "OK" if not n_appr else "WARN", f"{n_appr} 条待补引文")
    add("null/unknown 区分", "OK" if not n_unk else "WARN", f"{n_unk} 处 unknown 字面量")


def check_links(evj):
    """来源 URL 抽样可达性（带缓存 state/link_cache.json，7 天有效期）；
    外网抖动只记 WARN，不阻断；完全无网络记 SKIP。"""
    cache_path = os.path.join(ROOT, "state", "link_cache.json")
    try:
        cache = json.load(open(cache_path, encoding="utf-8"))
    except Exception:
        cache = {}
    urls = []
    for e in (evj or {}).get("events", []):
        for s in e.get("sources", []):
            u = s.get("url")
            if u and u.startswith("http") and u not in urls:
                urls.append(u)
    if not urls:
        add("来源链接可达", "SKIP", "无来源 URL")
        return
    import random
    random.seed(42)
    sample = random.sample(urls, min(8, len(urls)))
    now = datetime.datetime.now().strftime("%Y-%m-%d")
    try:
        import urllib.request
    except Exception:
        add("来源链接可达", "SKIP", "无 urllib")
        return
    n_ok = n_bad = n_net = 0
    dirty = False
    for u in sample:
        ent = cache.get(u)
        if ent and (datetime.datetime.strptime(now, "%Y-%m-%d")
                    - datetime.datetime.strptime(ent.get("ts", "2000-01-01"), "%Y-%m-%d")).days < 7:
            if ent.get("ok"):
                n_ok += 1
            else:
                n_bad += 1
                add("来源链接可达", "WARN", f"缓存 7 日内失败: {u[:80]}（HTTP {ent.get('status')}）")
            continue
        try:
            req = urllib.request.Request(u, method="HEAD",
                                         headers={"User-Agent": "PubX-validate/1.0 (link check)"})
            with urllib.request.urlopen(req, timeout=12) as r:
                ok = r.status < 400
                cache[u] = {"ok": ok, "status": r.status, "ts": now}
                dirty = True
                if ok:
                    n_ok += 1
                else:
                    n_bad += 1
                    add("来源链接可达", "WARN", f"HTTP {r.status}: {u[:80]}")
        except Exception as ex:
            n_net += 1
    if n_net == len(sample):
        add("来源链接可达", "SKIP", f"抽样 {len(sample)} 条全部网络不可达（离线或外网受限），本次跳过")
    else:
        add("来源链接可达", "OK" if not n_bad else "WARN",
            f"抽样 {len(sample)} 条（7 天缓存）：{n_ok} 可达 / {n_bad} 失败 / {n_net} 网络错误（不计失败）")
    if dirty:
        try:
            json.dump(cache, open(cache_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        except Exception:
            pass


# 页面级检查路由（R10 第 5 条，仿 licheng verify-site）：
# (路由, 期望) —— expect: h1=页面应有唯一 H1；redirect=旧路由应跳走（最终 hash 不同且页面非空）
PAGE_ROUTES = [
    ("", "h1"), ("events", "h1"), ("events?view=table", "h1"), ("board", "h1"),
    ("issues", "h1"), ("cos", "h1"), ("topics", "h1"), ("about", "h1"),
    ("about?tab=validate", "h1"), ("event/E-028", "h1"),
    ("feed", "redirect"), ("hk", "redirect"), ("arc", "redirect"),
    ("detail/23", "redirect"), ("ana/graph", "redirect"), ("sanctions", "redirect"),
    ("market", "redirect"), ("cos/projects", "redirect"), ("src", "redirect"),
]
PAGE_WIDTHS = [375, 768, 1280]


def check_pages(report):
    """无头浏览器页面检查：每页唯一 H1、三档宽度无横向溢出、JS 无报错、
    旧路由跳转成功、站内 hash 链接无死链。无 playwright 时记 SKIP。"""
    try:
        from playwright.sync_api import sync_playwright
    except Exception:
        add("页面检查", "SKIP", "无 playwright，跳过死链/H1/溢出检查（装 playwright 后自动启用）")
        return
    import http.server
    import socket
    import threading
    sock = socket.socket()
    sock.bind(("127.0.0.1", 0))
    port = sock.getsockname()[1]
    sock.close()
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    # 静默请求日志，避免污染 validate 输出
    class QuietHandler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    handler = functools.partial(QuietHandler, directory=ROOT)
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
    srv.daemon_threads = True
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{port}/"
    results = []
    all_links = set()
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            for route, expect in PAGE_ROUTES:
                row = {"route": "#/" + route, "expect": expect, "h1": None,
                       "overflow": {}, "js_errors": [], "final": None, "empty": False}
                for w in PAGE_WIDTHS:
                    pg = browser.new_page(viewport={"width": w, "height": 844})
                    errs = []
                    pg.on("pageerror", lambda e: errs.append(str(e)))
                    pg.goto(base + "#/" + route)
                    pg.wait_for_timeout(900)
                    if w == PAGE_WIDTHS[0]:
                        row["h1"] = pg.evaluate('document.querySelectorAll("h1").length')
                        row["final"] = pg.evaluate("location.hash")
                        row["empty"] = pg.evaluate(
                            'document.getElementById("view").textContent.trim().length < 10')
                        row["js_errors"] = errs
                        for lk in pg.evaluate(
                                'Array.from(document.querySelectorAll("a[href^=\'#/\']")).map(a=>a.getAttribute("href"))'):
                            all_links.add(lk)
                    ov = pg.evaluate("document.documentElement.scrollWidth>window.innerWidth+2")
                    row["overflow"][str(w)] = bool(ov)
                    pg.close()
                results.append(row)
            # 站内 hash 死链：全部路由收集到的链接全局去重后逐个试渲染（上限 150）
            dead = []
            probe = browser.new_page(viewport={"width": 1280, "height": 844})
            for lk in sorted(all_links)[:150]:
                errs2 = []
                hnd = lambda e: errs2.append(str(e))
                probe.on("pageerror", hnd)
                probe.goto(base + lk)
                probe.wait_for_timeout(500)
                empty2 = probe.evaluate(
                    'document.getElementById("view").textContent.trim().length < 10')
                probe.remove_listener("pageerror", hnd)
                if empty2 or errs2:
                    dead.append(lk)
            probe.close()
            browser.close()
    except Exception as ex:
        add("页面检查", "SKIP", f"playwright 运行失败：{str(ex)[:160]}")
        srv.shutdown()
        return
    srv.shutdown()

    n_bad = 0
    for r in results:
        bad = []
        if r["expect"] == "h1":
            if r["h1"] != 1:
                bad.append(f"H1 数={r['h1']}")
            if r["empty"]:
                bad.append("页面空白")
        else:  # redirect
            if r["final"] == r["route"] or r["empty"]:
                bad.append(f"未跳转或空白（最终 {r['final']}）")
        ov_bad = [w for w, ov in r["overflow"].items() if ov]
        if ov_bad:
            bad.append("溢出@" + "/".join(ov_bad))
        if r["js_errors"]:
            bad.append("JS报错:" + r["js_errors"][0][:60])
        r["ok"] = not bad
        if bad:
            n_bad += 1
            add("页面检查", "ERROR", f"{r['route']}: {'；'.join(bad)}")
    if dead:
        n_bad += 1
        add("站内死链", "ERROR", f"{len(dead)} 条: {' '.join(dead[:5])}")
    else:
        add("站内死链", "OK", f"全局去重 {min(len(all_links), 150)} 条站内链接均可渲染")
    report["pages"] = {
        "widths": PAGE_WIDTHS,
        "routes_checked": len(results),
        "links_checked": min(len(all_links), 150),
        "failed": n_bad,
        "results": results,
        "dead_links": dead,
    }
    add("页面检查", "OK" if not n_bad else "ERROR",
        f"{len(results)} 条路由 × {len(PAGE_WIDTHS)} 宽度：H1/溢出/JS报错/旧路由跳转；站内链接 {min(len(all_links), 150)} 条；失败 {n_bad}")


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
    check_event_consistency(evj)
    check_links(evj)
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
    # 页面级检查（死链/H1/溢出/旧路由跳转）：无 playwright 自动记 SKIP
    check_pages(report)
    # 页面检查的 ERROR/WARN 需并入汇总（check_pages 在 report 建后追加 issues）
    n_err = sum(1 for _, lv, _ in ISSUES if lv == "ERROR")
    n_warn = sum(1 for _, lv, _ in ISSUES if lv == "WARN")
    n_skip = sum(1 for _, lv, _ in ISSUES if lv == "SKIP")
    report["summary"] = {"ERROR": n_err, "WARN": n_warn, "SKIP": n_skip}
    report["issues"] = [{"check": c, "level": lv, "detail": d}
                        for c, lv, d in ISSUES if lv in ("ERROR", "WARN", "SKIP")]
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=1)
    print(f"validate：ERROR {n_err} · WARN {n_warn} · SKIP {n_skip} → state/validate_report.json")
    for c, lv, d in ISSUES:
        if lv == "ERROR":
            print(f"  [ERROR] {c}: {d}")
    return 1 if n_err else 0


if __name__ == "__main__":
    sys.exit(main())
