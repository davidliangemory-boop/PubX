# -*- coding: utf-8 -*-
"""LLM 分析模块（Moonshot OpenAI 兼容接口，纯标准库）。

两个角色：
  gate()    —— 实质筛选门：判断公告是否含"境外主体/业务 + 实质动作"
  analyze() —— 对收录公告做 25 字段结构化分析 + 逐字摘录 + 未披露事项
  case_update() —— 同一公司出现新事件时，更新连续案例的 summary/check

口径硬约束（与监测规则一致）：
  · 只输出 JSON；所有数字/事实必须来自原文，禁止编造
  · '签约'不写成'收入实现'，'授信/上限'不写成'已支付'
  · 摘录必须是原文逐字复制，引擎会回原文校验页码，对不上就丢弃
"""
import json, os, re, time
import urllib.request

API_BASE = os.environ.get("MOONSHOT_BASE", "https://api.moonshot.cn/v1")
API_KEY = os.environ.get("MOONSHOT_API_KEY", "")
MODEL = os.environ.get("MODEL_NAME", "kimi-k2-0905-preview")

ANALYZE_FIELDS = ["公司全称"] + [
    "公告类型", "涉及国家/地区", "动作类型", "动作阶段", "投资金额", "合作方",
    "出海模式归类", "盈利方式", "本地化深度", "对主营业务的战略价值",
    "对营收结构与利润的预期影响", "是否构成第二增长曲线", "主要风险与不确定性",
    "同行业可比出海案例（公司+时间+做法+成效）", "与本公司动作的异同", "先发/后发位置判断",
    "①商务关注（市场进入/渠道客户/竞争/关税贸易政策）",
    "②财务关注（投资规模与资金来源/汇率敞口/海外收入占比/利润率现金流）",
    "③法务关注（ODI/FDI审批备案/目标国合规/制裁出口管制/知识产权）",
]
FIELD_KEYS = ANALYZE_FIELDS[1:]

GATE_SYSTEM = (
    "你是上市公司公告筛选员，为'企业出海披露监测'做实质筛选。判断给定公告是否与"
    "'企业出海实质动作'相关。只输出JSON，格式："
    '{"include":true/false,"category":"...","reason":"..."}。'
    "收录标准（需同时满足）：涉及境外主体/资产/业务/市场/客户，且属于实质动作之一："
    "境外设企/建厂/产能/投产；收购/合资/股权调整/交割；海外签约/重大合同/订单；"
    "增资/股东借款/财务资助/担保；境外子公司产销量价与利润；项目延期/违约/处罚/退出；"
    "能改变既有出海事项判断的后续进展。排除类别（category用下列值）："
    "名称误匹配（公司名碰巧含关键词但与出海无关）、纯制度文件、资本运作"
    "（H股上市/境外发债/回购/股权激励）、无新信息重复披露、弱信号"
    "（仅筹备境外上市的制度/提示，无实质动作）、其他无关。宁可错排也要保持收录纯度，"
    "但对'进展/延期/数据更新'类要收录——它们用于更新既有案例判断。"
)

ANALYZE_SYSTEM = (
    "你是企业出海情报分析师。基于公告原文输出严格JSON。硬规则："
    "1) 所有数字、金额、比例、日期必须逐字来自原文，禁止编造；原文没有的写'未披露'。"
    "2) 口径：'签约'不写成'收入实现'；'授信/额度上限'不写成'已支付'；"
    "'完成备案/登记'不写成'建成/投产'；进展公告只描述已发生事实。"
    "3) evidence_quotes：从原文逐字复制2-4条关键句（每条8-30字，必须是原文原样子串，"
    "优先选含金额/比例/对手方/审批结果的句子，禁止改写、禁止省略号拼接）。"
    "4) undisclosed：一句话写出本次公告最有信息量的未披露事项（金额/时间表/条款缺口）。"
    "输出JSON格式：{"
    + ",".join(f'"{k}":"..."' for k in ANALYZE_FIELDS[:16])
    + ",...（共25个字段）...,"
    '"evidence_quotes":["..."],"undisclosed":"..."}'
)

