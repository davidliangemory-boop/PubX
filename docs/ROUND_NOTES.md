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

## Round 4 (2026-10-27, ?v=20261027d6) — final push on remaining gaps
- Real outbound peers added (only from other outbound overlays, numbers from their own filings): E-055 (vs E-014, E-009 — overseas operating contracts at 2.33% vs 6.16%/1.53% of revenue), E-044 (vs E-027 — own-product overseas registration), E-045 ↔ E-032 (cross-border acquisition of listed-target stakes; ODI filing vs completed transfer).
- Still no true peer in outbound set or raw: E-017, E-024, E-040, E-051, E-052, E-056, E-058 — left empty.
- Single-node timelines: raw/ grep by issuer found no later filings for E-054, E-009, E-014, E-015, E-016, E-027, E-033, E-045, E-D-…hkex_12382424, E-D-…626427, E-D-…627271, E-H-…586743, E-H-…619598 — left as brief.
- E-035 (one row: ≤€105m ≈ RMB 862m cap, phased cash) and E-037 (US$30m cash = registered capital, not additive; 100% via HK sub) re-checked against filings 1225597383 / 1225597906: correct, unchanged.
- key_metrics left empty on ~14 filings with no numeric terms; no industry_context added (no cited external source on disk). Depth unchanged: deep 36 / brief 42.

## ROLLUP — 出海信披金样深抠 R1→R4
| Round | Live | Depth (deep/brief) | Gained |
|---|---|---|---|
| Base | c2 | 14/64 (built: 1 deep, tags lost) | — |
| R1 | d1 | 27/51 | Depth tags preserved in build; 36 thin events: summaries 186–265 → 312–480 chars, 28 real comps, timelines extended, project_maturity ×9 |
| R2 | d4 | 33/45 | The other 41: summaries 338–541 chars, operating_background 36/41, maturity on mine/plant assets, new comps; 8 new deep |
| R3 | d5 | 36/42 | All 77: F/S/I meaning tied to disclosed numbers, watch items as "variable → view change"; key_metrics from raw on 15; duplicate metrics merged; comps on ~14; industry_context only where raw has sample/date/basis (~11) |
| R4 | d6 | 36/42 | 4 more real peer comps (E-055, E-044, E-045, E-032); E-035/E-037 verified; confirmed no further raw for single-node timelines |

Hard limits: to go further we need new source material (later filings, counterparty/host-regulator docs, industry reports). Without it, more gold-standard density would mean making things up.

## Round 5 (2026-10-28, ?v=20261028g1) — pubx-5 loop: industry context for H-share cluster
- Outbound P0 gaps re-checked: all 77 non-gold summaries ≥150字; remaining key_metrics/comparables gaps are filings without numeric terms or true peers (see R4) — unchanged, not padded.
- P1 industry_context added to 25 H-share issuance/listing/termination/placing events (E-054/059/048/053, E-H-617671, E-002/041, E-D-627271, E-033, E-H-621125, E-042/043/003/034, E-D-621945, E-010/018/019/025/026, E-D-619286, E-D-622034, E-029, E-020/047), from verified external sources added to research_sources (label 外部信息, so depth is not auto-upgraded):
  HKEX IPO application report Sep 2026 (933 handled / 590 processing / 146 lapsed-rejected-returned-withdrawn, 157 A-share fast track, 6→12 month validity extension), HKEX Monthly Market Highlights Sep 2026 (118 new listings, IPO HK$388.03bn +106%, total funds HK$723.96bn), KPMG 2026 Q3 review (38 A+H, ~70% of IPO funds). Each item states sample/date/basis; stage-specific readings (筹划/递表备案/聆讯/挂牌/终止/配售).
- Depth unchanged deep 36 / brief 42. E-013 and HK/US gold untouched.

