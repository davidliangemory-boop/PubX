# 共享研究事件层（P0，2026-10-27）

## 架构与边界

采集层保持市场独立：出海 `state/db.json` 与 `state/events.json`、HK `state/hk_market.json`、SEC `state/us_market.json`。不反向改写采集分类、不抓取网络、不改 raw。`scripts/build_events.py` 通过 `research_schema.py` 在构建时派生 分市场 `assets/events_*.js`，由 `events_index.js` 提供计数、文件名、构建时间与 US 直达详情分片索引。产物由 CI 重建，沿用 `assets/*data.js` 忽略与 sync_guard 拒绝提交规则。页面通过动态 script 按当前市场加载，兼容 Pages 与 file://；US material / capital 独立分片，默认仅加载 material。index 不再预载事件全集。

共享对象的每个标准字段均为 `{value,prov}`。prov 为 disclosed（已收录原文事实）、external（外部来源）、analysis（规则或研究判断）、undisclosed（当前材料未提取，不能宣称发行人未披露）、na（有依据的不适用）。来源数组保留 doc_id、日期、链接；分析不等同于事实。顶层 title、stream、importance、specialty 为界面辅助属性；specialty 的业务字段同样带 provenance。

标准字段全集：event_id、market、issuer_id、entity_id、event_type、event_subtype、stage、status、event_date、disclosure_date、parties、target、geography、consideration、payment_structure、ownership_before、ownership_after、control_result、financing、conditions_precedent、approvals、long_stop_date、termination、governance、sources、disclosure_changes、financial_analysis、investment_analysis、strategy_analysis、legal_analysis、comparables、action_plan、information_gaps、next_milestones。

## 页面流

市场总览 → 事件库 → 事件详情 → 事实与条款 → 四维透视 → 类案比较 → 判断与方案 → 持续跟踪。

三市场复用 `page_events.js` 详情模板，事件路由 `#/event/<id>`；出海旧详情 `?legacy=1`。派生数据缺失时回退原页面。港股子导航为市场总览、事件库、发行人、在途交易、收购与私有化、融资与资本运作、监管执法、类案、方法；SEC 默认重大事件，可切资本市场流水与旧文件视图；出海导航为市场总览、事件库、企业档案、国家与产业、类案研究、项目跟踪、法律议题、方法与来源。

## 本轮交付与后续

### 出海

- P0 已交付：现有78事件映射；A决策摘要、B事实/文件链、C18项条款、D财务/投资/战略/法律、E类案、F条件方案、G跟踪；金额+地域+动作标题，中文类型，融资>境内融资/境外融资/发债；四维使用已有分析并明确缺口；法律只从事实标题及来源引文触发，排除旧分析文本触发；类案按国家/产业关键词/交易结构计分并说明理由，最多8条。
- P0 限制：不足3条有依据类案时明确缺口，不补无关类案；条款仅映射已有结构字段，缺失待核；条件方案为可审阅规则草案，未经个案人工确认。
- P1：人工复核taxonomy/title/legal false-trigger修正；完善条款同义词映射、行业编码与3–8条高质量类案；深度财务模型、估值与方案责任人。
- P2：跨市场实体解析、法律规则版本、情景测算、长期项目跟踪与跨案例结论。

### 港股

- P0 已交付：发行人+交易类型+标题相似度+90日日期邻近或标题/摘要引用前次公告日期的保守聚类，不按发行人直接合并；同日期同标题重印去重；首次披露按事件已收录最早来源计算；importance仅排序。CCT≠投并购，关连交易单列；董事变更归治理；收购守则/私有化、配售供股及须予披露/主要/非常重大分类；SFC独立external流。缺金额标注「PDF首页未抽取」。
- P0 已交付文件角色：首次公告/补充公告/延迟寄发/通函/IFA/投票结果/完成/终止/其他；阶段按最新文件功能。首份文件不明角色才标首次公告，首次收录不保证为全历史首次公告。「完成」统一提示范围待核，不推定全部交割。
- P1：繁简与英文同义词进一步归一、跨语言海外公告重印识别、引用日期多格式解析、同发行人多交易人工拆并；首次披露全历史核查；抽取Chapter14比例测试、14A豁免、股东批准、控制权与独立IFA结论。P0这些字段无证据时待核。
- P2：长链持续追踪与期限告警、类案审核库、监管执法实体图谱。P0港股类案区为缺口提示，不生成无依据类案。

### SEC

