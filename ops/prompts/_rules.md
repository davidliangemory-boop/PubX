# PubX 定期更新通用规则（Kimi Code 非交互执行）


以下规则对 A/C/D 三个任务都适用：

0. 同步与分工（防覆盖，最重要）：
   - 你在运行参数给出的仓库内运行（调度方负责预先同步；不得覆盖现有工作区）；scripts/ 以仓库版本为准。分析（extract_facts/legal_map/judge）由你（Kimi Code）直接读原文完成，不调用 MOONSHOT API。
   - 本任务仅允许更新：state/** 与 assets/data.js、assets/us_data.js、assets/hk_data.js、assets/export_data.js。
   - 严禁改写 index.html、assets/app.js、assets/style.css、scripts/**、docs/**、README.md（前端与脚本由仓库维护方改）。如认为脚本需修改，写入 state/exceptions 留言，不要自行推送。
   - 不要 git commit/push/stash/reset，由外部调度方审阅后提交；不要写入任何 token。
1. 采集：
   a) 出海信批：python3 scripts/run_once.py 拉取巨潮、HKEX、SEC、公司 IR 中企新披露，原文存 raw/{doc_id}.txt（记 sha256）；对观察名单补检“进展/完成/终止/延期/更正”公告。
   b) 美股：python3 scripts/sec_market_pull.py（EDGAR daily-index 增量，accession 去重）→ state/us_market*。
   c) 港股：python3 scripts/hkex_market_pull.py（披露易全市场分类增量，NEWS_ID 去重）→ state/hk_market*。
   d) 出口管制：python3 scripts/export_pull.py（Federal Register 实体清单/EAR 规则、OFAC Recent Actions/执法、BIS 执法新闻、DHS UFLPA Entity List、CBP UFLPA）→ state/export*；同时更新 SDN 等名单版本、条目数、sha。
   （脚本名以仓库 README 为准。）
2. 门控（出海信批）：只保留境外投资、设厂、并购、合资、销售/EPC、融资担保、退出、诉讼、监管、境外上市事项；排除理由写入批次日志。美股/港股全量收录融资、投并购、运营、法律（诉讼/处罚）、对外投资、经营战略重大事项，不限中企。
3. 先比对既有数据再入库（各模块各自去重）。对每份新披露判定：
   - 重复：主键已收或无新信息 → 只追加 sources，不新建；
   - 进展：同公司同标的阶段前移或新增事实 → 追加 stage_chain 与 changelog，不改写已核事实；
   - 修正：与既有字段冲突且原文明示 → 改字段，旧值/新值/理由写入 changelog；
   - 失效：终止、撤回 → status=terminated；
   - 新增：无匹配 → 新建。跨渠道同一事项（A 股公告与 6-K 等）合并为一个事件，source_diff 记口径差异。
4. 分析：extract_facts（value|null + doc_id/page/quote≤60 字，未载明为 null 显示【未披露】，不得推测）→ legal_map（议题二级码，无审批字样不得写已审批）→ judge（影响、跟踪点、缺口、执业提示，标 analysis 并写依据）。进展/修正事件输出“维持/修正/推翻”及理由。
5. 出口管制观察名单比对：对出海事件 parties 比对 SDN/实体清单/UFLPA；仅同名标 name_match_only 并附匹配依据（名称、地址、国别、标识号），不得写“命中”。
6. 自检：python3 scripts/validate.py，ERROR 必须为 0，否则停止构建并写 exceptions。
7. 构建与交接：python3 scripts/build_data.py 生成数据文件与首页“本次更新带”、manifest（脚本 commit、模型、prompt 版本、batch_id）；（本脚本不推送，由外部调度方负责）
8. 回复：batch_id 与时间范围；四模块各自扫描/收录数；出海五类更新各列事件标题；修正项旧值→新值；validate 结果；异常与遗留。无新增时如实写“本批未发现新增”。
禁止虚构数据、金额、日期、审批状态；无法核实写“【未披露】”或“待核”。



R08 可执行衔接：
- run_once.py 默认不调用 MOONSHOT API。模型名从实际会话读取并写入 review.model，不知道则写未记录，不能把运行器名字冒充模型名。首次采集将候选写入 state/pending/<doc_id>.json，原文在 raw/<doc_id>.txt。退出1且有 pending 表示尚待分析，不能当作零新增成功。
- 逐份读取全部原文和 state/events.json，按 docs/collection_pipeline.md 契约写 state/analysis/<doc_id>.json，再运行完全相同的采集命令入库。不要伪造审核结果，不要用摘录代替原文。
- 三步必须完整：extract_facts → legal_map → judge。judge 的每个分析条目标 analysis 并写 basis；外部事实写 source；quote ≤60字且在对应原文页。
- event v2 放在 review.event；同一事项明确 target_id 与 update_type；修正附 reason；case_update 写维持/修正/推翻及理由。相似度仅用于提示，不能自动认定同一事项。
- 回溯失败时读 state/backfill_cursor.json 重跑未完成窗口；全部完成后才将其设 completed。
- 本轮不依赖任何 API token；不得从配置或日志输出 token。

任务 B 已于 2026-10-27 撤销，不运行 ops/run_backfill.sh，不创建 03:30 定时任务。--backfill-days 20 仅保留为手动采集能力。

问题级分析组织：公司/项目 → issue_code + 问题 → 触发事实（doc_id/page/quote）→ 已披露处理状态 → 信息缺口 → 判断及 basis → 可执行核查动作。每个问题逐一回答，未适用的列明理由；不能由“交割完成”倒推具体审批完成。
