#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""HKEX 披露易「全市场重大事项」采集（不分中外企，与出海信批归纳口径互不混用）。

数据源：
  1) 披露易 titleSearchServlet 全市场标题检索（stockId=-1，按日 + 分类组别检索，
     本地按二级类别白名单过滤）——layer=disclosed（公司披露）
  2) 证监会执法新闻 API（newsType=EF）——layer=external（外部事实，附 SFC 来源）

批次：
  --date YYYY-MM-DD      扫描该日 00:00-24:00（香港时间=北京时间），批次 D-YYYYMMDD
  --backfill-days N      回溯最近 N 天（默认 20，含今天），逐日批次 B-YYYYMMDD
去重：NEWS_ID（state/hkex_market_seen.json）；数据追加不覆盖历史（state/hk_market.json）。
金额/事项：仅对白名单命中的公告抓取 PDF 首页（pdftotext），抽取原文金额表述与摘录；
  未披露写【未披露】；PDF 未及抓取的记 pending，后续运行自动补齐。
输出：state/hk_market.json + assets/hk_data.js（window.HKDB）

用法：
  python3 scripts/hkex_market_pull.py --date 2026-10-22
  python3 scripts/hkex_market_pull.py --backfill-days 20
  python3 scripts/hkex_market_pull.py --backfill-days 20 --max-pdf 400
