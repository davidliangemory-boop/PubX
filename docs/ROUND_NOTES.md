# 出海信披金样深抠 — Round notes

## Round 1 (2026-10-27, ?v=20261027d1)
Gold: research/outbound_e013.json (structure) + research/hk_01788.json (density).

**Build fix:** reviewed outbound overlays marked deep are tagged `curated=outbound`; `finalize_research` keeps deep when core source + real comparable + meaning≥2 sections + summary≥300 chars + (timeline≥2 or financials or project_maturity). Test `scripts/test_outbound_depth.py` asserts built depth == overlay depth and no banned placeholders.
Built outbound depth: before deep 14 / brief 64 (live c2; 10 overlays demoted by generic gate) → after deep 27 / brief 51 (overlay intent 27, all match).

**Thin cohort (36):** summaries 186–265 → 312–480 chars; 28/36 gained a real comparable (from other outbound overlays only); timelines expanded (e.g. E-004 →20, E-034/E-003 →9); project_maturity added to 9; operating_background on E-030/E-051/E-055. New deep: E-006, E-030, E-036, E-060. E-H-20261027-1225620428 downgraded to brief (single filing, no financials/maturity).
Remaining gaps for R2: key_metrics still 0 on 15 events (filings without numeric terms: terminations, H-share filings); operating_background mostly absent; next-thinnest cohort (score ≥8.9) not touched.
Event ids: see /tmp/r1_after.txt list in commit message.

## Round 2 (2026-10-27, ?v=20261027d3)
Cohort: the 41 overlays not touched in R1 (next-thinnest audit tail + previously deep ones still under gold density); gold E-013 untouched.
- Summaries: all 41 now 338–541 chars (R1-untouched briefs were 207–265).
- operating_background added from raw filings: now present on 36/41 (was ~25).
- project_maturity added where overseas mine/plant/asset applies (e.g. E-027, E-031, E-056, E-058, E-H-…620428, E-057, E-037).
- New real outbound comparables (other overlays only): E-012, E-050, E-020-cohort retained; E-016 now 2. No comps forced on E-017/E-024/E-001/E-056/E-058/E-D-…625852 (no true peer).
- Depth after overlay review: 28 deep / 13 brief in cohort. Newly deep: E-012, E-050, E-031, E-057, E-022, E-020, E-010, E-H-…620428. Downgraded to brief (single dated filing): E-009, E-015, E-H-…619598.
- Metrics left empty/short only where filings carry no numeric terms; no industry numbers invented. HK/US untouched; routines not resumed.
