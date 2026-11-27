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

## Round 14 (2026-11-11, ?v=20261111g1) — pubx-5 loop: R13 发布修复；赛诺哥伦比亚注册链 brief→deep；NFRA/巨潮来源替换
- **发布阻塞**: 11月10日三次 ingest-and-publish（42748898448 / 42750136676 / 42751516015）均在 actions/deploy-pages@v4 轮询部署状态时返回空状态、10分钟超时被取消；构建与产物上传（约3.1MB）均成功，属 GitHub Pages 端部署状态异常，仓库无需改动。11月11日重跑 42951393437 成功，R13 ?v=20261110g1 上线。
- **E-044 赛诺医疗 brief→deep**: 补齐同一产品跨公告注册链——SC HONKYTONK 2025-11-19 巴西ANVISA、2026-01-10 哈萨克斯坦、2026-03-26 越南、2026-10-10 哥伦比亚INVIMA；同期哥伦比亚另获 HT Supreme 支架（6/6）与 NC ROCKSTAR 球囊（7/11），当地冠脉三款产品均已获证。财务取半年报收入分解（境外收入2,336.25万元，约占7.7%本站计算；境外球囊毛利约29.2% vs 境内约63.1%，境外支架约63.3%，本站计算）与三季报（前三季度营收4.50亿元 +23.66%，归母净利6,914.52万元 +227.42%，经营现金流1.44亿元 +71.64%）；10/31 eLum 追加关联方借款（累计上限300万美元）入财务意义。类案 E-027 改为“逐国注册→境外收入占比”对比（汇宇约31.5%）。标题改为“赛诺医疗HONKYTONK冠脉球囊获哥伦比亚注册，当地三款冠脉产品均已获证”。8/26 巴拉圭支架公告证书号与哥伦比亚重复，未采用。
- **来源替换**: E-058 保费数据由中国经济网转载改为金融监管总局官网《2026年9月保险业经营情况表》《人身险公司经营情况表》，同比改为本站按2025年9月同口径官方表计算（52,613/52,145.77 ≈ +0.9%；38,631/38,433.67 ≈ +0.5%），删去无法由官方表核验的“由负转正”。E-017 众望布艺类案公告由上证报电子版改为巨潮原文 PDF（1225468444）。
- 其余8件 brief（E-054/055/009/014/016/052、鸿特资金池、兆丰韩国基地）在巨潮 11月7—11日检索中无新的实质跟进公告（仅质押、专利、担保等无关公告），维持 brief。H股管线（龙迅、晶晨、新宙邦、绿联、天赐、科大智能）11月7日后无新公告。Depth: outbound deep 69 / brief 9 → deep 70 / brief 8。E-013 / hk_01788 / us_eqt_range、HK/US 批量、paused pubx-2/3/4 均未动。

## Round 15 (2026-11-12, ?v=20261112g1) — pubx-5 loop: 精工钢构丹格特合同 brief→deep
- **E-055 精工钢构 brief→deep**: 核心链补齐为 10/16《2026年第三季度经营数据》→ 10/20 签约公告 → 10/29 三季报。经营数据：1—9月国际新签44.7亿元 -10.5%（海外工业建筑28.1亿元 +11.2%，公共建筑16.6亿元 -32.7%），公司称部分海外招投标延迟；本单约4.86亿元相当于1—9月国际新签额10.9%、第三季度单季营收9.2%（本站计算）。三季报：前三季度营收149.27亿元 +2.54%，归母净利4.77亿元 -19.07%（Q3 -54.42%，理财回撤＋国内公共建筑毛利下滑），经营现金净流出2.78亿元，合同资产101.68亿元。核心数字6项、财务/战略/投资三维重写，E-009 类案改为“对各自海外板块的边际份量”对比，标题改为主体＋动作＋金额。
- **保持 brief**: E-052 天成自控、兆丰韩国基地的三季报财务可用，但一旦写入财务背景即被构建门槛自动判为 deep，而两者仍只有单份定点/设立公告，按“材料不足不硬凑”继续 brief；E-054 嘉立创 11/12 临时股东会议题为超募资金新项目及治理制度，与 H 股无关；其余 brief（E-009/014/016、鸿特资金池）巨潮 10/15—11/12 检索无实质跟进。Depth: outbound deep 70 / brief 8 → deep 71 / brief 7。E-013 / hk_01788 / us_eqt_range、HK/US 批量、paused pubx-2/3/4 均未动。

## Round 16 (2026-11-13, ?v=20261113g1) — pubx-5 loop: 江丰电子递表；E-014 来源升级
- **E-048 江丰电子**: 11月12日向香港联交所递交H股主板发行上市申请，并在联交所网站刊发草拟申请资料（cninfo 1225669904；申请版本 sehk26111201124）。独家保荐人为招商证券（香港）有限公司；发行股数、定价及所得款项用途须待正式上市文件确定。标题改为“江丰电子向港交所递交H股发行上市申请并刊发申请资料”，阶段改为已递表；待中国证监会备案及香港审核。类案 E-053 联讯仪器改为递表进度对比（联讯截至11月13日检索未见递表公告）；行业队列表述删除“尚未递表”。
- **E-014 来源替换**: 变压器/电线电缆/整体出口数据由京报网图文实录改为中国政府网转载人民日报（2026-10-15，https 可核验），服务器等数据处理设备出口+7.2%补新华网转载科技日报同场发布会报道。数字未改。
- **保持 brief**: 嘉立创 11/13 第三次临时股东会决议为超募资金新项目、修订章程及治理制度，与 H 股无关；三星电气 10/31 预中标为国家电网营销设备（智能电能表等），与美国数据中心油变合同无关；其余 brief（E-009/016/052、鸿特资金池、兆丰韩国基地）无事件相关跟进。未把三季报单独写入 E-052/兆丰，以免构建门槛自动升 deep。点心债证券日报源维持中国金融信息网（R13：官网 https 不稳定）。Depth: outbound deep 71 / brief 7 不变。E-013 / hk_01788 / us_eqt_range、HK/US 批量、paused pubx-2/3/4 均未动。

