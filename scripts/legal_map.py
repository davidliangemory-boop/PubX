# -*- coding: utf-8 -*-
"""legal_map.py（R06）：事实 JSON + 议题编码表 → 每事件结构化 legal_triggers[]。

纪律（pubx_benchmark_spec.md §b/§c、R06 通用纪律）：
  · 每条 trigger 只挂一个二级码（state/issues_taxonomy.json）；
  · trigger_fact 只引用事件已有字段或原文摘录上下文，禁止推测；
  · status 四态：disclosed_cleared / disclosed_pending / not_disclosed / not_applicable。
    原文无审批/备案处理字样的，一律 not_disclosed，禁止写「已审批」；
  · layer：raw_category（来源原始分类）与多地披露为 disclosed，其余归码为 analysis，
    basis 必须写明命中规则与字段；
  · 旧轮自由文本触发点按「；」拆片后归码，归不上的进 legal_notes_unmapped（不丢不编）。

幂等：每次全量重建 legal_triggers（旧自由文本已存 legacy 快照于 meta.legal_map）。
用法：python3 scripts/legal_map.py [--dry-run]
"""
import json, os, re, sys, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EV_PATH = os.path.join(ROOT, "state", "events.json")
DB_PATH = os.path.join(ROOT, "state", "db.json")
TAX_PATH = os.path.join(ROOT, "state", "issues_taxonomy.json")

CLEARED = re.compile(r"已完成|已取得|已获得|已通过|已获|完成.*(备案|核准|审批|登记)|取得.*(备案|核准|批复|许可)")
PENDING = re.compile(r"尚需|须待|待.*(批准|核准|备案|审批)|尚未|进行中|拟|需经|须经|有待")
NEG = re.compile(r"未|不|无|尚需|待|拟|需")
NEG_HIT = re.compile(r"不涉及|无需|不适用|未涉及|不属于|并非|未触发|无重大")

# 东道国外资审查机制（trigger_fact 中的机制名属 external 常识标注，写进 basis）
FDI_REGIME = {
    "澳大利亚": "FIRB", "美国": "CFIUS", "加拿大": "加拿大投资法(ICA)",
    "英国": "NSIA", "德国": "AWV", "法国": "法国 FDI 审查", "意大利": "黄金权力",
    "欧盟": "EU FDI 筛查条例", "日本": "外汇及外国贸易法", "新西兰": "OIO",
    "印度": "FDI 审批（接壤国家来源）",
}
INVEST_MT = {"设厂", "建厂", "并购", "合资"}


def ctx(text, kw, span=18):
    """命中词上下文片段（真实文本子串，供 trigger_fact 引用）。"""
    i = (text or "").find(kw)
    if i < 0:
        return ""
    return text[max(0, i - span):i + len(kw) + span]


def status_of(snippet, default="not_disclosed"):
    """按命中上下文判断处理方式披露状态；否定/未完成语境不算完成。"""
    if not snippet:
        return default
    if CLEARED.search(snippet) and not NEG.search(snippet[:CLEARED.search(snippet).start() + 2]):
        return "disclosed_cleared"
    if PENDING.search(snippet):
        return "disclosed_pending"
    return default


