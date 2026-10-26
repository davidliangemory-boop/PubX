# -*- coding: utf-8 -*-
"""R05 事件重抽片段校验器：子代理产出的 state/r05_fragments/E-0XX.json 逐条核验。

规则（对齐 R05 / docs/schema.md §b）：
① evidence = {doc_id, page, quote}：quote 规范化空白后必须是 raw/{doc_id}.txt
   对应页（\\f 分页）子串；页码在页数范围内；quote ≤ 60 字；
② 原文未载明 → value/text 置 null（展示【未披露】），不得推测；
③ layer=analysis 的条目必须有 basis；
④ terms 为结构化字典：completeness + fields{12 个条款字段}，
   每字段 {value|null|"unknown", evidence|None}；
⑤ sources 必备 doc_id/file/date/url，quotes 同样回原文比对；
⑥ gaps 每条须有 item/why/where。

用法：python3 scripts/r05_verify.py state/r05_fragments/E-028.json [...]
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "raw")

TERMS_FIELDS = ["payment", "conditions_precedent", "approvals", "contingent",
                "completion_adjustment", "deposit", "long_stop_date", "breach",
                "reps_warranties", "transition", "tax", "dispute_resolution"]

ALLOWED_KEYS = {"event_id", "title_fact", "importance", "holding_chain", "parties",
                "geo", "matter_type", "stage_current", "stage_chain", "scale",
                "terms", "legal_triggers", "impact", "watch_points", "gaps",
                "practice_notes", "sources", "source_diff", "changelog_add"}

_pages_cache = {}


def norm(s):
    return re.sub(r"\s+", "", s or "")


def pages_of(doc_id):
    if doc_id not in _pages_cache:
        p = os.path.join(RAW, f"{doc_id}.txt")
        if not os.path.exists(p):
            _pages_cache[doc_id] = None
        else:
            _pages_cache[doc_id] = open(p, encoding="utf-8", errors="replace").read().split("\f")
    return _pages_cache[doc_id]


class Checker:
    def __init__(self, path):
        self.path = path
        self.errors = []
        self.checks = 0

    def err(self, msg):
        self.errors.append(msg)

    def ev(self, ev, where):
        """核验一个 evidence 对象。"""
        self.checks += 1
        for k in ("doc_id", "page", "quote"):
            if k not in ev:
                self.err(f"{where}: evidence 缺 {k}")
                return
        q = ev["quote"]
        if not isinstance(q, str) or not q.strip():
            self.err(f"{where}: quote 为空")
            return
        if len(q) > 60:
            self.err(f"{where}: quote 超过 60 字（{len(q)}）「{q[:24]}…」")
        pages = pages_of(ev["doc_id"])
        if pages is None:
            self.err(f"{where}: 无原文缓存 raw/{ev['doc_id']}.txt")
            return
        pn = ev["page"]
        if not isinstance(pn, int) or not (1 <= pn <= len(pages)):
            self.err(f"{where}: 页码 {pn} 越界（原文 {len(pages)} 页）")
            return
        nq = norm(q)
        if nq in norm(pages[pn - 1]):
            return
        hits = [i + 1 for i, pg in enumerate(pages) if nq in norm(pg)]
        if hits:
            self.err(f"{where}: 标注 P{pn}，实际位于 P{hits}「{q[:24]}…」")
        else:
            self.err(f"{where}: quote 非原文子串「{q[:24]}…」")

    def walk(self, o, where):
        if isinstance(o, dict):
            ev = o.get("evidence")
            if ev is not None:
                if isinstance(ev, dict):
                    self.ev(ev, where)
                else:
                    self.err(f"{where}: evidence 应为对象或 null")
            if o.get("layer") == "analysis" and not str(o.get("basis") or "").strip():
                self.err(f"{where}: analysis 层缺 basis")
            for k, v in o.items():
                if k == "evidence":
                    continue
                self.walk(v, f"{where}.{k}")
        elif isinstance(o, list):
            for i, x in enumerate(o):
                self.walk(x, f"{where}[{i}]")


def check_fragment(path):
    c = Checker(path)
    try:
        frag = json.load(open(path, encoding="utf-8"))
    except Exception as e:
        print(f"{os.path.basename(path)}: JSON 解析失败 {e}")
        return False
    eid = frag.get("event_id")
    if not eid:
        print(f"{os.path.basename(path)}: 缺 event_id")
        return False
    extra = set(frag) - ALLOWED_KEYS
    if extra:
        c.err(f"未知顶层字段 {sorted(extra)}")
    c.walk(frag, eid)

    t = frag.get("terms")
    if t is not None:
        if not isinstance(t, dict) or not isinstance(t.get("fields"), dict):
            c.err("terms 应为 {completeness, completeness_basis, fields{...}} 结构")
        else:
            missing = [f for f in TERMS_FIELDS if f not in t["fields"]]
            if missing:
                c.err(f"terms.fields 缺字段 {missing}")
            if t.get("completeness") not in ("全文已披露", "仅摘要条款", "未披露协议条款"):
                c.err(f"terms.completeness 非法：{t.get('completeness')!r}")
            for f in TERMS_FIELDS:
                fld = t["fields"].get(f)
                if isinstance(fld, dict) and "value" not in fld:
                    c.err(f"terms.fields.{f} 缺 value（null=已核未披露，unknown=未核查）")
    for i, g in enumerate(frag.get("gaps") or []):
        for k in ("item", "why", "where"):
            if not str(g.get(k) or "").strip():
                c.err(f"gaps[{i}] 缺 {k}")
    for i, s in enumerate(frag.get("sources") or []):
        for k in ("doc_id", "file", "date", "url"):
            if not s.get(k):
                c.err(f"sources[{i}] 缺 {k}")
        for q in s.get("quotes") or []:
            c.ev({"doc_id": s["doc_id"], "page": q.get("page"), "quote": q.get("text")},
                 f"sources[{i}].quotes")
        if not str(s.get("new_info") or "").strip():
            c.err(f"sources[{i}] 缺 new_info（该来源新增信息）")
    imp = frag.get("importance") or {}
    if imp.get("level") != "A" or not imp.get("reason"):
        c.err("importance 须为 {level:A, reason, layer:analysis, basis}")

    if c.errors:
        print(f"{os.path.basename(path)}: ERROR {len(c.errors)}")
        for m in c.errors:
            print(f"  ✗ {m}")
        return False
    print(f"{os.path.basename(path)}: OK（evidence/quote 核验 {c.checks} 处）")
    return True


if __name__ == "__main__":
    paths = sys.argv[1:]
    if not paths:
        d = os.path.join(ROOT, "state", "r05_fragments")
        paths = sorted(os.path.join(d, f) for f in os.listdir(d) if f.endswith(".json")) \
            if os.path.isdir(d) else []
    if not paths:
        print("用法：python3 scripts/r05_verify.py <fragment.json> [...]")
        sys.exit(2)
    ok = all([check_fragment(p) for p in paths])
    sys.exit(0 if ok else 1)
