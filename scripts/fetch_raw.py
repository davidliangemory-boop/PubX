# -*- coding: utf-8 -*-
"""抓取已收录披露的原文并落盘 raw/{doc_id}.txt（页间 \f 分隔），供 validate.py
引文回原文比对（quote 必须是原文对应页子串、页码在页数范围内）。

纪律：带 User-Agent、限速（请求间隔 ≥1.2s）；PDF 校验 %PDF 魔数；
失败的如实记入 raw/index.json，不阻断。只抓取 events.json 中带有引文的来源文件。

用法：python3 scripts/fetch_raw.py [--limit N] [--force]
"""
import hashlib
import html
import json
import os
import re
import subprocess
import sys
import time
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAWDIR = os.path.join(ROOT, "raw")
UA = "PubX-research/1.0 (public-disclosure archive; contact via GitHub Pages repo)"
SLEEP = 1.2


def fetch(url):
    # 巨潮静态服务器经代理访问 http 会挂起，统一升 https（与 build_data.https_link 一致）
    if url.startswith("http://static.cninfo.com.cn"):
        url = "https://" + url[len("http://"):]
    headers = {"User-Agent": UA}
    # 披露易部分文件无 Referer 时返回 200 但为「网页已移除」HTML 页（实测），需带检索页 Referer
    if "hkexnews.hk" in url:
        headers["Referer"] = "https://www1.hkexnews.hk/search/titlesearch.xhtml?lang=zh"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.read(), r.headers.get("Content-Type", "")


def pdf_to_text(pdf_path, txt_path):
    r = subprocess.run(["pdftotext", "-enc", "UTF-8", pdf_path, txt_path],
                       capture_output=True, text=True, timeout=120)
    return r.returncode == 0


def html_to_text(raw_bytes):
    txt = raw_bytes.decode("utf-8", errors="replace")
    txt = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", txt)
    txt = re.sub(r"(?s)<[^>]+>", " ", txt)
    txt = html.unescape(txt)
    return re.sub(r"[ \t]+", " ", txt)


def main():
    limit = None
    force = "--force" in sys.argv
    if "--limit" in sys.argv:
        limit = int(sys.argv[sys.argv.index("--limit") + 1])
    os.makedirs(RAWDIR, exist_ok=True)
    ev = json.load(open(os.path.join(ROOT, "state", "events.json"), encoding="utf-8"))
    docs = {}
    for e in ev.get("events", []):
        for s in e.get("sources", []):
            if s.get("quotes") and s.get("url", "").startswith("http"):
                docs[s["doc_id"]] = s["url"]
    idx_path = os.path.join(RAWDIR, "index.json")
    try:
        index = json.load(open(idx_path, encoding="utf-8"))
    except Exception:
        index = {}
    n_ok = n_fail = n_skip = 0
    items = sorted(docs.items())
    if limit:
        items = items[:limit]
    for doc_id, url in items:
        txt_path = os.path.join(RAWDIR, f"{doc_id}.txt")
        if not force and os.path.exists(txt_path) and index.get(doc_id, {}).get("ok"):
            n_skip += 1
            continue
        ent = {"url": url, "fetched_at": time.strftime("%Y-%m-%d %H:%M:%S"), "ok": False}
        try:
            blob, ctype = fetch(url)
            ent["bytes"] = len(blob)
            if blob[:4] == b"%PDF":
                pdf_path = os.path.join(RAWDIR, f"{doc_id}.pdf")
                with open(pdf_path, "wb") as f:
                    f.write(blob)
                if not pdf_to_text(pdf_path, txt_path):
                    raise RuntimeError("pdftotext 失败")
                os.remove(pdf_path)
            elif ".pdf" in url.lower():
                raise RuntimeError("URL 指向 PDF 但返回非 PDF 内容（死链或拦截页）")
            else:
                with open(txt_path, "w", encoding="utf-8") as f:
                    f.write(html_to_text(blob))
            raw = open(txt_path, encoding="utf-8", errors="replace").read()
            ent["ok"] = len(raw.strip()) > 50
            ent["pages"] = raw.count("\f") + 1
            ent["sha256"] = hashlib.sha256(raw.encode("utf-8")).hexdigest()
            if not ent["ok"]:
                ent["error"] = "提取文本为空（可能为扫描件）"
        except Exception as ex:
            ent["error"] = str(ex)[:160]
        index[doc_id] = ent
        if ent["ok"]:
            n_ok += 1
        else:
            n_fail += 1
            print(f"[fail] {doc_id}: {ent.get('error')}")
        time.sleep(SLEEP)
    with open(idx_path, "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=1)
    print(f"fetch_raw：成功 {n_ok} / 失败 {n_fail} / 已有跳过 {n_skip}（共 {len(docs)} 份带引文来源）→ raw/index.json")


if __name__ == "__main__":
    main()