## Round 17 (2026-11-16, ?v=20261116g1) — pubx-5 loop: 传音控股部分行使超额配售权
- **E-018 传音控股**: 11月11日整体协调人按每股35.30港元部分行使超额配售权，增发6,500,600股H股（占初步发售7.50%），额外募集资金净额约2.271亿港元（cninfo 1225667718；港交所 hkex_2026111101428）。稳定价格期同日结束：国际发售曾超额分配12,997,200股，稳定价格操作人中信里昂证券于市场按32.36–35.30港元买入6,496,600股，未行使部分失效。行使后H股93,148,900股、占总股本7.49%（总股本1,244,333,445股）。本站计算累计估计净额约31.27亿港元（基础发行估计约29亿＋额外约2.271亿，均为扣费后估计）。标题改为“传音控股部分行使H股超额配售权，额外净筹约2.271亿港元”，阶段改为超额配售部分行使；稳定价格期结束。超额配售股份预期11月16日上午9时上市买卖。
- **保持 brief**: 七件 brief 均无事件相关跟进。嘉立创 11/13 第三次临时股东会仍为超募资金新项目、章程及治理，与 H 股无关；鸿特 11/04 为控股股东质押及权益变动；兆丰 11/13 控股子公司中标并签署金华“机器人创新服务平台”合同（2.9992亿元）属境内项目，与韩国生产基地无关；广电运通 11/11 为转让数据交易公司股权等境内事项；三星电气 11/11 为子公司担保进展，10/31 预中标仍为国家电网营销设备；泰林生物仅有专利证书及三季报；天成自控自 10/17 定点后无订单或量产跟进。未把三季报或财务背景写入 E-052/兆丰，以免构建门槛自动升 deep。
- **已 deep 事件核阅但未改**: 江丰电子无递表后新公告。奥士康 11/14 股东会通过南通海门 PCB 产业基地对外投资、设立江苏喜珍电路，并决定不向下修正奥士转债转股价，均与 H 股无关。天赐 11/13 安徽东至 50 万吨电解液项目及组织架构调整、新宙邦 11/13 与亿纬锂能长期供货、联讯/龙迅回购或股东会、东山精密注销部分 A 股回购股份、汇宇与同源康 3 亿元和解、精工钢构股东质押等，均未写入各自原事件。海尔智家 11/12–13 翌日披露报表为 H 股回购日常披露，不写入 E-040（D 股回购）作为最新实质进展。
- **新事件仅记录、本轮不入库**: 晶科科技马来西亚购地（R14 已报）11/14 回复上交所监管函（上证公函〔2026〕1667号），仍不新增；海南橡胶控股子公司合盛农业拟公开征集转让 JFL Agro Pte. Ltd. 100%股权（楼下马来西亚胶园/油棕园约 9,844.9 公顷，估值下限 8,726.20 万新元，约合人民币 47,632.84 万元）；中国银行 400 亿美元中期票据计划下悉尼分行发行 4 亿澳元浮息票据（2031 年到期，代号 40973）及 20 亿元人民币 1.64% 票据（2029 年到期，代号 85514）、香港分行发行 25 亿元人民币 1.60% 票据（2028 年到期，代号 85513）及 10 亿港元 3.95% 票据（2029 年到期，代号 40960）在港交所上市，与既有迪拜分行 20 亿元人民币票据事件不是同一笔发行。
- Depth: outbound deep 71 / brief 7 不变。E-013 / hk_01788 / us_eqt_range、HK/US 批量、paused pubx-2/3/4 均未动。

## Round 18 (2026-11-17, ?v=20261117g1) — pubx-5 loop: 小鹏第三季度业绩
- **E-031 小鹏**: 11月16日刊发第三季度未经审计财务业绩（港交所 hkex_2026111600843；SEC 6-K Exhibit 99.1 sec_000119312526461897）。总收入242.8亿元，同比+19.1%、环比+23.0%；汽车销售收入216.3亿元，同比+19.8%、环比+26.9%，公司称增长主要由于交付量增加及产品组合改善带动平均售价上升。汽车毛利率13.1%，同比持平、环比+1.0个百分点；综合毛利率18.9%，同比-1.2个百分点、环比-1.8个百分点。净亏损8.7亿元，上年同期亏损3.8亿元，较第二季度13.4亿元环比收窄35.1%；经营亏损7.5亿元，同比基本持平。截至9月30日在手现金454.1亿元（口径含受限制现金、短期投资及定期存款），6月末为404.8亿元。第四季度展望交付16.9万–17.4万辆、总收入304.0亿–318.0亿元（初步估计，可能变动）。10月交付50,237辆及海外13,326辆维持，并补年內累计334,604辆（截至10月31日）；自营充电站更新为4,035座，门店731间、覆盖253个城市。标题改为“小鹏第三季度营收242.8亿元，净亏损8.7亿元环比收窄”。本份业绩未按地区拆分收入或交付，未把集团毛利当作海外或香港超充站回报。
- **保持 brief**: 七件 brief 仍无事件相关跟进。嘉立创截至11月17日仍未见董事会通过H股方案，11/13临时股东会与H股无关；鸿特、兆丰韩国基地、天成自控、广电运通泰国GSB合同、三星电气美国油变合同、泰林生物新加坡孙公司均无事件跟进公告。广电运通11/17第二次临时股东会为10/30通知所列境内事项，与泰国合同无关。未把三季报或财务背景写入 E-052/兆丰，以免构建门槛自动升 deep。
- **已 deep 事件核阅但未改**: 蔚来、理想第三季度财务业绩尚未刊发（公开信息指向约11月25日）。江丰电子递表后无新的聆讯或受理公告。E-018 传音超额配售已在R17写入。
- **新事件仅记录、本轮不入库**: 晶科科技马来西亚购地（11/14上证问询回复）及海南橡胶控股子公司合盛农业拟公开征集转让 JFL Agro 100%股权、中行MTN计划下多笔新上市，仍不新增，与既有事件不是同一笔交易。
- Depth: outbound deep 71 / brief 7 不变。E-013 / hk_01788 / us_eqt_range、HK/US 批量、paused pubx-2/3/4 均未动。