def corpus_of(e, db_by_aid):
    """事件语料：[(field, text, layer)]，全部来自已有字段/原文摘录，不生成新事实。"""
    c = []
    if e.get("title_fact"):
        c.append(("title_fact", e["title_fact"].get("text") or "", "disclosed"))
    if e.get("geo"):
        c.append(("geo", e["geo"].get("text") or "", "disclosed"))
    if e.get("scale"):
        c.append(("scale", e["scale"].get("text") or "", "disclosed"))
    c.append(("stage_current", e.get("stage_current") or "", "disclosed"))
    t = e.get("terms")
    if isinstance(t, dict):
        for k, f in (t.get("fields") or {}).items():
            v = (f or {}).get("value")
            if v and v != "unknown":
                c.append(("terms." + k, str(v), "disclosed"))
    elif isinstance(t, list):
        for x in t:
            if isinstance(x, dict) and x.get("text"):
                c.append(("terms", x["text"], x.get("layer", "analysis")))
    for f in ("watch_points", "gaps", "practice_notes", "impact"):
        for x in (e.get(f) or []):
            if isinstance(x, dict) and x.get("text"):
                c.append((f, x["text"], x.get("layer", "analysis")))
            elif isinstance(x, dict) and x.get("item"):
                c.append((f, " ".join(str(x.get(k) or "") for k in ("item", "why", "where")), x.get("layer", "analysis")))
    for s in e.get("sources", []):
        if s.get("file"):
            c.append(("sources.file", s["file"], "disclosed"))
        for q in (s.get("quotes") or []):
            if q.get("text"):
                c.append(("sources.quotes", q["text"], "disclosed"))
        d = db_by_aid.get(s.get("doc_id"))
        if d:
            for f in ("公告标题", "公告类型", "披露易分类", "动作类型", "未披露事项"):
                if d.get(f):
                    c.append(("db." + f, str(d[f]), "disclosed"))
            for f in ("③法务关注（ODI/FDI审批备案/目标国合规/制裁出口管制/知识产权）",
                      "主要风险与不确定性", "①商务关注（市场进入/渠道客户/竞争/关税贸易政策）"):
                if d.get(f):
                    c.append(("db." + f[:6], str(d[f]), "analysis"))
    return [(f, x, l) for f, x, l in c if x and str(x).strip()]


