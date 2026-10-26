# P5 第4轮审查与修复

## 借鉴与审查依据

- 李成工作站/licheng-ai-site：source-manifest 精确版本与自动验收，落实 scripts/pipeline_state.py、#/about 和页面检查。
- Gardner’s Vault：公司/项目→问题→出处、原始与派生信息分开，落实进展字段 diff + source_doc_ids、详情原值留痕及采集 prompt。
- 已阅读 R08、ACCEPT、kimi_reply1、benchmark_spec、REF_ashare_outbound、cron_prompt_new 与 /tmp/PubX/ops。用户最新撤销 B 的决定优先于旧 cron 文档。审查 git show HEAD（上一轮 51d28e0）及当前页面；起始工作区无未提交差异。

## 具体问题及修复

1. event_merge 写 batch/change，页面读取 batch_id/type/date/doc_id/note；update_type_latest 英文也与现存中文契约不一致，导致新更新在首页被漏计。统一持久化字段，新建也生成新增记录；主键重放仍幂等。另在浏览器内存使用实际事件做隔离集成验证，merge生成的新增记录可在首页更新带读到（P5-round4-integration.json），未写入生产数据。
2. progress 仅存阶段与来源，新增事实被丢弃。现在保存 diff 的 old/new 与 source_doc_ids，不覆盖旧事实；事件详情可展开逐项核对。
3. 空来源与非法类型可进入新事件分支。归并前拒绝空事件ID、空来源、重复来源主键、非法类型。
4. 源站抛错会直接中断缓存接续。现在仍审核本窗口缓存，记录 collection_error/collection_complete，返回非零，回溯游标不完成；批次说明明确不是成功零新增。
5. #/about 固定链接第三轮报告且称本轮；更新第四轮原文核查和 prompt 版本。通用 prompt 仍宣称 run_once 自身采集三渠道，已改为巨潮入口+分别执行其他 pull。

## 用户六项标准核验

- 独立用途：出海的总览/库/议题/企业/专题/看板/方法及 SEC、HKEX、出口管制分别可访问；未跨模块合并数据文件。
- 首页：日批五类与回溯单列、头条事实/判断/证据可见；修复未来入库更新记录漏计。
- 原文：重新 GET 精工、安踏、红隼3份PDF，User-Agent、逐条间隔1秒；金额/主体/阶段核验见 P5-round4-source-audit.json。精工中标/签约两种原文表述保留边界；安踏本完成公告未披露对价；红隼完成交割不能倒推具体审批。
- 数字口径/分析依据：人工检查首页日批窗口、全库样本、模块独立统计及三层依据标记；未把核查报告当新日批。
- 持续更新：11个测试通过；最近3个非空批次回放1+2+5份来源全部重复，60事件不变，马赫芯仅E-049。
- 页面操作/排版：shot.py 实跑11路由×1440/390，全部H1=1、无横向溢出、无JS错误；已查看首页桌面、方法手机、美股手机、出口管制桌面截图。validate 另查375/768/1280、旧路由及站内链接，结果见 state/validate_report.json。

## 交接与边界

- 新增业务事件0条；新增3份原文复核记录，保留64披露/60事件；seen 为86/5/10，65/65来源主键有原文缓存，无需补造状态。
- 日更/周更 bash 语法和 PUBX_DRY_RUN 展开通过；未运行付费模型任务，不冒充连续两天实时采集。B禁用入口仍返回64。
- /tmp/PubX/ops/_common.sh 仍是另一副本的旧运行器，含stash/commit/push。未修改该外部副本；调度方须使用本仓库ops入口，不能继续引用旧副本。无token写入；无commit/push。
- 旧15条批次命名保留（WARN），构建为日批视图；IR覆盖与未提交扫描历史不可反推，见 docs/missing_state.md。

## 改动文件

assets/app.js、assets/data.js；scripts/run_once.py、event_merge.py、pipeline_state.py；ops/prompts/_rules.md、daily.md、weekly_exportcontrol.md；docs/collection_pipeline.md；tests/test_pipeline.py；state/manifest.json、validate_report.json；reports/P5-round4-{review.md,source-audit.json,integration.json}。

最终 validate：ERROR=0、WARN=1、SKIP=0。唯一 WARN 为保留的15条存量批次旧命名；页面检查22路由×375/768/1280通过，详情见 state/validate_report.json。
