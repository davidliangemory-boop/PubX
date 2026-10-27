# -*- coding: utf-8 -*-
"""PubX 统一事件 schema（四模块共用骨架）——字段定义与存量兼容映射。

文档见 docs/schema.md。本模块只定义结构与校验规则，不改写业务数据；
被 scripts/validate.py 引用，也可被后续批次脚本复用。

纪律：null = 已核原文未披露（页面显示【未披露】）；"unknown" = 尚未核查。
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ── 模块（分页面）定义：数据文件、统计口径互不混用 ──
MODULES = {
    "cn_outbound": {
        "name": "出海信披归纳",
        "route": "#/",
        "files": ["state/events.json", "state/db.json"],
        "scope": "仅中企出海相关披露（巨潮 / 披露易 / EDGAR 中概名单）",
    },
    "us_market": {
        "name": "美股（SEC）",
        "route": "#/us",
        "files": ["state/us_market.json"],
        "scope": "SEC EDGAR 全量，不分中外企",
        "categories": ["交易类", "融资类", "运营", "法律（诉讼/监管处罚）", "对外投资", "经营战略重大事项"],
    },
    "hk_market": {
        "name": "港股（HKEX）",
        "route": "#/hk-market",
        "files": ["state/hk_market.json"],
        "scope": "HKEX 披露易全量，不分中外企",
        "categories": ["交易类", "融资类", "运营", "法律（诉讼/监管处罚）", "对外投资", "经营战略重大事项"],
    },
    "export_control": {
        "name": "出口管制",
        "route": "#/export",
        "files": ["state/export.json"],
        "scope": "BIS / OFAC / UFLPA：执法案例更新 / 清单更新 / 规则更新；SDN 筛查并入「观察名单比对」子视图（同名≠命中）",
        "columns": {"enforcement": "执法案例更新", "lists": "清单更新", "rules": "规则更新"},
    },
}

# ── 枚举（中文库内值 ↔ 规格英文值，见 docs/schema.md §3）──
STATUS_LIFECYCLE = ["活跃", "完成", "终止"]
UPDATE_TYPES = ["新增", "进展", "重复", "修正", "失效"]
UPDATE_TYPE_EN = {"新增": "new", "进展": "progress", "重复": "duplicate",
                  "修正": "corrected", "失效": "invalid"}
LAYERS = ["disclosed", "external", "analysis"]
CHANNELS = ["A股·巨潮", "港股·披露易", "美股·EDGAR", "其他来源"]

# 必填字段（缺失 = ERROR）；叙事字段（text/layer/basis 结构）
REQUIRED_FIELDS = ["event_id", "title_fact", "status", "parties",
                   "stage_current", "stage_chain", "sources", "changelog"]
NARRATIVE_FIELDS = ["title_fact", "geo", "matter_type", "scale", "holding_chain"]
NARRATIVE_LIST_FIELDS = ["legal_triggers", "watch_points",
                         "practice_notes", "impact"]
# terms：R05 起为结构化字典 {completeness, completeness_basis, fields{12 条款}};
# gaps：{item, why, where, layer, basis} 三段式（缺什么/为何重要/去哪找）
TERMS_FIELDS = ["payment", "conditions_precedent", "approvals", "contingent",
                "completion_adjustment", "deposit", "long_stop_date", "breach",
                "reps_warranties", "transition", "tax", "dispute_resolution"]
TERMS_COMPLETENESS = ["全文已披露", "仅摘要条款", "未披露协议条款"]

CURRENCY_TOKENS = ["美元", "港元", "人民币", "澳元", "欧元", "英镑", "日元",
                   "新元", "迪拉姆", "卢比", "加元", "瑞郎", "万元", "亿元", "元",
                   "辆", "股", "吨", "%"]  # 非金额规模（交付量/股数/产能）也算有口径


def module_of(event):
    """兼容映射：存量事件无 module 字段时视为 cn_outbound（不丢数据）。"""
    return event.get("module") or "cn_outbound"


def is_narrative(v):
    # 兼容映射：matter_type 用 value 键（=text 别名），不丢数据
    return isinstance(v, dict) and ("text" in v or "value" in v)


def narrative_text(v):
    return v.get("text", v.get("value"))


def check_event(ev):
    """校验单条事件记录，返回 [(level, field, message), ...]，level ∈ ERROR/WARN。"""
    issues = []

    def err(field, msg):
        issues.append(("ERROR", field, msg))

    def warn(field, msg):
        issues.append(("WARN", field, msg))

    for f in REQUIRED_FIELDS:
        if f not in ev or ev[f] is None:
            err(f, "缺少必填字段")
    if issues:
        return issues  # 必填缺失时不再深入，避免连锁报错

    if not isinstance(ev.get("event_id"), str) or not ev["event_id"].strip():
        err("event_id", "id 为空")
    mod = module_of(ev)
    if mod not in MODULES:
        err("module", f"未知模块 {mod}")
    if ev.get("status") not in STATUS_LIFECYCLE:
        err("status", f"非法生命周期状态 {ev.get('status')!r}")
    if ev.get("update_type_latest") not in UPDATE_TYPES:
        warn("update_type_latest", f"非法更新类型 {ev.get('update_type_latest')!r}")

    # 叙事字段：null 允许（未披露），存在则须 text + layer 合法；analysis 须有 basis
    for f in NARRATIVE_FIELDS:
        v = ev.get(f)
        if v is None:
            continue
        if not is_narrative(v):
            err(f, "叙事字段应为 {text, layer, basis} 结构或 null")
            continue
        if not str(narrative_text(v) or "").strip():
            warn(f, "text 为空（未披露应置 null）")
        if v.get("layer") not in LAYERS:
            err(f, f"非法 layer {v.get('layer')!r}")
        elif v["layer"] == "analysis" and not str(v.get("basis") or "").strip():
            err(f, "analysis 层必须写 basis 依据")

    for f in NARRATIVE_LIST_FIELDS:
        v = ev.get(f)
        if v is None:
            continue
        if not isinstance(v, list):
            err(f, "应为数组或 null")
            continue
        for i, item in enumerate(v):
            if not is_narrative(item):
                err(f, f"第{i + 1}项应为 {{text, layer, basis}} 结构")
                continue
            if item.get("layer") not in LAYERS:
                err(f, f"第{i + 1}项非法 layer {item.get('layer')!r}")
            elif item["layer"] == "analysis" and not str(item.get("basis") or "").strip():
                err(f, f"第{i + 1}项 analysis 层必须写 basis 依据")

    # 交易条款：R05 起为结构化字典；存量 list 形态（{text,layer,basis} 数组）兼容
    t = ev.get("terms")
    if isinstance(t, dict):
        if t.get("completeness") not in TERMS_COMPLETENESS:
            err("terms", f"completeness 非法 {t.get('completeness')!r}")
        fields = t.get("fields")
        if not isinstance(fields, dict):
            err("terms", "缺 fields 字典")
        else:
            missing = [k for k in TERMS_FIELDS if k not in fields]
            if missing:
                err("terms", f"fields 缺 {missing}")
            for k in TERMS_FIELDS:
                fld = fields.get(k)
                if isinstance(fld, dict) and "value" not in fld:
                    err("terms", f"fields.{k} 缺 value（null=已核未披露）")
    elif isinstance(t, list):
        for i, item in enumerate(t):
            if not is_narrative(item):
                err("terms", f"（旧形态）第{i + 1}项应为 {{text, layer, basis}} 结构")

    # 信息缺口：{item, why, where} 三段式；存量 {text} 形态兼容
    for i, g in enumerate(ev.get("gaps") or []):
        if isinstance(g, dict) and "item" in g:
            for k in ("item", "why", "where"):
                if not str(g.get(k) or "").strip():
                    err("gaps", f"第{i + 1}项缺 {k}")
        elif not is_narrative(g):
            err("gaps", f"第{i + 1}项应为 {{item, why, where}} 或 {{text, layer, basis}} 结构")

    # 规模金额：出现数字时必须带币种/单位口径；以"—/未披露/未载"开头的视为未披露说明，豁免
    sc = ev.get("scale")
    sc_text = str(narrative_text(sc) or "") if is_narrative(sc) else ""
    sc_undisclosed = sc_text.startswith(("—", "-", "未披露", "未载")) or "未披露" in sc_text[:12]
    if is_narrative(sc) and not sc_undisclosed and any(ch.isdigit() for ch in sc_text):
        if not any(t in sc_text for t in CURRENCY_TOKENS):
            err("scale", "金额/数字缺少币种或单位口径")

    # 阶段链
    if not isinstance(ev.get("stage_chain"), list) or not ev["stage_chain"]:
        err("stage_chain", "阶段链为空")
    else:
        for i, c in enumerate(ev["stage_chain"]):
            if not (c.get("date") and c.get("stage")):
                warn("stage_chain", f"第{i + 1}环缺 date/stage")

    # 来源：file/date/url 必备；quotes 须 text+page
    if not isinstance(ev.get("sources"), list) or not ev["sources"]:
        err("sources", "来源为空")
    else:
        for i, s in enumerate(ev["sources"]):
            for k in ("doc_id", "file", "date", "url"):
                if not s.get(k):
                    err("sources", f"第{i + 1}份来源缺 {k}")
            for j, q in enumerate(s.get("quotes") or []):
                if not str(q.get("text") or "").strip():
                    err("sources", f"第{i + 1}份来源第{j + 1}条引文为空")
                elif len(q["text"]) > 300:
                    warn("sources", f"第{i + 1}份来源第{j + 1}条引文超过 300 字，应截取短引文")

    # 主体
    if not ev.get("parties") or not all(p.get("name") for p in ev["parties"]):
        err("parties", "主体为空或缺名称")

    return issues


def check_events(events):
    """校验事件集：id 唯一 + 逐条结构。返回 {event_id: issues} 与 id 重复列表。"""
    seen, dup = {}, []
    out = {}
    for ev in events:
        eid = ev.get("event_id", "?")
        if eid in seen:
            dup.append(eid)
        seen[eid] = 1
        iss = check_event(ev)
        if iss:
            out[eid] = iss
    return out, dup


def load_events(path=None):
    path = path or os.path.join(ROOT, "state", "events.json")
    with open(path, encoding="utf-8") as f:
        return json.load(f)


if __name__ == "__main__":
    evj = load_events()
    problems, dup = check_events(evj.get("events", []))
    n_err = sum(1 for iss in problems.values() for i in iss if i[0] == "ERROR")
    n_warn = sum(1 for iss in problems.values() for i in iss if i[0] == "WARN")
    print(f"事件 {len(evj.get('events', []))} 条；问题事件 {len(problems)} 条；"
          f"ERROR {n_err} · WARN {n_warn}；重复 id {dup or '无'}")