# 关键词规则：(rule_id, issue_code, keywords, 说明)；命中即在语料找上下文
KW_RULES = [
    ("R-I1.5", "I1.5", ["境外上市备案", "证监会备案", "全流通"], "境外上市证监会备案"),
    ("R-I1.6", "I1.6", ["对外承包", "EPC", "工程总承包", "总承包合同"], "对外承包工程资格与备案"),
    ("R-I2.2", "I2.2", ["行业准入", "负面清单", "经营许可", "牌照", "特许经营权"], "行业准入/负面清单"),
    ("R-I2.3", "I2.3", ["采矿权", "矿权", "矿区", "矿业权", "探矿权", "土地所有权", "特许权"], "土地/矿权/特许权"),
    ("R-I2.4", "I2.4", ["园区", "投资优惠", "财政补贴", "政府补贴"], "投资优惠与园区义务"),
    ("R-I3.1", "I3.1", ["经营者集中", "反垄断申报", "反垄断审查"], "经营者集中申报"),
    ("R-I3.2", "I3.2", ["外国补贴", "FSR"], "EU 外国补贴审查"),
    ("R-I4.1", "I4.1", ["出口管制", "实体清单", "FDPR", "两用物项", "EAR", "出口许可"], "出口管制"),
    ("R-I5.1", "I5.1", ["OFAC", "SDN", "制裁"], "制裁名单风险"),
    ("R-I5.3", "I5.3", ["不可靠实体清单", "反制裁"], "中国反制裁"),
    ("R-I6.1", "I6.1", ["数据出境", "数据跨境", "数据合规", "个人信息", "数据安全"], "数据出境/个人信息"),
    ("R-I6.2", "I6.2", ["GDPR"], "东道国个人信息法"),
    ("R-I6.3", "I6.3", ["网络安全", "关键信息基础设施", "DSA"], "网络安全/平台监管"),
    ("R-I7.3", "I7.3", ["出口退税", "退税", "税则"], "出口退税/税则申报"),
    ("R-I7.1", "I7.1", ["关税", "反倾销", "反补贴", "301", "232", "de minimis", "小额包裹"], "关税/贸易救济"),
    ("R-I7.2", "I7.2", ["原产地", "转运", "规避"], "原产地与转运"),
    ("R-I7.4", "I7.4", ["产品认证", "CE认证", "CE 认证", "FCC", "FDA", "药械注册", "SRRC", "TELEC"], "产品认证"),
    ("R-I8.1", "I8.1", ["转让定价", "常设机构"], "常设机构/转让定价"),
    ("R-I8.2", "I8.2", ["预提税", "税收协定", "股息税"], "预提税/税收协定"),
    ("R-I8.3", "I8.3", ["支柱二", "全球最低税", "BEPS"], "支柱二全球最低税"),
    ("R-I8.4", "I8.4", ["间接转让"], "间接转让"),
    ("R-I9.1", "I9.1", ["外派", "雇佣配额", "本地雇佣", "本地化用工"], "外派与本地雇佣"),
    ("R-I9.2", "I9.2", ["工会", "集体谈判", "罢工"], "工会/集体谈判"),
    ("R-I9.3", "I9.3", ["环保", "环评", "原住民", "社区权益", "尾矿", "排放"], "环保/社区权益"),
    ("R-I9.4", "I9.4", ["UFLPA", "强迫劳动", "供应链尽调"], "强迫劳动供应链尽调"),
    ("R-I10.1", "I10.1", ["先决条件", "交割条件", "closing condition", "Closing Condition", "长停止", "生效条件"], "先决条件与长停止日"),
    ("R-I10.2", "I10.2", ["或有", "对价调整", "价款调整", "里程碑付款", "业绩承诺", "earn-out", "Earn-Out"], "价款调整/或有对价"),
    ("R-I10.4", "I10.4", ["争议解决", "适用法律", "管辖", "仲裁条款"], "争议解决与适用法"),
    ("R-I10.5", "I10.5", ["合资", "治理结构", "董事会席位", "僵局", "退出机制"], "合资治理/退出"),
    ("R-I11.1", "I11.1", ["技术许可", "技术转让", "技术出资", "授权许可"], "技术许可/转让"),
    ("R-I11.2", "I11.2", ["专利", "商标", "知识产权"], "商标与专利"),
    ("R-I11.3", "I11.3", ["337", "ITC"], "337 调查"),
    ("R-I12.2", "I12.2", ["行政处罚", "罚款", "整改", "警示函", "监管函", "违规"], "行政处罚与整改"),
    ("R-I12.1", "I12.1", ["诉讼", "仲裁"], "境外诉讼仲裁"),
    ("R-I12.3", "I12.3", ["投资仲裁", "征收", "国有化", "战争险"], "投资仲裁/国家风险"),
    ("R-I13.2", "I13.2", ["H股", "H 股", "GDR", "D股", "D 股", "双重主要上市", "第二上市"], "H股/D股/GDR"),
    ("R-I13.3", "I13.3", ["募集资金", "募资", "配售所得", "全球发售所得"], "募集资金境外使用"),
    ("R-I1.4", "I1.4", ["国资", "国有资产", "国资委"], "国资境外投资监管"),
    ("R-I1.1", "I1.1", ["发改委", "ODI", "境外投资备案", "境外投资项目"], "ODI 发改委备案/核准"),
    ("R-I1.2", "I1.2", ["商务部备案", "商务部门备案", "境外投资备案"], "商务部境外投资备案"),
    ("R-I1.3", "I1.3", ["外汇登记", "资金汇出", "购付汇", "外汇局"], "外汇 ODI 登记及汇出"),
]

LEGACY_KW = [(code, kw) for _rid, code, kws, _n in KW_RULES for kw in kws]


def map_legacy_fragment(frag):
    for code, kw in LEGACY_KW:
        if kw in frag:
            return code
    return None


def raw_categories(e, db_by_aid):
    """各来源原始分类（disclosed）：巨潮公告类型 / 披露易分类 / SEC 表格。"""
    cats = []
    for s in e.get("sources", []):
        d = db_by_aid.get(s.get("doc_id"))
        if d and d.get("公告类型"):
            cats.append((s, "巨潮公告类型「" + str(d["公告类型"]) + "」"))
        if d and d.get("披露易分类"):
            cats.append((s, "披露易 headline「" + str(d["披露易分类"]) + "」"))
        if not d or (not d.get("公告类型") and not d.get("披露易分类")):
            m = re.match(r"^([0-9A-Z\-]+)[：:]", s.get("file") or "")
            if s.get("channel") == "美股·EDGAR" and m:
                cats.append((s, "SEC 表格 " + m.group(1)))
    return cats


