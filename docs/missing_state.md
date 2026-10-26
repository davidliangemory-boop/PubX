# 沙箱状态恢复审计

依据：state/db.json、state/events.json、assets/data.js、当前 Git 可达历史。未删除任何用户原始数据。

- seen.json：现存 86 个 scanned；可重建 86 个。保留现有文件；seen 的 scanned 包含历史排除项，不等于收录数。
- sec_seen.json：现存 5 个 acc；可重建 5 个。保留现有文件；seen 的 scanned 包含历史排除项，不等于收录数。
- hkex_seen.json：现存 10 个 news；可重建 10 个。保留现有文件；seen 的 scanned 包含历史排除项，不等于收录数。

原文：65/65 个来源主键有 raw/<doc_id>.txt。

## 不能无损恢复的状态

- 沙箱中从未提交的全量扫描/排除/失败历史、逐公司最新扫描游标、HKEX stockId 缓存：无法从收录结果反推；继续用重叠窗口查询。
- 原文缓存只能保留真实原文，不能从分析或摘录拼造。现有 raw/index.json 仅记录既有抓取结果，不补造下载时间。
- 完整 SEC/HKEX 采集覆盖与公司 IR 自动接入未能由存量收录证明；接口失败必须记录，不宣称全量成功。
- SEC 新采集已跨相邻美东索引并按 acceptance 转换北京时间；旧存量的申报日与未记录的 acceptance 无法无损重建，保持原值，不猜测转换。

缺失原文主键：无（库内来源主键均有缓存）
