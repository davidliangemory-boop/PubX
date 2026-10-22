# -*- coding: utf-8 -*-
"""PubX 出口管制模块采集（#/export）：Federal Register API（BIS 实体清单/EAR 规则、
UFLPA 列入通知、OFAC 法规）、OFAC recent-actions（执法/清单/通用许可/指南）、
BIS 新闻与执法稿、DHS UFLPA 实体清单页。
输出 state/export.json，并同步生成前端 assets/export_data.js（window.EXDATA）。

纪律：只记录官方公开原文所载事实（external 层，附来源链接）；合规影响一律
analysis 层并写依据；原文未载的字段留空，前端显示【未披露】。文件号/链接去重。

用法：
  python3 scripts/export_pull.py                        # 增量：自上次运行窗口结束日起
  python3 scripts/export_pull.py --backfill-days 90     # 回溯最近 N 天（默认 20）
  python3 scripts/export_pull.py --since 2026-07-25     # 指定起始日
  python3 scripts/export_pull.py --date 2026-10-22      # 仅扫该日（北京时间当日 00:00–24:00；
                                                        #  来源仅精确到发布日，按美东发布日同日近似对齐）
批次：本模块为周批 batch_id=W-YYYYWW；回溯运行 kind=backfill。
"""
import argparse
import datetime
import hashlib
import html as htmlmod
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATE_PATH = os.path.join(ROOT, "state", "export.json")
JS_PATH = os.path.join(ROOT, "assets", "export_data.js")

UA = "PubX-Research/1.0 (public-info research; https://davidliangemory-boop.github.io/PubX/)"
THROTTLE = 1.2  # 秒，限速
LAST_REQ = [0.0]

CN_RE = re.compile(r"china|chinese|hong\s*kong|xinjiang|macau|beijing|shanghai|shenzhen|guangdong", re.I)
ENTITY_NAME_RE = re.compile(
    r"^([A-Z][A-Za-z0-9 ,.&'()\-/]{2,90}?(?:Co\.|Company|Corp\.?|Corporation|Inc\.?|Ltd\.?|Limited|LLC|LLP|GmbH|S\.A\.|PLC|Technologies|Technology|Electronics|Semiconductor|Industries|Group|Holdings|Bank|University|Institute|Laborator\w+|Logistics|Shipping|Airlines?|Trading|International)[A-Za-z0-9 ,.&'()\-/]*)\s*$")


def http_get(url, binary=False):
    """带 UA、限速与重试的 GET；最终失败抛异常由调用方计入 failed。"""
    last = None
    for attempt in range(3):
        dt = time.time() - LAST_REQ[0]
        if dt < THROTTLE:
            time.sleep(THROTTLE - dt)
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
            LAST_REQ[0] = time.time()
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
                final_url = r.geturl()
            if binary:
                return data, final_url
            return data.decode("utf-8", errors="replace"), final_url
        except Exception as e:
            last = e
            print("  [http] 第 %d 次失败 %s: %s" % (attempt + 1, url[:90], e))
            time.sleep(3 * (attempt + 1))
    raise last


def today_cn():
    return datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))).date()


def now_cn():
    return datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))).strftime("%Y-%m-%d %H:%M")


def week_batch_id(d=None):
    d = d or today_cn()
    iso = d.isocalendar()
    return "W-%d%02d" % (iso[0], iso[1])


def china_link(text):
    """external 层：仅按原文文字命中判断，附命中词作为依据。"""
    m = CN_RE.search(text or "")
    if m:
        return {"value": "是", "layer": "external",
                "basis": "原文命中关键词「%s」（全文检索）" % m.group(0)}
    return {"value": "否", "layer": "external", "basis": "原文未出现中国相关关键词（全文检索）"}


# ───────────────────────── Federal Register API ─────────────────────────
FR_API = "https://www.federalregister.gov/api/v1/documents.json"
FR_FIELDS = ["document_number", "title", "type", "abstract", "publication_date",
             "html_url", "pdf_url", "raw_text_url", "citation", "agencies",
             "effective_on", "comments_close_on", "cfr_references", "significant"]


