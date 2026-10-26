## 任务 C：出口管制周更（每周六 09:00）
任务：PubX 出口管制周更。运行 python3 scripts/export_pull.py --since {7 天前} --backfill-days 20：执法案例更新（BIS 行政执法/和解、OFAC 执法公告、CBP/UFLPA 执法）、清单更新（Federal Register 实体清单新增/移除、OFAC Recent Actions SDN 增删、DHS UFLPA Entity List）、规则更新（EAR/OFAC 法规、通用许可、FAQ、指南）。每条：发布日期、机构、文件号（FR doc number/OFAC action id 等）、涉及主体、中国关联、要点、合规影响（标 analysis）、原文链接。更新名单版本/条目数/sha 后，对出海事件 parties 做观察名单比对（同名≠命中，附依据）。然后通用规则 6–8，batch_id=W-{年周}，只推送 state/export* 与 assets/export_data.js。

