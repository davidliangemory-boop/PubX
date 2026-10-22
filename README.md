# 企业出海研究工作台（PubX / cninfo-watch）

面向商务、投资、财务、法务的企业出海研究工作台：**理解趋势 → 发现企业动作 → 深入项目 →
分析经营及合规影响 → 跟踪后续变化 → 核验原文**。

## 功能结构（P1：一级导航四分页面）

一级导航四个平级分页面，**数据文件、统计口径互不混用**：

- **出海信批归纳**（`#/`，仅中企）：二级导航 = 总览 / 事件库（卡片·表格·时间线·港股名单）/
  法律议题 / 企业档案 / 专题研究 / 项目看板 / 方法与来源；事件详情 `#/event/:id` 一事件一记录，
  摘要全文只在此页出现。R03 旧路由（#/feed、#/arc、#/hk、#/detail/:seq 等）301 式重定向继续可用。
- **美股 SEC**（`#/us`）：EDGAR 全量、不分中外企；交易类/融资类/运营/法律（诉讼/监管处罚）/
  对外投资/经营战略重大事项六栏目。（数据采集尚未上线，骨架页如实留白）
- **港股 HKEX**（`#/hk-market`）：披露易全量，同美股口径。（同上；`#/market` 重定向 `#/us`）
- **出口管制**（`#/export`）：BIS / OFAC / UFLPA，三栏目 = 执法案例更新 / 清单更新 / 规则更新；
  原 SDN 筛查并入为「观察名单比对」子视图（**同名≠命中**，仅名称相同只记「名称相似」）。

纪律：禁止虚构数据；原文未披露显示【未披露】；每条陈述区分 disclosed（公司披露）/
external（外部事实，附来源）/ analysis（系统分析，写依据）。事件结构见 `docs/schema.md`
（`scripts/schema.py` 实现），质检见 `scripts/validate.py`（报告在 #/about → 质检报告）。

## 数据链路（保留原有自动更新发布）

```
定时任务（代理平台，每交易日 08:00–18:00 每 2 小时）
  → A股·巨潮：34个出海关键词+10项排除词，PDF 正文解析
  → 港股·披露易：30只观察名单按股拉取（NEWS_ID 去重，无需密钥）
  → 美股·EDGAR：35家中概股名单为主键（CIK/accessionNumber 去重，不用关键词检索）
  → OFAC SDN 筛查
  → state/db.json（唯一准绳）+ state/events.json（事件层，schema 见 docs/schema.md）
  → scripts/sync_github.py 推送到本仓库（按 _aid 与批次 id 双向合并）
  → scripts/build_data.py + scripts/derive.py 生成 assets/data.js（含派生实体与渠道健康度）
  → ingest.yml 部署 GitHub Pages（同一链接自动更新）

历史回溯任务（每日 06:30，每次回补 20 个自然日，目标覆盖 2020-01-01 至今）：
  游标持久化于本仓库 state/backfill.json（同步进 data.js，来源健康页可见进度）；
  每运行 = 拉仓库 → 读游标 → 三市场回补 20 天（scripts/backfill_pull.py）→ 分析入库 →
  更新游标 → 推送部署；游标到 2020-01-01 自动停止。回溯条目与前向收录同一库同一页面，
  批次以 B-BF- 前缀标识。
```

- 派生实体（公司/项目/区域/资金/合规/图谱/变化/判断/日历/政策）全部由 34 条真实披露
  与现行法规映射生成（见 `scripts/derive.py`），每条可回溯到披露原文与页码。
- 合规事项状态分「已识别（有原文证据）/待跟踪（缺口）」，不虚构完成度。
- 关注、个人备注、合规标注保存在浏览器本机（localStorage），可在「披露档案 → 导出」导出 JSON/CSV。
- 个人工作标注与公开披露数据分离保存。

## 推送分工（防覆盖）

为避免定时任务覆盖人工维护的前端与管线代码，推送权限按路径划分：

| 路径 | 维护方 |
|---|---|
| `state/**`（含 `state/validate_report.json`） | 定时任务（Kimi 网页版 `sync_github.py`，不在本仓库）可写 |
| `assets/*data.js`（数据构建产物） | 定时任务可写 |
| `index.html`、`assets/app.js`、`assets/style.css`、`scripts/*.py`、`docs/`、`.github/` | **只在仓库维护**，定时任务不得推送 |

- `scripts/build_data.py` 只生成数据文件（`assets/data.js`），不写前端代码。
- 定时任务推送前须过 `scripts/sync_guard.py`：给定待推送文件列表（参数或 stdin），
  白名单外路径一律拒绝并打印归属原因，存在拒绝时退出码为 1：

```bash
python3 scripts/sync_guard.py state/db.json assets/data.js     # 通过
git diff --name-only | python3 scripts/sync_guard.py -         # 校验一次提交的文件集
```

## 运行模式（二选一）

| | 模式一：GitHub 原生 | 模式二：混合模式（零 API 费用，当前使用） |
|---|---|---|
| 分析在哪里跑 | GitHub Actions 调 Moonshot API | 外部定时任务（订阅额度） |
| GitHub 需要的配置 | Secrets：`MOONSHOT_API_KEY` | 无 Secrets |
| 更新频率 | 每 2 小时 | 每交易日每 2 小时 |

模式二部署：仓库根目录即站点；Pages Source 选 GitHub Actions；保留 `.github/workflows/ingest.yml`
（不要加会响应 repository_dispatch 的第二个 workflow）。任务侧配置 `state/github_repo.txt` 与
`state/github_token.txt`（classic PAT，repo 范围）。

迭代记录：v1–v3 见 CHANGELOG.md；v4（六轮：信息层级/工作台布局/渠道字段/检索机制/真实数据/打磨验证）见 迭代记录v4.md。