def fr_search(term=None, agency=None, types=None, gte=None, lte=None, stats=None, tag=""):
    """翻页检索 Federal Register，返回文档列表。"""
    out, page = [], 1
    while True:
        qs = []
        for f in FR_FIELDS:
            qs.append(("fields[]", f))
        if term:
            qs.append(("conditions[term]", term))
        if agency:
            for a in agency:
                qs.append(("conditions[agencies][]", a))
        if types:
            for t in types:
                qs.append(("conditions[type][]", t))
        if gte:
            qs.append(("conditions[publication_date][gte]", gte))
        if lte:
            qs.append(("conditions[publication_date][lte]", lte))
        qs.append(("per_page", "100"))
        qs.append(("order", "newest"))
        qs.append(("page", str(page)))
        url = FR_API + "?" + urllib.parse.urlencode(qs)
        try:
            raw, _ = http_get(url)
            data = json.loads(raw)
        except Exception as e:
            if stats is not None:
                stats[tag]["failed"] += 1
            print("  [FR] 查询失败 %s: %s" % (tag, e))
            break
        results = data.get("results", [])
        if stats is not None:
            stats[tag]["scanned"] += len(results)
        out.extend(results)
        if page >= data.get("total_pages", 1) or not results:
            break
        page += 1
    return out


def fr_doc_detail(doc_number):
    url = "https://www.federalregister.gov/api/v1/documents/%s.json" % doc_number
    raw, _ = http_get(url)
    return json.loads(raw)


def clean_entity_name(nm):
    """清理启发式抽取的实体名：截断连词尾巴、剔除句子残片。"""
    nm = re.split(r",?\s+and\s+(?:the|each|all|six|seven|two|three)\b", nm)[0]
    nm = re.split(r"\s+(?:under|has|have|was|were|located|pursuant)\b", nm)[0]
    nm = re.sub(r",?\s+and\s+[A-Za-z]{0,4}$", "", nm)  # 截窗残片（如 ", and t"）
    nm = nm.replace("\xa0", " ")
    nm = nm.strip(" ,;.")
    if not nm or re.search(r"\b(removal|addition|production bases|following|entity list|presumption|denial|subject to|for all items)\b|\b\d+\s*FR\b", nm, re.I):
        return ""
    if re.match(r"^(Co\.?|Ltd\.?|Inc\.?|Corp\.?|LLC|Limited|Company)\b[\s,.]", nm):
        return ""  # 后缀残片（如 "Co., Ltd. from the Entity List"）
    if not re.search(r"Co\.?|Ltd|Limited|Inc\.?|Corp|LLC|GmbH|S\.A\.|PLC|Company|Group|Holdings|Bank|University|Institute|Technolog|Electronics|Semiconductor|Industries|Logistics|Shipping|Airline|Trading|International|Laborator", nm):
        return ""  # 无公司形态词（地址残片等）
    return nm


def extract_entities_from_text(txt):
    """从 FR 规则全文中试探性抽取实体名（靠近 China 的公司样式行）。
    启发式，仅作 external 层线索；抽不到留空由前端显示【未披露】。"""
    if not txt:
        return []
    names = []
    for m in re.finditer(r"(?i)china", txt):
        seg = txt[max(0, m.start() - 700):m.start() + 120]
        for line in seg.splitlines():
            line = line.strip()
            # “X (also known as Y)” 形态取括号前主名
            mm0 = re.match(r"^([A-Z][A-Za-z0-9 ,.&'\-/]{4,90}?)\s*\(also known as", line)
            if mm0:
                nm = clean_entity_name(mm0.group(1))
                if nm and nm not in names:
                    names.append(nm)
                continue
            mm = ENTITY_NAME_RE.match(line)
            if mm:
                nm = clean_entity_name(re.sub(r"\s+", " ", mm.group(1)))
                if 4 < len(nm) < 100 and nm not in names:
                    names.append(nm)
        if len(names) >= 30:
            break
    return names[:30]


def fr_classify(doc):
    """FR 文档 → (column, action)。"""
    t = (doc.get("title") or "")
    tl = t.lower()
    if "entity list" in tl or "unverified list" in tl or "denied persons" in tl or "military end user" in tl:
        if "removal" in tl or "remove" in tl:
            return "lists", "removed"
        if "revision" in tl or "revis" in tl:
            return "lists", "revised"
        if "addition" in tl or "adding" in tl or "add" in tl:
            return "lists", "added"
        return "lists", ""
    return "rules", ""


