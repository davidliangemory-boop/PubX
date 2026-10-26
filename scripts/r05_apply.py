# -*- coding: utf-8 -*-
"""R05：把校验通过的 state/r05_fragments/E-0XX.json 片段合并进 state/events.json。

只合并 r05_verify.py 允许的顶层键；每个事件追加一条 changelog（type=修正）。
合并前自动调用 r05_verify 全量复核，任一片段不过则中止不写盘。

用法：python3 scripts/r05_apply.py
"""
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRAGDIR = os.path.join(ROOT, "state", "r05_fragments")
EV_PATH = os.path.join(ROOT, "state", "events.json")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from r05_verify import ALLOWED_KEYS  # noqa: E402

TODAY = "2026-10-26"


def main():
    frags = sorted(f for f in os.listdir(FRAGDIR) if f.endswith(".json"))
    if not frags:
        print("无片段"); return 1
    r = subprocess.run([sys.executable, os.path.join(ROOT, "scripts", "r05_verify.py")]
                       + [os.path.join(FRAGDIR, f) for f in frags])
    if r.returncode != 0:
        print("片段校验未过，中止合并")
        return 1
    evj = json.load(open(EV_PATH, encoding="utf-8"))
    byid = {e["event_id"]: e for e in evj["events"]}
    applied = []
    for fn in frags:
        frag = json.load(open(os.path.join(FRAGDIR, fn), encoding="utf-8"))
        e = byid.get(frag["event_id"])
        if e is None:
            print(f"[skip] {fn}: 事件不存在"); continue
        add = frag.pop("changelog_add", None)
        for k, v in frag.items():
            if k in ("event_id",) or k not in ALLOWED_KEYS:
                continue
            e[k] = v
        note = (add or {}).get("note") or ("R05 重抽：extract_facts 自原文重抽主体/地点/事项/阶段/规模/条款，"
                                          "evidence 逐条回原文比对；交易条款结构化 12 字段；补影响与信息缺口三段式")
        entry = {"date": (add or {}).get("date") or TODAY, "type": (add or {}).get("type") or "修正",
                 "doc_id": (add or {}).get("doc_id") or (e.get("sources") or [{}])[0].get("doc_id", ""),
                 "note": note}
        cl = e.setdefault("changelog", [])
        if not any(c.get("date") == entry["date"] and c.get("note") == entry["note"]
                   and c.get("doc_id") == entry["doc_id"] for c in cl):
            cl.append(entry)
        e["update_type_latest"] = "修正"
        applied.append(frag["event_id"])
    with open(EV_PATH, "w", encoding="utf-8") as f:
        json.dump(evj, f, ensure_ascii=False, indent=1)
    print(f"已合并 {len(applied)} 个事件：{', '.join(applied)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
