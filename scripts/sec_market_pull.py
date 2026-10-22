#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""PubX 美股（SEC）全量重大事项采集 —— 独立口径，不进出海信批统计。

数据源：EDGAR 每日索引 master.idx（T+1，美东晚 22:00 后发布；当日/未发布返回 403，属正常）。
链路：master.idx 全量扫描 → 表格类型白名单过滤 → 8-K 用 EFTS 批量取 Item 号预筛
      （EFTS 失败时回退为逐份解析主文档 Item 标题）→ 仅对命中 filing 抓主文档，
      抽取一句话事项、金额、交易对方（均为原文正则抽取，抽不到写【未披露】，不编造）。

表格白名单：8-K/8-K/A（Item 1.01/1.02/1.05/2.01/2.03/2.05/2.06/3.01/3.02/5.01/5.02/8.01）、
6-K/6-K/A、S-1/F-1/S-4/F-4（含/A）、424B*、SC TO-T/14D9/13E3（含/A）、DEFM14A、425。

去重：accessionNumber（state/sec_market_seen.json）；数据追加不覆盖历史。
分片：state/us_market/YYYY-MM-DD.json；汇总 state/us_market.json；前端 assets/us_data.js。

用法：
  python3 sec_market_pull.py --date 2026-10-21        # 单日（日批次 D-YYYYMMDD）
  python3 sec_market_pull.py --backfill-days 20       # 回溯 N 天（回溯批次 B-YYYYMMDD，默认 20）
  python3 sec_market_pull.py --build-only             # 仅由 state/us_market.json 重建 us_data.js