def impact_for(column, agency, action, title):
    """analysis 层合规影响模板，依据写明。"""
    tl = (title or "").lower()
    if column == "lists" and ("uflpa" in tl or "uyghur" in tl):
        return {"layer": "analysis",
                "text": "UFLPA 实体清单主体涉疆产品适用“可反驳推定”禁止进口；进口商须准备清晰且令人信服的供应链证据。相关出口/采购企业应更新供应商筛查并留存溯源文件。",
                "basis": "UFLPA §3 可反驳推定 + DHS/CBP 进口商指引"}
    if column == "lists" and "entity list" in tl:
        return {"layer": "analysis",
                "text": "实体清单变动直接影响涉美出口/再出口/境内转让：清单主体交易须按该规则所载许可要求与许可政策申请 BIS 许可（多数为推定拒绝）。相关中企及其供应链应核对清单条目、更新筛查。",
                "basis": "EAR §744.16（实体清单许可要求）+ 本规则原文的许可政策列"}
    if column == "lists":
        return {"layer": "analysis",
                "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
                "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"}
    if column == "rules":
        return {"layer": "analysis",
                "text": "规则/通用许可/指南变动改变许可要求或合规义务边界；须核对生效日期、CFR 修订条款与过渡安排，评估对存量交易与许可策略的影响。",
                "basis": "本文档 dates/CFR 引用所载生效条款，以原文为准"}
    return {"layer": "analysis",
            "text": "执法案例显示执法重点与裁量因素（VSD 自愿披露、egregious 定性、合规承诺），可作为同类业务风险评估与合规体系改进的对照样本。",
            "basis": "本案执法文书 + BIS/OFAC 执法指南的一般裁量框架"}


def pull_fr(gte, lte, stats):
    items = []
    # 1) BIS 规则与清单（机构全量，按标题二次过滤分类）
    docs = fr_search(agency=["industry-and-security-bureau"], types=["RULE", "PRORULE"],
                     gte=gte, lte=lte, stats=stats, tag="FR-BIS")
    # 2) UFLPA 列入通知（DHS 等，按标题过滤）
    docs += [d for d in fr_search(term="UFLPA", gte=gte, lte=lte, stats=stats, tag="FR-UFLPA")
             if "uflpa" in (d.get("title") or "").lower() or "uyghur" in (d.get("title") or "").lower()]
    # 3) OFAC 法规（财政部海外资产控制办公室）
    docs += fr_search(agency=["foreign-assets-control-office"], types=["RULE", "PRORULE"],
                      gte=gte, lte=lte, stats=stats, tag="FR-OFAC")
    seen = set()
    for d in docs:
        dn = d.get("document_number")
        if not dn or dn in seen:
            continue
        seen.add(dn)
        title = htmlmod.unescape(d.get("title") or "")
        tl_low = title.lower()
        is_uflpa = "uflpa" in tl_low or "uyghur" in tl_low
        agency_name = ", ".join(a.get("name", "") for a in d.get("agencies", []))
        column, action = fr_classify(d)
        if is_uflpa:
            column, action = "lists", "added"
        abstract = (d.get("abstract") or "").strip()
        basis_text = title + " " + abstract
        parties = []
        # 清单类规则：取全文尝试抽取实体名与中国关联
        raw_url = d.get("raw_text_url")
        if column == "lists" and raw_url:
            try:
                txt, _ = http_get(raw_url)
                parties = extract_entities_from_text(txt)
                basis_text += " " + txt[:200000]
            except Exception as e:
                print("  [FR] 全文获取失败 %s: %s" % (dn, e))
                stats["FR-fulltext"]["failed"] += 1
        pts = []
        if abstract:
            pts.append({"text": abstract, "layer": "external", "source": "Federal Register 摘要"})
        pts.append({"text": "文档类型 %s；引文 %s；生效 %s。" % (
            d.get("type") or "—", d.get("citation") or "【未披露】", d.get("effective_on") or "见原文"),
            "layer": "external", "source": "Federal Register 文档元数据"})
        agency_short = "BIS" if "Industry and Security" in agency_name else (
            "OFAC" if "Foreign Assets Control" in agency_name else (
                "DHS/FLETF" if is_uflpa else agency_name or "【未披露】"))
        items.append({
            "id": "fr-" + dn, "column": column, "action": action,
            "date": d.get("publication_date"), "agency": agency_short,
            "doc_no": dn + (" / " + d["citation"] if d.get("citation") else ""),
            "title": title, "parties": parties,
            "china_link": {"value": "是", "layer": "external",
                           "basis": "UFLPA 列入通知，法律依据为涉疆强迫劳动条款"} if is_uflpa
            else china_link(basis_text),
            "points": pts, "impact": impact_for(column, agency_short, action, title),
            "url": d.get("html_url"), "pdf_url": d.get("pdf_url"),
            "source": {"channel": "Federal Register API", "retrieved_at": now_cn()},
        })
        stats["FR-BIS" if "Industry" in agency_name else "FR-other"]["kept"] += 1
    return items


