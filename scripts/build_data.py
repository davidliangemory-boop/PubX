# -*- coding: utf-8 -*-
"""state/db.json + state/config.json → assets/data.js（window.DB）。

派生逻辑：
  · 阶段组：由动作阶段前缀映射（首页/档案筛选用）
  · 连续案例：config.case_seed 为种子；库内同一公司≥2个事件且不在种子中的，
    自动生成案例（summary/check 由 analyze.case_update 在入库时写入 db.case_state；
    缺失时给规则兜底文本，不造假）
"""
import json, os, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(ROOT, "state", "db.json")
CFG_PATH = os.path.join(ROOT, "state", "config.json")
OUT_PATH = os.path.join(ROOT, "assets", "data.js")

STATUS_MAP = {"意向": "谈判中", "协议": "签约推进", "实施": "实施中",
              "变更": "推进中", "投产/运营": "运营期"}


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


def main():
    db = json.load(open(DB_PATH, encoding="utf-8"))
    cfg = json.load(open(CFG_PATH, encoding="utf-8"))
    disclosures = []
    for d in db["disclosures"]:
        d = dict(d)
        d["阶段组"] = stage_group(d.get("动作阶段", ""))
        disclosures.append(d)
    disclosures.sort(key=lambda d: d["披露日期与时间"], reverse=True)
    for i, d in enumerate(disclosures, 1):
        d["序号"] = str(i)
    out = {
        "disclosures": disclosures,
        "batches": db["batches"],
        "cases": build_cases(db, cfg),
        "sources": cfg["sources"],
        "rules": cfg["rules"],
        "exceptions": db["exceptions"],
        "synced": datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))
                                        ).strftime("%Y-%m-%d %H:%M"),
    }
    js = "window.DB = " + json.dumps(out, ensure_ascii=False, indent=1) + ";\n"
    open(OUT_PATH, "w", encoding="utf-8").write(js)
    print(f"data.js 已生成：{len(disclosures)} 条披露，{len(out['cases'])} 个案例，"
          f"{len(out['batches'])} 个批次")


if __name__ == "__main__":
    main()
