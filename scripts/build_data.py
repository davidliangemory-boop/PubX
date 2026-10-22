# -*- coding: utf-8 -*-
"""state/db.json + state/config.json → assets/data.js（window.DB）。

派生逻辑：
  · 阶段组：由动作阶段前缀映射（首页/档案筛选用）
  · 连续案例：config.case_seed 为种子；库内同一公司≥2个事件且不在种子中的，
    自动生成案例（summary/check 由 analyze.case_update 在入库时写入 db.case_state；
    缺失时给规则兜底文本，不造假）
"""
import json, os, datetime
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


def main():
    db = json.load(open(DB_PATH, encoding="utf-8"))
    cfg = json.load(open(CFG_PATH, encoding="utf-8"))
    disclosures = []
    for d in db["disclosures"]:
        d = dict(d)
        d["阶段组"] = stage_group(d.get("动作阶段", ""))
        d.setdefault("处理状态", "已发布")
        d["渠道"] = channel_of(d)
        disclosures.append(d)
    disclosures.sort(key=lambda d: d["披露日期与时间"], reverse=True)
    for i, d in enumerate(disclosures, 1):
        d["序号"] = str(i)
    out = {
        "disclosures": disclosures,
        "batches": db["batches"],
        "cases": build_cases(db, cfg),
        "exceptions": db["exceptions"],
        "derived": derive.build_derived(db, cfg),
        "health": build_health(db, cfg, disclosures),
        "watch": {"hk": load_watch("watchlist_hk.json"), "us": load_watch("watchlist_us.json")},
        "backfill": db.get("backfill") or None,
        "synced": datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))
                                        ).strftime("%Y-%m-%d %H:%M"),
    }
    # 事件层：一事件一记录（state/events.json，由 migrate_events.py / 批次流程维护）
    ev_path = os.path.join(ROOT, "state", "events.json")
    if os.path.exists(ev_path):
        try:
            evj = json.load(open(ev_path, encoding="utf-8"))
            out["events"] = evj.get("events", [])
            out["event_docs"] = evj.get("docs", {})
        except Exception as e:
            print(f"[build] events.json 读取失败（跳过事件层）：{e}")
    # 质检报告（scripts/validate.py 产出，#/about 展示）
    vr = load_watch("validate_report.json")
    if isinstance(vr, dict) and vr.get("summary"):
        out["validate"] = vr
    out["build"] = {
        "time": out["synced"],
        "batch": db["batches"][0]["id"] if db.get("batches") else "—",
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
