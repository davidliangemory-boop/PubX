# -*- coding: utf-8 -*-
"""derive.py — 从 web_db.json 的披露记录派生工作台实体数据。

派生口径（全部可回溯到披露原文）：
  · 公司 / 项目（公司+主区域）/ 区域（别名归一）/ 合作方 / 行业（公司映射表）
  · 资金事项（金额正则抽取 + 类型判定，保留原文表述）
  · 合规事项（按动作类型从法规模板选取，证据自动挂披露摘录；无证据则「待跟踪」）
  · 关系图谱节点边 / 披露变化 / 判断检验 / 项目日历 / 政策时间线（真实法规政策）
"""
import re, json, os
from collections import OrderedDict

# ── 区域别名归一（仅命中别名表的计入，避免自由文本噪音） ──
REGION_ALIAS = OrderedDict([
    ("尼日利亚", ["尼日利亚"]), ("埃塞俄比亚", ["埃塞俄比亚"]),
    ("刚果（金）", ["刚果", "科米卡"]), ("阿联酋", ["阿联酋", "阿布扎比"]),
    ("澳大利亚", ["澳大利亚", "西澳大利亚", "Durack", "Yandanooka"]),
    ("泰国", ["泰国"]), ("美国", ["美国"]), ("埃及", ["埃及", "亚历山大", "苏伊士"]),
    ("新加坡", ["新加坡"]), ("越南", ["越南", "顺化"]), ("法国", ["法国"]),
    ("塞尔维亚", ["塞尔维亚"]), ("哥伦比亚", ["哥伦比亚"]), ("印度", ["印度"]),
    ("韩国", ["韩国"]), ("巴西", ["巴西"]), ("墨西哥", ["墨西哥"]),
    ("摩洛哥", ["摩洛哥"]), ("斯洛伐克", ["斯洛伐克"]), ("英国", ["英国", "伦敦"]),
    ("中国香港", ["中国香港", "香港", "BVI"]),
])
SKIP_TOKEN = ("已通过", "已获", "此前已获", "将注销", "原计划", "发行主体注册", "标的")

# ── 公司行业映射（按公司全称关键字；新项目公司落在「—」并随批次补） ──
INDUSTRY_MAP = [
    ("精工钢", "建筑工程"), ("晶科电力", "新能源"), ("兖矿能源", "能源矿业"),
    ("广电运通", "电子信息"), ("鸿富瀚", "电子制造"), ("龙佰集团", "新材料"),
    ("三星医疗", "电气设备"), ("玲珑轮胎", "汽车零部件"), ("泰林生物", "医药健康"),
    ("三友联众", "电气设备"), ("行云科技", "信息技术"), ("品茗科技", "软件服务"),
    ("汇宇制药", "医药健康"), ("赛诺医疗", "医疗器械"), ("航宇科技", "航空航天"),
    ("太湖雪", "纺织消费"), ("共达电声", "电子制造"), ("川金诺", "化工"),
    ("泰晶科技", "电子制造"), ("瀚蓝环境", "环保公用"), ("天成自控", "汽车零部件"),
    ("安踏", "纺织消费"), ("理想汽车", "汽车整车"), ("Li Auto", "汽车整车"),
    ("腾讯控股", "互联网"), ("腾讯", "互联网"), ("中国人寿", "金融保险"),
    ("吉利", "汽车整车"), ("长城汽车", "汽车整车"), ("海尔智家", "家电制造"),
    ("JinkoSolar", "新能源"), ("晶科", "新能源"), ("NIO", "汽车整车"), ("蔚来", "汽车整车"),
    ("XPeng", "汽车整车"), ("小鹏", "汽车整车"), ("PDD", "跨境电商"), ("拼多多", "跨境电商"),
    ("传音", "消费电子"), ("剑桥科技", "通信设备"), ("若羽臣", "电商服务"),
    ("天赐材料", "新材料"), ("新宙邦", "新材料"), ("汉威科技", "仪器仪表"),
    ("绿联科技", "消费电子"), ("江丰电子", "半导体材料"), ("联讯仪器", "仪器仪表"),
    ("嘉立创", "电子制造"), ("奥士康", "电子制造"),
]