- P0 已交付：424B*、FWP、structured notes分入capital_markets，默认隐藏；material按CIK、表单族、30日（无交易对手）至120日（有交易对手）窗口及共享对手/引用accession/高标题相似度聚类。来源展示form/item与记录中已有exhibit字段，M&A和融资走同一详情模板。
- P0 金额语义：Transaction Value / EV / Equity / Purchase Price / Debt Principal / Financing Commitment / Offering Size / Share Price / Conversion / Par / Termination Fee / Earnout / Regulatory Threshold / Unknown；上下文正则分类保留置信度和摘录；par value $0.001、minimum bid $1.00、registration fee、per-note price、conversion price、coupon从交易对价剔除。Unknown保留待核，不推断交易总价。
- P1：exhibit-first读取2.1协议、10.1重大合同、99.1新闻稿，当前仅展示已收录字段，不补抓缺失附件；解决多金额邻近歧义、跨表单交易聚类与单申报多交易拆分；完善M&A与融资专属字段及类案。
- P2：协议条款全文差异、跨境主体对齐、融资摊薄模型、组合事件图谱。

## 验证与运行

`python3 scripts/build_site.py && python3 scripts/validate.py`。validate检查标准字段、来源标签和跨市场事件ID唯一性，并保留原校验；默认链接检查只读本地缓存，显式 `PUBX_VALIDATE_NETWORK=1` 才请求网络。所有新增JS运行 `node --check`。构建产物不得提交，sync_guard仍拒绝events_data.js（接受构建不代表接受推送）。

## 20261027p05

构建生成 events_outbound.js、events_hk.js、events_us_material.js、events_us_capital.js 与 events_index.js；全部由 assets/events_*.js 忽略，不提交。app.js 统一协调研究路由及 HK/US 标签页，等待当前分片并防止异步导航覆盖新路由；加载失败回退原页面，后续导航可重试。

SEC exhibit-first 仅读现有 state 文本与附件结构，无网络抓取。附件按编号、描述判断性质并标 analysis，保留核心标志、来源 doc_id 与 EDGAR 链接；没有附件 URL 时明确链接为 filing/index，不伪造附件地址。正则仅摘取原文附近的 termination fee、outside date、per-share consideration、principal、interest、maturity；未定位到附件的条款保留在 extracted_filing_terms，不归因到某协议。merger_agreement_terms / credit_agreement_terms 为「未抽取」占位。当前 us_market 无结构化 exhibit 字段，raw_manifest 仅缓存指针，不把指针当正文。

HK 从标题、摘要、category codes/excerpt 派生 Ch14、14A、持续关连、年度上限、百分比率、IFA 名称/结论、独立股东批准、收购守则条款及清洗豁免；仅显示可匹配文本，缺项明确「未披露/未抽取」，不据此断言发行人未披露。海外监管公告重印仅在相同发行人、同日、去除明确前缀后标题完全相同才去重，避免跨交易误合并。

## P0.6 全文抽取层（2026-10-27）
- `scripts/extract_research_terms.py`：读本机 `raw/hkex_market/*.txt`（港股通函/关连/主要交易 PDF 前 80 页 pdftotext）与 `raw/sec_exhibits/`（8-K Item 1.01/2.01/2.03 的 EX-2.1/10.1/10.2）→ `state/research_extracts.json`（入 git，约 180 KB；raw 仍不入 git）。CI 构建只读该 json。
- 港股：ifa_name（释义「獨立財務顧問」指…）、ifa_conclusion（吾等認為…公平合理＋建议投票，排除「是否公平合理」设问句）、percent_ratio、annual_cap、whitewash；每项带原文 quote/来源/置信度，无原文则保持 未抽取。
- SEC：merger_agreement_terms（终止费/Outside Date/Exchange Ratio/每股对价（排除面值）/MAE/go-shop/no-shop/适用法）、credit_agreement_terms（本金/利率/到期/财务契约/担保/转换价）；Securities Purchase Agreement 归融资，不归并购。
- 覆盖：港股 581 份全文 → 277 份有抽取（% 比率 252、IFA 名 51、IFA 结论 18、年度上限 54、清洗豁免 6）；SEC 181 份 8-K → 177 索引、123 份附件全文 → 30 份有条款（11 并购、19 融资；19 份含实质条款）。
- 待办：IFA 函件分段定位（区分 IBC 与 IFA 原话）、SEC S-4/DEFM14A/SC TO 附件、终止费/Outside Date 召回偏低、每日 ingest 增量拉取 raw（目前为本机一次性拉取）。