# ───────────────────────── OFAC recent-actions ─────────────────────────
OFAC_RA = "https://ofac.treasury.gov/recent-actions"
OFAC_ROW_RE = re.compile(
    r'<a href="(/recent-actions/([0-9a-z_]+))"[^>]*>(.*?)</a>.*?'
    r'([A-Z][a-z]+ \d{1,2}, \d{4})\s*-.*?'
    r'<a href="/recent-actions/[a-z-]+">([^<]+)</a>', re.S)

OFAC_TYPE_COL = {
    "Sanctions List Updates": ("lists", ""),
    "Enforcement Actions": ("enforcement", ""),
    "General Licenses": ("rules", ""),
    "Guidance": ("rules", ""),
    "Rule Making": ("rules", ""),
}


def ofac_date(s):
    return datetime.datetime.strptime(s.strip(), "%B %d, %Y").strftime("%Y-%m-%d")


def pull_ofac(gte, lte, stats):
    items, page = [], 0
    tag = "OFAC-RA"
    while page < 40:
        url = OFAC_RA + ("?page=%d" % page if page else "")
        try:
            h, _ = http_get(url)
        except Exception as e:
            stats[tag]["failed"] += 1
            print("  [OFAC] 列表页失败 p%d: %s" % (page, e))
            break
        rows = OFAC_ROW_RE.findall(h)
        stats[tag]["scanned"] += len(rows)
        if not rows:
            break
        stop = False
        for path, slug, title_html, date_s, type_label in rows:
            d = ofac_date(date_s)
            if d < gte:
                stop = True
                continue
            if d > lte:
                continue
            title = htmlmod.unescape(re.sub(r"<[^>]+>", "", title_html)).strip()
            column, action = OFAC_TYPE_COL.get(type_label.strip(), ("rules", ""))
            item = {
                "id": "ofac-" + slug, "column": column, "action": action,
                "date": d, "agency": "OFAC", "doc_no": slug,
                "title": title, "parties": [],
                "china_link": china_link(title),
                "points": [{"text": "类型标签：%s（OFAC recent-actions 列表）。" % type_label.strip(),
                            "layer": "external", "source": "OFAC recent-actions"}],
                "impact": impact_for(column, "OFAC", action, title),
                "url": "https://ofac.treasury.gov" + path, "pdf_url": None,
                "source": {"channel": "OFAC recent-actions", "retrieved_at": now_cn()},
            }
            if column == "enforcement":
                enrich_ofac_enforcement(item, stats)
            items.append(item)
            stats[tag]["kept"] += 1
        if stop:
            break
        page += 1
    return items


def party_from_title(title):
    """从执法标题抽取当事方（external 层，标题直取）。"""
    m = re.search(r"Office of Foreign Assets Control and (.+?)(?:\s+for|\s+over|\s+Related|$)", title)
    if m:
        return m.group(1).strip(" .,")
    m = re.search(r"(?:Settlement|Settlement Agreement|Penalty|Action)\s+(?:with|against)\s+(.+?)(?:\s+for|\s+to Pay|\s+over|\s+Related|\s+Order|$)", title)
    if m:
        return m.group(1).strip(" .,")
    m = re.search(r"\bwith\s+([A-Z][A-Za-z0-9 ,.&'()\-]{3,80}?)(?:\s+for|\s+to Pay|\s+Order|$)", title)
    if m:
        return m.group(1).strip(" .,")
    return ""


