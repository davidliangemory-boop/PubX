# P5 第 2 轮审查

本轮借鉴：李成律师工作站 / lennonli/licheng-ai-site 的逐题拆解、字段证据定位与 source-manifest，落实到 scripts/analyze.py、pipeline_state.py 和 #/about。
本轮借鉴：Gardner’s Vault 的公司/项目→问题→出处结构及原始/派生口径分离，落实到 ops/prompts/_rules.md、方法页核查路径与候选新发现/待审核双计数。
参考已读：REF_ashare_outbound、REF_hk、REF_us、REF_exportcontrol，以及 R08、ACCEPT、规格与 cron_prompt_new。旧 cron 文档中的 B 任务服从 2026-10-27 撤销指令。

## 发现及修复

1. 上轮仍有可运行的任务 B 入口和提示词。现旧入口返回 64，提示词明确撤销；历史滚动回溯保留，手动参数与 backfill_cursor 保留。
2. 三步审核允许空数组，字段证据只依赖摘要引文匹配。现三步均需非空，字段证据逐页核对；analysis/external 检查扩展到入库 event；数值 0 不转换为未披露。
3. HKEX/SEC 同日重跑覆盖候选文件，而 seen 已消费发现主键。现合并保留候选；新发现与保留候选分计；提示词要求跨日查历史候选，发现不等于入库。
4. HKEX cursor 存 YYYY-MM-DD，但接口 fromDate 要 YYYYMMDD。查询前规范格式；NEWS_ID 统一字符串，避免类型差异漏去重。
5. manifest 无待审口径，方法页难看出采集到分析链路。现展示公司/项目→触发事实→问题→缺口→依据→核查动作，披露 pending_review 的适用范围和三条原文核查入口。
6. schema 模块元数据仍指向不存在的 events_us/events_hk/events_export。改为实际 us_market/hk_market/export.json。
7. run_once 先构建再交 ops 验证，错误状态可能生成页面。改为构建前验证失败立即停止；增加失败不构建测试。
8. 恢复审计把 scanned 描述为已收录，混淆扫描/排除与入库。现按真实现存数量审计、保持所有原文件；65/65 来源主键缓存齐全。

## 内容与原文

未新增事件。重新 GET 三份完整官方 PDF（带 UA，每次间隔 1 秒），pdftotext 逐页核对精工钢构 #1、安踏 #22、红隼 #23；完整发现及文件 SHA-256 在 P5-round2-source-audit.json。
精工 P1 重要提示称中标，正文另明确成功签约，P2 列具体分包主体与付款条款；原有中标标签是保守标签，不应等同尚未签约。安踏本公告未载对价；红隼的具体审批结论必须按不同公告分别定位。

## 验证

- shot.py 修改前后实跑并查看首页、方法页桌面/手机及出口管制手机截图。修改后 10 个当前页面与 6 个旧路由 × 1440/390，32 项均 overflow=False、H1=1、JS errors=[]；截图 /workspace/kc/shots/P5-r2-after。
- validate 全站 22 路由 × 375/768/1280，150 站内链接；结果见 state/validate_report.json。
- 七项 unittest 通过，包括错误页码拒收、空步骤拒收、0 值保留、待审候选重跑、日界及归并幂等。
- 最近三个非空存量批次离线回放 1/2/5 份来源全部重复，60 事件不变，马赫芯仅 E-049；不冒充线上新批次实跑。
- 日更/周更运行器 dry-run、bash -n、node --check、git diff --check 通过；撤销入口返回 64。

## 遗留

没有执行新的线上定时采集、没有提交或推送；连续两日日更与周更真实调度需由调度环境执行。IR 自动接入、BIS/UFLPA 逐主体独立标识比对仍需补充，提示词明确不得声称覆盖。Kimi Code 对非巨潮候选需按契约同时维护事件及披露两层，尚未统一为单一自动入库命令。历史批次命名保留为 1 项 WARN，前端按日聚合。没有删除用户 state 原始数据。

## 改动文件

- assets/app.js
- assets/data.js
- docs/collection_pipeline.md
- docs/missing_state.md
- ops/prompts/_rules.md
- ops/prompts/backfill.md
- ops/prompts/daily.md
- ops/prompts/history_backfill.md
- ops/prompts/weekly_exportcontrol.md
- ops/run_backfill.sh
- scripts/analyze.py
- scripts/hkex_pull.py
- scripts/pipeline_state.py
- scripts/recover_state.py
- scripts/run_once.py
- scripts/schema.py
- scripts/sec_pull.py
- state/manifest.json
- state/validate_report.json
- tests/test_pipeline.py
- reports/P5-round2-source-audit.json
- reports/P5-round2-review.md