## Round 19 (2026-11-18, ?v=20261118g1) — pubx-5 loop: 吉利独立股东批准关连购销框架；蔚来三季报日期
- **E-012 吉利汽车**: 10月23日联交所刊发持续关连交易通函（通函日期10月26日；hkex_2026102300383），独立财务顾问博思融资及独立董事委员会建议独立股东投票赞成。11月16日股东特别大会以普通决议通过零部件购销协议（赞成2,823,942,827股，99.89%）及动力总成产品购买协议（赞成2,823,902,826股，99.91%）及其2027—2029年建议年度上限（hkex_2026111601378）。动力总成协议先决条件（独立股东批准）已达成；零部件购销协议还约定须遵守上市规则及联交所可能施加的其他规定，若2026年12月31日或书面延后日期前未达成则自动终止。标题改为“吉利汽车独立股东批准2027至2029年关连购销框架”，阶段改为独立股东已批准、计划2027年1月1日起执行。上限仍非已实现收入或采购。
- **E-030 蔚来**: 11月17日港交所公告（hkex_2026111700701），董事会将于12月1日举行会议并刊发第三季度未经审计财务业绩，同日北京╱香港╱新加坡时间下午八时举行电话会议。10月交付数据未改；标题仍为交付更新，待观察中的产品盈利项指向12月1日三季报。
- **保持 brief**: 七件 brief 仍无事件相关跟进。嘉立创 11/13（11/12召开）第三次临时股东会为超募资金新项目、修订章程及治理制度，与 H 股无关；兆丰 11/13 控股子公司兆聚智能与金华金漪体育公园运营签署“机器人创新服务平台”合同（2.9992亿元）属境内项目，与韩国生产基地无关；广电运通 11/11 为转让广州数据交易公司30%股权、11/17第二次临时股东会为拟注册发行中期票据，均与泰国GSB合同无关；三星电气 11/11 为子公司银行授信担保进展、11/17为回购注销持股计划股份，与美国数据中心油变合同无关；鸿特资金池、泰林生物新加坡孙公司、天成自控泰国定点均无事件跟进公告。未把三季报或财务背景写入 E-052/兆丰，以免构建门槛自动升 deep。
- **已 deep 事件核阅但未改**: 理想汽车 11/10 公告将于11月25日刊发三季报，美团 11/17 公告将于11月27日刊发三季报，均与既有事件（马赫心融资、80亿元优先票据）不是同一事项，未写入。兖矿能源 11/18 为收购山东能源新能源集团及山能售电完成工商变更，与红隼煤矿无关；航宇科技 11/17 股东会为修订制度、调整募投及注册债务融资工具，未见摩洛哥锻造基地进展；贵州轮胎 11/17 股东会为中期利润分配；长城汽车 11/17 董事会为注册港交所联讯通账户；龙佰 11/16 股东会为三季度利润分配及续聘会计师事务所，未改金样 E-013。江丰电子 11/17 为境内子公司晶丰芯驰增资及股权转让完成工商变更，与 H 股递表无关；汇宇制药 11/12 与同源康和解，与境外许可链无关。
- **新事件仅记录、本轮不入库**: 晶科科技购买境外土地租赁产权暨关联交易（马来西亚购地）11月17日股东会审议通过（11月18日决议公告 1225675847），仍不新增，与既有阿布扎比股东借款（E-056）不是同一笔交易。海南橡胶控股子公司合盛农业拟公开征集转让 JFL Agro 100%股权、中行MTN计划下多笔新上市，仍不新增。
- Depth: outbound deep 71 / brief 7 不变。E-013 / hk_01788 / us_eqt_range、HK/US 批量、paused pubx-2/3/4 均未动。

