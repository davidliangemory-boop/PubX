#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""三市场历史信批回溯拉取（公开接口，零密钥）。
用法：python3 backfill_pull.py <start> <end>     # YYYY-MM-DD，含首尾
  或：python3 backfill_pull.py --end YYYY-MM-DD --backfill-days N   # 默认 N=20；回溯批次号 B-<end>
- A股巨潮：state/config.json 关键词组全文检索（exclude_words 仅打标不拦截，交由分析环节剔除）
- 港股披露易：state/watchlist_hk.json 按股拉 titleSearchServlet；NEWS_ID 去重（state/hkex_seen.json）
- 美股SEC：state/watchlist_us.json 按 CIK 拉 submissions；超出 recent 自动翻 filings.files 历史分页；
  accessionNumber 去重（state/sec_seen.json）；不做关键词检索
输出：state/raw_bf_{cninfo|hkex|sec}_<start>.json
"""
import json, os, re, sys, time, html, datetime, urllib.request, urllib.parse

BASE = os.path.dirname(os.path.abspath(__file__))
STATE = os.path.normpath(os.path.join(BASE, "..", "state"))

UA_WEB = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36"}
UA_SEC = {"User-Agent": "PubX Disclosure Backfill (research; contact: admin@pubx.local)"}
UA_HKEX = dict(UA_WEB, **{"Accept": "application/json, text/javascript, */*; q=0.01",
                          "Referer": "https://www1.hkexnews.hk/search/titlesearch.xhtml?lang=zh"})

FORMS = {"6-K", "6-K/A", "20-F", "20-F/A", "10-K", "10-K/A", "10-Q", "10-Q/A", "8-K", "8-K/A",
         "F-1", "F-1/A", "F-3", "F-3/A", "424B4", "424B5", "S-8", "SC 13G", "SC 13G/A",
         "SC 13D", "SC 13D/A", "6-K/A"}


def fetch(url, headers, data=None, retries=2):
    for i in range(retries + 1):
        try:
            req = urllib.request.Request(url, data=data, headers=headers)
            with urllib.request.urlopen(req, timeout=40) as r:
                return r.read().decode("utf-8", "ignore")
        except Exception:
            if i == retries:
                raise
            time.sleep(2 * (i + 1))


def load(name, default):
    p = os.path.join(STATE, name)
    if os.path.exists(p):
        try:
            return json.load(open(p, encoding="utf-8"))
        except Exception:
            pass
    return default


def save(name, obj):
    json.dump(obj, open(os.path.join(STATE, name), "w", encoding="utf-8"), ensure_ascii=False, indent=1)


def clean(s):
    s = html.unescape(s or "")
    s = re.sub(r"<[^>]+>", " ", s)
    return re.sub(r"\s+", " ", s).strip()


# ── A股·巨潮 ─────────────────────────────────────────────
def pull_cninfo(start, end):
    cfg = load("config.json", {})
    kws = ((cfg.get("keywords") or {}).get("include")
           or ["出海", "海外", "境外", "国际市场", "境外投资", "跨境并购", "H股", "GDR"])
    excl = set(((cfg.get("rules") or {}).get("exclude_words")) or [])
    base = "http://www.cninfo.com.cn/new/hisAnnouncement/query"
    headers = dict(UA_WEB, **{"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                              "Referer": "http://www.cninfo.com.cn/new/commonUrl/pageOfSearch?url=disclosure/list/search"})
    seen, errors = {}, []
    for kw in kws:
        page = 1
        while True:
            body = urllib.parse.urlencode({
                "pageNum": page, "pageSize": 30, "column": "szse", "tabName": "fulltext",
                "plate": "", "stock": "", "searchkey": kw, "secid": "", "category": "",
                "trade": "", "seDate": f"{start}~{end}", "sortName": "time",
                "sortType": "desc", "isHLtitle": "true"}).encode()
            try:
                d = json.loads(fetch(base, headers, data=body))
            except Exception as e:
                errors.append({"kw": kw, "page": page, "error": str(e)[:150]})
                break
            for a in (d.get("announcements") or []):
                aid = a.get("announcementId")
                if not aid:
                    continue
                title = clean(a.get("announcementTitle"))
                hit = [w for w in excl if w in title]
                if aid not in seen:
                    seen[aid] = {"announcementId": aid, "time": a.get("announcementTime"),
                                 "secCode": a.get("secCode"), "secName": a.get("secName"),
                                 "title": title, "adjunctUrl": a.get("adjunctUrl"),
                                 "keywords": [kw], "exclude_hit": hit}
                else:
                    if kw not in seen[aid]["keywords"]:
                        seen[aid]["keywords"].append(kw)
                    seen[aid]["exclude_hit"] = sorted(set(seen[aid]["exclude_hit"]) | set(hit))
            if not d.get("hasMore") or page >= 6:
                break
            page += 1
            time.sleep(0.5)
        time.sleep(0.4)
    rows = sorted(seen.values(), key=lambda x: (x["time"] or 0))
    out = {"pulled_at": datetime.datetime.now().isoformat(timespec="seconds"),
           "from": start, "to": end, "count": len(rows), "items": rows, "errors": errors}
    save(f"raw_bf_cninfo_{start}.json", out)
    print(f"[cninfo] {start}~{end} 命中 {len(rows)} 条（关键词 {len(kws)} 个），错误 {len(errors)}")


# ── 港股·披露易 ───────────────────────────────────────────
SERVLET = "https://www1.hkexnews.hk/search/titleSearchServlet.do"
PREFIX = "https://www1.hkexnews.hk/search/prefix.do"


def resolve_id(code):
    for lang in ("EN", "ZH"):
        q = urllib.parse.urlencode({"callback": "cb", "lang": lang, "type": "A",
                                    "name": code, "market": "SEHK", "_": "1"})
        txt = fetch(PREFIX + "?" + q, UA_HKEX)
        m = re.search(r"\w+\((.*)\);?\s*$", txt, re.S)
        if not m:
            continue
        data = json.loads(m.group(1))
        for s in data.get("stockInfo", []):
            if s.get("code") == code:
                return s.get("stockId")
        if data.get("stockInfo"):
            return data["stockInfo"][0].get("stockId")
    return None


def pull_hkex(start, end):
    watch = load("watchlist_hk.json", [])
    ids = load("hkex_ids.json", {})
    seen = load("hkex_seen.json", {"news": [], "cursor": {}})
    seen_ids = set(seen.get("news", []))
    frm, tod = start.replace("-", ""), end.replace("-", "")
    out, errors = [], []
    for w in watch:
        code = w["code"]
        if code not in ids:
            try:
                sid = resolve_id(code)
                if sid:
                    ids[code] = sid
                else:
                    errors.append({"code": code, "error": "resolve: stockId not found"})
                    continue
                time.sleep(0.3)
            except Exception as e:
                errors.append({"code": code, "error": "resolve: " + str(e)[:150]})
                continue
        q = {"sortDir": "0", "sortByOptions": "DateTime", "category": "0", "market": "SEHK",
             "stockId": ids[code], "documentType": "-1", "fromDate": frm,
             "toDate": tod, "title": "", "rowRange": "100", "lang": "zh"}
        try:
            data = json.loads(fetch(SERVLET + "?" + urllib.parse.urlencode(q), UA_HKEX))
            recs = json.loads(data.get("result") or "[]")
        except Exception as e:
            errors.append({"code": code, "error": str(e)[:200]})
            continue
        time.sleep(0.4)
        for r in recs:
            nid = r.get("NEWS_ID")
            if not nid or nid in seen_ids:
                continue
            seen_ids.add(nid)
            dtc = r.get("DATE_TIME", "")
            try:
                day = datetime.datetime.strptime(dtc, "%d/%m/%Y %H:%M").strftime("%Y-%m-%d")
            except Exception:
                day = dtc
            out.append({"code": code, "name": w["name"], "news_id": nid,
                        "title": clean(r.get("TITLE")),
                        "category": clean(r.get("LONG_TEXT")).split(" - ")[0].strip() or "公告及通告",
                        "sub": clean(r.get("LONG_TEXT")), "date": day, "time": dtc,
                        "size": r.get("FILE_INFO", ""),
                        "url": "https://www1.hkexnews.hk" + (r.get("FILE_LINK") or "")})
    out.sort(key=lambda x: x["date"], reverse=True)
    save(f"raw_bf_hkex_{start}.json",
         {"pulled_at": datetime.datetime.now().isoformat(timespec="seconds"),
          "from": start, "to": end, "count": len(out), "items": out, "errors": errors})
    save("hkex_ids.json", ids)
    seen["news"] = sorted(seen_ids)
    save("hkex_seen.json", seen)
    print(f"[hkex] {start}~{end} 命中 {len(out)} 条（{len(watch)} 家），错误 {len(errors)}")


# ── 美股·SEC EDGAR ────────────────────────────────────────
def sec_json(url):
    return json.loads(fetch(url, UA_SEC))


def pull_sec(start, end):
    watch = load("watchlist_us.json", [])
    seen = load("sec_seen.json", {"acc": [], "cursor": {}})
    seen_acc = set(seen.get("acc", []))
    out, errors = [], []
    for w in watch:
        cik = int(w["cik"])
        try:
            sub = sec_json(f"https://data.sec.gov/submissions/CIK{cik:010d}.json")
        except Exception as e:
            errors.append({"ticker": w["ticker"], "error": str(e)[:150]})
            continue
        time.sleep(0.3)
        blocks = []
        rec = sub.get("filings", {}).get("recent", {})
        if rec.get("accessionNumber"):
            blocks.append(rec)
        # 历史分页：与窗口有交集才取
        for f in sub.get("filings", {}).get("files", []):
            try:
                if f.get("filingFrom", "9999") <= end and f.get("filingTo", "0000") >= start:
                    blocks.append(sec_json(f"https://data.sec.gov/submissions/{f['name']}"))
                    time.sleep(0.3)
            except Exception as e:
                errors.append({"ticker": w["ticker"], "error": "hist: " + str(e)[:120]})
        for b in blocks:
            n = len(b.get("accessionNumber", []))
            for i in range(n):
                try:
                    form = b["form"][i]
                    filed = b["filingDate"][i]
                except Exception:
                    continue
                if form not in FORMS or not (start <= filed <= end):
                    continue
                acc = b["accessionNumber"][i]
                if acc in seen_acc:
                    continue
                seen_acc.add(acc)
                acc_nodash = acc.replace("-", "")
                doc = b["primaryDocument"][i] if i < len(b.get("primaryDocument", [])) else ""
                out.append({"ticker": w["ticker"], "cik": cik, "name": w["name"], "form": form,
                            "filed": filed, "accession": acc,
                            "items": b["items"][i] if i < len(b.get("items", [])) else "",
                            "desc": b["primaryDocDescription"][i] if i < len(b.get("primaryDocDescription", [])) else "",
                            "url": f"https://www.sec.gov/Archives/edgar/data/{cik}/{acc_nodash}/{doc}",
                            "index": f"https://www.sec.gov/Archives/edgar/data/{cik}/{acc_nodash}/"})
    out.sort(key=lambda x: x["filed"], reverse=True)
    save(f"raw_bf_sec_{start}.json",
         {"pulled_at": datetime.datetime.now().isoformat(timespec="seconds"),
          "from": start, "to": end, "count": len(out), "items": out, "errors": errors})
    seen["acc"] = sorted(seen_acc)
    save("sec_seen.json", seen)
    print(f"[sec] {start}~{end} 命中 {len(out)} 条（{len(watch)} 家），错误 {len(errors)}")


if __name__ == "__main__":
    # 用法一（区间）：backfill_pull.py <start YYYY-MM-DD> <end YYYY-MM-DD>
    # 用法二（回溯窗口）：backfill_pull.py --end YYYY-MM-DD --backfill-days N（默认 20）
    # 回溯批次入库时批次号为 B-YYYYMMDD（取 end 日，docs/schema.md §6）
    args = sys.argv[1:]
    if "--end" in args:
        i = args.index("--end")
        e = args[i + 1]
        n = 20
        if "--backfill-days" in args:
            n = int(args[args.index("--backfill-days") + 1])
        s = (datetime.date.fromisoformat(e) - datetime.timedelta(days=n - 1)).isoformat()
    elif len(args) == 2:
        s, e = args
    else:
        print("usage: backfill_pull.py <start YYYY-MM-DD> <end YYYY-MM-DD>\n"
              "   or: backfill_pull.py --end YYYY-MM-DD [--backfill-days N]")
        sys.exit(1)
    datetime.date.fromisoformat(s); datetime.date.fromisoformat(e)
    pull_cninfo(s, e)
    pull_hkex(s, e)
    pull_sec(s, e)
    print("[backfill] 窗口 %s ~ %s 拉取完成" % (s, e))
