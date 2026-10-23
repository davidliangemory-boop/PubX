# -*- coding: utf-8 -*-
"""PubX 观察名单比对（R09 并入 #/export 子视图）：
下载 OFAC SDN 名单（记录下载时间、条目数、sha256、名单发布日期），
对观察名单主体（watchlist_hk/us）与事件 parties 做名称归一 + 别名匹配。

三态纪律：no_hit / name_match_only（仅名称相似，展示匹配依据并标“需人工核验”）/
confirmed（名称 + 至少一项独立标识一致：地址/证件号/国籍等）。本脚本数据侧不持有
主体地址与证件信息，confirmed 只能由人工核验后置位——脚本自身绝不输出 confirmed。

用法：python3 scripts/sdn_screen.py
结果写入 state/export.json 的 watch 节，并重新生成 assets/export_data.js。
"""
import csv
import datetime
import hashlib
import io
import json
import os
import re
import sys
import time
import unicodedata
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXPORT_PATH = os.path.join(ROOT, "state", "export.json")
UA = "PubX-Research/1.0 (public-info research; https://davidliangemory-boop.github.io/PubX/)"

SDN_MAIN = "https://www.treasury.gov/ofac/downloads/sdn.csv"
SDN_ALT = "https://www.treasury.gov/ofac/downloads/alt.csv"
SDN_ADD = "https://www.treasury.gov/ofac/downloads/add.csv"

LEGAL_TOKENS = {
    "co", "ltd", "limited", "inc", "incorporated", "corp", "corporation", "company",
    "llc", "llp", "gmbh", "sa", "ag", "plc", "sas", "bv", "pte", "pty", "pjsc", "oao",
    "group", "holdings", "holding", "international", "intl",
    "有限公司", "股份有限公司", "有限责任公司", "集团", "控股集团", "株式会社",
}


def now_cn():
    return datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))).strftime("%Y-%m-%d %H:%M")


def http_get(url):
    last = None
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=180) as r:
                return r.read(), r.geturl(), r.headers
        except Exception as e:
            last = e
            print("  [SDN] 第 %d 次下载失败: %s" % (attempt + 1, e))
            time.sleep(4 * (attempt + 1))
    raise last


def normalize(name):
    """大小写/标点/法律后缀归一；CJK 保留原字。"""
    if not name:
        return ""
    s = unicodedata.normalize("NFKD", name).lower()
    s = re.sub(r"[（(].*?[)）]", " ", s)  # 去括号注记（保留主名）
    s = re.sub(r"[^0-9a-z一-鿿 ]+", " ", s)
    toks = [t for t in s.split() if t and t not in LEGAL_TOKENS]
    # 中文整名去后缀后拼接比对（不拆字）
    joined = "".join(toks)
    for suf in LEGAL_TOKENS:
        if joined.endswith(suf):
            joined = joined[: -len(suf)]
    return " ".join(toks) if any(re.match(r"[a-z0-9]", t) for t in toks) else joined


def load_sdn():
    """下载 SDN 主表/别名表/地址表，返回 entries 与元信息。"""
    raw, final_url, headers = http_get(SDN_MAIN)
    sha = hashlib.sha256(raw).hexdigest()
    m = re.search(r"/(\d{4}-\d{2}-\d{2})/", final_url or "")
    list_version = m.group(1) if m else (headers.get("Last-Modified") or "未知")
    entries = {}
    rdr = csv.reader(io.StringIO(raw.decode("utf-8", errors="replace")))
    for row in rdr:
        if len(row) < 4:
            continue
        num, name, etype, program = row[0].strip(), row[1].strip(), row[2].strip(), row[3].strip()
        entries[num] = {"num": num, "name": name, "type": etype if etype != "-0-" else "",
                        "program": program if program != "-0-" else "", "aliases": [], "addresses": []}
    time.sleep(1.2)
    try:
        raw_alt, _, _ = http_get(SDN_ALT)
        for row in csv.reader(io.StringIO(raw_alt.decode("utf-8", errors="replace"))):
            if len(row) >= 4 and row[0].strip() in entries:
                entries[row[0].strip()]["aliases"].append(row[3].strip())
    except Exception as e:
        print("  [SDN] 别名表下载失败: %s" % e)
    time.sleep(1.2)
    try:
        raw_add, _, _ = http_get(SDN_ADD)
        for row in csv.reader(io.StringIO(raw_add.decode("utf-8", errors="replace"))):
            if len(row) >= 6 and row[0].strip() in entries:
                addr = ", ".join(x.strip() for x in row[2:6] if x.strip() and x.strip() != "-0-")
                if addr:
                    entries[row[0].strip()]["addresses"].append(addr)
    except Exception as e:
        print("  [SDN] 地址表下载失败: %s" % e)
    return entries, {"sha256": sha, "list_version": list_version, "entry_count": len(entries)}