# ── 项目名称映射（按公告标题关键字；兜底用动作类型） ──
PROJECT_NAME = [
    ("精工钢", "尼日利亚/埃塞钢结构工程分包"),
    ("晶科电力", "阿布扎比 Al Dhafrah 2,100MW 光储电站"),
    ("兖矿能源", "兖煤澳大利亚运营（权益产销量）"),
    ("广电运通", "泰国金融智能终端供货"),
    ("鸿富瀚", "刚果（金）科米卡矿区电站并购+增资"),
    ("龙佰集团", "西澳 Durack/Yandanooka 钛锆矿砂"),
    ("三星医疗", "美国数据中心油浸式变压器供货"),
    ("玲珑轮胎", "埃及亚历山大 PCR 轮胎厂（600万套/年）"),
    ("泰林生物", "新加坡国际贸易平台"),
    ("三友联众", "越南顺化继电器基地增资扩产"),
    ("行云科技", "新加坡算力服务器销售"),
    ("品茗科技", "收购新加坡 ZLX ENGINEERING"),
    ("汇宇制药", "药品国际注册（法国等15国）"),
    ("赛诺医疗", "冠脉介入器械国际注册"),
    ("航宇科技", "摩洛哥锻造生产基地（自斯洛伐克迁址）"),
    ("太湖雪", "伦敦跨境电商/零售实体"),
    ("共达电声", "泰国电声元器件研发制造基地"),
    ("川金诺", "埃及苏伊士磷化工项目（优先股募资）"),
    ("安踏", "PUMA SE 29.06%股权投资"),
    ("理想汽车", "马赫心科技芯片业务融资"), ("Li Auto", "马赫心科技芯片业务融资"),
    ("腾讯", "全球中期票据计划（GMTN）发行"),
    ("中国人寿", "养老险公司股权出售（集团重组）"),
    ("吉利", "2027-2029持续关连交易框架"),
    ("长城汽车", "持续关连交易年度上限修订"),
    ("海尔智家", "控股子公司担保额度管理"),
    ("JinkoSolar", "江西晶科9M2026业绩预告"), ("晶科", "江西晶科9M2026业绩预告"),
    ("NIO", "多品牌交付放量"), ("蔚来", "多品牌交付放量"),
    ("XPeng", "Q3交付放量＋香港兆瓦超充站"), ("小鹏", "Q3交付放量＋香港兆瓦超充站"),
    ("PDD", "Temu跨境电商（Q2 2026业绩）"), ("拼多多", "Temu跨境电商（Q2 2026业绩）"),
    ("传音", "H股上市（2636.HK）"), ("剑桥科技", "H股配售＋可转债融资"),
    ("若羽臣", "H股发行上市推进"), ("天赐材料", "H股发行上市推进"),
    ("新宙邦", "H股发行上市推进"), ("汉威科技", "H股发行上市推进"),
    ("绿联科技", "H股发行上市推进"), ("江丰电子", "H股发行上市筹划"),
    ("联讯仪器", "H股发行上市筹划"), ("嘉立创", "H股发行上市筹划"), ("奥士康", "H股发行上市筹划"),
    ("泰晶科技", "越南晶振/频率元件生产基地"),
    ("瀚蓝环境", "分步并购粤丰环保（100%控股）"),
    ("天成自控", "泰国乘用车座椅总成定点"),
]

LIFECYCLE = ["意向", "签约", "审批", "登记", "交割", "建设", "投产", "运营", "扩产", "退出"]

