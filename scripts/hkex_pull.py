#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""HKEX 披露易观察名单拉取（公开接口，无需密钥）。
主键：股票代码（观察名单 state/watchlist_hk.json）
接口：titleSearchServlet.do（公告检索）+ prefix.do（代码→内部 stockId 解析）
去重：NEWS_ID（state/hkex_seen.json）
游标：每代码记录最新公告日期；默认回看 --days 天兜底重叠
用法：python3 hkex_pull.py [--date YYYY-MM-DD] [--backfill-days N] [--days 30] [--out PATH]
  --date           只扫该日（北京时间当日披露，fromDate=toDate=该日）
  --backfill-days  回溯重叠窗口天数（默认 20；--days 为旧别名，仍可单独使用）
"""
import json, os, sys, time, urllib.request, urllib.parse, datetime, argparse, html, re

UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      "Accept": "application/json, text/javascript, */*; q=0.01",
      "Referer": "https://www1.hkexnews.hk/search/titlesearch.xhtml?lang=zh"}
BASE = os.path.dirname(os.path.abspath(__file__))
STATE = os.path.normpath(os.path.join(BASE, "..", "state"))
SERVLET = "https://www1.hkexnews.hk/search/titleSearchServlet.do"
PREFIX = "https://www1.hkexnews.hk/search/prefix.do"


def fetch(url, retries=2):
    for i in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read().decode("utf-8", "ignore")
        except Exception:
            if i == retries:
                raise
            time.sleep(2 * (i + 1))


def resolve_id(code):
    for lang in ("EN", "ZH"):
        q = urllib.parse.urlencode({"callback": "cb", "lang": lang, "type": "A", "name": code, "market": "SEHK", "_": "1"})
        txt = fetch(PREFIX + "?" + q)
        m = re.search(r'\w+\((.*)\);?\s*$', txt, re.S)
        if not m:
            continue
        data = json.loads(m.group(1))
        for s in data.get("stockInfo", []):
            if s.get("code") == code:
                return s.get("stockId")
        if data.get("stockInfo"):
            return data["stockInfo"][0].get("stockId")
    return None


def clean(s):
    s = html.unescape(s or "")
    s = re.sub(r"<[^>]+>", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def cat_of(long_text):
    t = (long_text or "").split(" - ")[0].strip()
    return t or "公告及通告"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", default="", help="只扫该日 YYYY-MM-DD（北京时间）")
    ap.add_argument("--backfill-days", type=int, default=20, help="回溯重叠窗口天数")
    ap.add_argument("--days", type=int, default=0, help="旧别名；>0 时覆盖 --backfill-days")
    ap.add_argument("--out", default="")
    a = ap.parse_args()
    days = a.days if a.days > 0 else a.backfill_days

    watch = json.load(open(os.path.join(STATE, "watchlist_hk.json"), encoding="utf-8"))
    ids_p = os.path.join(STATE, "hkex_ids.json")
    seen_p = os.path.join(STATE, "hkex_seen.json")
    ids = json.load(open(ids_p, encoding="utf-8")) if os.path.exists(ids_p) else {}
    seen = json.load(open(seen_p, encoding="utf-8")) if os.path.exists(seen_p) else {"news": [], "cursor": {}}
    seen_ids = {str(x) for x in seen.get("news", [])}
    cursor = seen.get("cursor", {})

    today = datetime.date.today()
    if a.date:
        run_date = datetime.date.fromisoformat(a.date)
    else:
        run_date = today
    since_global = run_date - datetime.timedelta(days=0 if a.date else days)
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
        sid = ids.get(code)
        if not sid:
            continue
        if a.date:
            frm = to = run_date.strftime("%Y%m%d")  # 只扫该日北京时间 00:00–24:00
        else:
            frm = (cursor.get(code) or since_global.strftime("%Y%m%d")).replace("-", "")
            frm = min(frm, since_global.strftime("%Y%m%d"))
            to = today.strftime("%Y%m%d")
        q = {"sortDir": "0", "sortByOptions": "DateTime", "category": "0", "market": "SEHK",
             "stockId": sid, "documentType": "-1", "fromDate": frm,
             "toDate": to, "title": "", "rowRange": "100", "lang": "zh"}
        try:
            data = json.loads(fetch(SERVLET + "?" + urllib.parse.urlencode(q)))
            recs = json.loads(data.get("result") or "[]")
        except Exception as e:
            errors.append({"code": code, "error": str(e)[:200]})
            continue
        time.sleep(0.4)
        latest = cursor.get(code, "")
        for r in recs:
            nid = str(r.get("NEWS_ID") or "")
            if not nid or nid in seen_ids:
                continue
            dtc = r.get("DATE_TIME", "")  # DD/MM/YYYY HH:MM
            try:
                dt = datetime.datetime.strptime(dtc, "%d/%m/%Y %H:%M")
                day = dt.strftime("%Y-%m-%d")
            except Exception:
                day = dtc
            latest = max(latest, day)
            raw_id = "hkex_" + str(nid)
            try:
                import cninfo
                got = cninfo.fetch_announcement({"announcementId": raw_id,
                    "adjunctUrl": "https://www1.hkexnews.hk" + (r.get("FILE_LINK") or "")}, os.path.join(STATE, "tmp"))
                time.sleep(0.4)
            except Exception as exc:
                errors.append({"news_id": nid, "error": "原文失败，未消费主键: " + str(exc)[:160]})
                continue
            seen_ids.add(nid)
            out.append({
                "raw_path": "raw/" + raw_id + ".txt",
                "code": code, "name": w["name"], "news_id": nid,
                "title": clean(r.get("TITLE")), "category": cat_of(clean(r.get("LONG_TEXT"))),
                "sub": clean(r.get("LONG_TEXT")),
                "raw_category": r.get("LONG_TEXT"),
                "source_pdf_url_zh": "https://www1.hkexnews.hk" + (r.get("FILE_LINK") or ""),
                "source_pdf_url_en": None,  # 英文版本须另行核实，禁止猜测 URL
                "date": day, "time": dtc,
                "size": r.get("FILE_INFO", ""),
                "url": "https://www1.hkexnews.hk" + (r.get("FILE_LINK") or ""),
            })
        if latest:
            cursor[code] = latest

    out.sort(key=lambda x: x["date"], reverse=True)
    out_p = a.out or os.path.join(STATE, "raw_hkex_%s.json" % today.strftime("%Y%m%d"))
    newly_discovered = len(out)
    # 发现去重与完成审核分开：保留同日未入库候选，重跑不能覆盖待审原文索引。
    if os.path.exists(out_p):
        previous = json.load(open(out_p, encoding="utf-8"))
        retained = {str(x["news_id"]): x for x in previous.get("items", [])}
        retained.update({str(x["news_id"]): x for x in out})
        out = list(retained.values())
    json.dump({"pulled_at": datetime.datetime.now().isoformat(timespec="seconds"),
               "from": since_global.strftime("%Y%m%d"), "count": len(out), "new_count": newly_discovered, "retained_count": len(out)-newly_discovered, "items": out, "errors": errors},
              open(out_p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump(ids, open(ids_p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump({"news": sorted(seen_ids), "cursor": cursor}, open(seen_p, "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print("[hkex] 命中 %d 条新公告（%d 家观察），错误 %d 个 → %s" % (len(out), len(watch), len(errors), out_p))


if __name__ == "__main__":
    main()
