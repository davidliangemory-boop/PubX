# -*- coding: utf-8 -*-
"""巨潮资讯检索 + 公告PDF下载 + 正文抽取 + 摘录页码定位。

纯标准库实现（PDF 解析优先用 pdftotext，缺失时回退 pypdf），
保证 GitHub Actions 的 ubuntu-latest 环境零额外依赖即可运行。
"""
import json, re, time, sys, os, subprocess, tempfile
import urllib.request, urllib.parse

BASE = "http://www.cninfo.com.cn/new/hisAnnouncement/query"
PDF_BASE = "http://static.cninfo.com.cn/"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Referer": "http://www.cninfo.com.cn/new/commonUrl/pageOfSearch?url=disclosure/list/search",
}

KEYWORDS = ["出海", "海外", "境外", "国际市场", "海外建厂", "海外并购",
            "境外子公司", "海外产能", "海外签约", "海外投资", "境外投资",
            "海外基地", "国际化", "全球化"]


def _post(url, data, timeout=30, retries=3):
    body = urllib.parse.urlencode(data).encode()
    last = None
    for i in range(retries):
        try:
            req = urllib.request.Request(url, data=body, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except Exception as e:  # 网络抖动重试，最后一次抛出
            last = e
            time.sleep(2 * (i + 1))
    raise last


def query(kw, sdate, edate, page=1, size=30):
    d = _post(BASE, {
        "pageNum": page, "pageSize": size, "column": "szse", "tabName": "fulltext",
        "plate": "", "stock": "", "searchkey": kw, "secid": "", "category": "",
        "trade": "", "seDate": f"{sdate}~{edate}", "sortName": "time",
        "sortType": "desc", "isHLtitle": "true",
    })
    return json.loads(d.decode("utf-8"))


def clean(t):
    return re.sub(r"</?em>", "", t or "")


def search(sdate, edate, keywords=None, max_page=5, verbose=True):
    """按关键词组检索，按 announcementId 去重，返回按时间升序的候选列表。"""
    seen = {}
    for kw in (keywords or KEYWORDS):
        page = 1
        while True:
            try:
                d = query(kw, sdate, edate, page)
            except Exception as e:
                if verbose:
                    print(f"[warn] 检索失败 {kw} 第{page}页: {e}", file=sys.stderr)
                break
            anns = d.get("announcements") or []
            for a in anns:
                aid = str(a.get("announcementId"))
                if aid not in seen:
                    seen[aid] = {
                        "announcementId": aid,
                        "time": a.get("announcementTime"),
                        "secCode": a.get("secCode"),
                        "secName": a.get("secName"),
                        "title": clean(a.get("announcementTitle")),
                        "adjunctUrl": a.get("adjunctUrl"),
                        "keywords": [kw],
                    }
                elif kw not in seen[aid]["keywords"]:
                    seen[aid]["keywords"].append(kw)
            if not d.get("hasMore") or page >= max_page:
                break
            page += 1
            time.sleep(0.5)
        time.sleep(0.4)
    return sorted(seen.values(), key=lambda x: (x["time"] or 0))


def pdf_url(item):
    u = item.get("adjunctUrl") or ""
    if u.startswith("http"):
        return u
    return PDF_BASE + u.lstrip("/")


def download_pdf(url, dest, timeout=60, retries=2):
    last = None
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=timeout) as r, open(dest, "wb") as f:
                f.write(r.read())
            return dest
        except Exception as e:
            last = e
            time.sleep(2 * (i + 1))
    raise last


def extract_pages(pdf_path):
    """返回按页分割的正文列表。优先 pdftotext -layout，回退 pypdf。"""
    try:
        out = subprocess.run(["pdftotext", "-layout", pdf_path, "-"],
                             capture_output=True, timeout=60)
        if out.returncode == 0 and out.stdout.strip():
            return out.stdout.decode("utf-8", errors="replace").split("\f")
    except FileNotFoundError:
        pass
    try:
        from pypdf import PdfReader
        return [(p.extract_text() or "") for p in PdfReader(pdf_path).pages]
    except ImportError:
        raise RuntimeError("无PDF解析工具：请安装 poppler-utils 或 pip install pypdf")


def norm(s):
    """页内归一化：去掉所有空白（含全角空格）便于逐字匹配。"""
    return re.sub(r"\s+", "", s or "")


def locate_quotes(pages, quotes):
    """在PDF页中定位逐字摘录，返回 [{'text','page'}]；找不到的丢弃（不造假页码）。"""
    npages = [norm(p) for p in pages]
    out = []
    for q in quotes:
        key = norm(q)
        if len(key) < 4:
            continue
        hit = None
        for i, p in enumerate(npages):
            if key in p:
                hit = i + 1
                break
        if hit:
            out.append({"text": q, "page": hit})
    return out


def fetch_announcement(item, workdir):
    """下载并抽取一份公告，返回 {'pages': [...], 'pdf': path}。"""
    os.makedirs(workdir, exist_ok=True)
    dest = os.path.join(workdir, f"{item['announcementId']}.pdf")
    download_pdf(pdf_url(item), dest)
    return {"pages": extract_pages(dest), "pdf": dest}


def flatten(pages, limit=None):
    text = "\n".join(pages)
    text = re.sub(r"[ \t]+", " ", text)
    if limit and len(text) > limit:
        head = text[: int(limit * 0.6)]
        tail = text[-int(limit * 0.4):]
        text = head + "\n……（中间略）……\n" + tail
    return text
