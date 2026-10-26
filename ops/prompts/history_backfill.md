## 任务 D：历史滚动回溯（每天，与日更并行）

规则（用户 2026-10-26 语音确认）：
1. 每天跑一轮，窗口固定 30 天。
2. 第 1 天：回溯「最近 30 日」（今天往前 30 天至昨天）。
3. 第 2 天：回溯「31–60 天前」，之后每天再往前推 30 天。
4. 一直推到窗口触达 2020-01-01 为止；触达后本任务停止或改写状态为 done，不再往前。
5. 覆盖：A股新批（出海信批/巨潮）、港股新批、美股新批、OFAC/出口管制相关（含 BIS 执法与清单若脚本支持）、以及持仓清单（对观察名单/持仓做比对更新，同名≠命中）。
6. 与现有「每日更新」并行，互不替代；batch_id 用 H-YYYYMMDD（运行日）+ 窗口起止写入日志。

执行步骤：
1. 读取 ops/state/history_backfill_cursor.json（若仓库内有 state/history_backfill_cursor.json 优先用仓库内）。取 next_window_start / next_window_end。
2. 若 next_window_end < 2020-01-01，或 next_window_start 已早于 2020-01-01 且本窗无剩余天数：写 status=done，更新带注明「历史回溯已触达 2020-01-01」，结束。
3. 对本窗口 [start, end] 重跑采集（按日或 --date / 日期范围）：
   - A股：run_once.py（或等价）覆盖窗口内各日
   - 美股：sec_market_pull.py
   - 港股：hkex_market_pull.py
   - 出口管制/OFAC：export_pull.py --since start（至少覆盖 OFAC；能带 BIS 则带）
   - 持仓清单：对持仓主体跑观察名单比对并更新页面/state，写清同名≠命中
4. 已收主键只判定重复/进展/修正；新发现按披露日入库，found_by=history_backfill，窗口写入批次 meta。
5. 跑完后：把本窗记入 completed_windows；next_window_end = 本窗 start 的前一天；next_window_start = next_window_end 往前 29 天（共 30 天）；更新 updated_at；status=running。
6. 通用规则同日更（去重、分析、validate ERROR=0、白名单审阅后推送）。更新带单列「历史回溯 H-日期：窗口 start～end，补入/进展/修正计数」。


## 网站同步（用户 2026-10-26 语音补充，强制）
回溯产出必须按网站现有分析与呈现要求，同步更新到 PubX 对应页面，按白名单审阅后由调度方发布（推送 main），而不是只写进度文件：
- A股新批 → 出海信批归纳（首页更新带、事件库、相关详情）
- 港股新批 → #/hk-market
- 美股新批 → #/us
- OFAC/出口管制 → #/export（执法/清单/规则及观察名单比对）
- 持仓清单 → 出口管制观察名单比对或持仓相关视图（同名≠命中）
遵守 disclosed/external/analysis 区分、来源可点开、validate ERROR=0、白名单审阅与推送；batch 写入首页“本次更新带”的历史回溯条目。