限流：≤8 次/秒（官方上限 10，留余量），带 User-Agent，429/5xx 指数退避。
"""
import argparse
import concurrent.futures as cf
import datetime
import html as htmlmod
import json
import os
import re
import sys
import threading
import time
import urllib.error
import urllib.request

UA = {"User-Agent": "PubX Disclosure Monitor (research; contact: admin@pubx.local)"}
BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(BASE, ".."))
STATE = os.path.join(ROOT, "state")
SHARD_DIR = os.path.join(STATE, "us_market")
MASTER_P = os.path.join(STATE, "us_market.json")
SEEN_P = os.path.join(STATE, "sec_market_seen.json")
OUT_JS = os.path.join(ROOT, "assets", "us_data.js")

RPS = 0.4               # 共享出口 IP 上 SEC 限流极敏感：实测 2/s 触发数分钟 403 封禁，0.25/s 可持续
MAX_DOC_BYTES = 700000  # 主文档只读前 700KB，够取 Items 与首段事实
THREADS = 2

FORM_WHITELIST = {
    "8-K", "8-K/A", "6-K", "6-K/A",
    "S-1", "S-1/A", "F-1", "F-1/A", "S-4", "S-4/A", "F-4", "F-4/A",
    "424B1", "424B2", "424B3", "424B4", "424B5", "424B7", "424B8",
    "SCTO-T", "SCTO-T/A", "SC14D9", "SC14D9/A", "SC13E3", "SC13E3/A",
    "DEFM14A", "425",
}
ITEM_WHITELIST = ["1.01", "1.02", "1.05", "2.01", "2.03", "2.05", "2.06",
                  "3.01", "3.02", "5.01", "5.02", "8.01"]
ITEM_NAME_ZH = {
    "1.01": "签订重大确定性协议", "1.02": "终止重大确定性协议", "1.05": "重大网络安全事件",
    "2.01": "完成收购或处置", "2.03": "产生直接财务义务", "2.05": "重组与退出成本",
    "2.06": "重大减值", "3.01": "退市通知/不符合持续上市标准", "3.02": "未注册增发",
    "5.01": "控制权变更", "5.02": "董监高变动", "8.01": "其他重大事项",
}
# 8-K 多 Item 时按此优先级定主类别
ITEM_PRIORITY = ["1.05", "2.01", "1.01", "1.02", "2.03", "3.02",
                 "2.05", "2.06", "3.01", "5.01", "5.02", "8.01"]

CATS = ["交易类", "融资类", "运营", "法律（诉讼/监管处罚）", "对外投资", "经营战略重大事项"]

LAW_RE = re.compile(r"\b(lawsuit|litigation|class action|settlement|indict|sec (?:charges|investigation|order)|"
                    r"doj|penalt|consent (?:order|decree)|subpoena|enforcement|sanction|fine[ds]? |cease[\s-]and[\s-]desist|"
                    r"fcpa|fraud charges|restitution|injunction|delisting (?:proceedings|determination))\b", re.I)
FIN_RE = re.compile(r"\b(offering|private placement|pipe\b|registered direct|convertible (?:notes?|debentures?)|"
                    r"notes? (?:offering|due)|credit (?:facility|agreement)|loan|term debt|bond|debenture|"
                    r"at[\s-]the[\s-]market|equity line|prepaid forward| IPO\b|initial public offering)\b", re.I)
MA_RE = re.compile(r"\b(acqui[rs][ei]|merger|merg(?:e|ed) with|business combination|takeover|tender offer|"
                   r"privatiz|going private|spin[\s-]?off|divest|dispos(?:al|ition)|sale of (?:assets|the company)|"
                   r"purchase of|joint venture|strategic investment|minority (?:stake|investment))\b", re.I)
STRAT_RE = re.compile(r"\b(strategic (?:alternatives|review|transformation|shift|pivot)|restructur|"
                      r"new business (?:line|segment)|change of (?:control|ceo|cfo|chief)|appoint(?:ment|ed)? (?:of )?(?:a )?(?:new )?(?:chief|ceo|cfo)|"
                      r"resign(?:ation|ed)?|wind[\s-]?down|liquidat|bankrupt|chapter 11|delisting|reverse split)\b", re.I)
AMT_RE = re.compile(r"((?:US\$|USD\s?\$?|\$|€|£|RMB|CNY|HK\$)\s?[\d][\d,]*(?:\.\d+)?\s?"
                    r"(?:million|billion|trillion|thousand|亿|万)?)", re.I)
AMT_KEY_RE = re.compile(r"aggregate|purchase price|total|principal|offering price|consideration|proceeds|"
                        r"valued at|value of|approximately|up to|commitment", re.I)
CPTY_RES = [
    re.compile(r"(?:agreement|merger agreement|business combination agreement|transaction)\s+(?:with|by and between|by and among|among)\s+([A-Z][\w&.,'()\[\]\- ]{2,70}?)(?:,|\.| pursuant| under| dated| relating| providing)", re.I),
    re.compile(r"(?:acquisition|purchase) of\s+([A-Z][\w&.,'()\[\]\- ]{2,60}?)(?:,|\.| from| for| pursuant)", re.I),
    re.compile(r"merger with\s+([A-Z][\w&.,'()\[\]\- ]{2,60}?)(?:,|\.| and )", re.I),
]
CN_NAME_RE = re.compile(r"china|hong\s?kong|beijing|shanghai|shenzhen|guangzhou|hangzhou|suzhou|nanjing|"
                        r"chengdu|wuhan|xiamen|tianjin|chongqing|alibaba|tencent|baidu|jd\.com|pinduoduo|"
                        r"netease|weibo|bilibili|xpeng|jinko|daqo|trip\.com|iqiyi|huya|douyu", re.I)
VALID_ITEM_RE = re.compile(r"Item\s+([1-9]\.\d\d)\b")
TAG_RE = re.compile(r"<[^>]+>")

_lock = threading.Lock()
_last_req = [0.0]
_interval = [1.0 / RPS]  # 自适应请求间隔（秒）：成功衰减、403 翻倍，2.5–30
_stats = {"fetches": 0, "errors": 0}


def throttle():
    with _lock:
        now = time.monotonic()
        wait = _last_req[0] + _interval[0] - now
        if wait > 0:
            time.sleep(wait)
        _last_req[0] = time.monotonic()


def _adapt(ok):
    with _lock:
        if ok:
            _interval[0] = max(2.5, _interval[0] * 0.85)
        else:
            _interval[0] = min(30.0, _interval[0] * 2.0)


def fetch(url, max_bytes=None, retries=2, retry_403=False):
    """自适应限流 + 退避；max_bytes 截断读取（主文档只看头部）。
    共享出口上 SEC 限流窗口存在但短（实测静默 2–5 分钟即恢复），
    403 时把全局请求间隔翻倍，成功后逐步回落，避免陷入超长休眠。
    日索引的 403（未发布）不重试，由调用方视为正常态。"""
    for i in range(retries + 1):
        throttle()
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=40) as r:
                _stats["fetches"] += 1
                data = r.read(max_bytes) if max_bytes else r.read()
            _adapt(True)
            return data.decode("utf-8", "ignore")
        except urllib.error.HTTPError as e:
            if e.code == 404:
                raise
            if e.code == 403:
                if not retry_403:
                    raise
                _adapt(False)
                print("[403 限流，请求间隔升至 %.1fs]" % _interval[0], flush=True)
            if i == retries:
                _stats["errors"] += 1
                raise
            time.sleep(min(60, (8 * (3 ** i)) if e.code == 403 else (2 ** (i + 2))))
        except Exception:
            if i == retries:
                _stats["errors"] += 1
                raise
            time.sleep(min(90, 2 ** (i + 2)))


def qtr_of(datestr):
    return "QTR%d" % ((int(datestr[5:7]) - 1) // 3 + 1)


def master_idx(datestr):
    """拉某 EDGAR 日索引；未发布(403/404)返回 None。"""
    yyyymmdd = datestr.replace("-", "")
    url = "https://www.sec.gov/Archives/edgar/daily-index/%s/%s/master.%s.idx" % (
        datestr[:4], qtr_of(datestr), yyyymmdd)
    try:
        raw = fetch(url)
    except urllib.error.HTTPError as e:
        if e.code in (403, 404):
            return None
        raise
    rows = []
    for line in raw.splitlines():
        p = line.split("|")
        if len(p) == 5 and p[0].strip().isdigit():
            rows.append({"cik": p[0].strip(), "company": p[1].strip(),
                         "form": p[2].strip(), "date": p[3].strip(), "path": p[4].strip()})
    return rows


def efts_items(datestr):
    """EFTS 批量取当日全部 8-K 的 Item 号（文档级 _id=accession:文件名）。
    返回 {accession: {"items": set, "doc": 主文档文件名}}；失败返回 None 触发回退。"""
    out = {}
    frm = 0
    try:
        while True:
            url = ("https://efts.sec.gov/LATEST/search-index?q=%22%22&forms=8-K"
                   "&startdt=%s&enddt=%s&from=%d" % (datestr, datestr, frm))
            d = json.loads(fetch(url))
            hits = d.get("hits", {}).get("hits", [])
            for h in hits:
                s = h.get("_source", {})
                acc = s.get("adsh")
                if not acc:
                    continue
                e = out.setdefault(acc, {"items": set(), "doc": ""})
                for it in s.get("items") or []:
                    e["items"].add(it)
                fn = h.get("_id", "").split(":")[-1]
                if (s.get("file_type") or "").upper().startswith("8-K"):
                    e["doc"] = fn
            total = d.get("hits", {}).get("total", {})
            tv = total.get("value", 0) if isinstance(total, dict) else int(total or 0)
            frm += len(hits)
            if not hits or frm >= min(tv, 9900):
                break
            if frm > 9900:
                break
        return out
    except Exception:
        return None


def strip_html(x):
    x = TAG_RE.sub(" ", x)
    x = htmlmod.unescape(x)
    return re.sub(r"\s+", " ", x).strip()


def parse_primary(txt_raw, form):
    """从 full-submission .txt 取主文档纯文本（第一个 <TYPE> 与表单一的 <DOCUMENT>）。"""
    blocks = re.split(r"<DOCUMENT>", txt_raw)
    want = form.replace(" ", "")
    first_text = None
    for b in blocks[1:]:
        m = re.match(r"\s*<TYPE>([^\n<]+)", b)
        if not m:
            continue
        btype = m.group(1).strip()
        t = re.search(r"<TEXT>(.*)", b, re.S)
        if not t:
            continue
        body = t.group(1)
        body = body.split("</TEXT>")[0]
        if first_text is None:
            first_text = body
        if btype.replace(" ", "").upper() == want.upper():
            return strip_html(body)
    return strip_html(first_text) if first_text else ""


def parse_items(text):
    """从 8-K 正文解析 Item 编号（借鉴 edgartools：正文正则，TOC/正文出现均收入并集）。"""
    found = set()
    for m in VALID_ITEM_RE.finditer(text[:120000]):
        c = m.group(1)
        if c in ITEM_NAME_ZH or c in ("2.02", "2.04", "1.03", "1.04", "3.03", "4.01", "4.02",
                                      "5.03", "5.04", "5.05", "5.06", "5.07", "5.08", "7.01", "9.01"):
            found.add(c)
    return sorted(found)


def item_context(text, item):
    """取某 Item 标题之后的首段文字（跳过目录点线）。"""
    best = ""
    for m in re.finditer(r"Item\s+%s[^\n]{0,120}" % re.escape(item), text):
        seg = text[m.end():m.end() + 700]
        if "...." in seg[:80]:
            continue
        seg = re.sub(r"\s+", " ", seg).strip()
        if len(seg) > len(best):
            best = seg
        if len(best) > 120:
            break
    return best


def first_sentences(text, n=2, cap=260):
    parts = re.split(r"(?<=[.!?])\s+(?=[A-Z(])", text.strip())
    out = ""
    for s in parts:
        if not s:
            continue
        out = (out + " " + s).strip()
        if len(out) >= cap or out.count(".") + out.count("!") + out.count("?") >= n:
            break
    return out[:cap].strip()


def extract_amount(text):
    if not text:
        return "【未披露】"
    best = None
    for m in AMT_RE.finditer(text):
        ctx = text[max(0, m.start() - 90):m.end() + 30]
        if AMT_KEY_RE.search(ctx):
            best = m.group(1).strip()
            break
        if best is None:
            best = m.group(1).strip()
    return best if best else "【未披露】"


def extract_counterparty(text):
    if not text:
        return "【未披露】"
    for rx in CPTY_RES:
        m = rx.search(text[:4000])
        if m:
            name = re.sub(r"\s+", " ", m.group(1)).strip(" ,.")
            if 2 < len(name) <= 70 and not re.match(r"^(The|A|An|Its|This)\b", name):
                return name
    return "【未披露】"


def classify_8k(items, text):
    picked = [i for i in ITEM_PRIORITY if i in items]
    primary = picked[0] if picked else None
    seg = item_context(text, primary) if primary else ""
    low = (seg + " " + text[:3000]).lower()
    if primary == "1.05":
        return "法律（诉讼/监管处罚）", "重大网络安全事件（Item 1.05）"
    if primary == "2.01":
        if re.search(r"sale|sold|disposition|divestiture|divest", low):
            return "交易类", "完成资产/业务出售（Item 2.01）"
        return "对外投资", "完成收购（Item 2.01）"
    if primary == "1.01":
        if FIN_RE.search(low):
            return "融资类", "重大融资/信贷协议（Item 1.01）"
        if MA_RE.search(low):
            return "对外投资", "投资并购类重大协议（Item 1.01）"
        return "交易类", "签订重大确定性协议（Item 1.01）"
    if primary == "1.02":
        return "交易类", "终止重大确定性协议（Item 1.02）"
    if primary == "2.03":
        return "融资类", "产生直接财务义务·借款/发债（Item 2.03）"
    if primary == "3.02":
        return "融资类", "未注册增发（Item 3.02）"
    if primary == "2.05":
        return "运营", "重组与退出成本（Item 2.05）"
    if primary == "2.06":
        return "运营", "重大减值（Item 2.06）"
    if primary == "3.01":
        return "运营", "退市通知/不符合持续上市标准（Item 3.01）"
    if primary == "5.01":
        return "经营战略重大事项", "控制权变更（Item 5.01）"
    if primary == "5.02":
        return "经营战略重大事项", "董监高变动（Item 5.02）"
    if primary == "8.01":
        if LAW_RE.search(low):
            return "法律（诉讼/监管处罚）", "诉讼/监管事项（Item 8.01，关键词判定）"
        return "经营战略重大事项", "其他重大事项（Item 8.01）"
    return "运营", "其他（Item 未命中白名单）"


def classify_form(form, text):
    f = form.upper()
    low = (text or "")[:4000].lower()
    if f.startswith("424B"):
        if f == "424B4":
            return "融资类", "IPO 招股说明书（定价，424B4）"
        return "融资类", "证券发行定价/招股补充（%s）" % f
    if f in ("S-1", "S-1/A"):
        return "融资类", "IPO/发行注册说明书（%s）" % f
    if f in ("F-1", "F-1/A"):
        return "融资类", "外国发行人 IPO/发行注册（%s）" % f
    if f in ("S-4", "S-4/A", "F-4", "F-4/A"):
        return "交易类", "并购/换股合并注册（%s）" % f
    if f.startswith("SCTO-T"):
        return "交易类", "要约收购（SC TO-T）"
    if f.startswith("SC14D9"):
        return "交易类", "要约收购回应声明（SC 14D9）"
    if f.startswith("SC13E3"):
        return "交易类", "私有化交易（SC 13E3）"
    if f == "DEFM14A":
        return "交易类", "并购表决代理声明（DEFM14A）"
    if f == "425":
        return "交易类", "并购沟通材料（425）"
    if f.startswith("6-K"):
        if LAW_RE.search(low):
            return "法律（诉讼/监管处罚）", "诉讼/监管事项（6-K，关键词判定）"
        if FIN_RE.search(low):
            return "融资类", "融资/证券发行（6-K，关键词判定）"
        if MA_RE.search(low):
            if re.search(r"acqui|joint venture|strategic investment|minority", low):
                return "对外投资", "对外投资/并购（6-K，关键词判定）"
            return "交易类", "并购/出售（6-K，关键词判定）"
        if STRAT_RE.search(low):
            return "经营战略重大事项", "战略/治理事项（6-K，关键词判定）"
        return "运营", "定期/其他披露（6-K）"
    return "运营", "其他（%s）" % form


def china_tag(cik, company, watch_ciks):
    if cik and str(int(cik)) in watch_ciks:
        return "是", "CIK 命中出海观察名单"
    if CN_NAME_RE.search(company or ""):
        return "是", "公司名含中国地名/中概关键词（系统粗判）"
    return "未知", "无名单/名称信号，未进一步核查"


def load_json(p, default):
    if os.path.exists(p):
        try:
            return json.load(open(p, encoding="utf-8"))
        except Exception:
            pass
    return default


def process_filing(row, tickers, watch_ciks, efts_map, batch_id):
    """单个命中 filing → entry；失败返回 (None, 错误串)。"""
    acc = os.path.basename(row["path"]).replace(".txt", "")
    acc_nodash = acc.replace("-", "")
    cik_i = str(int(row["cik"]))
    form = row["form"]
    base = "https://www.sec.gov/Archives/edgar/data/%s/%s" % (cik_i, acc_nodash)
    index_url = "%s/%s-index.htm" % (base, acc)
    info = (efts_map or {}).get(acc) if form.startswith("8-K") else None
    try:
        raw = fetch("https://www.sec.gov/Archives/edgar/" + row["path"],
                    max_bytes=MAX_DOC_BYTES, retries=3, retry_403=True)
        text = parse_primary(raw, form)
    except Exception as e:
        return None, "%s %s: %s" % (acc, form, str(e)[:120])
    if form.startswith("8-K"):
        items = sorted(info["items"]) if info and info["items"] else parse_items(text)
        keep = [i for i in items if i in ITEM_WHITELIST]
        if not keep:
            return "SKIP", None
        cat, sub = classify_8k(keep, text)
        seg = item_context(text, keep[0])
        summary = first_sentences(seg) if seg else first_sentences(text)
    else:
        items = []
        cat, sub = classify_form(form, text)
        summary = first_sentences(text)
    if not summary:
        summary = "【正文未能抽取，见原文】"
    primary_doc = (info or {}).get("doc") or ""
    doc_url = "%s/%s" % (base, primary_doc) if primary_doc else index_url
    china, china_basis = china_tag(cik_i, row["company"], watch_ciks)
    entry = {
        "id": "usm_" + acc_nodash,
        "accession": acc,
        "date": row["date"],
        "company": row["company"],
        "cik": cik_i,
        "ticker": tickers.get(cik_i),
        "form": form,
        "items": items,
        "item_names": [ITEM_NAME_ZH.get(i, i) for i in items if i in ITEM_NAME_ZH],
        "category": cat,
        "subtype": sub,
        "summary": summary,
        "amount": extract_amount(item_context(text, keep[0]) if form.startswith("8-K") else text[:6000]),
        "counterparty": extract_counterparty(text),
        "url": doc_url,
        "index_url": index_url,
        "china": china,
        "china_basis": china_basis,
        "layer": {"category": "analysis", "china": "analysis",
                  "summary": "disclosed", "amount": "disclosed"},
        "batch": batch_id,
    }
    return entry, None


def collect_dates(dates, batch_id, max_docs=None, max_minutes=None):
    deadline = time.monotonic() + max_minutes * 60 if max_minutes else None
    tickers_raw = load_json(os.path.join(STATE, "sec_tickers_cache.json"), None)
    if not tickers_raw:
        try:
            tj = json.loads(fetch("https://www.sec.gov/files/company_tickers.json"))
            tickers_raw = {str(v["cik_str"]): v["ticker"] for v in tj.values()}
            json.dump(tickers_raw, open(os.path.join(STATE, "sec_tickers_cache.json"), "w"),
                      ensure_ascii=False)
        except Exception:
            tickers_raw = {}
    tickers = {str(int(k)): v for k, v in tickers_raw.items()}

    watch = load_json(os.path.join(STATE, "watchlist_us.json"), [])
    watch_ciks = {str(int(w["cik"])) for w in watch if w.get("cik")}

    seen = load_json(SEEN_P, {"acc": []})
    seen_acc = set(seen.get("acc", []))
    master = load_json(MASTER_P, {"meta": {"batches": []}, "entries": []})
    have_ids = {e["id"] for e in master["entries"]}

    bstat = {"batch_id": batch_id, "ran_at": datetime.datetime.now().isoformat(timespec="seconds"),
             "dates": {}, "new_entries": 0, "errors": []}
    fetched_docs = 0

    for dstr in dates:
        if deadline and time.monotonic() > deadline:
            print("[--max-minutes 到达，提前收尾]")
            break
        try:
            rows = master_idx(dstr)
        except Exception as e:
            bstat["errors"].append("%s master.idx: %s" % (dstr, str(e)[:120]))
            continue
        if rows is None:
            bstat["dates"][dstr] = {"status": "索引未发布（403/404，T+1 正常态）"}
            continue
        hits = [r for r in rows if r["form"].replace(" ", "").upper() in
                {f.replace(" ", "") for f in FORM_WHITELIST}]
        seen_nd = {a.replace("-", "") for a in seen_acc}
        todo = [r for r in hits
                if os.path.basename(r["path"]).replace(".txt", "").replace("-", "") not in seen_nd
                and "usm_" + os.path.basename(r["path"]).replace(".txt", "").replace("-", "")
                not in have_ids]
        efts_map = efts_items(dstr) if any(r["form"].startswith("8-K") for r in todo) else None
        if efts_map is None and any(r["form"].startswith("8-K") for r in todo):
            # EFTS 回退：逐份解析主文档 Item（process_filing 内 parse_items）
            efts_map = {}
        # EFTS 预筛：8-K 且 items 与白名单无交 → 不抓文档
        pre = []
        for r in todo:
            acc = os.path.basename(r["path"]).replace(".txt", "")
            if r["form"].startswith("8-K") and efts_map and acc in efts_map:
                its = efts_map[acc]["items"]
                if its and not (set(its) & set(ITEM_WHITELIST)):
                    continue
            pre.append(r)
        if max_docs is not None:
            pre = pre[:max(0, max_docs - fetched_docs)]
        results = []
        with cf.ThreadPoolExecutor(max_workers=THREADS) as ex:
            futs = {ex.submit(process_filing, r, tickers, watch_ciks, efts_map, batch_id): r for r in pre}
            for fu in cf.as_completed(futs):
                r = futs[fu]
                try:
                    entry, err = fu.result()
                except Exception as e:
                    entry, err = None, "worker: %s" % str(e)[:120]
                if entry == "SKIP":
                    acc = os.path.basename(r["path"]).replace(".txt", "")
                    seen_acc.add(acc)
                elif entry:
                    results.append(entry)
                    seen_acc.add(entry["accession"])
                    fetched_docs += 1
                elif err:
                    bstat["errors"].append(err)
        results.sort(key=lambda e: (e["company"], e["accession"]))
        master["entries"].extend(results)
        have_ids.update(e["id"] for e in results)
        bstat["dates"][dstr] = {
            "status": "ok", "scanned": len(rows), "whitelist_hits": len(hits),
            "new_filings": len(todo), "doc_fetched": len(pre), "kept": len(results),
        }
        print("[%s] 扫描 %d · 白名单 %d · 新 %d · 抓文档 %d · 收录 %d" %
              (dstr, len(rows), len(hits), len(todo), len(pre), len(results)), flush=True)
        # 每日落一次游标与汇总，防长任务中断丢进度
        json.dump({"acc": sorted(seen_acc),
                   "last_run": datetime.datetime.now().isoformat(timespec="seconds")},
                  open(SEEN_P, "w", encoding="utf-8"), ensure_ascii=False)
        save_master(master)
        if max_docs is not None and fetched_docs >= max_docs:
            print("[--max-docs %d 达到，停止]" % max_docs)
            break

    bstat["new_entries"] = sum(v.get("kept", 0) for v in bstat["dates"].values())
    master["meta"]["batches"] = [b for b in master["meta"].get("batches", [])
                                 if b.get("batch_id") != batch_id] + [bstat]
    save_master(master)
    return bstat


def save_master(master):
    master["entries"].sort(key=lambda e: (e["date"], e["company"], e["accession"]), reverse=True)
    dates = sorted({e["date"] for e in master["entries"]})
    cats = {}
    for e in master["entries"]:
        cats[e["category"]] = cats.get(e["category"], 0) + 1
    master["meta"].update({
        "generated_at": datetime.datetime.now(
            datetime.timezone(datetime.timedelta(hours=8))).strftime("%Y-%m-%d %H:%M"),
        "date_range": [dates[-1], dates[0]] if dates else [],
        "total": len(master["entries"]),
        "by_category": cats,
        "caliber": ("数据源 SEC EDGAR 每日索引 master.idx（T+1）；表格白名单 8-K/6-K/S-1/F-1/S-4/F-4/"
                    "424B*/SC TO-T/14D9/13E3/DEFM14A/425；8-K 按 Item 白名单过滤；"
                    "分类、中国关联为系统规则推断（analysis 层）；一句话事项/金额/交易对方为原文正则抽取，"
                    "抽不到写【未披露】；全量口径不分中企外企，与出海信批归纳互不混用。"),
    })
    os.makedirs(SHARD_DIR, exist_ok=True)
    by_date = {}
    for e in master["entries"]:
        by_date.setdefault(e["date"], []).append(e)
    for d, es in by_date.items():
        json.dump({"date": d, "count": len(es), "entries": es},
                  open(os.path.join(SHARD_DIR, d + ".json"), "w", encoding="utf-8"),
                  ensure_ascii=False, indent=0)
    json.dump(master, open(MASTER_P, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    build_js(master)


def build_js(master):
    payload = {"meta": master["meta"], "entries": master["entries"]}
    with open(OUT_JS, "w", encoding="utf-8") as f:
        f.write("window.US_DATA = ")
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))
        f.write(";\n")
    print("[build] assets/us_data.js  %d 条，%.1f MB" %
          (len(master["entries"]), os.path.getsize(OUT_JS) / 1048576))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", help="YYYY-MM-DD，扫该日 EDGAR 日索引（日批次 D-YYYYMMDD）")
    ap.add_argument("--backfill-days", type=int, default=20,
                    help="回溯最近 N 个自然日（回溯批次 B-YYYYMMDD，默认 20）")
    ap.add_argument("--max-docs", type=int, default=None, help="调试用：最多抓主文档份数")
    ap.add_argument("--max-minutes", type=float, default=None, help="总时长上限（分钟），到达后保存进度收尾")
    ap.add_argument("--build-only", action="store_true", help="仅由 us_market.json 重建 us_data.js")
    a = ap.parse_args()

    if a.build_only:
        master = load_json(MASTER_P, None)
        if not master:
            print("state/us_market.json 不存在")
            return 1
        save_master(master)
        return 0

    today = datetime.date.today()
    if a.date:
        dates = [a.date]
        batch_id = "D-" + a.date.replace("-", "")
    else:
        dates = [(today - datetime.timedelta(days=i)).isoformat()
                 for i in range(1, a.backfill_days + 1)]
        batch_id = "B-" + today.strftime("%Y%m%d")
    bstat = collect_dates(dates, batch_id, max_docs=a.max_docs, max_minutes=a.max_minutes)
    ok = sum(1 for v in bstat["dates"].values() if v.get("status") == "ok")
    print("批次 %s：索引可用 %d 天 · 新增收录 %d 条 · 错误 %d 个（抓取 %d 次，失败 %d 次）"
          % (batch_id, ok, bstat["new_entries"], len(bstat["errors"]),
             _stats["fetches"], _stats["errors"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
