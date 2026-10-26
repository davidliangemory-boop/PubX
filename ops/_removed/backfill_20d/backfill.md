## 任务 B：回溯补漏（每天 03:30）
任务：PubX 回溯补漏。对 [今天-20 天, 昨天] 重跑三条采集：run_once.py / sec_market_pull.py / hkex_market_pull.py 均加 --backfill-days 20。已收主键只判定重复/进展/修正，不新建；新发现的按其披露日入库并标 found_by=backfill。然后通用规则 2–8，batch_id=B-{今天}。更新带写“回溯补入 X 条、进展 Y、修正 Z”。


回溯游标存 state/backfill_cursor.json（续接上次进度）。