## Round 6 (2026-10-29, ?v=20261029g1) — pubx-5 loop: real peers for the no-comparable outbound set
- P0 comparables gap: 11 of the 12 outbound events with empty 类案 now have one real outbound peer (numbers only from each side's own filing; each row states what the difference means for this case):
  E-056↔E-038 (overseas project vehicle funding: shareholder loan vs preferred shares), E-058↔E-050 (connected deal with controller side: one-off stake sale vs purchase cap), E-D-…625852↔E-D-…617035 (H-share purchase: secondary market vs new-share subscription), E-H-…586743↔E-024 (intra-group cash pool vs guarantee), E-H-…617216↔E-H-…617420 (controlling host-country entity: new JV vs 51% old shares), E-001↔E-051 (US-filed results: group actual vs subsidiary PRC-GAAP forecast), E-007↔E-H-…620428 (overseas control buy: terminated MOU vs completed 70%), E-040↔E-004 (cancellation of overseas-listed securities: buyback vs CB conversion), E-052↔E-009 (Thailand customer award: nomination vs signed contract).
- E-017 (US tariff refund) still has no true peer — left empty.
- Depth via standard rule (core filing + chain + comparable + operating background + ≥2 meaning dims): E-001, E-024, E-051, E-056, E-058 brief→deep. Outbound now deep 41 / brief 37. E-013 and HK/US gold untouched.

## Round 7 (2026-10-30, ?v=20261030g1) — pubx-5 loop: real key_metrics for the 14 no-number outbound events
- P0 key_metrics gap: all 14 outbound events with empty 核心数字 now carry ≤6 numbers taken from the companies' own filings (cninfo board resolutions / MOU / 2025 annual, 2026 H1 & Q3 reports; HKEX for Meituan). Each number is linked to its source in research_sources (公告事实/核心文件 for plan resolutions; 财务数据/企业资料 for periodic reports) and the boundary line states the basis (consolidated, RMB, YTD cumulative and YoY; overseas revenue = annual-report geographic split; H-share cap ≠ final issue size).
  E-054 嘉立创, E-D-…619286 中坚科技, E-D-…622034 蓝色光标, E-H-…617671 科大智能, E-H-…621125 晶晨股份, E-002 翱捷科技, E-003 军信股份, E-007 酷特智能, E-029 博瑞医药, E-034 天赐材料, E-041 汉威科技, E-042 新宙邦, E-043 绿联科技, E-D-hkex_12382424 美团.
- New progress picked up while sourcing: 军信 announced on 2026-09-22 it postponed the H-share issue after the hearing (title/stage/summary/timeline/watch items rewritten); 美团 signed the purchase agreement for RMB 8.0bn senior notes (4.5bn 2.50% due 2031 + 3.5bn 3.10% due 2036, at par; HKEX 2026-10-28) — title/stage/timeline/metrics rewritten.
- Event chains completed from cninfo announcement lists (筹划/递表/重新递表/证监会接收/备案) for 新宙邦, 绿联, 晶晨, 翱捷, 汉威, 科大智能, 博瑞, 蓝色光标.
- Depth via standard rule (core filing + chain ≥2 + comparable + financial data + ≥2 meaning dims): 13 events brief→deep (all above except E-054, which has a single node and no approved plan yet). Outbound now deep 54 / brief 24. E-013 and HK/US gold untouched.
- Remaining: E-017 still no peer; 翱捷 Q3 report not yet out (H1 used); H-share final issue sizes await prospectuses; HK/US not touched.

## Round 8 (2026-11-03, ?v=20261103g1) — pubx-5 loop: official outbound-investment context for non-H-share events
- P1 industry_context added to 18 non-H-share outbound events (overseas plants, subsidiaries, M&A, project funding, contracting) from MOFCOM/SAFE 2026 Jan–Sep statistics (published 2026-10-23): total ODI RMB 881.48bn −4.6%; non-financial ODI RMB 692.01bn −12.8% (9,071 enterprises, 148 economies); BRI non-financial RMB 184.29bn −14.3%; overseas contracting turnover RMB 894.79bn +2.1%, new contracts RMB 1,406.96bn +1.8%. Each item states sample/date/basis; the BRI item is only used for BRI countries (Korea, Italy, UK, HK, Singapore-trading cases use the national item only); share-of-total figures are labelled as site-computed order-of-magnitude references.
  E-055, E-056, E-060, E-005, E-008, E-011, E-016, E-021, E-023, E-035, E-036, E-037, E-039, E-045, E-H-…617216, E-H-…617420, E-H-…619598, E-H-…620428.
- E-055 comparables wording cleaned (no 未披露 token on page).
- Sources added to research_sources as 外部信息, so depth unchanged: deep 54 / brief 24. E-013 and HK/US gold untouched. E-028 (Yancoal-funded offshore) deliberately not mapped to China ODI stats.

## Round 9 (2026-11-04, ?v=20261104g1) — pubx-5 loop: sector context for results/notes/FX/pharma/auto outbound events; E-017 peer
- P1 industry_context added to 29 of the 32 outbound events still lacking it, each item with sample/date/basis and a labelled external source (外部信息):
  - Autos (CAAM Jan–Sep 2026: NEV sales 12.472m +11.1%, exports 4.006m ×2.3, domestic 8.466m −10.6%): E-030 蔚来, E-031 小鹏, E-049 理想/马赫心, E-012 吉利, E-050 长城, E-052 天成自控 (+GACC China–ASEAN trade).
  - Offshore notes (Wind dim-sum issuance to 22 Sep 14,481.5亿元 > 2025 full year; HKEX/Bloomberg HK-listed dim sum 2,669亿元 +13.8%, RMB 38% vs USD 31% share, USD issuance down >1/3): E-D-…620956 中行迪拜, E-D-…hkex_12382424 美团, E-046 腾讯, E-D-…619052 中交建, E-H-…617098 海南橡胶.
  - Cross-border RMB (PBOC Q1–Q3 current-account 15.23万亿 / direct-investment 6.11万亿): E-H-…586743 鸿特资金池.
  - Trade (GACC Q1–Q3: ASEAN 6.84万亿 +22.7%; IC +99.1%, ADP equipment +48.1%; 财信 transformer exports 92.20亿美元 +28.0%): E-009 广电运通, E-022 行云, E-014 三星电气.
  - Retail (NBS Jan–Sep online 151,471亿 +4.4%): E-001 拼多多. Solar (NEA 110.83GW new; SMM module exports 184.66GW −9.6%): E-051 晶科.
  - Gold (CGA Q1–Q3: domestic-ore output −18.71%, big groups' overseas mines 71.126t +15.77%): E-D-…617035 紫金/赤峰. Insurance (NFRA Q1–Q3 premiums 52,613亿 +0.9%): E-058 中国人寿. Coal (Australia REQ Sep 2026 outlook): E-028, E-057 兖煤.
  - Pharma/devices (CCCMHPIE H1 2026: exports 599.66亿美元 +9.87%, finished drugs +24.2%, EU +14.03%, Italy +75.6%, devices +12.47%): E-027, E-D-…626427 汇宇, E-044 赛诺.
  - ODI/BRI (MOFCOM Jan–Sep, reused): E-032 安踏/PUMA, E-007 酷特 (terminated), E-038 川金诺 (Egypt, BRI). KPMG A+H stat: E-D-…625852 华勤/晶合.
- E-017 中源家居: first real peer — 众望布艺 Z-WOVENS IEEPA refund (US$1.426m incl. interest; 13.36% of audited net profit vs this case 40.49%), plus CBP refund progress (US$166bn collected; ~US$127.7bn certified by 23 Oct). Now passes the standard gate → brief→deep.
- Site-computed ratios (share of national totals) are labelled as order-of-magnitude references. Depth: deep 55 / brief 23. Still no industry_context: E-004 联想可转债转换, E-024 海尔境内担保, E-040 海尔D股回购 (no fitting sector statistic). E-013 and HK/US gold untouched.