def build_triggers(e, db_by_aid, tax_names):
    mt = (e.get("matter_type") or {}).get("value") or ""
    if mt == "建厂":
        mt = "设厂"
    geo = (e.get("geo") or {}).get("text") or ""
    corp = corpus_of(e, db_by_aid)
    full = "\n".join(x[1] for x in corp)
    trs, seen = [], set()

    def add(code, fact, status, layer, basis):
        key = (code, fact)
        if key in seen:
            return
        seen.add(key)
        trs.append({
            "issue_code": code, "issue": tax_names.get(code, ""),
            "trigger_fact": fact, "text": fact,   # text 兼容 validate/旧前端
            "status": status, "layer": layer, "basis": basis,
        })

    # ① 关键词规则：每条命中取一处真实上下文
    for rid, code, kws, label in KW_RULES:
        for kw in kws:
            hit = None
            for field, text, layer in corp:
                if kw in text:
                    hit = (field, text, layer, ctx(text, kw))
                    break
            if hit:
                field, text, layer, snip = hit
                if NEG_HIT.search(snip):
                    break  # 否定语境（「不涉及ODI」等）：触发点不成立，不出条
                st = status_of(snip)
                add(code,
                    "语料提及「%s」（字段：%s）" % (snip, field),
                    st, "analysis",
                    "%s 命中词「%s」→ %s；处理状态按命中上下文判定，无审批/备案处理字样即 not_disclosed" % (rid, kw, label))
                break

    # ② 结构规则：境内出境监管（对外投资类事项兜底，not_disclosed 不推断）
    def has_code(c):
        return any(t["issue_code"] == c for t in trs)
    if mt in INVEST_MT:
        if not has_code("I1.1"):
            add("I1.1", "事项类型=%s，涉及境内主体对外投资；ODI 发改委备案/核准在已核语料中%s"
                % (mt, "有提及（见关键词触发条）" if "发改委" in full or "ODI" in full else "未提及"),
                "not_disclosed", "analysis",
                "R-I1.1-mt：事项类型∈{设厂/并购/合资}→境内出境监管链路核查点；原文未载明办理状态，不推断")
        if not has_code("I1.2"):
            add("I1.2", "事项类型=%s；商务部境外投资备案在已核语料中%s"
                % (mt, "有提及" if "商务" in full else "未提及"),
                "not_disclosed", "analysis", "R-I1.2-mt：同上规则组")
    # 东道国外资审查（并购/新设进入受审查法域）
    for ctry, regime in FDI_REGIME.items():
        if ctry in geo and mt in INVEST_MT:
            kw_hit = any(kw in full for kw in ("外资审查", "FIRB", "CFIUS", "审批", "审查"))
            add("I2.1", "标的/项目位于%s（geo 字段），事项类型=%s；%s 审查在已核语料中%s"
                % (ctry, mt, regime, "有提及" if kw_hit else "未提及办理状态"),
                "not_disclosed", "analysis",
                "R-I2.1-geo：受审查法域+投资类事项→%s 核查点；机制名为法域常识标注" % regime)
            break
    # 并购→经营者集中
    if mt == "并购" and "经营者集中" not in full and "反垄断" not in full:
        add("I3.1", "事项类型=并购；经营者集中申报义务是否触发，已核语料未提及",
            "not_disclosed", "analysis", "R-I3.1-mt：并购事项→反垄断申报核查点；无原文不推断")
    # 融资/担保类
    if mt in ("融资", "担保", "发债") or any(kw in full for kw in ("银团", "担保", "授信", "贷款")):
        st = "not_disclosed"
        add("I10.3", "事项类型=%s；涉及融资/担保安排（语料%s「银团/担保/授信/贷款」字样）"
            % (mt or "未归类", "含" if any(kw in full for kw in ("银团", "担保", "授信", "贷款")) else "未含，按事项类型"),
            st, "analysis", "R-I10.3-mt：融资/担保类事项→I10.3；担保结构、财务契约以原文为准")
    # 合资
    if mt == "合资":
        add("I10.5", "事项类型=合资；合资治理/僵局/退出安排以协议为准", "not_disclosed", "analysis",
            "R-I10.5-mt：合资事项→合资治理核查点")
    # ③ 原始分类（disclosed，保底：每事件 ≥1 条）
    cats = raw_categories(e, db_by_aid)
    for s, label in cats:
        add("I3.3", "披露渠道原始分类：%s（来源：%s %s）" % (label, s.get("channel", ""), s.get("date", "")),
            "disclosed_cleared", "disclosed",
            "R-I3.3-raw：raw_category 逐源保留，不作归一改写（Vault 双层分类做法）")
    # ④ 多地披露同步
    chans = sorted({s.get("channel") for s in e.get("sources", []) if s.get("channel")})
    if len(chans) >= 2:
        add("I13.1", "同一事项经 %d 个市场渠道披露：%s" % (len(chans), "、".join(chans)),
            "disclosed_cleared", "disclosed", "R-I13.1-src：来源渠道数≥2（sources 字段计数）")
    if not cats and not trs:
        add("I3.3", "披露渠道原始分类：%s（来源文件字段，无更细分类）"
            % "、".join(chans) if chans else "未记录",
            "disclosed_cleared", "disclosed", "R-I3.3-fallback：无 raw_category 字段，以渠道兜底")
    return trs