## Round 21 (2026-11-20, ?v=20261120g1) — pubx-5 loop: 拼多多三季度业绩；赛诺医疗印尼/哥斯达黎加注册
- **E-001 拼多多**: 11月19日（美东时间）6-K业绩稿（sec_000110465926130116，SEC受理时间北京时间11月20日05:00）。三季度营收1,083.41亿元（上年同期1,082.77亿元，基本持平；环比二季度约-3.6%，本站计算），线上营销及其他598.19亿元（+12%），交易服务485.22亿元（-12%）；销售及营销费用252.96亿元（-16.6%），经营利润311.64亿元（+24.5%）；利息及投资净收入53.89亿元（上年85.65亿元）、所得税65.70亿元（上年39.87亿元），归母净利润295.41亿元（+0.7%）；经营现金净流入430.19亿元，投资净流出377.74亿元；9月末现金及短期投资4,553.80亿元、受限资金821.97亿元。标题、摘要、核心数字、财务/战略/投资、时间线、待观察、现金解释全部切换为三季度口径；行业对比更新为国家统计局1—10月网上商品和服务零售额169,811亿元、+3.7%（11月16日发布，注明与原“网上零售额”不可比）。
- **E-044 赛诺医疗**: 11月20日公告（1225679453）HONKYTONK、NC ROCKSTAR、TRADENT棘突球囊及HT Infinity支架获印尼注册（2026年申报），HT Supreme支架获哥斯达黎加注册（2023年申报）。HT Supreme此前已获印尼注册，印尼冠脉产品线达五款（本站整理）；HT Infinity为首个境外注册。标题、摘要、最新注册、战略/投资意义、时间线、成熟度、待观察及类案本案描述已更新；仍未见当地经销或首批发货公告。
- **保持 brief**: 七件 brief 仍无事件相关跟进。天成自控 11/19 定点公告为武汉天成国内客户座椅骨架项目（2028年2月量产），与泰国子公司定点无关；广电运通 11/19 为中国农业银行超级柜台入围（约3亿元含税），与泰国GSB无关；三星电气 11/19 董事会为章程/内控制度修订及临时股东会通知，担保进展为境内子公司奥克斯智能，与美国油变合同无关；嘉立创 11/19 为境内全资子公司担保进展；兆丰、泰林生物、鸿特无新公告。
- **已 deep 事件核阅但未改**: 吉利、蔚来、小鹏、理想、美团、腾讯、安踏 11/19–11/20 港交所无新公告；联想 11/19 中期业绩及股息与 E-004 可转债注销事项无关；中交建 11/19 中期股息更新与永续证券赎回无关；紫金 11/19 A股回购方案与赤峰黄金交易无关；精工钢构 11/19 控股子公司为上市公司担保，与丹格特合同无关；传音仅翌日披露报表；共达电声 11/19 新设子公司为上海共达创研，与泰国子公司无关；中水渔业 11/20 临时股东会为续聘审计机构及日常关联交易，与基里巴斯合资无关；江丰电子无新公告。
- **新事件仅记录、本轮不入库**: 行云科技 11/19《AI词元跨境销售服务合同》（上限20亿元、首期2亿元）即 R20 已记录线索，未新增；晶科科技马来西亚购地、海南橡胶 JFL Agro 转让、中行MTN 11/19–11/20 未见新公告。
- Depth: outbound deep 71 / brief 7 不变。E-013 / hk_01788 / us_eqt_range、HK/US 批量、paused pubx-2/3/4 均未动。

## Round 22 (2026-11-23, ?v=20261123g1) — pubx-5 loop: 东山精密部分行使超额配售权；长城汽车独立股东批准关联采购上限
- **E-D-20261026-1225621945 东山精密**: 11月22日整体协调人按每股86.80港元部分行使超额配售权，增发1,617,900股H股（占初步发售约1.42%），额外募集资金净额约139.16百万港元（cninfo 1225682713；港交所 hkex_2026112200104）。稳定价格期同日结束：国际发售曾超额分配17,067,400股，稳定价格操作人UBS AG Hong Kong Branch等于市场按72.50–86.80港元买入15,449,500股，未行使部分失效。行使后H股115,401,100股、占总股本5.93%（总股本1,947,008,632股）。本站计算累计估计净额约98.56亿港元（基础发行估计约97.17亿＋额外约1.3916亿，均为扣费后估计）。标题改为“东山精密部分行使H股超额配售权，额外净筹约1.3916亿港元”，阶段改为超额配售部分行使；稳定价格期结束。超额配售股份预计11月25日上午9时上市买卖。
- **E-050 长城汽车**: 10月30日刊发股东特别大会通告及通函。11月20日股东特别大会以普通决议通过上交所项下调整2026年采购产品日常关联交易上限及预计2027年度日常关联交易金额（普通股合计赞成974,075,316股，98.01226%）及调整2026—2027年度采购产品持续关连交易年度上限（补充协议二；赞成974,050,616股，98.01027%）（hkex_2026112000977）。保定创新长城企业管理所持5,115,000,000股A股及保定市长城控股集团所持37,998,500股H股回避表决。标题改为“长城汽车独立股东批准上调2026及2027年关联采购上限”，阶段改为独立股东已批准。上限仍为2026年1,690,000万元、2027年1,950,000万元，并非已确定订单或现金支出。
- **保持 brief**: 七件 brief 仍无事件相关跟进。嘉立创 11/21 为超募资金投资江苏中信华高多层线路板项目签署募集资金四方监管协议，与 H 股无关；三星电气 11/21 为实际控制人、董事提议回购 A 股（5,000万–10,000万元，拟用于员工持股或股权激励），与美国油变合同无关；泰林生物 11/20 下午为全资子公司泰林医学工程取得专利及软件著作权，与新加坡孙公司无关；广电运通、鸿特资金池、兆丰韩国基地、天成自控泰国定点在 11/20–11/23 窗口无新公告。未把三季报或财务背景写入 E-052/兆丰，以免构建门槛自动升 deep。
- **已 deep 事件核阅但未改**: 华海药业 11/21 为酮咯酸氨丁三醇注射液获得国家药监局境内药品注册证书（国药准字 H20266613），与阿哌沙班片德国上市许可无关；晶合集成 11/20 为与合肥建投、合肥勤合订立增资协议（合计现金人民币91亿元认购目标公司新增注册资本，仍待独立股东批准），与既有华勤通讯香港增持晶合 H 股事件不是同一笔交易；江丰电子 11/20 为新增回购专用账户及首次回购 A 股，与 H 股递表无关；鸿富瀚 11/20 担保进展为梅州鸿富瀚、东莞鸿富瀚、梅州嘉颖、东莞捷风等境内子公司，与刚果（金）光储项目无关；共达电声 11/20 担保进展为香港共达对品佳股份的7,000万元保证，与拟设泰国子公司无关；罗博特科 11/20 临时股东会为回购 A 股方案，与 H 股挂牌及港股通无关；博瑞医药 11/21 临时股东会为修订章程、内部制度及董责险，与已终止的 H 股无关；泰晶科技 11/23 为 2026 年员工持股计划，与越南生产基地无关；兖矿能源 11/21 为控股股东山东能源增持 A 股进展，与红隼煤矿及兖煤澳洲季度运营无关；紫金 11/20–11/21 为 A 股回购方案及首次回购，与赤峰黄金交易无关；海尔智家 11/21 为 A 股回购进展及翌日披露报表，不写入 E-040（D 股回购）作为最新实质进展；天赐材料、玲珑轮胎为 A 股回购相关披露，分别与 H 股聆讯后资料、埃及项目无关；中水渔业 11/20 临时股东会决议及法律意见书为续聘审计机构等，与基里巴斯合资无关（R21 已核）；龙佰 11/20 为三季度权益分派实施，未改金样 E-013。吉利、蔚来、小鹏、理想、美团、腾讯、安踏、传音、中交建、中行 11/20–11/23 港交所无新的事件相关公告；拼多多窗口内仅有 R21 已写入的 11/20 05:00（北京时间）三季报 6-K。
- **新事件仅记录、本轮不入库**: 军信股份 11/20 下属公司军信环保（吉尔吉斯）与吉尔吉斯共和国部长内阁签署比什凯克垃圾科技处置发电项目二期工程投资协议之补充协议（规划处理规模 2,000 吨/日，总投资额约 2.3 亿美元，尚需境外投资备案或审批），与既有 H 股暂缓发行不是同一事项，不新增。晶合集成上述 91 亿元增资协议（11月19日签署，通函预计 12月31日或之前刊发）亦不新增，不并入华勤增持事件。晶科科技马来西亚购地、海南橡胶 JFL Agro 转让、行云科技《AI词元跨境销售服务合同》、中行 MTN 11/20–11/23 未见新公告。
- Depth: outbound deep 71 / brief 7 不变。E-013 / hk_01788 / us_eqt_range、HK/US 批量、paused pubx-2/3/4 均未动。

