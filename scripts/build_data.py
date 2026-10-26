# -*- coding: utf-8 -*-
"""state/db.json + state/config.json → assets/data.js（window.DB）。

派生逻辑：
  · 阶段组：由动作阶段前缀映射（首页/档案筛选用）
  · 连续案例：config.case_seed 为种子；库内同一公司≥2个事件且不在种子中的，
    自动生成案例（summary/check 由 analyze.case_update 在入库时写入 db.case_state；
    缺失时给规则兜底文本，不造假）
"""
import json, os, re, datetime
import derive

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(ROOT, "state", "db.json")
CFG_PATH = os.path.join(ROOT, "state", "config.json")
OUT_PATH = os.path.join(ROOT, "assets", "data.js")

STATUS_MAP = {"意向": "谈判中", "协议": "签约推进", "实施": "实施中",
              "变更": "推进中", "投产/运营": "运营期", "完成": "已完成"}


def stage_group(s):
    # 与人工监测口径一致：投产/运营为全文包含匹配，优先于实施前缀
    if s.startswith("变更"):
        return "变更"
    if "投产" in s or "运营" in s:
        return "投产/运营"
    if s.startswith(("实施", "建设", "交割")):
        return "实施"
    if s.startswith(("协议", "签约")):
        return "协议"
    if s.startswith(("完成", "交割完成")):
        return "完成"
    return "意向"


def build_cases(db, cfg):
    cases = []
    for c in cfg.get("case_seed", []):
        cases.append(dict(c))
    by_company = {}
    for d in db["disclosures"]:
        by_company.setdefault(d["公司全称"], []).append(d)
    cs = db.setdefault("case_state", {})
    n = len(cases)
    seeded_companies = {c["company"] for c in cases}
    for company, evs in sorted(by_company.items(), key=lambda kv: kv[1][-1]["披露日期与时间"]):
        if len(evs) < 2 or company in seeded_companies:
            continue
        n += 1
        evs = sorted(evs, key=lambda d: d["披露日期与时间"])
        latest = evs[-1]
        state = cs.get(company) or {}
        if not state.get("summary"):
            state = {"summary": f"{company} 围绕境外事项已有 {len(evs)} 个披露事件；"
                                f"最新：{latest['动作类型']}。",
                     "check": "规则兜底：LLM案例摘要缺失，待下个批次补全。"}
        cases.append({
            "id": f"CASE-{n:02d}",
            "title": f"{company.replace('股份有限公司','').replace('有限公司','')} — 连续事件跟踪",
            "company": company,
            "code": latest["股票代码"],
            "region": latest["涉及国家/地区"],
            "status": STATUS_MAP.get(latest.get("阶段组") or stage_group(latest["动作阶段"]), "推进中"),
            "events": [d["_aid"] for d in evs],
            "summary": state["summary"],
            "check": state["check"],
        })
    return cases


def channel_of(d):
    ch = d.get("渠道")
    if ch in ("A股·巨潮", "港股·披露易", "美股·EDGAR"):
        return ch
    code = (d.get("股票代码") or "").upper()
    if code.endswith(".HK"):
        return "港股·披露易"
    if code.endswith((".SH", ".SZ", ".BJ")):
        return "A股·巨潮"
    if d.get("SEC表格") or d.get("CIK"):
        return "美股·EDGAR"
    return "其他来源"


def load_watch(name):
    p = os.path.join(ROOT, "state", name)
    if os.path.exists(p):
        try:
            return json.load(open(p, encoding="utf-8"))
        except Exception:
            return []
    return []


def build_health(db, cfg, disclosures):
    """各渠道健康度：接入方式/去重主键来自 config.channels（静态配置），
    收录数与最新日期来自实际库内数据，失败从批次记录汇总。无数据如实为 0。"""
    out = []
    last_batch = db["batches"][0] if db["batches"] else None
    exc_n = len(db.get("exceptions", []))
    for c in cfg.get("channels", []):
        key = c["key"]
        docs = [d for d in disclosures if channel_of(d) == key]
        latest = max([d["披露日期与时间"] for d in docs], default="")
        status = c.get("status", "正常")
        if status != "手动" and c.get("kind") != "screen":
            if last_batch and last_batch.get("failed", 0) > 0 and key == "A股·巨潮":
                status = "降级"
            elif not docs and not c.get("watch"):
                status = "待收录"
        out.append({
            "key": key, "name": c["name"], "status": status,
            "method": c.get("method", ""), "cursor": c.get("cursor", ""),
            "cadence": c.get("cadence", ""), "url": c.get("url", "—"),
            "count": len(docs), "latest": latest,
            "watch": c.get("watch") or None,
            "lastBatch": last_batch["id"] + " · " + last_batch["time"] if last_batch else "—",
            "note": c.get("note", ""),
        })
    return out


def batch_day(b):
    """批次 → (kind, day)：回溯批次（B-BF-* 或来源含「回溯」）kind=backfill，其余为日批次。
    旧命名 B-YYYYMMDD-HHMM / B-YYYYMMDD-SEC 等按自然日聚合为 D-YYYYMMDD（不改原始记录）。"""
    bid = b.get("id", "")
    if bid.startswith("B-BF-") or "回溯" in (b.get("source") or ""):
        day = bid.replace("B-BF-", "")[:8]
        return "backfill", day
    m = re.match(r"[BD]-(\d{8})", bid)
    if m:
        return "daily", m.group(1)
    t = (b.get("time") or "")[:10].replace("-", "")
    return "daily", t or "unknown"


