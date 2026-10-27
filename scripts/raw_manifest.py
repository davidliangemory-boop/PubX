# -*- coding: utf-8 -*-
"""raw/ 原文缓存（PDF/HTML/TXT）不进 git，只在 state/raw_manifest.json 留指针：
{doc_id: {file, sha256, bytes, fetched_at, url}}。原文可按 url 回源核验，sha256 校验一致性。
用法：python3 scripts/raw_manifest.py   （采集/validate 之后、推送之前运行；追加更新不删旧指针）"""
import hashlib, json, os, time
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "raw")
OUT = os.path.join(ROOT, "state", "raw_manifest.json")

def urls():
    m = {}
    try:
        for k, d in json.load(open(os.path.join(ROOT, "state", "hk_market.json"), encoding="utf-8")).get("docs", {}).items():
            if d.get("url"):
                m[str(d.get("doc_id") or k)] = d["url"]
    except Exception:
        pass
    return m

def main():
    man = json.load(open(OUT, encoding="utf-8")) if os.path.exists(OUT) else {}
    u = urls()
    if os.path.isdir(RAW):
        for fn in sorted(os.listdir(RAW)):
            p = os.path.join(RAW, fn)
            if not os.path.isfile(p):
                continue
            doc_id = fn.rsplit(".", 1)[0]
            st = os.stat(p)
            key = fn
            old = man.get(key)
            if old and old.get("bytes") == st.st_size and old.get("mtime") == int(st.st_mtime):
                continue
            h = hashlib.sha256(open(p, "rb").read()).hexdigest()
            man[key] = {"doc_id": doc_id, "sha256": h, "bytes": st.st_size, "mtime": int(st.st_mtime),
                        "fetched_at": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(st.st_mtime)),
                        "url": u.get(doc_id) or (old or {}).get("url")}
    json.dump(dict(sorted(man.items())), open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(f"raw_manifest：{len(man)} 个原文指针 → state/raw_manifest.json")

if __name__ == "__main__":
    main()