## Round 23 (2026-11-24, ?v=20261124g1) — pubx-5 loop: 东山精密H股调入港股通；联科科技调整埃及项目投资路径
- **E-D-20261026-1225621945 东山精密**: 已在香港联交所上市的H股自2026年11月23日起调入沪港通及深港通标的证券名单，符合条件的内地投资者可通过上交所、深交所直接投资（cninfo 1225683208，公告落款11月23日、巨潮11月24日披露；港交所海外监管公告 hkex_2026112301036，11月23日18:12刊发）。标题改为“东山精密H股自11月23日起调入港股通”。11月22日部分行使超额配售（1,617,900股、额外净筹约139.16百万港元）及稳定价格期结束的事实保留；超额配售股份仍预计11月25日上午9时上市买卖，本轮未见新的上市/完成公告。港股通调入按公告表述为“有利于进一步扩大”投资者基础、“并将潜在提高”流动性，未把调入名单写成已实现成交或估值变化。
- **E-005 联科科技**: 11月23日第三届董事会第二十四次会议审议通过调整埃及苏伊士运河经济特区二氧化硅—炭黑循环经济一体化项目的投资路径（cninfo 1225683066、董事会决议 1225683065，11月24日披露）。原路径为海南联科国际100%持有新加坡 Lianke International Pte. Ltd.，再由新加坡与海南主体分别持有埃及公司99%及1%；现改为海南联科国际拟持99.9%、上市公司拟持0.1%，直接合资设立埃及公司，取消新加坡中间层。建设内容与约100,000万元投资额保持不变；以上为暂定信息，最终以核准登记及实际注册为准，无需提交股东会，不构成关联交易或重大资产重组。标题改为“联科科技调整埃及二氧化硅及炭黑项目投资路径，拟取消新加坡中间层”。
- **保持 brief**: 七件 brief 仍无事件相关跟进。三星电气 11/24 为子公司奥克斯智能科技在国家电网2026年华东区域第二次联合采购10kV变压器、10kV柱上变压器台成套设备框架协议（协议库存）公开招标中被推荐为中标候选人，预计合计中标总金额约27,766.96万元（招标编号 SL262K，尚未收到中标通知书）（1225683011），与美国数据中心油浸式变压器合同无关。嘉立创、广电运通、鸿特资金池、兆丰韩国基地、天成自控泰国定点、泰林生物新加坡孙公司在 11/23–11/24 窗口无新公告。未把三季报或财务背景写入 E-052/兆丰，以免构建门槛自动升 deep。
- **已 deep 事件核阅但未改**: 龙佰集团 11/24 披露下属子公司拟通过股权受让及增资取得 Titon Resources Pty Ltd 72.50%股权，从而间接持有 Durack、Yandanooka 两个矿砂项目 72.50%权益（1225684269；董事会 11月20日，决议 1225684270）。香港公司拟以现金 20,000,000 澳元受让 103 股，Murray Zircon 拟以选矿厂及配套设备等资产（不含 GST 约定价值 121,000,000 澳元）认购新增 622 股；交割后 Titon 总股本 1,000 股，公司合计 72.50%、Image Resources NL 27.50%，Titon 纳入合并报表。总对价 141,000,000 澳元，按董事会召开前一日中间价 1 澳元=4.49160 元人民币约合人民币 63,331.56 万元。构成关联交易（Image Resources 为控股股东、实际控制人、董事长许冉担任董事的企业）。尚需 Image 股东大会批准、重大资产处置及担保授予批准、FIRB 无异议、ACCC 批准（如依法需要）、中国境外投资备案及外汇登记等先决条件，协议日落日 2027年4月30日；标的项目目前仅取得勘探许可、尚未取得采矿许可。该事项为金样 E-013 的事件链跟进，本轮按硬约束不改 research/outbound_e013.json。行云科技 11/24 与北京豆神智算科技有限公司签订《算力服务合同》，向其提供 32 套标准化 GPU 算力技术服务，含税总金额 29,856 万元、期限 5 年，所涉服务器已完成合规采购并于上周验收交付（1225684153），对手方为境内主体，与 E-022 境外服务器订单不是同一合同，亦不是此前仅记录的《AI词元跨境销售服务合同》，不写入 E-022、不新增事件。绿联科技 11/23 为深圳龙华区工业用地取得不动产权证书（1225684351），与 H 股聆讯无关；罗博特科 11/23 为 H 股发行后变更注册资本并完成工商登记（总股本 180,130,211 股、注册资本 18,013.0211 万元）（1225683316），属已完成挂牌后的残余登记，不改 E-019 标题或阶段；晶合集成 11/23 翌日披露报表为 A 股回购 2,071,417 股作库存（成交总额人民币 55,503,801.83 元）（1225684129），11/24 为 12月2日召开三季报业绩说明会（1225683633），均不并入华勤增持晶合 H 股事件，也不把 91 亿元增资并入该事件；赤峰黄金 11/24 完成注册资本由 1,900,411,178 元变更为 2,211,313,909 元及法定代表人变更的工商登记（1225683480），属已完成紫金交易后的登记手续，不改 E-D-20261023-1225617035；航宇科技 11/24 为境内控股子公司贵州钜航向农行申请固定资产借款并提供比例保证（1225683868），与摩洛哥锻造基地无关；精工钢构股权解押、紫金回购股东名单、品茗科技回购实施结果、龙迅股份首次回购 A 股、联讯仪器回购进展、共达电声股东一致行动人增持、泰晶科技员工持股计划（R22 已核）均与既有出海事件无关。吉利、蔚来、小鹏、理想、美团、腾讯、安踏、传音、中交建、中行、长城 11/23–11/24 港交所无新的事件相关公告（东山精密港交所仅有上述港股通海外监管公告；紫金为 A 股回购相关）。SEC 窗口内仅有蔚来 Form 4（2026-11-24 05:00 CST 接收），非三季报，不写入 E-030。
- **新事件仅记录、本轮不入库**: 军信股份吉尔吉斯二期补充协议、晶合集成 91 亿元增资协议、晶科科技马来西亚购地、海南橡胶 JFL Agro 转让、行云科技《AI词元跨境销售服务合同》、中行 MTN 在 11/23–11/24 未见需新入库的公告。龙佰上述矿砂交易为既有金样事件跟进而非新事件。
- Depth: outbound deep 71 / brief 7 不变。E-013 / hk_01788 / us_eqt_range、HK/US 批量、paused pubx-2/3/4 均未动。