# ── 法规模板（依据均为真实现行法规，引用到法规名称与文号，不虚构条文） ──
COMPLIANCE_TEMPLATE = [
    ("境外投资备案（发改）", "发改委11号令", "境内企业直接或通过控制的境外企业开展敏感类/大额非敏感类境外投资",
     "实行备案管理的，投资主体通过在线平台提交备案申请；地方企业由省级发改委备案",
     "《企业境外投资管理办法》（国家发展改革委令第11号，2018-03-01施行）",
     "备案申请表、投资主体营业执照、董事会决议、尽调/可研、资金来源说明",
     "新设|并购|增资|收购|投资", "发改备案通知书 / 在线平台回执"),
    ("境外投资备案（商务）", "商务部3号令", "境内企业新设、并购及其他方式取得境外企业权益",
     "报省级商务主管部门备案，领取《企业境外投资证书》",
     "《境外投资管理办法》（商务部令2014年第3号）",
     "备案表、境外企业章程、投资主体证书", "新设|并购|增资|收购|投资", "企业境外投资证书"),
    ("ODI 外汇登记", "汇发〔2015〕13号", "境内机构境外直接投资外汇收支",
     "银行凭发改委/商务备案直接办理外汇登记，无需外汇局事前核准",
     "《关于进一步简化和改进直接投资外汇管理政策的通知》（汇发〔2015〕13号）",
     "业务登记凭证、资金来源证明、备案文件", "新设|并购|增资|收购|投资|借款|担保", "外汇业务登记凭证"),
    ("上市公司审议与披露", "信披办法", "上市公司实施境外投资、担保、资助达到披露或审议标准",
     "按章程权限经董事会/股东大会审议，及时履行临时公告义务，持续披露进展",
     "《上市公司信息披露管理办法》及交易所股票上市规则",
     "董事会/股东大会决议、临时公告、进展公告", "ALL", "公告原文与决议"),
    ("目标国公司注册", "属地公司法", "在目标国新设子公司、孙公司或收购后重组主体",
     "按目标国公司法完成注册、章程备案、股东/董事登记，取得注册证书",
     "目标国公司法及投资促进法规（以属地要求为准）",
     "章程、注册证书、股东名册、董事委任", "新设|注册|设立|孙公司|子公司", "注册证书 / 登记回执"),
    ("行业准入与许可", "属地行业法", "从事受监管行业（采矿、电力、医疗器械、药品、金融设备等）",
     "取得目标国行业许可证/注册证，注意许可有效期与续期条件",
     "目标国行业监管法规；医疗器械/药品另涉 CE/FDA 等注册",
     "许可申请表、技术文件、质量体系证明", "矿|电站|医疗|药品|注册|许可|厂|基地", "许可证 / 注册证"),
    ("税务合规", "税法+税收协定", "设立实体、取得所得或在目标国构成常设机构",
     "完成目标国税务登记与申报；关注中国受控外国企业规则与税收协定待遇",
     "《企业所得税法》第45条（受控外国企业）；中国与目标国税收协定",
     "税务登记、转让定价文档、协定待遇备案", "新设|并购|厂|基地|运营|销售", "税务登记 / 申报回执"),
    ("劳工与环保", "属地劳动法", "建厂、运营及并购后雇用当地员工",
     "遵守目标国劳动用工、社保、安全生产与环保许可要求",
     "目标国劳动法、环境保护法规（以属地要求为准）",
     "用工合同、环评批复、安全许可", "厂|基地|运营|并购|电站", "环评批复 / 用工登记"),
    ("制裁与出口管制", "出口管制", "涉美元结算、美国技术含量高的产品、敏感地区投资",
     "筛查交易对手与最终用户（OFAC/EAR/联合国及中国出口管制法），评估二级制裁风险",
     "《出口管制法》；OFAC 制裁条例；EAR",
     "制裁筛查记录、最终用户声明、许可判断", "刚果|电站|矿|美国|军工|航空|半导体", "筛查记录 / 许可证"),
    ("知识产权", "知产国际注册", "品牌、技术进入目标国市场",
     "通过马德里体系/巴黎公约/PCT 完成商标专利布局，监控侵权",
     "《商标法》《专利法》及马德里/巴黎公约、PCT",
     "商标/专利申请材料、优先权文件", "注册|品牌|技术|药品|医疗", "注册证书 / 受理通知"),
    ("数据与跨境信息", "数据合规", "业务涉及个人信息或重要数据跨境传输",
     "履行告知同意、数据出境安全评估/标准合同；遵守目标国数据法（如 GDPR）",
     "《个人信息保护法》《数据安全法》；目标国数据保护法规",
     "告知同意文本、出境评估/备案材料", "算力|服务器|数据|电商", "评估批复 / 备案回执"),
    ("合同与承诺履行", "合同法", "签署长期供货、PPA、定点、投资承诺",
     "跟踪履约节点、投资承诺兑现、违约与终止条款",
     "《民法典》合同编；目标国合同法；合同文本",
     "合同文本、履约凭证、交付验收", "签约|合同|定点|PPA|借款|担保", "合同 / 交付凭证"),
]

FUND_KEYWORDS = [
    ("借款", "股东借款", "内部资金"), ("财务资助", "财务资助", "内部资金"),
    ("担保", "担保", "或有负债"), ("优先股", "股权融资", "股权资金"),
    ("增资", "增资", "股权资金"), ("收购|并购", "并购投资", "对外支付"),
    ("投资设立|投资建设|建厂|建设生产基地", "绿地投资", "对外支付"),
    ("可行性研究", "绿地投资", "对外支付"),
    ("合同|签约|定点|订单", "合同订单", "未来流入"),
    ("产量|销量|经营数据", "经营数据", "—"),
    ("许可|注册证", "市场准入", "—"),
    ("意向|条款清单", "意向", "—"),
]