"""
import argparse
import datetime
import html
import json
import os
import re
import subprocess
import sys
import time
import urllib.parse
import urllib.request

UA = {"User-Agent": "PubX/1.0 (https://davidliangemory-boop.github.io/PubX/; research) "
                    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      "Accept": "application/json, text/javascript, */*; q=0.01",
      "Referer": "https://www1.hkexnews.hk/search/titlesearch.xhtml?lang=zh"}
BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(BASE, ".."))
STATE = os.path.join(ROOT, "state")
RAWDIR = os.path.join(ROOT, "raw", "hkex_market")
SERVLET = "https://www1.hkexnews.hk/search/titleSearchServlet.do"
TIER2_URL = "https://www1.hkexnews.hk/ncms/script/eds/tiertwo_c.json"
SFC_API = "https://apps.sfc.hk/edistributionWeb/api/news/search"
SFC_LINK = "https://apps.sfc.hk/edistributionWeb/gateway/EN/news-and-announcements/news/doc?refNo="

SEEN_P = os.path.join(STATE, "hkex_market_seen.json")
DB_P = os.path.join(STATE, "hk_market.json")
TIER2_CACHE = os.path.join(STATE, "hkex_tiertwo.json")
HK_DATA_JS = os.path.join(ROOT, "assets", "hk_data.js")

# ── 检索组别：(t1code, t2Gcode)；t2code=-2 组内全取，本地再按白名单过滤 ──
# 10000 公告及通告: 1 關連交易 / 2 公司狀況變動 / 3 財務資料 / 5 上市 / 6 須予公布的交易 /
#                   7 重組股權上市地位 / 8 證券股本 / 9 雜項
# 20000 通函 / 30000 上市文件 / 55000 收購守則交易披露 / 90000 監管者公告（后三者整类保留）
GROUPS = [("10000", "1"), ("10000", "2"), ("10000", "3"), ("10000", "5"),
          ("10000", "6"), ("10000", "7"), ("10000", "8"), ("10000", "9"),
          ("20000", "-2"), ("30000", "-2"), ("55000", "-2"), ("90000", "-2")]
KEEP_ALL_T1 = {"55000", "90000"}

# ── 事件流白名单：t2code → (六类, 子类沿用港交所原文名) ──
# 六类：融资类 / 投并购 / 运营 / 法律（诉讼/监管处罚） / 对外投资 / 经营战略重大事项
W = {
    # 组1 關連交易
    "11200": "投并购", "11300": "投并购", "11500": "投并购", "11100": "法律（诉讼/监管处罚）",
    # 组2 公司狀況變動
    "12150": "经营战略重大事项", "12350": "经营战略重大事项", "12951": "经营战略重大事项",
    "12700": "经营战略重大事项",
    "12850": "法律（诉讼/监管处罚）",
    # 组3 財務資料
    "13100": "融资类", "13350": "融资类", "13500": "运营", "13550": "运营",
    # 组5 上市
    "15300": "经营战略重大事项", "15600": "经营战略重大事项", "15700": "投并购",
    # 组6 須予公布的交易
    "16100": "投并购", "16200": "投并购", "16300": "投并购", "16400": "投并购",
    "16500": "投并购", "16600": "投并购", "16700": "投并购",
    "16800": "投并购", "16900": "投并购",
    # 组7 重組/股權/上市地位
    "17100": "投并购", "17150": "投并购", "17200": "经营战略重大事项",
    "17300": "经营战略重大事项", "17450": "经营战略重大事项",
    "17550": "经营战略重大事项", "17600": "经营战略重大事项",
    "17650": "经营战略重大事项", "17700": "经营战略重大事项",
    "17750": "经营战略重大事项", "17850": "经营战略重大事项",
    "17900": "经营战略重大事项", "17950": "经营战略重大事项", "17960": "经营战略重大事项",
    # 组8 證券/股本（融资）
    "18100": "融资类", "18120": "融资类", "18140": "融资类", "18180": "融资类",
    "18240": "融资类", "18300": "融资类", "18320": "融资类", "18340": "融资类",
    "18360": "融资类", "18380": "融资类", "18400": "融资类", "18420": "融资类",
    "18480": "融资类", "18500": "融资类",
    # 组9 雜項
    "19700": "运营", "19750": "经营战略重大事项", "19760": "运营", "19780": "法律（诉讼/监管处罚）",
    "19820": "运营", "19840": "融资类",
    # 通函 20000（同一事项的下一份披露，保留作进展来源）
    "21100": "投并购", "21200": "投并购", "24100": "投并购", "24200": "投并购",
    "24300": "投并购", "24400": "投并购", "24500": "投并购",
    "25100": "投并购", "25200": "投并购", "25300": "经营战略重大事项",
    "25400": "经营战略重大事项", "25600": "经营战略重大事项",
    "26100": "融资类", "26150": "融资类", "26200": "融资类",
    "26400": "融资类", "26450": "融资类", "26500": "融资类", "26550": "融资类",
    "26600": "融资类", "26650": "融资类", "26700": "融资类", "26800": "融资类",
    "26900": "融资类",
    # 上市文件 30000：公司上市/再融资文件 = 融资类（R03b：IPO/上市属融资类）；
    # 30100 認可集體投資計劃（ETF/杠杆产品文件）与 30900 其他（供股表格等程序件）不入六类
    "30200": "融资类", "30300": "融资类", "30400": "融资类", "30500": "融资类",
    "30600": "融资类", "30700": "融资类", "30800": "融资类", "31000": "融资类",
    "31100": "融资类", "31200": "融资类",
}
# 不入事件流白名单、但保留入库并单列「常规程序」的类别：
#   26300 回購股份的說明函件（股东周年大会例行授权说明，非交易）等
ROUTINE_CODES = {"26300", "30100", "30900"}
# 中国关联标签（仅标签，不作筛选前提；基于名称/标题的弱启发式）
CN_RE = re.compile(r"中國|中国|內地|内地|大灣區|大湾区|深圳|上海|北京|廣州|广州|浙江|江蘇|江苏|國資|国资")
# 金额原文表述抽取（PDF 首页）
AMT_RE = re.compile(
    r"(?:HK\$|US\$|RMB|港元|港幣|美元|人民幣|欧元|歐元|日圓|日元|澳元|新加坡元|英鎊|英磅)"
    r"\s*(?:約|约)?\s*[\d][\d,\.]*\s*(?:億|亿|萬|万|百萬|百万|千|million|billion)?"
    r"|[\d][\d,\.]*\s*(?:億|亿|萬|万|百萬|百万)\s*(?:港元|港幣|美元|人民幣|欧元|歐元|澳元|英鎊)")

T1_NAME = {"10000": "公告及通告", "20000": "通函", "30000": "上市文件",
           "55000": "合併守則-交易披露", "90000": "監管者發出的公告及消息"}
CAT6 = ["融资类", "投并购", "运营", "法律（诉讼/监管处罚）", "对外投资", "经营战略重大事项"]


def fetch(url, data=None, binary=False, retries=2, timeout=40):
    for i in range(retries + 1):
        try:
            req = urllib.request.Request(url, data=data, headers=UA)
            with urllib.request.urlopen(req, timeout=timeout) as r:
                raw = r.read()
            return raw if binary else raw.decode("utf-8", "ignore")
        except Exception:
            if i == retries:
                raise
            time.sleep(2 * (i + 1))


def clean(s):
    s = html.unescape(s or "")
    s = re.sub(r"<[^>]+>", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def load_json(p, default):
    if os.path.exists(p):
        try:
            return json.load(open(p, encoding="utf-8"))
        except Exception:
            pass
    return default


def save_json(p, obj):
    tmp = p + ".tmp"
    json.dump(obj, open(tmp, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    os.replace(tmp, p)


def load_tier2():
    """二级类别字典（版本化缓存）；返回 name→[codes] 与 code→name。"""
    j = load_json(TIER2_CACHE, None)
    if not j or (time.time() - j.get("fetched_at", 0)) > 30 * 86400:
        rows = json.loads(fetch(TIER2_URL))
        j = {"version": datetime.date.today().isoformat(), "fetched_at": time.time(), "rows": rows}
        save_json(TIER2_CACHE, j)
        time.sleep(0.4)
    name2codes, code2name = {}, {}
    for r in j["rows"]:
        name2codes.setdefault(r["name"], []).append(r["code"])
        code2name[r["code"]] = r["name"]
    return name2codes, code2name, j["version"]


def servlet_query(day, t1, t2g):
    """按日+组别检索，返回 records；rowRange 递进到 1000 封顶，仍有 hasNextRow 记警告。"""
    got, warns = [], []
    for rr in (200, 1000):
        q = {"sortDir": "0", "sortByOptions": "DateTime", "category": "0", "market": "SEHK",
             "stockId": "-1", "documentType": "-1", "fromDate": day, "toDate": day,
             "title": "", "searchType": "0", "t1code": t1, "t2Gcode": t2g,
             "t2code": "-2", "rowRange": str(rr), "lang": "zh"}
        data = json.loads(fetch(SERVLET + "?" + urllib.parse.urlencode(q)))
        recs = json.loads(data.get("result") or "[]")
        got = recs
        if not data.get("hasNextRow"):
            return got, warns
    warns.append("t1=%s t2G=%s 当日超过 1000 条，仅取前 1000" % (t1, t2g))
    return got, warns


def parse_dt(dtc):
    try:
        dt = datetime.datetime.strptime(dtc, "%d/%m/%Y %H:%M")
        return dt.strftime("%Y-%m-%d"), dt.strftime("%Y-%m-%d %H:%M"), dt.strftime("%Y%m%d")
    except Exception:
        return dtc, dtc, ""


def bracket_names(long_text):
    """LONG_TEXT 形如 '公告及通告 - [須予披露的交易 / 關連交易]'，取全部方括号内类目名。"""
    lt = clean(long_text)
    names = []
    for seg in re.findall(r"\[([^\]]+)\]", lt):
        names += [x.strip() for x in seg.split("/") if x.strip()]
    top = lt.split(" - ")[0].strip()
    return top, names


def cn_tag(title, stock_name):
    blob = (title or "") + " " + (stock_name or "")
    return "是（标题/简称提及，弱启发式）" if CN_RE.search(blob) else "未知"


def guess_outbound(title):
    """标题含对外投资/合营合资关键词 → 对外投资（六类之一），仅作归类标签。"""
    return bool(re.search(r"對外投資|对外投资|合資|合营|合營|聯營|联营|海外投資|境外投資", title or ""))


# 摘录剥离：披露易免责声明各变体、通函套话、公司注册头部、落款套话
EXC_DROP_RE = re.compile(
    r"概不負責|概不负责|承擔任何責任|承担任何责任|此乃要件|請即處理|请即处理|應諮詢閣下|应咨询阁下|"
    r"持牌證券|持牌证券|銀行經理|银行经理|專業會計師|专业会计师|註冊成立|注册成立|"
    r"股份代號|股份代号|Stock Code|香港聯合交易所|香港联合交易所|香港交易及結算|香港交易及结算|"
    r"務請垂注|务请垂注|敬請垂注|敬请垂注|承董事會命|承董事会命|交予買主|交予买主|股票經紀|股票经纪|"
    r"僅作參考|仅供参考|僅供參考|不構成|不构成|邀請或要約|邀请或要约|要約邀請|要约邀请|"
    r"招攬|招揽|提呈發售|提呈发售|出售任何證券|出售任何证券|"
    r"司法管轄區|司法管辖区|受到法律限制|尚未根據|任何證券法律|任何证券法律|登記或獲准|登记或获准|"
    r"1933年|美國證券法|美国证券法|登記聲明|登记声明|不得在美國|不得在美国|適用州證券|适用州证券")


def clean_excerpt(txt):
    """首页正文摘录：剔除免责声明/通函套话/公司注册头部，保留公告标题与正文首句（繁体原文）。"""
    flat = re.sub(r"\s+", " ", txt)
    # 部分 PDF 逐字空格分隔（"香 港 交 易 …"/"2 0 2 6"/"L B M A P"），压缩字间空格使规则可匹配；
    # 拉丁字母仅压缩单字母词序列（"L B M A P"→"LBMAP"），不动正常英文单词间空格
    flat = re.sub(r"(?<=[一-鿿]) (?=[一-鿿])", "", flat)
    flat = re.sub(r"(?<=\d) (?=\d)", "", flat)
    flat = re.sub(r"(?<=\b[A-Za-z]) (?=[A-Za-z]\b)", "", flat)
    flat = re.sub(r"[（(][^（）()]{0,80}(?:註冊成立|注册成立|Incorporated in)[^（）()]{0,80}[)）]", " ", flat)
    flat = re.sub(r"[（(]\s*(?:股份代號|Stock Code)\s*[：:][^（）()]{0,20}[)）]", " ", flat)
    # 全大写英文标题行（"NOTIFICATION LETTER AND REPLY FORM" 等，≥2 个词）属版式噪音
    flat = re.sub(r"\b[A-Z][A-Z0-9&,\.\-']+(?: [A-Z0-9&,\.\-']+){1,12}\b", " ", flat)
    segs = [s for s in re.split(r"(?<=[。；;])", flat) if s.strip()]
    segs = [s for s in segs if not EXC_DROP_RE.search(s)]
    body = "".join(segs).strip()
    # 去掉行首英文公司名（ASCII 段后接中文）
    body = re.sub(r"^\s*[A-Za-z0-9 &,\.\-'()]{6,80}\s*(?=[一-鿿])", "", body)
    return body.strip()[:160]


def extract_amount_excerpt(pdf_path):
    """pdftotext 取首页，抽取金额原文表述与首页摘录（剔除披露易标准免责段）。
    金额须带量级词（億/萬/百萬…）或千分位数字，滤掉每股价格类小数噪音。"""
    try:
        out = subprocess.run(["pdftotext", "-f", "1", "-l", "1", "-enc", "UTF-8", pdf_path, "-"],
                             capture_output=True, timeout=30)
        txt = out.stdout.decode("utf-8", "replace")
    except Exception:
        return [], "", ""
    flat = re.sub(r"\s+", " ", txt)
    amts = []
    for m in AMT_RE.finditer(flat):
        a = m.group(0).strip()
        num = re.search(r"[\d][\d,\.]*", a)
        has_unit = re.search(r"億|亿|萬|万|百萬|百万|千|million|billion", a)
        if not num:
            continue
        if not has_unit:
            # 无量级词的千分位数字：仅保留紧跟「元」的金额表述，
            # 排除「每平方米/每股/均价」等单价语境（非交易金额）
            if "," not in num.group(0):
                continue
            after = flat[m.end():m.end() + 1]
            before = flat[max(0, m.start() - 14):m.start()]
            if after != "元" or re.search(r"每平方米|每股|每單位|每单位|均價|均价|銷售價格|销售价格", before):
                continue
        if a not in amts:
            amts.append(a)
        if len(amts) >= 3:
            break
    return amts, clean_excerpt(txt), txt


def stage_of(doc):
    """披露阶段（系统规则推断=analysis：类别码 + 标题关键词；非港交所原文字段）。
    依据：16600 終止交易 / 16100 交易延誤 / 16700 條款上的更改 等二级类别码语义。"""
    if (doc.get("channel") or "").startswith("SFC"):
        return "—"
    codes = set(doc.get("cat_codes") or [])
    t = doc.get("title") or ""
    if "16600" in codes or re.search(r"(?<!職務)(?<!职务)終止|(?<!職務)(?<!职务)终止|不再進行|不會進行|失效", t):
        return "终止"
    if "16100" in codes or re.search(r"延遲|延期|延後|押後", t):
        return "延迟"
    if "16700" in codes or re.search(r"條款.{0,4}更改|修訂.{0,4}條款|補充協議", t):
        return "条款变更"
    if re.search(r"完成|交割|落實|已成為|生效", t):
        return "完成"
    if re.search(r"進展|進一步資料|進一步公告|更新|最新情況|補充公告", t):
        return "进展"
    return "首次披露"


def pull_sfc(d_from, d_to, seen_ids):
    """SFC 执法新闻（newsType=EF），layer=external。主键 newsRefNo。"""
    items, errors = [], []
    page = 0
    while page < 6:
        body = json.dumps({"lang": "TC", "category": "enforcement-news", "year": "all",
                           "month": "all", "pageNo": page, "pageSize": 50}).encode()
        try:
            req = urllib.request.Request(SFC_API, data=body, headers=dict(
                UA, **{"Content-Type": "application/json"}))
            data = json.loads(urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "ignore"))
        except Exception as e:
            errors.append("sfc: " + str(e)[:150])
            break
        rows = data.get("items") or []
        if not rows:
            break
        stop = False
        for it in rows:
            if it.get("newsType") != "EF":
                continue
            day = (it.get("issueDate") or "")[:10]
            if not day or day > d_to:
                continue
            if day < d_from:
                stop = True
                continue
            ref = it.get("newsRefNo")
            did = "sfc_" + ref
            targets = [t.get("ceName") for t in (it.get("targetCeList") or []) if t.get("ceName")]
            items.append({
                "doc_id": did, "channel": "SFC·執法新聞", "layer": "external",
                "board": "", "stock_code": "", "stock_name": "；".join(targets[:3]) if targets else "【未披露】",
                "pub_date": day, "pub_datetime": day,
                "title": clean(it.get("title")),
                "headline_raw": "SFC Enforcement News（證監會執法新聞）",
                "cat_codes": [], "cat6": "法律（诉讼/监管处罚）", "cat6_sub": "證監會執法",
                "matter": clean(it.get("title")),
                "amount": "【未披露】", "cn_related": cn_tag(it.get("title"), "；".join(targets)),
                "url": SFC_LINK + ref, "url_en": "", "file_type": "HTM",
                "excerpt": "", "quotes": [], "pdf_status": "na",
            })
        if stop or len(rows) < 50:
            break
        page += 1
        time.sleep(0.5)
    return items, errors


def scan_day(day, name2codes, seen_ids, docs_by_id, max_pdf, pdf_state):
    """扫描一天，返回 (新增条目, 批次统计)。"""
    ymd = day.replace("-", "")
    stats = {"date": day, "scanned": 0, "kept": 0, "excluded": 0, "new": 0, "dup": 0,
             "cross_dup": 0, "correction": 0, "pdf_fetched": 0, "errors": [], "warns": [], "unmapped": {}}
    new_docs = []
    day_excluded = set()
    day_kept = set()
    for t1, t2g in GROUPS:
        try:
            recs, warns = servlet_query(ymd, t1, t2g)
            stats["warns"] += warns
        except Exception as e:
            stats["errors"].append("query t1=%s g=%s: %s" % (t1, t2g, str(e)[:150]))
            time.sleep(0.5)
            continue
        time.sleep(0.4)
        stats["scanned"] += len(recs)
        for r in recs:
            nid = r.get("NEWS_ID")
            if not nid:
                continue
            if nid in seen_ids:
                if nid in day_kept:
                    stats["cross_dup"] += 1  # 同日跨组别重出（同一公告属多个 headline 组）
                else:
                    stats["dup"] += 1  # 此前批次已见
                continue
            if nid in day_excluded:
                continue
            top, names = bracket_names(r.get("LONG_TEXT"))
            codes = []
            for nm in names:
                codes += name2codes.get(nm, [])
            codes = sorted(set(codes))
            keep_codes = [c for c in codes if c in W]
            routine = False
            if t1 in KEEP_ALL_T1:
                keep = True
                if not keep_codes:
                    keep_codes = codes  # 整类保留但六类映射按名称关键词
            elif keep_codes:
                keep = True
            elif any(c in ROUTINE_CODES for c in codes):
                keep, routine = True, True  # 例行授权/基金文件：入库但单列「常规程序」
            else:
                keep = False
            if not keep:
                day_excluded.add(nid)
                stats["excluded"] += 1
                for nm in names:
                    if nm not in name2codes:
                        stats["unmapped"][nm] = stats["unmapped"].get(nm, 0) + 1
                continue
            seen_ids.add(nid)
            day_kept.add(nid)
            stats["kept"] += 1
            stats["new"] += 1
            title = clean(r.get("TITLE")).replace("  ", " ")
            d, dtm, _ = parse_dt(r.get("DATE_TIME", ""))
            link = r.get("FILE_LINK") or ""
            url_zh = "https://www1.hkexnews.hk" + link if link else ""
            url_en = re.sub(r"_c\.(pdf|htm)$", r"_e.\1", url_zh) if url_zh else ""
            # 六类归类
            if routine:
                cat6 = "常规程序"
            else:
                cat6 = None
                for c in keep_codes:
                    if c in W:
                        cat6 = W[c]
                        break
                if not cat6:
                    cat6 = {"55000": "投并购",
                            "90000": "法律（诉讼/监管处罚）"}.get(t1, "经营战略重大事项")
                if guess_outbound(title):
                    cat6 = "对外投资"
            ftype = (r.get("FILE_TYPE") or "").upper()
            doc = {
                "doc_id": "hkex_" + nid, "channel": "HKEX·披露易（全市场）", "layer": "disclosed",
                "board": "SEHK", "stock_code": clean(r.get("STOCK_CODE")),
                "stock_name": clean(r.get("STOCK_NAME")),
                "pub_date": d, "pub_datetime": dtm,
                "title": title, "headline_raw": clean(r.get("LONG_TEXT")),
                "headline_top": top, "cat_codes": keep_codes,
                "cat_names": names,
                "cat6": cat6, "cat6_sub": " / ".join(names[:3]) if names else top,
                "stage": "—",
                "matter": title,
                "amount": "【未披露】", "amounts": [],
                "cn_related": cn_tag(title, clean(r.get("STOCK_NAME"))),
                "url": url_zh, "url_en": url_en, "file_type": ftype,
                "file_info": r.get("FILE_INFO", ""), "size": r.get("FILE_INFO", ""),
                "excerpt": "", "quotes": [],
                "pdf_status": "pending" if ftype == "PDF" else "na",
                "t1": t1,
            }
            docs_by_id[doc["doc_id"]] = doc
            new_docs.append(doc)
    # PDF 首页抽取（仅命中公告；限量，剩余 pending 下轮补）
    for doc in new_docs:
        if doc["pdf_status"] != "pending":
            continue
        if pdf_state["count"] >= max_pdf:
            break
        m = re.search(r"(/listedco/[^\s]+\.pdf)$", doc["url"])
        if not m:
            doc["pdf_status"] = "na"
            continue
        try:
            raw = fetch("https://www1.hkexnews.hk" + m.group(1), binary=True)
            os.makedirs(RAWDIR, exist_ok=True)
            pp = os.path.join(RAWDIR, doc["doc_id"] + ".pdf")
            open(pp, "wb").write(raw)
            amts, excerpt, _txt = extract_amount_excerpt(pp)
            os.remove(pp)  # 只保留抽取结果，不囤 PDF
            doc["amounts"] = amts
            doc["amount"] = "；".join(amts[:2]) if amts else "【未披露】"
            doc["excerpt"] = excerpt
            if excerpt:
                doc["quotes"] = [{"page": 1, "text": excerpt[:100]}]
            doc["pdf_status"] = "done"
            stats["pdf_fetched"] += 1
            pdf_state["count"] += 1
        except Exception as e:
            doc["pdf_status"] = "failed"
            stats["errors"].append("pdf %s: %s" % (doc["doc_id"], str(e)[:120]))
        time.sleep(0.35)
    stats["new_ids"] = [d["doc_id"] for d in new_docs]
    return new_docs, stats


def backfill_pdf(docs_by_id, max_pdf, pdf_state):
    """补齐历史 pending 的 PDF 抽取。"""
    n = 0
    for doc in docs_by_id.values():
        if doc.get("pdf_status") != "pending":
            continue
        if pdf_state["count"] >= max_pdf:
            break
        m = re.search(r"(/listedco/[^\s]+\.pdf)$", doc.get("url") or "")
        if not m:
            doc["pdf_status"] = "na"
            continue
        try:
            raw = fetch("https://www1.hkexnews.hk" + m.group(1), binary=True)
            os.makedirs(RAWDIR, exist_ok=True)
            pp = os.path.join(RAWDIR, doc["doc_id"] + ".pdf")
            open(pp, "wb").write(raw)
            amts, excerpt, _ = extract_amount_excerpt(pp)
            os.remove(pp)
            doc["amounts"] = amts
            doc["amount"] = "；".join(amts[:2]) if amts else "【未披露】"
            doc["excerpt"] = excerpt
            if excerpt:
                doc["quotes"] = [{"page": 1, "text": excerpt[:100]}]
            doc["pdf_status"] = "done"
            pdf_state["count"] += 1
            n += 1
        except Exception:
            doc["pdf_status"] = "failed"
        time.sleep(0.35)
    return n


def cat6_of(doc):
    """六类归类（构建时按现行白名单重算，规则更新可全量传播；与 stage 同理为 analysis）。
    无白名单码但属例行授权/基金文件（ROUTINE_CODES）→「常规程序」，单列不入六类。"""
    if (doc.get("channel") or "").startswith("SFC"):
        return doc.get("cat6") or "法律（诉讼/监管处罚）"
    codes = doc.get("cat_codes") or []
    cat6 = None
    for c in codes:
        if c in W:
            cat6 = W[c]
            break
    if not cat6 and doc.get("t1") in KEEP_ALL_T1:
        cat6 = {"55000": "投并购", "90000": "法律（诉讼/监管处罚）"}.get(doc.get("t1"))
    if not cat6:
        if any(c in ROUTINE_CODES for c in codes) or doc.get("t1") == "30000":
            return "常规程序"
        return doc.get("cat6") or "常规程序"
    if guess_outbound(doc.get("title")):
        return "对外投资"
    return cat6


def build_hk_data_js(db):
    docs = sorted(db["docs"].values(), key=lambda x: (x.get("pub_datetime") or ""), reverse=True)
    keep = ("doc_id", "channel", "layer", "stock_code", "stock_name", "pub_date", "pub_datetime",
            "title", "headline_raw", "cat6", "cat6_sub", "stage", "amount", "cn_related",
            "url", "url_en", "excerpt", "pdf_status")
    slim = []
    for d in docs:
        d["cat6"] = cat6_of(d)
        d["stage"] = stage_of(d)  # 构建时按现行规则重算，规则更新可全量传播
        slim.append({k: d.get(k) for k in keep})
    out = {
        "build": {"time": now_hkt(), "docs": len(slim), "batches": len(db["batches"])},
        "meta": db["meta"],
        "batches": db["batches"][-40:],
        "docs": slim,
    }
    payload = json.dumps(out, ensure_ascii=False, separators=(",", ":"))
    open(HK_DATA_JS, "w", encoding="utf-8").write("window.HKDB=" + payload + ";\n")


def redo_excerpt(docs_by_id, pdf_state):
    """按现行 clean_excerpt 规则重抓并重建摘录（仅针对命中旧 boilerplate 残留的条目）。"""
    bad = re.compile(r"^(香港交易及結算所|香港联合交易|此乃要件|IMPORTANT|Hong Kong Exchanges)|"
                     r"註冊成立|注册成立|Incorporated in|Stock Code|股份代號|股份代号|承擔任何責任|承担任何责任|應諮詢閣下|"
                     r"香\s*港\s*交\s*易\s*及\s*結\s*算|承\s*擔\s*任\s*何\s*責\s*任|"
                     r"註\s*冊\s*成\s*立|股\s*份\s*代\s*號|S\s*t\s*o\s*c\s*k\s*C\s*o\s*d\s*e|"
                     r"此\s*乃\s*要\s*件|請\s*即\s*處\s*理|交\s*予\s*買\s*主|股\s*票\s*經\s*紀|"
                     r"僅\s*作\s*參\s*考|僅\s*供\s*參\s*考|不\s*構\s*成|邀\s*請\s*或\s*要\s*約|"
                     r"提\s*呈\s*發\s*售|"
                     r"司\s*法\s*管\s*轄\s*區|受\s*到\s*法\s*律\s*限\s*制|尚\s*未\s*根\s*據|"
                     r"美\s*國\s*證\s*券\s*法|1\s*9\s*3\s*3\s*年|不\s*得\s*在\s*美\s*國|"
                     r"\d \d \d|\b[A-Za-z] [A-Za-z] [A-Za-z]\b|\b[A-Z]{3,}(?: [A-Z]{3,})+\b")
    n = 0
    for doc in docs_by_id.values():
        if doc.get("pdf_status") != "done" or not bad.search(doc.get("excerpt") or ""):
            continue
        m = re.search(r"(/listedco/[^\s]+\.pdf)$", doc.get("url") or "")
        if not m:
            continue
        try:
            raw = fetch("https://www1.hkexnews.hk" + m.group(1), binary=True)
            os.makedirs(RAWDIR, exist_ok=True)
            pp = os.path.join(RAWDIR, doc["doc_id"] + ".pdf")
            open(pp, "wb").write(raw)
            amts, excerpt, _ = extract_amount_excerpt(pp)
            os.remove(pp)
            doc["amounts"] = amts
            doc["amount"] = "；".join(amts[:2]) if amts else "【未披露】"
            doc["excerpt"] = excerpt
            if excerpt:
                doc["quotes"] = [{"page": 1, "text": excerpt[:100]}]
            n += 1
        except Exception:
            pass
        time.sleep(0.3)
    return n


def fix_amounts(docs_by_id):
    """按现行金额过滤规则重抽：仅针对 amounts 含无量级词条目的存量文档（单价/截断噪音修正）。"""
    def has_no_unit(doc):
        for a in doc.get("amounts") or []:
            if not re.search(r"億|亿|萬|万|百萬|百万|千|million|billion", a):
                return True
        return False
    n = 0
    for doc in docs_by_id.values():
        if doc.get("pdf_status") != "done" or not has_no_unit(doc):
            continue
        m = re.search(r"(/listedco/[^\s]+\.pdf)$", doc.get("url") or "")
        if not m:
            continue
        try:
            raw = fetch("https://www1.hkexnews.hk" + m.group(1), binary=True)
            os.makedirs(RAWDIR, exist_ok=True)
            pp = os.path.join(RAWDIR, doc["doc_id"] + ".pdf")
            open(pp, "wb").write(raw)
            amts, excerpt, _ = extract_amount_excerpt(pp)
            os.remove(pp)
            doc["amounts"] = amts
            doc["amount"] = "；".join(amts[:2]) if amts else "【未披露】"
            doc["excerpt"] = excerpt
            n += 1
        except Exception:
            pass
        time.sleep(0.35)
    return n


def now_hkt():
    return datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))).strftime("%Y-%m-%d %H:%M")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", default="", help="扫描该日（香港时间=北京时间），批次 D-YYYYMMDD")
    ap.add_argument("--backfill-days", type=int, default=0, help="回溯最近 N 天，逐日批次 B-YYYYMMDD")
    ap.add_argument("--max-pdf", type=int, default=800, help="本次运行最多抓取的 PDF 数（剩余 pending 下轮补）")
    ap.add_argument("--no-sfc", action="store_true", help="跳过 SFC 执法新闻源")
    ap.add_argument("--redo-excerpt", action="store_true",
                    help="重抓摘录命中 boilerplate 残留的存量条目并重建 hk_data.js（不扫描新公告）")
    ap.add_argument("--fix-amounts", action="store_true",
                    help="按现行金额规则重抽存量含无量级词条目的文档并重建 hk_data.js（不扫描新公告）")
    a = ap.parse_args()

    if a.fix_amounts:
        db = load_json(DB_P, {"meta": {}, "batches": [], "docs": {}})
        if isinstance(db.get("docs"), list):
            db["docs"] = {d["doc_id"]: d for d in db["docs"]}
        n = fix_amounts(db["docs"])
        build_hk_data_js(db)
        save_json(DB_P, db)
        print("[hk-market] fix-amounts 完成：重抽 %d 条" % n)
        return

    if a.redo_excerpt:
        db = load_json(DB_P, {"meta": {}, "batches": [], "docs": {}})
        if isinstance(db.get("docs"), list):
            db["docs"] = {d["doc_id"]: d for d in db["docs"]}
        n = redo_excerpt(db["docs"], {"count": 0})
        build_hk_data_js(db)
        save_json(DB_P, db)
        print("[hk-market] redo-excerpt 完成：重建摘录 %d 条" % n)
        return

    if not a.date and not a.backfill_days:
        a.backfill_days = 20  # 默认回溯 20 天
    days = []
    if a.date:
        days = [(a.date, "D-" + a.date.replace("-", ""))]
    else:
        today = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))).date()
        for i in range(a.backfill_days - 1, -1, -1):
            d = (today - datetime.timedelta(days=i)).isoformat()
            days.append((d, "B-" + d.replace("-", "")))

    name2codes, code2name, t2ver = load_tier2()
    seen = load_json(SEEN_P, {"news": [], "sfc": []})
    seen_ids = set(seen.get("news", [])) | set(seen.get("sfc", []))
    db = load_json(DB_P, {"meta": {}, "batches": [], "docs": {}})
    if isinstance(db.get("docs"), list):  # 兼容旧结构
        db["docs"] = {d["doc_id"]: d for d in db["docs"]}
    docs_by_id = db["docs"]
    pdf_state = {"count": 0}

    # SFC 执法新闻（整个日期区间一次拉取）
    sfc_new, sfc_err = [], []
    if not a.no_sfc:
        sfc_new, sfc_err = pull_sfc(days[0][0], days[-1][0], seen_ids)
        for it in sfc_new:
            if it["doc_id"] in seen_ids:
                continue
            seen_ids.add(it["doc_id"])
            docs_by_id[it["doc_id"]] = it

    all_stats = []
    for day, bid in days:
        new_docs, st = scan_day(day, name2codes, seen_ids, docs_by_id, a.max_pdf, pdf_state)
        st["batch_id"] = bid
        if day == days[-1][0] and sfc_new:
            st["sfc_new"] = len(sfc_new)
            st["errors"] += sfc_err
        all_stats.append(st)
        # 每天落盘一次（断点续跑安全）
        db["batches"] = [b for b in db["batches"]
                         if b.get("batch_id") != bid and b.get("date") != day] + [st]
        db["batches"].sort(key=lambda b: b["batch_id"])
        db["meta"] = {
            "scope": "HKEX 披露易全市场标题检索（stockId=-1，不分中外企）+ SFC 执法新闻；"
                     "事件流白名单=須予披露/主要/非常重大/關連/配售/供股/發行證券債券/收購守則/私有化/"
                     "上市文件（公司上市与再融资文件）/業務更新/更換董事或行政總裁/更改公司名稱/訴訟/監管公告等二级类别；"
                     "程序性类别（翌日披露報表/月報表/委任代表表格等）不计入；"
                     "例行授权文件（回購股份說明函件/一般性授權）与认可集体投资计划文件（ETF/杠杆产品）"
                     "入库但单列「常规程序」，不入六类统计。",
            "tier2_dict_version": t2ver,
            "updated": now_hkt(),
            "date_range": [min(b["date"] for b in db["batches"]), max(b["date"] for b in db["batches"])],
        }
        save_json(DB_P, db)
        save_json(SEEN_P, {"news": sorted(x for x in seen_ids if x.startswith("hkex_") or x.isdigit()),
                           "sfc": sorted(x for x in seen_ids if x.startswith("sfc_"))})
        print("[hk-market] %s 批次 %s：扫描 %d / 收录 %d（新 %d，重复 %d，排除 %d）PDF %d 错误 %d"
              % (day, bid, st["scanned"], st["kept"], st["new"], st["dup"], st["excluded"],
                 st["pdf_fetched"], len(st["errors"])))

    filled = backfill_pdf(docs_by_id, a.max_pdf, pdf_state)
    if filled:
        print("[hk-market] 补抓历史 pending PDF %d 份" % filled)
    build_hk_data_js(db)
    save_json(DB_P, db)  # cat6/stage 构建时重算结果一并落盘
    n_docs = len(docs_by_id)
    n_pending = sum(1 for d in docs_by_id.values() if d.get("pdf_status") == "pending")
    print("[hk-market] 完成：总收录 %d 条（PDF 待补 %d），批次 %d 个 → %s + %s"
          % (n_docs, n_pending, len(db["batches"]), DB_P, HK_DATA_JS))


if __name__ == "__main__":
    main()