CASE_SYSTEM = (
    "你是连续案例跟踪分析师。给定同一公司围绕同一境外事项的按时间排列的事件序列，"
    "输出严格JSON：{\"summary\":\"一段话概括案例全貌与当前所处阶段（80字内）\","
    "\"check\":\"判断检验：此前判断是什么、本次事件对它做了什么更新（维持/修正/推翻，"
    "写明理由；首个事件则写明当前最值得跟踪的判断点）\"}。"
    "只基于给定事件事实，禁止外推编造。"
)


def _chat(messages, temperature=0.2, retries=3):
    if not API_KEY:
        raise RuntimeError("缺少 MOONSHOT_API_KEY 环境变量/Secrets")
    body = json.dumps({
        "model": MODEL, "messages": messages, "temperature": temperature,
        "response_format": {"type": "json_object"},
    }).encode()
    req = urllib.request.Request(
        API_BASE.rstrip("/") + "/chat/completions", data=body,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {API_KEY}"})
    last = None
    for i in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                d = json.loads(r.read().decode())
            return d["choices"][0]["message"]["content"]
        except Exception as e:
            last = e
            time.sleep(3 * (i + 1))
    raise last


def _parse_json(s):
    s = s.strip()
    if s.startswith("```"):
        s = re.sub(r"^```(json)?\s*", "", s)
        s = re.sub(r"\s*```$", "", s)
    return json.loads(s)


def gate(title, text_head):
    """实质筛选。text_head 取公告前2页即可，控制成本。"""
    prompt = (f"公告标题：{title}\n\n公告开头内容：\n{text_head[:2500]}\n\n"
              "请按收录标准判断，只输出JSON。")
    out = _chat([{"role": "system", "content": GATE_SYSTEM},
                 {"role": "user", "content": prompt}], temperature=0.0)
    try:
        r = _parse_json(out)
        return {"include": bool(r.get("include")),
                "category": str(r.get("category", "")),
                "reason": str(r.get("reason", ""))}
    except Exception:
        # 解析失败时保守处理：不收录、记异常人工复核，避免脏数据入库
        return {"include": False, "category": "解析失败",
                "reason": "gate输出JSON解析失败，默认排除以防脏数据"}


def analyze(title, full_text):
    """25字段结构化分析。返回dict含fields/quotes/undisclosed。"""
    prompt = f"公告标题：{title}\n\n公告全文：\n{full_text}\n\n请输出严格JSON。"
    last_err = None
    for attempt in range(2):
        try:
            extra = "" if attempt == 0 else "上次输出不是合法JSON，请重新输出且只输出JSON。"
            out = _chat([{"role": "system", "content": ANALYZE_SYSTEM},
                         {"role": "user", "content": prompt + extra}], temperature=0.2)
            r = _parse_json(out)
            fields = {k: str(r.get(k, "未披露") or "未披露") for k in ANALYZE_FIELDS}
            quotes = [str(q) for q in (r.get("evidence_quotes") or [])][:4]
            return {"fields": fields, "quotes": quotes,
                    "undisclosed": str(r.get("undisclosed", "") or "未在本次公告中披露。")}
        except Exception as e:
            last_err = e
    raise RuntimeError(f"analyze输出解析失败: {last_err}")


def case_update(company, events):
    """events: [{date,title,stage,summary}] 按时间升序。返回 {'summary','check'}。"""
    lines = "\n".join(
        f"{i+1}. [{e['date']}] {e['title']}（阶段：{e['stage']}）—— {e['summary']}"
        for i, e in enumerate(events))
    out = _chat([{"role": "system", "content": CASE_SYSTEM},
                 {"role": "user", "content": f"公司：{company}\n事件序列：\n{lines}"}],
                temperature=0.3)
    try:
        r = _parse_json(out)
        return {"summary": str(r.get("summary", "")), "check": str(r.get("check", ""))}
    except Exception:
        return {"summary": events[-1]["summary"][:80],
                "check": "案例概要为规则兜底生成（LLM输出解析失败）。"}