## Round 24 (2026-11-25, ?v=20261125g1) — pubx-5 loop: 赛诺医疗TRADENT棘突球囊获马来西亚MDA注册
- **E-044 赛诺医疗**: 11月25日自愿性披露公告（cninfo 1225687105，公告编号2026-087）：自主研发的TRADENT冠状动脉棘突球囊扩张导管近日获得马来西亚医疗器械管理局（MDA）注册批准，证书编号GD7520826-248376，2026年6月向MDA申报。公告称该产品于2023年9月12日获中国国家药监局注册证，2025年至2026年已分别获得泰国、韩国、越南、印尼等国家和地区注册。11月20日印尼四款（含TRADENT）及哥斯达黎加HT Supreme获证的事实保留。标题改为“赛诺医疗TRADENT棘突球囊获马来西亚MDA注册”。两份11月公告均称无法预测获证对业绩的具体影响；截至11月25日巨潮检索仍未见当地经销协议或首批发货公告。上半年境外收入2,336.25万元、约占营收7.7%（本站计算）等财务背景未改。
- **保持 brief**: 七件 brief 仍无事件相关跟进。三星电气 11/24 国网华东区域第二次联合采购10kV变压器等预中标（预计约27,766.96万元，1225683011）已在 R23 核为与美国数据中心油变合同无关，本轮无更新。嘉立创、广电运通、鸿特资金池、兆丰韩国基地、天成自控泰国定点、泰林生物新加坡孙公司在 11/24–11/25 窗口无新公告。未把三季报或财务背景写入 E-052/兆丰，以免构建门槛自动升 deep。
- **已 deep 事件核阅但未改**: 东山精密超额配售股份原预计 11月25日上午9时上市买卖；截至本轮扫描（约11:45 北京时间）巨潮与港交所（02384，窗口至11月25日）均未见上市/完成公告，页面仍按 11/22–11/23 公告写“预计”，不改为已上市。联科科技 11/24 对外投资进展（1225683066）已在 R23 写入，窗口内无更新。传音控股 11月24日第一次临时股东会为董事会换届选举，11月25日披露决议及董监高聘任（1225686742 等；港交所 11月24日22:46–22:48），与已完成的 H 股超额配售无关。鸿富瀚 11/24 为2021年创业板首发募集资金等额置换、开立专户、变更财务总监及提议回购（1225685454 等），所涉超募项目包括已于8月25日公告的越南组件生产基地（截至10月31日拟投入募集资金尚未发生实际投入）及苏州项目，与刚果（金）光储收购（E-011）不是同一事项。绿联科技龙华工业用地权证、航宇科技境内子公司贵州钜航担保、罗博特科 A 股回购及工商变更、景旺电子 A 股回购结果及11月23日翌日披露报表（A 股回购入库及激励计划行权，非 H 股变动）、晶合集成 A 股回购翌日披露及三季报说明会、中国交建限制性股票回购注销及控股股东持股被动增至1%刻度、中坚科技限制性股票授予登记、会通股份回购减资通知债权人及三季报说明会、精工钢构股权解押、紫金回购股东名单、共达电声股东一致行动人增持、泰晶科技员工持股计划、品茗科技回购实施结果、龙迅及联讯仪器 A 股回购，均与既有出海事件无关。吉利汽车 11月24日16:30港交所自愿公布发行人民币25亿元中期票据（2026年度第三期，期限2年、第一年利率1.44%，计划2028年11月24日到期，所得资金用于补充附属公司在中国境内使用的流动资金），与 E-012 关连购销框架不是同一事项，不写入该页。拼多多 11月24日 6-K 为股东年会通知，不写入 E-001 三季报事件；11月19日 6-K 为已在 R21 写入的业绩新闻稿。蔚来 11月17日 6-K 为已在 R19 写入的董事会会议/三季报日期公告，11月23日 Form 4 为股权变动，均非三季报正文。理想汽车、小鹏汽车、美团在 11月23–25日港交所无新公告，理想与小鹏同期 SEC 亦无新 6-K；理想、美团、蔚来三季报均未刊发（蔚来仍为12月1日）。
- **新事件仅记录、本轮不入库**: 军信股份吉尔吉斯二期补充协议、晶合集成 91 亿元增资协议、晶科科技马来西亚购地、海南橡胶 JFL Agro 转让、行云科技《AI词元跨境销售服务合同》、中行 MTN 在 11/24–11/25 未见需新入库的公告。行云科技 11/24 与北京豆神智算科技有限公司签订《算力服务合同》（32 套标准化 GPU 算力技术服务，含税总金额 29,856 万元、期限 5 年，1225684153）已在 R23 记录，对手方为境内主体，不写入 E-022、不新增。吉利上述人民币 25 亿元中期票据为新线索，不入库。龙佰 Titon 矿砂交易为金样 E-013 事件链跟进：11月20日董事会审议、11月24日公告（1225684269）拟通过受让及增资取得 Titon Resources 72.50% 股权，从而持有西澳 Durack、Yandanooka 两矿砂项目 72.50% 权益；香港公司拟以现金 20,000,000 澳元受让 103 股，Murray Zircon 拟以选矿厂及配套设备等资产（不含 GST 约定价值 121,000,000 澳元）认购新增 622 股；总对价 141,000,000 澳元，按董事会召开前一日中间价 1 澳元=4.49160 元人民币约合人民币 63,331.56 万元；构成关联交易；尚需 Image 股东大会、重大资产处置及担保授予批准、FIRB 无异议、ACCC（如依法需要）、中国境外投资备案及外汇登记等先决条件，协议日落日 2027年4月30日；标的项目目前仅取得勘探许可、尚未取得采矿许可。本轮按硬约束不改 research/outbound_e013.json。
- Depth: outbound deep 71 / brief 7 不变。E-013 / hk_01788 / us_eqt_range、HK/US 批量、paused pubx-2/3/4 均未动。

