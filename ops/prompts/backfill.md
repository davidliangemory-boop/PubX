## 20 天补漏
读取 state/backfill_cursor.json。如有 pending，续接原窗口并保留原批次ID；否则窗口为北京时间今天前20天至昨天。
执行 python3 scripts/run_once.py --backfill-days 20；python3 scripts/sec_market_pull.py --backfill-days 20；python3 scripts/hkex_market_pull.py --backfill-days 20。
对每份 pending 原文完成三步审核，按 docs/collection_pipeline.md 写 review 后重跑；只在三模块均完成时更新 cursor 为 completed，部分失败标 pending 并记录错误。披露日保留原值，found_by=backfill；更新带单列回溯补入数。不提交、不推送。
