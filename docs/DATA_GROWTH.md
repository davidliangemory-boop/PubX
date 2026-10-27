# 数据滚大治理（2026-10-27）

原则：git 存「历史」（批次日志、schema、规则变更），不存「数据本体/原件/构建产物」。

## A. 已实施：原始产物出 git
- `raw/`（PDF/HTML/TXT 原文缓存）已 `.gitignore` 并从索引移除；文件仍保留在采集机本地，validate 的「引文/字段级 evidence 回原文」继续用本地缓存比对。
- git 只留指针 `state/raw_manifest.json`：`{文件: {doc_id, sha256, bytes, fetched_at, url}}`，由 `scripts/raw_manifest.py` 在推送前追加更新；原文按 url（或披露易/巨潮 doc_id）回源核验，sha256 校验一致。
- `scripts/sync_guard.py` 新增 DENY 清单（优先于白名单）：`raw/*`、`*.pdf/*.html`、`assets/*data.js`、`state/tmp/*`。定时任务只允许推 `state/**`。
- 历史中已有的 raw txt 约 1 MB，未改写历史（不 force push）。

## B. 已实施：构建产物不进 main
- `assets/{data,hk_data,us_data,export_data}.js` 已 gitignore、从 main 移除。
- `ingest.yml` 在 Action 内运行 `scripts/build_site.py`（纯 stdlib、不联网，仅读 state/）构建 4 个产物后部署 Pages。
- 本地 ops 仍会运行 `build_site.py` 供 validate 检查，但不提交产物。
- 发布仍需 push 后 `gh workflow run ingest.yml`。

## C. 预案（未实施）：冷热分层
触发阈值：`state/`（不含已忽略的 `state/tmp/`）超过 50 MB。当前约 25 MB（tracked）。
- 热：近 90 天窗口进 data.js（展示层当前 20 天窗口，无缝衔接）。
- 温：明细按月分片 `state/hk_market-YYYY-MM.json`，页面查历史时按需 fetch 分片（us_data 已有按需分片先例）。
- 冷：回溯完成的 2020–2025 明细，每季度打 `json.gz` 快照挂 GitHub Release；git 只留聚合统计与批次日志。

## 遗留 / 后续
- 新机器或 CI 无 raw/ 本地缓存时，validate 的回原文检查会报 ERROR（缺缓存）；如需可再加 raw 季度 tar 挂 Release 以便恢复。
- raw_manifest 的 url 目前只对港股全市场 doc 填充，其余按 doc_id 回源。