## Round 25 (2026-11-26, ?v=20261126g1) — pubx-5 loop: 东山精密超额配售股份完成发行及配发
- **E-D-20261026-1225621945 东山精密**: 港交所 11 月 25 日 17:58 刊发翌日披露报表（2026112500738_c.pdf；A 股公告 cninfo 1225688384，11 月 26 日披露），确认因超额配售权获部分行使而发行的 1,617,900 股 H 股已于 2026 年 11 月 25 日完成发行及配发，发行价 86.80 港元，H 股已发行股份（不含库存股）由 113,783,200 股增至 115,401,100 股，变动约占有关事件前已发行 H 股的 1.42%。报表并确认已收取应得全部款项，且有关上市的先决条件及上市批准函条件已履行。11 月 22 日公告曾预计该等股份于 11 月 25 日上午 9 时开始买卖；本轮按报表用语写“发行及配发已完成”，不另行写成已观察到开始买卖。标题改为“东山精密超额配售股份于11月25日完成发行及配发”。已上市 H 股自 11 月 23 日起调入港股通的事实保留；报表未单独说明新增股份是否同步可通过港股通买卖。
- **保持 brief**: 七件 brief 仍无事件相关跟进。嘉立创 11 月 26 日公告使用全部超募资金 24,817.38 万元向全资子公司江苏中信华提供无息借款，实施江苏中信华高多层线路板建设项目（1225688382，A 股超募项目，与 E-054 筹划 H 股无关）。广电运通、三星电气、鸿特资金池、兆丰韩国基地、天成自控泰国定点、泰林生物新加坡孙公司在 11/25–11/26 窗口无新公告。未把三季报或财务背景写入 E-052/兆丰，以免构建门槛自动升 deep。
- **已 deep 事件核阅但未改**: 传音控股 11 月 24 日第一次临时股东会为董事会换届，11 月 25 日披露决议及董监高聘任（1225686742/1225686741），R24 已核为与已完成的 H 股超额配售无关。晶合集成 11 月 25 日第二次临时股东会通过给予董事会一般性授权回购 H 股股份（同意 99.8333%）及选聘 2026 年度会计师事务所（1225688737；港交所 19:48 投票结果），不是待观察的 91 亿元增资协议，亦不并入华勤增持晶合 H 股事件（E-D-…625852）。新宙邦 11 月 25 日为合营企业石磊氟材料向民生银行赣州分行提供最高额保证 4,282.51 万元（额度内进展，1225687565），与 E-042 H 股上市委员会审阅无关。中国交建调整 2026 年中期利润分配方案（1225688067），与 5 亿美元永续证券赎回通知（E-D-…619052）无关。景旺电子 11 月 23 日翌日披露报表为 A 股回购入库及激励计划行权（1225685309），R24 已核。赛诺医疗 1225687105 已在 R24 写入。行云科技首次回购公司股份、绿联科技首次回购、共达电声股东一致行动人增持、中坚科技限制性股票授予登记、精工钢构三季度业绩说明会、会通股份业绩说明会及回购减资通知债权人，均与既有出海事件无关。拼多多 11 月 24 日 6-K 为股东年会通知，R24 已核、不写入 E-001。美团、蔚来、小鹏在 11/25–11/26 港交所无新公告，蔚来与小鹏同期 SEC 亦无新 6-K；美团三季报窗口约 11/27，蔚来仍为 12 月 1 日刊发。
- **新事件仅记录、本轮不入库**: 理想汽车已于 11 月 25 日 16:30 在港交所刊发截至 2026 年 9 月 30 日止季度未经审计财务业绩（新闻稿；港交所 2026112500273_c.pdf；SEC 6-K 2026-11-25，accession 0001104659-26-131768，展 99.1 为同份新闻稿），按美国公认会计原则编制。要闻：季度收入总额人民币 288.344 亿元（表格 28,834.4 百万元），同比 +5.4%、环比 +12.3%；汽车总交付量 99,964 辆，同比 +7.2%；车辆销售收入 270.939 亿元，同比 +4.7%、环比 +12.6%；车辆毛利率 15.3%（上年同期 15.5%，二季度 9.4%）；毛利率 16.7%；经营亏损 6.996 亿元，同比收窄 40.6%、环比收窄 69.6%；净亏损 3.097 亿元，同比收窄 50.4%、环比收窄 81.8%；经营活动所得现金净额 32.292 亿元；自由现金流 19.619 亿元。第四季度预计车辆交付量 110,000 至 115,000 辆，同比增长 0.7% 至 5.3%。即使刊发也不写入既有融资协议事件 E-049，作为新线索待确认后入库。其余仍待确认、本轮不入库：军信股份吉尔吉斯二期补充协议、晶合集成 91 亿元增资协议（本次股东会未审议该项）、晶科科技马来西亚购地、海南橡胶 JFL Agro 转让、行云科技《AI词元跨境销售服务合同》、中行 MTN、吉利汽车人民币 25 亿元中期票据。龙佰 Titon 矿砂交易为金样 E-013 事件链跟进，本轮按硬约束不改 research/outbound_e013.json。
- Depth: outbound deep 71 / brief 7 不变。E-013 / hk_01788 / us_eqt_range、HK/US 批量、paused pubx-2/3/4 均未动。

