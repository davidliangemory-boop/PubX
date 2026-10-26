#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""SEC EDGAR 中概股观察名单拉取（公开 API，无需密钥）。
主键：CIK（观察名单 state/watchlist_us.json）
接口：https://data.sec.gov/submissions/CIK##########.json
去重：accessionNumber（state/sec_seen.json）
游标：每公司记录最新 filed 日期；默认回看 --days 天兜底重叠
用法：python3 sec_pull.py --days 45 --out ../state/raw_sec_YYYYMMDD.json
"""
import json, os, sys, time, urllib.request, datetime, argparse
from zoneinfo import ZoneInfo

UA = {"User-Agent": "PubX Disclosure Monitor (research; contact: admin@pubx.local)"}
FORMS = {"6-K", "20-F", "10-K", "10-Q", "8-K", "F-1", "F-1/A", "F-3", "F-3/A",
         "424B4", "424B5", "S-8", "SC 13G", "SC 13G/A", "SC 13D", "SC 13D/A", "6-K/A"}
BASE = os.path.dirname(os.path.abspath(__file__))
STATE = os.path.normpath(os.path.join(BASE, "..", "state"))


def fetch(url, retries=2):
    for i in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read().decode("utf-8", "ignore")
        except Exception as e:
            if i == retries:
                raise
            time.sleep(2 * (i + 1))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", default="", help="只扫该日 YYYY-MM-DD（按 acceptance 换算北京时间过滤）")
    ap.add_argument("--backfill-days", type=int, default=20, help="回溯重叠窗口天数")
    ap.add_argument("--days", type=int, default=0, help="旧别名；>0 时覆盖 --backfill-days")
    ap.add_argument("--out", default="")
    a = ap.parse_args()
    days = a.days if a.days > 0 else a.backfill_days
    run_date = datetime.date.fromisoformat(a.date) if a.date else datetime.date.today()

    watch = json.load(open(os.path.join(STATE, "watchlist_us.json"), encoding="utf-8"))
    seen_p = os.path.join(STATE, "sec_seen.json")
    seen = json.load(open(seen_p, encoding="utf-8")) if os.path.exists(seen_p) else {"acc": [], "cursor": {}}
    seen_acc = set(seen.get("acc", []))
    cursor = seen.get("cursor", {})

    since_global = run_date.isoformat() if a.date else (run_date - datetime.timedelta(days=days)).isoformat()
    out, errors = [], []
    for w in watch:
        cik = str(w["cik"]).zfill(10)
        url = "https://data.sec.gov/submissions/CIK%s.json" % cik
        try:
            data = json.loads(fetch(url))
        except Exception as e:
            errors.append({"ticker": w["ticker"], "error": str(e)[:200]})
            continue
        time.sleep(0.25)
        rec = data.get("filings", {}).get("recent", {})
        since = min(cursor.get(w["ticker"], "9999"), since_global)
        for i, form in enumerate(rec.get("form", [])):
            filed = rec["filingDate"][i]
            acc = rec["accessionNumber"][i]
            if form not in FORMS or acc in seen_acc or (a.date and filed < (run_date - datetime.timedelta(days=1)).isoformat()) or (not a.date and filed < since):
                continue
            acceptance = (rec.get("acceptanceDateTime") or [None] * len(rec.get("form", [])))[i]
            accepted_cn = None
            if acceptance:
                accepted_cn = datetime.datetime.fromisoformat(acceptance.replace("Z", "+00:00"))
                if accepted_cn.tzinfo is None: accepted_cn = accepted_cn.replace(tzinfo=ZoneInfo("America/New_York"))
                accepted_cn = accepted_cn.astimezone(datetime.timezone(datetime.timedelta(hours=8)))
            if a.date and (accepted_cn is None or accepted_cn.date() != run_date):
                continue
            doc = rec["primaryDocument"][i]
            acc_nodash = acc.replace("-", "")
            raw_id = "sec_" + acc_nodash
            raw_path = os.path.join(os.path.dirname(STATE), "raw", raw_id + ".txt")
            exhibit_names = []
            try:
                from sec_market_pull import parse_primary
                import hashlib
                content = fetch("https://www.sec.gov/Archives/edgar/data/%d/%s.txt" % (int(w["cik"]), acc))
                time.sleep(0.35)
                primary_text, exhibit_text = parse_primary(content, form)
                exhibit_names = __import__("re").findall(r"<TYPE>EX-99\.1[^<]*<SEQUENCE>[^<]*<FILENAME>([^\r\n<]+)", content, __import__("re").I)
                body = primary_text + ("\f" + exhibit_text if exhibit_text else "")
                if not body.strip(): raise ValueError("未提取到正文")
                os.makedirs(os.path.dirname(raw_path), exist_ok=True)
                with open(raw_path, "w", encoding="utf-8") as f: f.write(body)
                raw_sha = hashlib.sha256(body.encode("utf-8")).hexdigest()
            except Exception as exc:
                errors.append({"accession": acc, "error": "原文读取失败，未消费主键: " + str(exc)[:160]})
                continue
            out.append({
                "raw_path": "raw/" + raw_id + ".txt", "sha256": raw_sha,
                "exhibit_filenames": exhibit_names,
                "ticker": w["ticker"], "cik": str(w["cik"]), "name": w["name"],
                "form": form, "filed": filed, "accepted_at_cn": accepted_cn.isoformat() if accepted_cn else None, "accession": acc,
                "items": rec.get("items", [""])[i] if rec.get("items") else "",
                "desc": rec.get("primaryDocDescription", [""])[i] if rec.get("primaryDocDescription") else "",
                "url": "https://www.sec.gov/Archives/edgar/data/%d/%s/%s" % (int(w["cik"]), acc_nodash, doc),
                "index": "https://www.sec.gov/Archives/edgar/data/%d/%s/" % (int(w["cik"]), acc_nodash),
            })
            seen_acc.add(acc)
        # 游标：记录本次见到的最新 filed 日期
        if rec.get("filingDate"):
            cursor[w["ticker"]] = max(cursor.get(w["ticker"], ""), max(rec["filingDate"]))

    today = datetime.date.today().strftime("%Y%m%d")
    out_p = a.out or os.path.join(STATE, "raw_sec_%s.json" % today)
    json.dump({"pulled_at": datetime.datetime.now().isoformat(timespec="seconds"),
               "since": since_global, "count": len(out), "items": out, "errors": errors},
              open(out_p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump({"acc": sorted(seen_acc), "cursor": cursor}, open(seen_p, "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print("[sec] 命中 %d 条新披露（窗口 %s 起），错误 %d 个 → %s" % (len(out), since_global, len(errors), out_p))


if __name__ == "__main__":
    main()