AMOUNT_RE = re.compile(r"([\d,]+(?:\.\d+)?)\s*(亿|万)?\s*(亿人民币|亿元人民币|人民币|美元|澳元|欧元|港元|元)")
CCY_UNIT = {"美元": "USD", "人民币": "CNY", "元": "CNY", "人民币元": "CNY", "澳元": "AUD",
            "欧元": "EUR", "港元": "HKD", "万人民币": "CNY", "亿人民币": "CNY"}


def regions_of(text):
    out, seen = [], set()
    for tok in re.split(r"[、，,；;/（）()\s]+", text or ""):
        if not tok or any(tok.startswith(s) for s in SKIP_TOKEN):
            continue
        for canon, aliases in REGION_ALIAS.items():
            if canon in seen:
                continue
            if any(a in tok for a in aliases):
                seen.add(canon)
                out.append(canon)
                break
    return out


def industry_of(company):
    for k, v in INDUSTRY_MAP:
        if k in company:
            return v
    return "—"


def project_name(company, title, action):
    for k, v in PROJECT_NAME:
        if k in company:
            return v
    return (action or title or "未命名项目").split("（")[0][:28]


def stage_of(r):
    g = r.get("阶段组") or ""
    detail = (r.get("动作阶段") or "") + (r.get("动作类型") or "")
    if g == "意向":
        return "意向"
    if g == "协议":
        return "签约"
    if g == "变更":
        return "扩产" if "增资" in detail or "扩产" in detail else "变更"
    if g == "投产/运营":
        return "运营"
    if g == "完成":
        return "交割"
    if g == "实施":
        for kw, st in [("注册登记", "登记"), ("注册", "登记"), ("交割", "交割"),
                       ("开工|建设", "建设"), ("投产", "投产"), ("备案", "审批"),
                       ("置换|运营", "运营")]:
            if any(k in detail for k in kw.split("|")):
                return st
        return "实施"
    return "签约"


def parse_amounts(text):
    """返回 [{num, scale, ccy, raw}]；无法解析返回 []，不猜。"""
    out = []
    for m in AMOUNT_RE.finditer(text or ""):
        num = m.group(1).replace(",", "")
        try:
            v = float(num)
        except ValueError:
            continue
        scale = m.group(2) or ""
        ccy_raw = m.group(3)
        ccy = CCY_UNIT.get(ccy_raw, "CNY")
        out.append({"num": v, "scale": scale, "ccy": ccy, "raw": m.group(0)})
    return out


def fund_type(action, title):
    t = (action or "") + (title or "")
    for kws, ftype, direction in FUND_KEYWORDS:
        if any(k in t for k in kws.split("|")):
            return ftype, direction
    return "其他", "—"