def build_batches_daily(batches):
    """展示层日批次聚合：日批次 D-YYYYMMDD（同日多轮合并，runs 记轮数）；
    回溯补入单列（B-YYYYMMDD）。原始批次记录原样保留在 batches。"""
    groups, order = {}, []
    for b in batches:
        kind, day = batch_day(b)
        bid = ("B-" if kind == "backfill" else "D-") + day
        if bid not in groups:
            groups[bid] = {"id": bid, "kind": kind, "day": day, "time": b.get("time", ""),
                           "source": b.get("source", ""), "scanned": 0, "kept": 0,
                           "excluded": 0, "failed": 0, "runs": 0, "items": [],
                           "notes": [], "per_source": {}, "runs_ids": []}
            order.append(bid)
        g = groups[bid]
        g["time"] = max(g["time"], b.get("time", ""))
        for k in ("scanned", "kept", "excluded", "failed"):
            g[k] += b.get(k, 0) or 0
        g["runs"] += b.get("runs", 1)
        g["runs_ids"].append(b.get("id", ""))
        g["items"] = sorted(set(g["items"]) | set(b.get("items") or []))
        if b.get("note"):
            g["notes"].append(b["note"])
        if b.get("trend"):
            g["notes"].append(b["trend"])
        for sk, sp in (b.get("per_source") or {}).items():
            tgt = g["per_source"].setdefault(sk, {"scanned": 0, "kept": 0, "excluded": 0, "failed": 0})
            for k in tgt:
                tgt[k] += sp.get(k, 0) or 0
    out = [groups[bid] for bid in order]
    out.sort(key=lambda g: (g["day"], g["kind"] == "daily"), reverse=True)
    return out


def https_link(u):
    """巨潮 PDF 链接 http→https（静态服务器支持 https；部分网络环境 http 被断）。
    仅展示层改写，state/ 原始记录不动。"""
    if isinstance(u, str) and u.startswith("http://static.cninfo.com.cn"):
        return "https://" + u[len("http://"):]
    return u


def main():
    db = json.load(open(DB_PATH, encoding="utf-8"))
    cfg = json.load(open(CFG_PATH, encoding="utf-8"))
    disclosures = []
    for d in db["disclosures"]:
        d = dict(d)
        d["阶段组"] = stage_group(d.get("动作阶段", ""))
        d.pop("处理状态", None)  # R05：恒为「已发布」的 0 信息量字段，删除
        d["渠道"] = channel_of(d)
        d["来源链接"] = https_link(d.get("来源链接"))
        disclosures.append(d)
    disclosures.sort(key=lambda d: d["披露日期与时间"], reverse=True)
    for i, d in enumerate(disclosures, 1):
        d["序号"] = str(i)
    out = {
        "disclosures": disclosures,
        "batches": db["batches"],
        "batches_daily": build_batches_daily(db["batches"]),
        "cases": build_cases(db, cfg),
        "exceptions": db["exceptions"],
        "derived": derive.build_derived(db, cfg),
        "health": build_health(db, cfg, disclosures),
        "watch": {"hk": load_watch("watchlist_hk.json"), "us": load_watch("watchlist_us.json")},
        "backfill": db.get("backfill") or None,
        "synced": datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))
                                        ).strftime("%Y-%m-%d %H:%M"),
    }
    for n in out["derived"]["graph"]["nodes"]:
        if isinstance(n, dict) and isinstance(n.get("url"), str):
            n["url"] = https_link(n["url"])
    # 事件层：一事件一记录（state/events.json，由 migrate_events.py / 批次流程维护）
    ev_path = os.path.join(ROOT, "state", "events.json")
    if os.path.exists(ev_path):
        try:
            evj = json.load(open(ev_path, encoding="utf-8"))
            evs = evj.get("events", [])
            for ev in evs:
                for s in ev.get("sources", []):
                    s["url"] = https_link(s.get("url"))
            out["events"] = evs
            out["event_docs"] = evj.get("docs", {})
        except Exception as e:
            print(f"[build] events.json 读取失败（跳过事件层）：{e}")
    # 质检报告（scripts/validate.py 产出，#/about 展示）
    vr = load_watch("validate_report.json")
    if isinstance(vr, dict) and vr.get("summary"):
        out["validate"] = vr
    daily = [g for g in out["batches_daily"] if g["kind"] == "daily"]
    out["build"] = {
        "time": out["synced"],
        "batch": daily[0]["id"] if daily else (db["batches"][0]["id"] if db.get("batches") else "—"),
    }
    if "events" in out:
        out["build"]["events"] = len(out["events"])
    js = "window.DB = " + json.dumps(out, ensure_ascii=False, indent=1) + ";\n"
    open(OUT_PATH, "w", encoding="utf-8").write(js)
    dv = out["derived"]
    print(f"data.js 已生成：{len(disclosures)} 条披露，{len(out['cases'])} 个案例，"
          f"{len(out['batches'])} 个批次；派生：{len(dv['companies'])}公司/"
          f"{len(dv['projects'])}项目/{len(dv['regions'])}区域/{len(dv['funds'])}资金/"
          f"{len(dv['compliance'])}合规/{len(dv['graph']['nodes'])}图谱节点")


if __name__ == "__main__":
    main()