def enrich_ofac_enforcement(item, stats):
    """抓执法详情页，提取和解金额/违规笔数/VSD/egregious（external 层，附原文线索）。"""
    stats["OFAC-detail"]["scanned"] += 1
    try:
        h, _ = http_get(item["url"])
    except Exception as e:
        stats["OFAC-detail"]["failed"] += 1
        print("  [OFAC] 详情页失败 %s: %s" % (item["id"], e))
        return
    text = re.sub(r"<[^>]+>", " ", h)
    text = htmlmod.unescape(re.sub(r"\s+", " ", text))
    m = re.search(r"\$\s?([0-9][0-9,]*(?:\.\d+)?)\s*(million|billion)?", text)
    if m:
        amt = "$" + m.group(1) + (" " + m.group(2) if m.group(2) else "")
        item["points"].append({"text": "和解/罚款金额：%s（详情页正文首个金额数字，口径以原文 PDF 为准）。" % amt,
                               "layer": "external", "source": item["url"]})
    m = re.search(r"([0-9,]+)\s+apparent violations?", text, re.I)
    if m:
        item["points"].append({"text": "违规笔数（apparent violations）：%s。" % m.group(1),
                               "layer": "external", "source": item["url"]})
    if re.search(r"voluntarily self-disclosed", text, re.I):
        item["points"].append({"text": "原文提及自愿披露（voluntarily self-disclosed）情节，是否构成 VSD 及程度以执法文书为准。",
                               "layer": "external", "source": item["url"]})
    m = re.search(r"(non-egregious|egregious)", text, re.I)
    if m:
        item["points"].append({"text": "定性：%s。" % m.group(1).lower(),
                               "layer": "external", "source": item["url"]})
    pdfs = re.findall(r'href="([^"]*(?:\.pdf|/media/\d+/download)[^"]*)"', h)
    if pdfs:
        # 优先 Enforcement Release 所在链接，否则取最后一个
        pick = pdfs[-1]
        for pm in re.finditer(r'href="([^"]*(?:\.pdf|/media/\d+/download)[^"]*)"[^>]*>([^<]*)', h):
            if "enforcement" in pm.group(2).lower():
                pick = pm.group(1)
        item["pdf_url"] = urllib.parse.urljoin(item["url"], pick)
    party = party_from_title(item["title"])
    if party:
        item["parties"] = [party]
    item["china_link"] = china_link(item["title"] + " " + text[:60000])


# ───────────────────────── BIS 新闻/执法稿 ─────────────────────────
BIS_NEWS = "https://www.bis.gov/news-updates"
BIS_ITEM_RE = re.compile(
    r'<li data-date="[A-Z][a-z]{2} ([A-Z][a-z]{2}) (\d{2}) (\d{4})[^"]*"[^>]*>.*?'
    r'<a[^>]+href="([^"]+)"[^>]*>\s*<h3[^>]*>(.*?)</h3>\s*</a>(.*?)'
    r'<ul class="list-disc[^"]*">(.*?)</ul>', re.S)
BIS_MONTH = {m: i + 1 for i, m in enumerate(
    ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])}


