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

## Round 10 (2026-11-05, ?v=20261105g1) — pubx-5 loop: brief re-audit with new filings; E-004 CB context
- P1 brief→deep re-audit: 10 outbound events now have a real filing chain (≥2 dated nodes), a valid peer and 2026 Q3 financials (cninfo 财务数据/企业资料), and pass the standard gate:
  - E-D-…621945 东山精密: retitled 东山精密H股挂牌，净筹约97.17亿港元 (10/28 listing, 113,783,200 H shares @86.80港元 vs 93.80 cap, H 5.85%/6.67% post-greenshoe; Q3 rev 453.79亿 +67.63%, NP 52.89亿, ST debt 116.10亿).
  - E-048 江丰电子: 10/30 EGM passed H-share plan 99.88%; Q3 NP 8.11亿 vs 扣非 4.33亿 (≈3.78亿 non-recurring); peer E-053 refreshed.
  - E-053 联讯仪器: 11/02 EGM passed 99.98%; Q3 rev 40.43亿 +401.91%, NP 20.06亿 (Q3 alone ~72%); April STAR IPO; peer E-059.
  - E-059 奥士康: 11/05 EGM scheduled (result pending → watch item); Q3 NP 4.54亿 +60.87% vs op. cash 0.95亿 −48.68%.
  - E-033 若羽臣: chain 2025-09-19 first filing / 2026-04-27 refiling / 10-08 CSRC; Q3 NP 2.31亿 +120.92%.
  - E-D-…627271 龙迅: chain 2025-09-20 / 2025-11-21 board / 2026-10-27 CSRC; Q3 NP 1.17亿 −5.68%, R&D 20.90%.
  - E-015 玲珑轮胎: retitled 董事会批准埃及600万套半钢胎项目 (9/23 board, 对外投资公告 2026-071); Q3 NP 0.64亿 −94.51%, FX loss ≈4.37亿, raw-material cost +15.17%.
  - E-045 瀚蓝环境: SSE review chain (6/30 accepted, 7/13 inquiry, 9/2 reply, 9/30 suspended for stale financials), price adj. 24.30元/53,310,340 shares; 粤丰 1–9M NP contribution 4.22亿.
  - E-040 海尔智家: D-share offer 1.87欧元 → ≈1.48亿欧元 total (site-computed); Q3 NP 149.99亿 −13.67%, op. cash −39.00%.
  - E-H-…617216 中水渔业: same-board ship purchase (BG AGNES ≈US$12.525m) and 2 longliners (≈6,836万元); Q3 Q3-only loss ≈647万, liabilities/assets ≈70.3% (site-computed).
- E-004 联想: industry_context added — UBS via 经济参考报/新华网 (2026 YTD to ~10 Jun: HK CB issuance US$14.2bn > placements US$9.6bn; zero-coupon wave); 20 boilerplate timeline rows collapsed to 8 meaningful nodes. E-046 腾讯: 8 dealer-agreement history rows collapsed to 1.
- Dangling source refs fixed (sources cited in comparables but missing from research_sources): E-032, E-044, E-045, E-055.
- Depth: outbound deep 65 / brief 13. Still no industry_context: E-024 (intra-group guarantee), E-040 (D-share buyback) — no meaningful sector statistic. E-013 and HK/US gold untouched; pubx-2/3/4 still paused.

## Round 11 (2026-11-06, ?v=20261106g1) — pubx-5 loop: E-059 AGM result; clear remaining no-industry; source hygiene
- **E-059 奥士康**: 11月5日第二次临时股东会决议公告（cninfo 1225660210，11月6日披露）确认H股发行上市主议案同意率99.9928%（同意217,524,850股），出席表决权占比69.8399%；主板方案各子项、转为境外募集股份有限公司、24个月有效期、募集资金使用计划等均通过。标题/阶段/摘要/时间线/核心数字/待观察/投资意义同步改为“股东会通过；待境内备案及香港审核”。深度仍为 deep。
- **industry_context 清零剩余空缺**: E-024 补交通运输部前三季度营业性货运量/港口吞吐量（公路货运327.0亿吨 +2.5%）；E-040 补中国证券报引述上交所沪市前三季度新增回购计划250余家次、上限超720亿元（并标明本案为D股要约注销、与多数A股集中竞价计划不同市场）。此前 outbound 仅此两案缺/空 industry。
- **来源替换**: 紫金 E-D-…617035 黄金协会统计由新浪转载改为新华社稿；E-044 行业由医保商会综合H1改为商会《医疗器械进出口形势分析》专项（含拉美出口 +17.7%）；E-027 / E-D-…626427 西成药/对欧口径在原H1主键上收紧表述（商会尚未发前三季度西成药分项，不伪造Q3）。
- Depth unchanged: deep 65 / brief 13. No brief→deep this round（剩余 brief 多为单节点时间线或缺财务数据源，未垫高）。E-013 / hk_01788 / us_eqt_range 及 HK/US 批量、paused pubx-2/3/4 均未动。


