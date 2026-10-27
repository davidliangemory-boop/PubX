# 出海信披金样深抠 — Round notes

## Round 1 (2026-10-27, ?v=20261027d1)
Gold: research/outbound_e013.json (structure) + research/hk_01788.json (density).

**Build fix:** reviewed outbound overlays marked deep are tagged `curated=outbound`; `finalize_research` keeps deep when core source + real comparable + meaning≥2 sections + summary≥300 chars + (timeline≥2 or financials or project_maturity). Test `scripts/test_outbound_depth.py` asserts built depth == overlay depth and no banned placeholders.
Built outbound depth: before deep 14 / brief 64 (live c2; 10 overlays demoted by generic gate) → after deep 27 / brief 51 (overlay intent 27, all match).

**Thin cohort (36):** summaries 186–265 → 312–480 chars; 28/36 gained a real comparable (from other outbound overlays only); timelines expanded (e.g. E-004 →20, E-034/E-003 →9); project_maturity added to 9; operating_background on E-030/E-051/E-055. New deep: E-006, E-030, E-036, E-060. E-H-20261027-1225620428 downgraded to brief (single filing, no financials/maturity).
Remaining gaps for R2: key_metrics still 0 on 15 events (filings without numeric terms: terminations, H-share filings); operating_background mostly absent; next-thinnest cohort (score ≥8.9) not touched.
Event ids: see /tmp/r1_after.txt list in commit message.

## Round 2 (2026-10-27, ?v=20261027d4)
Cohort: the 41 overlays not touched in R1 (next-thinnest audit tail + previously deep ones still under gold density); gold E-013 untouched.
- Summaries: all 41 now 338–541 chars (R1-untouched briefs were 207–265).
- operating_background added from raw filings: now present on 36/41 (was ~25).
- project_maturity added where overseas mine/plant/asset applies (e.g. E-027, E-031, E-056, E-058, E-H-…620428, E-057, E-037).
- New real outbound comparables (other overlays only): E-012, E-050, E-020-cohort retained; E-016 now 2. No comps forced on E-017/E-024/E-001/E-056/E-058/E-D-…625852 (no true peer).
- Depth after overlay review: 28 deep / 13 brief in cohort. Newly deep: E-012, E-050, E-031, E-057, E-022, E-020, E-010, E-H-…620428. Downgraded to brief (single dated filing): E-009, E-015, E-H-…619598.
- Metrics left empty/short only where filings carry no numeric terms; no industry numbers invented. HK/US untouched; routines not resumed.

## Round 3 (2026-10-27, ?v=20261027d5)
Re-audit of all 77 outbound overlays vs gold (E-013 untouched). Overlay depth: before deep 33 / brief 45 → after deep 36 / brief 42 (built depth == overlay, test_outbound_depth).
- All 77: meaning F/S/I rewritten to tie to disclosed numbers; watch_items rewritten as "variable → what changes the view".
- Newly deep: E-004 (+comparable, +metric), E-D-20261024-1225619052, E-D-20261024-1225620956. E-009 / E-015 / E-H-…619598 re-checked, still brief (only one dated deal step; E-009 counterpart financial base date not counted).
- key_metrics added from raw: E-001, E-006, E-009, E-010, E-012(4→6), E-020, E-022, E-024(4→6), E-031(3→6), E-038, E-046, E-050(4→6), E-051, E-H-…617216, E-H-…620428. Duplicates merged: E-035 (two investment rows → one), E-037 (cash/registered capital merged). E-014/E-016: raw carries no further numeric terms; non-numeric rows not restored.
- Comparables added/sharpened: E-004, E-020, E-023, E-038, E-046 (now 2), E-D-hkex_12382424, E-H-…617671, E-H-…621125, E-034, E-041, E-042, E-043, E-053, E-059 and lessons sharpened on most deep files.
- industry_context added only where raw has figures, every item with sample/date/basis (e.g. E-001, E-005, E-008, E-012, E-018, E-025, E-026, E-030, E-049, E-050, E-057).
- project_maturity added: E-006, E-016, E-027, E-028, E-031, E-036. Summaries paragraph 2 rewritten for 进展/为何重要 on ~55 files.
Remaining gaps (R4): key_metrics still 0 on ~14 (E-002/003/007/029/034/041/042/043/054, several E-D/E-H filings — no numeric terms in raw); no outbound peer for E-017/024/032/040/044/045/051/052/055/056/058; industry data absent on most; E-035/E-037 now 1–2 metrics.