def pull_bis(gte, lte, stats):
    tag = "BIS-news"
    items = []
    try:
        h, _ = http_get(BIS_NEWS)
    except Exception as e:
        stats[tag]["failed"] += 1
        print("  [BIS] 新闻页失败: %s" % e)
        return items
    rows = BIS_ITEM_RE.findall(h)
    stats[tag]["scanned"] += len(rows)
    for mon, day, yr, href, title_html, mid, tags_html in rows:
        d = "%04d-%02d-%02d" % (int(yr), BIS_MONTH.get(mon, 0), int(day))
        if d < gte or d > lte:
            continue
        title = htmlmod.unescape(re.sub(r"<[^>]+>", "", title_html)).strip()
        tags = re.findall(r'<li[^>]*>([^<]+)</li>', tags_html)
        column = "enforcement" if any("enforcement" in t.lower() for t in tags) else "rules"
        url = href if href.startswith("http") else "https://www.bis.gov" + href
        slug = re.sub(r"[^a-z0-9]+", "-", href.lower()).strip("-")[:80]
        pts = [{"text": "栏目标签：%s（BIS 新闻页）。" % (", ".join(tags) if tags else "【未披露】"),
                "layer": "external", "source": "BIS news-updates"}]
        if href.startswith("http") and "bis.gov" not in href:
            pts.append({"text": "该条为外链稿件（如 DOJ 新闻稿），细节以外部链接原文为准。",
                        "layer": "external", "source": url})
        party = party_from_title(title) if column == "enforcement" else ""
        items.append({
            "id": "bis-" + slug, "column": column, "action": "",
            "date": d, "agency": "BIS", "doc_no": "",
            "title": title, "parties": [party] if party else [],
            "china_link": china_link(title),
            "points": pts, "impact": impact_for(column, "BIS", "", title),
            "url": url, "pdf_url": None,
            "source": {"channel": "BIS news-updates", "retrieved_at": now_cn()},
        })
        stats[tag]["kept"] += 1
    return items


# ───────────────────────── DHS UFLPA 实体清单 ─────────────────────────
DHS_UFLPA = "https://www.dhs.gov/uflpa-entity-list"


def pull_uflpa(gte, lte, stats, prev_snapshot):
    """解析 DHS UFLPA 页：按列入依据小节分表，条目带生效日期。
    生成快照（含 sha256）+ 窗口内生效日期的批次式清单条目。"""
    tag = "DHS-UFLPA"
    try:
        h, _ = http_get(DHS_UFLPA)
    except Exception as e:
        stats[tag]["failed"] += 1
        print("  [DHS] UFLPA 页失败: %s" % e)
        return [], prev_snapshot
    sha = hashlib.sha256(h.encode("utf-8")).hexdigest()
    # 逐表处理，向前找最近的列入依据小节号（§2(d)(2)(B)(i/ii/v)）
    entries = []
    for tm in re.finditer(r'<table>.*?</table>', h, re.S):
        tbl = tm.group(0)
        head = h[max(0, tm.start() - 2500):tm.start()]
        secs = re.findall(r'Section 2\(d\)\(2\)\(B\)\((i{1,2}|v)\)', head)
        sec = "§2(d)(2)(B)(%s)" % secs[-1] if secs else "【未披露】"
        for row in re.findall(r'<tr>(.*?)</tr>', tbl, re.S)[1:]:
            cells = re.findall(r'<td[^>]*>(.*?)</td>', row, re.S)
            if len(cells) < 2:
                continue
            name_raw = htmlmod.unescape(re.sub(r"<[^>]+>", "", cells[0])).replace("\xa0", " ").strip()
            eff_raw = htmlmod.unescape(re.sub(r"<[^>]+>", "", cells[1])).strip()
            aliases = []
            name = name_raw
            m = re.match(r"^(.*?)\s*\((?:and|including|formerly known as|also known as)\s+(.*)\)\s*$", name_raw, re.S)
            if m:
                name = m.group(1).strip()
                alias_txt = re.sub(r"^(?:(?:one|two|three|four|five|\d+)\s+aliases?:|f\.k\.a\.|a\.k\.a\.)\s*", "", m.group(2))
                aliases = [a.strip(" .;") for a in re.split(r";| and ", alias_txt) if a.strip()]
            try:
                eff = datetime.datetime.strptime(eff_raw, "%B %d, %Y").strftime("%Y-%m-%d")
            except ValueError:
                eff = eff_raw
            entries.append({"name": name, "aliases": aliases, "effective": eff, "section": sec})
    stats[tag]["scanned"] += len(entries)
    snapshot = {"retrieved_at": now_cn(), "sha256": sha, "count": len(entries), "entries": entries}
    # 窗口内生效的批次 → 清单条目（按生效日聚合）
    items = []
    by_date = {}
    for e in entries:
        if re.match(r"^\d{4}-\d{2}-\d{2}$", e["effective"]) and gte <= e["effective"] <= lte:
            by_date.setdefault(e["effective"], []).append(e)
    for d, es in sorted(by_date.items()):
        names = [e["name"] for e in es]
        secs = sorted(set(e["section"] for e in es))
        items.append({
            "id": "uflpa-" + d.replace("-", ""), "column": "lists", "action": "added",
            "date": d, "agency": "DHS/FLETF", "doc_no": "",
            "title": "UFLPA 实体清单新增 %d 个实体（生效 %s）" % (len(es), d),
            "parties": names,
            "china_link": {"value": "是", "layer": "external",
                           "basis": "UFLPA 实体清单列入依据为涉疆强迫劳动条款（%s）" % "、".join(secs)},
            "points": [{"text": "列入依据小节：%s；名单含别名（a.k.a./formerly known as），详见原文页。" % "、".join(secs),
                        "layer": "external", "source": DHS_UFLPA}],
            "impact": impact_for("lists", "DHS", "added", "UFLPA Entity List"),
            "url": DHS_UFLPA, "pdf_url": None,
            "source": {"channel": "DHS UFLPA Entity List", "retrieved_at": now_cn()},
        })
        stats[tag]["kept"] += 1
    return items, snapshot