def main():
    dry = "--dry-run" in sys.argv
    evj = json.load(open(EV_PATH, encoding="utf-8"))
    db = json.load(open(DB_PATH, encoding="utf-8"))
    tax = json.load(open(TAX_PATH, encoding="utf-8"))
    tax_names = {c: n for fl in tax["first_level"] for c, n in fl["sub"]}
    valid_codes = set(tax_names)
    db_by_aid = {d["_aid"]: d for d in db["disclosures"]}

    n_trig = n_unmapped = 0
    dist = {}
    for e in evj["events"]:
        legacy = e.get("legal_triggers") or []
        trs = build_triggers(e, db_by_aid, tax_names)
        # 旧自由文本拆片归码（保留旧轮分析内容，归不上的单列）
        unmapped = []
        for lt in legacy:
            txt = lt.get("text") or ""
            if not txt.strip() or lt.get("issue_code"):
                continue
            for frag in re.split(r"[；;]", txt):
                frag = frag.strip()
                if not frag:
                    continue
                code = map_legacy_fragment(frag)
                if code:
                    key = ("L", code, frag)
                    if not any(t["issue_code"] == code and frag in t["trigger_fact"] for t in trs):
                        trs.append({
                            "issue_code": code, "issue": tax_names.get(code, ""),
                            "trigger_fact": frag,
                            "text": frag,
                            "status": "not_disclosed", "layer": "analysis",
                            "basis": "旧轮入库分析文本归码（legal_map 关键词映射）；原文处理状态未核查",
                        })
                else:
                    unmapped.append({"text": frag, "basis": lt.get("basis") or ""})
        trs.sort(key=lambda t: t["issue_code"])
        e["legal_triggers"] = trs
        if unmapped:
            e["legal_notes_unmapped"] = unmapped
        else:
            e.pop("legal_notes_unmapped", None)
        n_trig += len(trs)
        n_unmapped += len(unmapped)
        for t in trs:
            dist[t["issue_code"]] = dist.get(t["issue_code"], 0) + 1
        bad = [t["issue_code"] for t in trs if t["issue_code"] not in valid_codes]
        if bad:
            raise SystemExit("非法议题码 %s @%s" % (bad, e["event_id"]))
        if not trs:
            raise SystemExit("事件无触发点（违反每事件≥1）：" + e["event_id"])

    evj.setdefault("meta", {})["legal_map"] = {
        "version": "r06-1", "run": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        "rule": "scripts/legal_map.py 确定性规则；trigger 只挂一个二级码；原文无处理字样一律 not_disclosed",
        "triggers": n_trig, "legacy_unmapped": n_unmapped,
    }
    if not dry:
        json.dump(evj, open(EV_PATH, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("legal_map %s：%d 事件 → %d 条触发点（%d 个二级码有命中），旧文本未归码 %d 片"
          % ("(dry-run)" if dry else "完成", len(evj["events"]), n_trig, len(dist), n_unmapped))
    for k in sorted(dist):
        print("  %s %s：%d" % (k, tax_names.get(k, ""), dist[k]))


if __name__ == "__main__":
    main()