## Round 26 (2026-11-27, ?v=20261127g1) — pubx-5 loop: 瀚蓝重组加期财务更新；泰晶越南基地纳入定增
- **E-045 瀚蓝环境/粤丰环保**: 11 月 26 日第十二届董事会第四次会议确认以 2026-06-30 为基准日的加期审计（粤丰模拟报表、高质量基金）及备考审阅报告，通过重组报告书（二次修订稿）；11 月 27 日公告（1225691062/1225691051/1225691049）称申报文件财务资料更新已完成。写入：交易总价 29.98 亿元（现金 17.02 亿、股份 12.95 亿；7.22% 股权现金对价 8.38 亿元＝上市公司 4.38 亿＋瀚蓝香港 4.00 亿）；粤丰 2026H1 营收 21.47 亿、归母净利 6.03 亿、经营现金流 8.18 亿、资产负债率 55.79%；备考 H1 归母净利 12.06→14.45 亿（+19.82%）、EPS 1.48→1.66 元；评估值 116.04 亿（增值 20.59%），静态 PE 15.27 倍/PB 1.21 倍对 6 宗国内垃圾焚烧可比交易平均（剔除异常值静态 PE 16.94 倍、PB 4.23 倍）。公告未表述上交所已恢复审核，页面不写已恢复。标题改为“瀚蓝环境完成粤丰环保收购重组加期财务更新，披露二次修订稿”。
- **E-039 泰晶科技越南**: 11 月 26 日董事会通过不超过 101,102.73 万元定增预案（1225690787/1225690803，11 月 27 日披露），“高精度石英频率元器件扩产项目”38,302.27 万元由公司及越南讯时科技在随州与越南北宁实施；预案称境外部分已取得境外投资项目备案通知书，越南当地审批或登记仍在办理；未拆分越南金额，不把 3.83 亿元整体计作越南投资；12 月 14 日临时股东会。标题改为“泰晶科技越南基地纳入10.11亿元定增募投项目，境外部分已获ODI备案”。
- **未写入**: 美团三季报截至扫描时（11/27 约 11:40 北京时间）港交所未刊发，且美团在出海模块仅有 80 亿元优先票据事件，三季报不属该事件链。华海药业西格列汀片获 FDA 正式批准（1225689367）与 E-006 阿哌沙班德国许可非同一产品链，记为新线索。理想 Q3（11/25 SEC 6-K）仍不写入 E-049。嘉立创超募借款江苏中信华（境内项目）、天成自控员工持股解锁、鸿富瀚回购、罗博特科/晶合 A 股回购、中行 TLAC 债发行完毕、中交建分红调整、绿联保代变更、汇宇担保进展、共达增持均与既有出海事件无关。
- 测试：scripts/test_acceptance_research.py E-031 既有失败仍在；scripts/test_research_render.js 在基线同样失败（data-module 断言，非本轮引入）；其余 python 测试及 tests/test_pipeline 通过。Depth: outbound deep 71 / brief 7 不变。E-013 / hk_01788 / us_eqt_range、HK/US 批量、paused pubx-2/3/4 均未动。