# ───────────────────────── 主流程 ─────────────────────────
def new_stats():
    s = {}
    for k in ("FR-BIS", "FR-UFLPA", "FR-OFAC", "FR-fulltext", "FR-other",
              "OFAC-RA", "OFAC-detail", "BIS-news", "DHS-UFLPA"):
        s[k] = {"scanned": 0, "kept": 0, "failed": 0}
    return s


def load_state():
    if os.path.exists(STATE_PATH):
        try:
            return json.load(open(STATE_PATH, encoding="utf-8"))
        except Exception:
            pass
    return {"meta": {}, "batches": [], "items": [], "uflpa_snapshot": None, "watch": None}


def emit_js(state):
    payload = {
        "meta": state.get("meta", {}),
        "batches": state.get("batches", [])[-12:],
        "items": state.get("items", []),
        "uflpa": {k: v for k, v in (state.get("uflpa_snapshot") or {}).items() if k != "entries"},
        "uflpa_count": (state.get("uflpa_snapshot") or {}).get("count"),
        "watch": state.get("watch"),
    }
    os.makedirs(os.path.dirname(JS_PATH), exist_ok=True)
    with open(JS_PATH, "w", encoding="utf-8") as f:
        f.write("window.EXDATA = ")
        json.dump(payload, f, ensure_ascii=False, indent=1)
        f.write(";\n")
    print("已生成 assets/export_data.js（items %d）" % len(payload["items"]))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", help="仅扫该日 YYYY-MM-DD（北京时间当日，按来源发布日近似）")
    ap.add_argument("--since", help="起始日 YYYY-MM-DD")
    ap.add_argument("--backfill-days", type=int, default=None, help="回溯天数（默认 20）")
    args = ap.parse_args()

    state = load_state()
    kind = "weekly"
    if args.date:
        gte = lte = args.date
    elif args.since:
        gte, lte = args.since, today_cn().strftime("%Y-%m-%d")
        kind = "backfill"
    else:
        days = args.backfill_days if args.backfill_days is not None else None
        if days is None:
            # 增量：自上次批次窗口结束日（或默认 20 天）
            last = state.get("meta", {}).get("last_window_lte")
            days = None
            if last:
                gte = (datetime.date.fromisoformat(last) + datetime.timedelta(days=1)).strftime("%Y-%m-%d")
            else:
                gte = (today_cn() - datetime.timedelta(days=20)).strftime("%Y-%m-%d")
            lte = today_cn().strftime("%Y-%m-%d")
        else:
            gte = (today_cn() - datetime.timedelta(days=days)).strftime("%Y-%m-%d")
            lte = today_cn().strftime("%Y-%m-%d")
            kind = "backfill" if days > 10 else "weekly"

    stats = new_stats()
    print("出口管制采集窗口 %s ~ %s（%s）" % (gte, lte, kind))
    items = []
    items += pull_fr(gte, lte, stats)
    items += pull_ofac(gte, lte, stats)
    items += pull_bis(gte, lte, stats)
    uflpa_items, snapshot = pull_uflpa(gte, lte, stats, state.get("uflpa_snapshot"))
    items += uflpa_items
    if snapshot:
        state["uflpa_snapshot"] = snapshot

    # 跨源合并：同一 UFLPA 列入批次同时见于 FR 通知与 DHS 页 → 保留 FR 条目，DHS 页记为附加来源
    def _is_uflpa(it):
        t = it["title"].lower()
        return "uflpa" in t or "uyghur" in t
    fr_uflpa = [it for it in items if it["id"].startswith("fr-") and _is_uflpa(it)]
    fr_uflpa_dates = {it["date"] for it in fr_uflpa}
    kept = []
    for it in items:
        if it["id"].startswith("uflpa-") and it["date"] in fr_uflpa_dates:
            fr = next((x for x in fr_uflpa if x["date"] == it["date"]), None)
            if fr is not None:
                fr["points"].append({"text": "DHS UFLPA 实体清单页同步收录该批 %d 个实体（含别名与生效日期，生效 %s）。" % (len(it["parties"]), it["date"]),
                                     "layer": "external", "source": it["url"]})
                if not fr["parties"]:
                    fr["parties"] = it["parties"]
            continue
        kept.append(it)
    items = kept
    # BIS 新闻稿与 FR 规则同题同日 → 保留 FR 条目并注明 BIS 稿链接
    fr_by = {(re.sub(r"\W+", "", it["title"].lower()), it["date"]): it
             for it in items if it["id"].startswith("fr-")}
    kept = []
    for it in items:
        if it["id"].startswith("bis-"):
            fr = fr_by.get((re.sub(r"\W+", "", it["title"].lower()), it["date"]))
            if fr is not None:
                fr["points"].append({"text": "BIS 新闻稿同日报道同一事项。", "layer": "external", "source": it["url"]})
                continue
        kept.append(it)
    items = kept

    # 去重合并：同 id 更新（保留最早入库时间）
    old = {it["id"]: it for it in state.get("items", [])}
    n_new = 0
    for it in items:
        if it["id"] in old:
            it["first_seen"] = old[it["id"]].get("first_seen", now_cn())
        else:
            it["first_seen"] = now_cn()
            n_new += 1
        old[it["id"]] = it
    merged = sorted(old.values(), key=lambda x: (x.get("date") or "", x["id"]), reverse=True)
    state["items"] = merged

    batch = {
        "batch_id": week_batch_id(), "kind": kind, "time": now_cn(),
        "window": {"gte": gte, "lte": lte,
                   "note": "按来源发布日（美东日期）过滤，与北京时间当日近似对齐" if args.date else "按来源发布日过滤"},
        "stats": stats, "new_items": n_new, "total_items": len(merged),
    }
    state.setdefault("batches", []).append(batch)
    state["meta"] = {
        "updated": now_cn(), "cadence": "周更（周批 W-YYYYWW）",
        "last_window_lte": lte,
        "sources": [
            {"name": "Federal Register API", "url": "https://www.federalregister.gov/api/v1/", "note": "BIS/OFAC 规则与实体清单通知，免费无 key"},
            {"name": "OFAC recent-actions", "url": OFAC_RA, "note": "执法/清单/通用许可/指南，HTML 列表"},
            {"name": "BIS news-updates", "url": BIS_NEWS, "note": "BIS 执法与规则新闻稿"},
            {"name": "DHS UFLPA Entity List", "url": DHS_UFLPA, "note": "批次式更新，含生效日期与列入依据小节"},
        ],
        "caliber": "本模块数据与其他分页面互不混用；仅收官方公开文件；要点=external（附来源），合规影响=analysis（写依据）；原文未载显示【未披露】。",
    }
    os.makedirs(os.path.dirname(STATE_PATH), exist_ok=True)
    with open(STATE_PATH, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=1)
    emit_js(state)
    print("批次 %s：新增 %d，库内累计 %d；失败 %d" % (
        batch["batch_id"], n_new, len(merged), sum(v["failed"] for v in stats.values())))


if __name__ == "__main__":
    sys.exit(main())