def build_derived(db, cfg):
    D = db["disclosures"]
    derived = {"companies": [], "projects": [], "regions": [], "partners": [],
               "funds": [], "compliance": [], "graph": {"nodes": [], "edges": []},
               "changes": [], "judgments": [], "calendar": [], "policies": [],
               "supplychain": {"capacity": [], "clusters": []}}

    comp = OrderedDict()
    for r in D:
        comp.setdefault(r["公司全称"], []).append(r)

    proj_idx = OrderedDict()
    for r in D:
        regs = regions_of(r.get("涉及国家/地区", ""))
        primary = regs[0] if regs else "未标明"
        key = (r["公司全称"], primary)
        if key not in proj_idx:
            pid = "P%02d" % (len(proj_idx) + 1)
            proj_idx[key] = {"id": pid, "company": r["公司全称"], "name": project_name(r["公司全称"], r["公告标题"], r["动作类型"]),
                             "region": primary, "regions_all": regs, "industry": industry_of(r["公司全称"]),
                             "aids": [], "events": []}
        proj_idx[key]["aids"].append(r["_aid"])
        if regs:
            proj_idx[key]["regions_all"] = sorted(set(proj_idx[key]["regions_all"]) | set(regs))

    # 公司
    for name, evs in comp.items():
        evs = sorted(evs, key=lambda x: x["披露日期与时间"])
        regs, partners, ftypes = set(), set(), set()
        for r in evs:
            regs |= set(regions_of(r.get("涉及国家/地区", "")))
            ft, _ = fund_type(r.get("动作类型"), r.get("公告标题"))
            ftypes.add(ft)
            for p in re.split(r"[；;、，,]", r.get("合作方", "")):
                p = p.strip().strip("（）()")
                if 2 < len(p) < 40:
                    partners.add(p)
        primary_proj = [p for p in proj_idx.values() if p["company"] == name]
        derived["companies"].append({
            "name": name, "code": evs[-1]["股票代码"], "industry": industry_of(name),
            "regions": sorted(regs), "aids": [r["_aid"] for r in evs],
            "projects": [p["id"] for p in primary_proj],
            "partners": sorted(partners)[:8], "fund_types": sorted(ftypes),
            "latest": evs[-1]["披露日期与时间"], "count": len(evs),
        })

    # 项目 + 时间线 + 资金 + 日历
    for p in proj_idx.values():
        evs = sorted([a for a in (by_aid(db, a) for a in p["aids"]) if a], key=lambda x: x["披露日期与时间"])
        timeline = [{"date": r["披露日期与时间"], "stage": stage_of(r), "title": r["公告标题"],
                     "aid": r["_aid"], "seq": r["序号"]} for r in evs]
        stages_hit = [t["stage"] for t in timeline]
        current = LIFECYCLE[max([LIFECYCLE.index(s) for s in stages_hit if s in LIFECYCLE] or [0])] if stages_hit else "意向"
        amounts = []
        for r in evs:
            for a in parse_amounts(r.get("投资金额")):
                ftype, direction = fund_type(r.get("动作类型"), r.get("公告标题"))
                fid = "F-%s-%d" % (r["_aid"], len(derived["funds"]))
                derived["funds"].append({**a, "id": fid, "aid": r["_aid"], "date": r["披露日期与时间"],
                                         "company": p["company"], "project": p["id"], "ftype": ftype,
                                         "direction": direction, "text": r["投资金额"][:120]})
            derived["calendar"].append({"date": r["披露日期与时间"], "type": "披露", "title": r["公告标题"],
                                        "company": p["company"], "project": p["id"], "aid": r["_aid"]})
        nexts = []
        for r in evs:
            for o in (r.get("后续观察清单") or []):
                if o and o not in nexts:
                    nexts.append(o)
        for i, o in enumerate(nexts[:3]):
            derived["calendar"].append({"date": "", "type": "待跟踪", "title": o, "company": p["company"],
                                        "project": p["id"], "aid": evs[-1]["_aid"]})
        derived["projects"].append({**p, "events": timeline, "current_stage": current,
                                    "stage_pos": (LIFECYCLE.index(current) + 1) if current in LIFECYCLE else 0,
                                    "lifecycle_len": len(LIFECYCLE),
                                    "latest": evs[-1]["披露日期与时间"],
                                    "next_nodes": nexts[:4], "amounts": amounts})

    # 区域聚合
    reg = OrderedDict()
    for p in derived["projects"]:
        for rr in (p["regions_all"] or [p["region"]]):
            reg.setdefault(rr, {"region": rr, "projects": [], "companies": set(), "industries": set(), "funds": []})
            reg[rr]["projects"].append(p["id"])
            reg[rr]["companies"].add(p["company"])
            if p["industry"] != "—":
                reg[rr]["industries"].add(p["industry"])
    for f in derived["funds"]:
        if f["project"] in {p["id"] for p in derived["projects"]}:
            pass
    for rr, v in reg.items():
        fsum = [f for f in derived["funds"] if f["project"] in v["projects"] and f["num"]]
        derived["regions"].append({"region": rr, "project_cnt": len(v["projects"]),
                                   "company_cnt": len(v["companies"]),
                                   "industries": sorted(v["industries"]),
                                   "fund_cnt": len(fsum),
                                   "projects": v["projects"]})

    # 合作方
    part = OrderedDict()
    for p in derived["projects"]:
        r0 = by_aid(db, p["aids"][0]) if p["aids"] else None
        if not r0:
            continue
        for x in re.split(r"[；;、，,]", r0.get("合作方", "")):
            x = x.strip().strip("（）()")
            if 2 < len(x) < 40:
                part.setdefault(x, {"name": x, "projects": [], "companies": set()})
                part[x]["projects"].append(p["id"])
                part[x]["companies"].add(p["company"])
    derived["partners"] = [{"name": k, "project_cnt": len(v["projects"]),
                            "companies": sorted(v["companies"]), "projects": v["projects"]}
                           for k, v in sorted(part.items(), key=lambda kv: -len(kv[1]["projects"]))]

    # 合规事项（按项目动作选模板；证据=披露摘录命中关键词）
    comp_id = 0
    for p in derived["projects"]:
        r0 = by_aid(db, p["aids"][0]) if p["aids"] else None
        if not r0:
            continue
        hay = (r0.get("动作类型", "") + r0.get("动作阶段", "") + r0.get("公告标题", ""))
        quotes = [{"aid": r0["_aid"], "text": q["text"], "page": q.get("page")}
                  for q in (r0.get("摘录") or [])]
        for cat, cat_short, cond, req, basis, material, kws, evidence_hint in COMPLIANCE_TEMPLATE:
            if "ALL" not in kws and not any(k in hay for k in kws.split("|")):
                continue
            comp_id += 1
            ev = []
            for kw in re.split(r"[|]", kws):
                if kw == "ALL":
                    continue
                hit = next((q for q in quotes if kw in q["text"]), None)
                if hit:
                    ev.append(hit)
                    break
            # 无关键词命中时也尝试用通用词（注册/备案/许可/合同）找证据
            if not ev:
                for q in quotes:
                    if any(g in q["text"] for g in ("备案", "注册", "许可", "证", "合同", "协议", "登记")):
                        ev.append(q)
                        break
            status = "已识别" if ev else "待跟踪"
            derived["compliance"].append({
                "id": "C%03d" % comp_id, "project": p["id"], "company": p["company"],
                "region": p["region"], "category": cat, "cond": cond, "req": req,
                "basis": basis, "material": material, "evidence": ev,
                "owner": "", "due": "", "review": "每批次扫描复核",
                "status": status, "gap": "" if ev else "待补充证据：%s" % evidence_hint})

    # 关系图谱
    nodes, edges = [], []
    def nid(kind, key):
        return "%s:%s" % (kind, key)
    def add_node(kind, key, name, extra=None):
        n = {"id": nid(kind, key), "kind": kind, "name": name}
        if extra:
            n.update(extra)
        if not any(x["id"] == n["id"] for x in nodes):
            nodes.append(n)
    def add_edge(kind, s, t, etype, date=""):
        edges.append({"s": s, "t": t, "type": etype, "date": date})
    for c in derived["companies"]:
        add_node("company", c["name"], c["name"].replace("股份有限公司", "").replace("有限公司", ""),
                 {"code": c["code"], "industry": c["industry"]})
    for p in derived["projects"]:
        add_node("project", p["id"], p["name"], {"stage": p["current_stage"], "region": p["region"]})
        add_edge("p", nid("company", p["company"]), nid("project", p["id"]), "投资/运营", p["latest"])
        for rr in (p["regions_all"] or [p["region"]]):
            add_node("region", rr, rr)
            add_edge("r", nid("project", p["id"]), nid("region", rr), "位于", p["latest"])
    for pt in derived["partners"]:
        add_node("partner", pt["name"], pt["name"][:18])
        for pid in pt["projects"][:4]:
            add_edge("pt", nid("partner", pt["name"]), nid("project", pid), "合作/交易")
    for f in derived["funds"]:
        if f["ftype"] in ("股东借款", "财务资助", "担保", "增资", "股权融资"):
            add_edge("f", nid("company", f["company"]), nid("project", f["project"]),
                     {"股东借款": "借款", "财务资助": "借款", "担保": "担保", "增资": "增资",
                      "股权融资": "股权"}[f["ftype"]], f["date"])
    for c0 in derived["compliance"]:
        add_node("compliance", c0["id"], c0["category"], {"status": c0["status"]})
        add_edge("c", nid("compliance", c0["id"]), nid("project", c0["project"]),
                 "审批/合规", "")
    for r in D:
        add_node("file", r["_aid"], "披露 %s" % r["披露日期与时间"],
                 {"aid": r["_aid"], "url": r["来源链接"]})
        pid = next((p["id"] for p in derived["projects"] if r["_aid"] in p["aids"]), None)
        if pid:
            add_edge("d", nid("project", pid), nid("file", r["_aid"]), "披露", r["披露日期与时间"])
    derived["graph"] = {"nodes": nodes, "edges": edges}

    event_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "state", "events.json")
    event_sources = []
    if os.path.exists(event_file):
        with open(event_file, encoding="utf-8") as event_stream:
            event_sources = [{s.get("doc_id") for s in e.get("sources", [])}
                             for e in json.load(event_stream).get("events", [])]
    # 披露变化：只比较同一事件的多份来源。
    for name, evs in comp.items():
        evs = sorted(evs, key=lambda x: x["披露日期与时间"])
        for i in range(1, len(evs)):
            a, b = evs[i - 1], evs[i]
            # 同一公司不同事项不能作为前后变化；仅同一事件的来源允许比对。
            same_event = any({a["_aid"], b["_aid"]} <= ids for ids in event_sources)
            if not same_event:
                continue
            items = []
            if a.get("阶段组") != b.get("阶段组"):
                items.append({"field": "阶段", "before": a.get("阶段组"), "after": b.get("阶段组"),
                              "aid_a": a["_aid"], "aid_b": b["_aid"]})
            if a.get("投资金额") != b.get("投资金额"):
                items.append({"field": "金额/规模", "before": (a.get("投资金额") or "")[:80],
                              "after": (b.get("投资金额") or "")[:80],
                              "aid_a": a["_aid"], "aid_b": b["_aid"]})
            if (a.get("主要风险与不确定性") or "") != (b.get("主要风险与不确定性") or ""):
                items.append({"field": "风险表述", "before": (a.get("主要风险与不确定性") or "")[:80],
                              "after": (b.get("主要风险与不确定性") or "")[:80],
                              "aid_a": a["_aid"], "aid_b": b["_aid"]})
            if items:
                derived["changes"].append({"company": name, "date_b": b["披露日期与时间"],
                                           "aid_a": a["_aid"], "aid_b": b["_aid"], "items": items})
    for c in db.get("cases", []) or []:
        derived["judgments"].append({"case": c.get("id"), "title": c.get("title"),
                                     "date": (c.get("events") and by_aid(db, c["events"][-1]) or {}).get("披露日期与时间", ""),
                                     "judgment": c.get("check", ""), "basis": c.get("summary", ""),
                                     "follow": "", "adjust": ""})
    for r in D:
        av = r.get("分析版本")
        if isinstance(av, dict) and (av.get("note") or av.get("model")):
            derived["judgments"].append({"case": "", "title": r["公告标题"], "date": r["披露日期与时间"],
                                         "judgment": av.get("note", "分析版本 %s" % av.get("v", "")),
                                         "basis": "模型 %s" % av.get("model", ""), "follow": "", "adjust": ""})

    # 政策时间线（真实法规政策，发布机构与日期可溯源）
    derived["policies"] = [
        {"date": "2014-09", "title": "《境外投资管理办法》施行", "issuer": "商务部",
         "level": "中国", "summary": "以备案为主、核准为辅的对外投资管理体系确立，企业新设/并购境外企业须报商务部门备案。",
         "industries": [], "regions": []},
        {"date": "2017-08", "title": "国办发〔2017〕74号 引导和规范境外投资方向", "issuer": "国务院办公厅",
         "level": "中国", "summary": "明确鼓励、限制、禁止三类境外投资方向；房地产酒店、娱乐业等受限。",
         "industries": ["房地产", "娱乐"], "regions": []},
        {"date": "2017-12", "title": "《企业境外投资管理办法》公布", "issuer": "国家发展改革委",
         "level": "中国", "summary": "发改委11号令：在线平台办理，敏感类项目核准、非敏感类备案，地方企业由省级发改委备案。",
         "industries": [], "regions": []},
        {"date": "2018-03", "title": "《对外投资备案（核准）报告暂行办法》", "issuer": "商务部等七部门",
         "level": "中国", "summary": "统一备案（核准）报告制度，强化事后报告与重点督查。",
         "industries": [], "regions": []},
        {"date": "2019-03", "title": "汇发〔2015〕13号全面实施，银行直接办理 ODI 外汇登记", "issuer": "外汇局",
         "level": "中国", "summary": "境外直接投资外汇登记由银行直接办理，资金汇出效率提升。",
         "industries": [], "regions": []},
        {"date": "2020-11", "title": "RCEP 签署", "issuer": "东盟十国及中澳日新韩",
         "level": "国际", "summary": "区域全面经济伙伴关系协定签署，区域内关税减让与原产地累积规则重塑东亚供应链布局。",
         "industries": ["制造"], "regions": ["日本", "韩国", "澳大利亚", "泰国", "越南", "新加坡"]},
        {"date": "2022-01", "title": "RCEP 正式生效", "issuer": "各成员国",
         "level": "国际", "summary": "RCEP 对首批成员国生效，出口关税下降推动部分制造产能向东南亚集聚。",
         "industries": ["制造"], "regions": ["泰国", "越南", "新加坡"]},
        {"date": "2023-05", "title": "欧盟碳边境调节机制（CBAM）生效", "issuer": "欧盟",
         "level": "目标国", "summary": "过渡期 2023-10 起报告义务，2026-01 起正式征收；钢铁、铝、水泥、化肥、电力、氢出口欧盟成本上升。",
         "industries": ["钢铁", "化工", "能源"], "regions": ["欧盟"]},
        {"date": "2024-05", "title": "美国宣布对华 301 关税加征（电动车、光伏、关键矿产等）", "issuer": "美国",
         "level": "目标国", "summary": "对电动车（100%）、光伏电池（50%）等加征关税，推动中国新能源与电动车产业链加速海外建厂。",
         "industries": ["新能源", "汽车"], "regions": ["美国"]},
        {"date": "2025-04", "title": "美国「对等关税」及普遍加征", "issuer": "美国",
         "level": "目标国", "summary": "对进口商品普遍加征关税并多次调整；转口与第三国产能布局成为出海企业核心议题。",
         "industries": ["制造"], "regions": ["美国", "墨西哥", "越南", "泰国"]},
        {"date": "2025-01", "title": "中国《民营经济促进法》立法推进", "issuer": "全国人大",
         "level": "中国", "summary": "促进民营经济高质量发展，稳定企业出海预期（后续正式出台以官方发布为准）。",
         "industries": [], "regions": []},
        {"date": "2026-01", "title": "CBAM 进入正式征收阶段", "issuer": "欧盟",
         "level": "目标国", "summary": "欧盟碳关税正式征收，对欧出口的碳密集行业需核算并购买 CBAM 证书。",
         "industries": ["钢铁", "化工", "能源"], "regions": ["欧盟"]},
    ]

    # 供应链/产能布局（从项目动作派生）
    for p in derived["projects"]:
        r0 = by_aid(db, p["aids"][0]) if p["aids"] else None
        if not r0:
            continue
        hay = r0.get("动作类型", "") + r0.get("公告标题", "")
        cap = None
        if re.search(r"建厂|生产基地|投资建设|建设.*基地|扩产", hay):
            cap = "新建/扩建产能"
        elif re.search(r"迁址|变更.*地点|迁移", hay) or "迁址" in p["name"]:
            cap = "产能迁移"
        elif re.search(r"投产|运营|产销量", hay):
            cap = "既有产能运营"
        if cap:
            derived["supplychain"]["capacity"].append({
                "project": p["id"], "company": p["company"], "region": p["region"],
                "industry": p["industry"], "type": cap, "date": p["latest"], "stage": p["current_stage"]})
    cl = OrderedDict()
    for cp in derived["supplychain"]["capacity"]:
        k = (cp["region"], cp["industry"])
        cl.setdefault(k, {"region": cp["region"], "industry": cp["industry"], "cnt": 0, "projects": []})
        cl[k]["cnt"] += 1
        cl[k]["projects"].append(cp["project"])
    derived["supplychain"]["clusters"] = sorted(cl.values(), key=lambda x: -x["cnt"])
    return derived


def by_aid(db, aid):
    for r in db["disclosures"]:
        if r["_aid"] == aid:
            return r
    return None


if __name__ == "__main__":
    db = json.load(open("../state/db.json", encoding="utf-8"))
    cfg = json.load(open("../state/config.json", encoding="utf-8"))
    d = build_derived(db, cfg)
    print("companies", len(d["companies"]), "| projects", len(d["projects"]),
          "| regions", len(d["regions"]), "| funds", len(d["funds"]),
          "| compliance", len(d["compliance"]), "| graph", len(d["graph"]["nodes"]), "n/", len(d["graph"]["edges"]), "e",
          "| changes", len(d["changes"]), "| judgments", len(d["judgments"]),
          "| calendar", len(d["calendar"]), "| capacity", len(d["supplychain"]["capacity"]))