def collect_subjects():
    """观察名单（港股/美股）+ 事件 parties，去重。"""
    subjects = []
    seen = set()

    def add(name, src):
        if not name:
            return
        key = name.strip()
        if not key or key in seen:
            return
        seen.add(key)
        subjects.append({"name": key, "source": src})

    for fn, src in (("watchlist_hk.json", "观察名单·港股"), ("watchlist_us.json", "观察名单·美股")):
        p = os.path.join(ROOT, "state", fn)
        if os.path.exists(p):
            for r in json.load(open(p, encoding="utf-8")):
                add(r.get("name"), src)
    evp = os.path.join(ROOT, "state", "events.json")
    if os.path.exists(evp):
        for e in json.load(open(evp, encoding="utf-8")).get("events", []):
            for pt in e.get("parties") or []:
                add(pt.get("name"), "事件主体·" + e.get("event_id", ""))
    return subjects


def screen(subjects, entries):
    """名称归一精确匹配（含别名）。只输出 no_hit / name_match_only。"""
    index = {}  # normalized -> [entry nums]
    for num, e in entries.items():
        keys = {normalize(e["name"])}
        for a in e["aliases"]:
            keys.add(normalize(a))
        for k in keys:
            if len(k) >= 4:
                index.setdefault(k, []).append(num)
    results = {"no_hit": 0, "name_match_only": 0, "confirmed": 0}
    matches = []
    for s in subjects:
        nm = normalize(s["name"])
        nums = index.get(nm, []) if len(nm) >= 4 else []
        if not nums:
            results["no_hit"] += 1
            continue
        results["name_match_only"] += 1
        for num in nums[:3]:
            e = entries[num]
            matches.append({
                "subject": s["name"], "subject_source": s["source"],
                "result": "name_match_only",
                "sdn_entry": {"num": num, "name": e["name"], "aliases": e["aliases"][:6],
                              "program": e["program"], "type": e["type"],
                              "addresses": e["addresses"][:4]},
                "match_basis": [
                    {"field": "名称/别名", "sdn": e["name"], "ours": s["name"], "verdict": "一致（归一后）"},
                    {"field": "地址", "sdn": "；".join(e["addresses"][:2]) or "名单未载",
                     "ours": "未核查", "verdict": "未知"},
                    {"field": "国别/注册地", "sdn": e["program"] or "名单未载", "ours": "未核查", "verdict": "未知"},
                    {"field": "标识号/证件", "sdn": "sdn.csv 主表无证件字段", "ours": "未核查", "verdict": "未知"},
                ],
                "note": "同名≠命中：仅名称相似，无地址/证件/国别等独立标识佐证，需人工核验。",
            })
    return results, matches


def main():
    state = {}
    if os.path.exists(EXPORT_PATH):
        state = json.load(open(EXPORT_PATH, encoding="utf-8"))
    else:
        state = {"meta": {}, "batches": [], "items": [], "uflpa_snapshot": None}
    print("下载 OFAC SDN 名单…")
    entries, meta = load_sdn()
    subjects = collect_subjects()
    results, matches = screen(subjects, entries)
    state["watch"] = {
        "list": "OFAC SDN", "list_version": meta["list_version"],
        "retrieved_at": now_cn(), "sha256": meta["sha256"],
        "entry_count": meta["entry_count"], "subject_count": len(subjects),
        "results": results, "matches": matches,
        "subjects": subjects,
        "method": "名称归一（大小写/标点/法律后缀/括号注记）+ 别名表精确匹配；confirmed 需名称+独立标识（地址/证件/国别）一致，脚本数据侧无独立标识，confirmed 只能由人工核验置位。",
    }
    with open(EXPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=1)
    print("SDN %s · 条目 %d · sha %s… · 受检主体 %d → no_hit %d / name_match_only %d / confirmed %d" % (
        meta["list_version"], meta["entry_count"], meta["sha256"][:12],
        len(subjects), results["no_hit"], results["name_match_only"], results["confirmed"]))
    # 重新生成前端数据
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import export_pull
    export_pull.emit_js(state)


if __name__ == "__main__":
    sys.exit(main())