## Round 12 (2026-11-09, ?v=20261109g1) — pubx-5 loop: ANTA consideration + 华勤首期执行；来源替换
- **E-032 安踏/PUMA brief→deep**: 依据1月26日公告、2月13日股东书面批准公告、4月24日通函及10月7日完成公告补入对价与财务资料。现金对价1,505,516,600欧元（不含税，每股35.0欧元），通函折合约人民币12,277,638,425元；卖方为Pinault家族旗下Artémis；资金来自集团内部资源（含营运资金）；安踏国际、安达控股及安达投资合计约52.83%持股书面批准，无需召开股东特别大会。通函摘录PUMA 2025年收入72.962亿欧元、净亏损6.152亿欧元；完成后按权益法核算联营公司，拟寻求监事会代表席位。标题改为“安踏以15.055亿欧元完成收购PUMA约29.06%股权”。
- **E-D-…625852 华勤/晶合 brief→deep**: 晶合集成10月29日公告（cninfo 1225637612）确认华勤通讯香港于10月27–28日通过联交所集中竞价增持H股1,056,500股（占总股本0.05%），一致行动人合计持股由10.97%升至11.02%。距计划下限1,500万股约7.0%（本站按已买股数/下限计算）；该公告没有列明成交价格。标题改为“华勤通讯香港开始增持晶合集成H股，首两日买入105.65万股”。
- **来源替换**: 中汽协1–9月新能源产销（E-012/030/031/049/050/052）由新浪/IT之家转载改为新华社10月12日稿；国内销量846.6万辆改为本站按销量减出口计算，不再沿用新华社未载明的同比-10.6%。人民银行前三季度跨境人民币数据（鸿特资金池）由新华财经cnfin转载改为新华社全文转载央行报告。点心债Wind数据（中行迪拜、腾讯、美团）改为证券日报原文；行云科技行业数据改为新华社外贸稿（集成电路出口+99.1%，先进制造进出口合计超10万亿元+58.9%），删去新华社未载明的自动数据处理设备+48.1%。
- 医保商会官网截至复核日仍未见2026年前三季度西成药/器械分项（官方列表最新仍为上半年），E-027 / E-D-…626427 / E-044 维持H1口径，不采用第三方稿件中的Q3数字。嘉立创、奥士康等未见11月6日后可核验的新实质公告；CSRC备案表页面更新至2026-11-06，附件xlsx下载返回HTTP 500，未据此改写名单。
- Depth: outbound deep 65 / brief 13 → deep 67 / brief 11. 其余11件brief仍为单节点订单/许可/筹划/注册或缺少财务数据源，未垫高。E-013 / hk_01788 / us_eqt_range 及 HK/US 批量、paused pubx-2/3/4 均未动。

## Round 13 (2026-11-10, ?v=20261110g1) — pubx-5 loop: 汇宇许可链 brief→deep；龙迅聆讯；蔚来/小鹏10月交付；来源替换
- **E-D-…626427 汇宇意葡许可 brief→deep**: 补齐申请→获批链——6月26日公告地西他滨已在意大利、德国递交申请，8月11日公告唑来膦酸已在葡萄牙、德国递交申请，10月27日意、葡均获批；11月5日（cninfo 1225658326）再获科索沃4项、英国1项许可。财务取半年报（国外营收约1.74亿元，+92.42%，约占营收31.5%本站计算；国内主要品种降价、收入基本持平）及三季报（前三季度营收8.66亿元 +16.71%，扣非1.34亿元 +68.59%，Q3单季营收+8.74%，研发占比30.52%）。类案改为跨公司 E-006 华海德国阿哌沙班＋同平台 E-027。标题改为“汇宇制药意葡两品种获批后，再获科索沃及英国5项许可”。
- **E-027 汇宇法国白紫 brief→deep**: 6月26日公告该品种已在14国获批、法国申请中→10月1日法国获批（NL56380）累计15国、塞尔维亚申请中；同一财务与类案口径。标题改为“汇宇制药白蛋白结合型紫杉醇获法国许可，累计15国”。
- **E-D-…627271 龙迅股份**: 11月7日公告（cninfo 1225662422）联交所上市委员会11月5日聆讯、保荐人11月6日收到已审阅信函（非正式批准）。标题/阶段/摘要/时间线/待观察更新。
- **E-D-…621945 东山精密**: 11月6日HKEX公告——上市前以内部资源完成收购江苏华存73.4393%（总代价最高约5.81亿元，含或然约1.45亿元，已付约3.76亿元，11月起并表）及4项少数股权投资约2.05亿元，均未动用H股所得款；资金使用待观察项相应收窄。
- **E-030 蔚来 / E-031 小鹏**: 补10月交付（HKEX自愿公告）。蔚来34,246辆（环比约-8.5%本站计算），1—10月334,547辆 +38.5%（前三季度+49.2%）；小鹏50,237辆创新高（+22%环比/+20%同比），海外13,326辆 +166%，约占26.5%（本站计算）。G9L巴黎发布结果未见公告，保留待观察。
- **来源替换**: E-051 光伏新增装机改为国家能源局官网1—9月电力统计一览表（11,083万千瓦，较上年同期减少12,944万千瓦，降幅约53.9%本站计算；删去由1—8月推算的9月单月数）；E-014 变压器出口由财信证券研报转载改为国新办发布会实录（海关总署：前三季度变压器出口+22.5%），删去依研报金额计算的1.4%占比。点心债Wind数据（中行迪拜、美团、腾讯）原证券日报http链接不可访问且不满足https发布契约，改为中国金融信息网刊载的证券日报原文。
- 其余9件brief（E-054/055/009/014/016/044/052、鸿特资金池、兆丰韩国基地）在cninfo 11月5—10日检索中均无新的实质跟进公告，维持brief。Depth: outbound deep 67 / brief 11 → deep 69 / brief 9。E-013 / hk_01788 / us_eqt_range、HK/US 批量、paused pubx-2/3/4 均未动。
