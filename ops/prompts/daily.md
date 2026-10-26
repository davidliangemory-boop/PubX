## 任务 A：每日更新（每天 01:30）
任务：PubX 每日更新。scan_date=北京时间昨天。执行：
python3 scripts/run_once.py --date {scan_date}（巨潮候选→直接原文审核→重跑入库）；python3 scripts/sec_market_pull.py --date {scan_date}；python3 scripts/hkex_market_pull.py --date {scan_date}。只覆盖 scan_date 北京时间 00:00–24:00 发布的披露（SEC 按 acceptance 时间换算北京时间）。然后通用规则 2–8，batch_id=D-{scan_date}。不运行出口管制采集。


出海观察名单另跑 python3 scripts/hkex_pull.py --date {scan_date} 与 python3 scripts/sec_pull.py --date {scan_date}。保留原始候选，在原文完整可读后按同一 review/event_merge 契约入库。IR 无配置来源不得声称已扫描，须在异常中写明未覆盖。
另运行 python3 scripts/watch_updates.py --date {scan_date}，补检在册观察主体近180天“进展/完成/终止/延期/更正”。输出只是候选，不混入日批次扫描/收录统计；按披露日原文审核后以回溯来源单列。H股/D股上市须归 matter_type=listing_abroad，不因上市属性排除。

先检查 state/raw_hkex_*.json 与 state/raw_sec_*.json 的历史未入库候选（以 events.docs 为准），再处理本日输出；发现去重 seen 不代表完成分析。对审核通过的非巨潮候选，用 scripts/event_merge.py 归并事件，同时按文档契约维护 db.json 的披露与对应日批；两层主键必须一致，不得只更新其中一层。处理失败保留候选和原文，日报列明待审，不报告为零新增成功。

接续核验：`collection_complete=false` 或 `collection_error` 非空表示该日检索未完成，即使缓存资料已审核完也不能报告成功或“本批零新增”；保留异常后重跑。入库后检查 changelog 有 date/type/batch_id/doc_id/note（type 为中文五类），首页对应 D 批次可见；进展的新字段在 diff 中保留并逐项核查，不覆盖已核事实。

交付检查：巨潮批次扫描数按 candidate_ids 去重，candidate_attempts 单列；awaiting_raw 必须先补下载，不能用摘录补造原文。各渠道的完成状态、待审与失败分别列出，不能把脚本退出或主键进入 seen 当作审核完成；原文缓存 raw/** 随结果交接。未配置 IR 写未覆盖。
