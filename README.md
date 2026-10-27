# 企业出海研究工作台（PubX / cninfo-watch）

面向商务、投资、财务、法务的企业出海研究工作台：**理解趋势 → 发现企业动作 → 深入项目 →
分析经营及合规影响 → 跟踪后续变化 → 核验原文**。

## 功能结构（P1：一级导航四分页面）

一级导航四个平级分页面，**数据文件、统计口径互不混用**：

- **出海信披归纳**（`#/research?v=events`，仅中企）：总览 / 事件库 / 类案研究 / 方法；
  企业档案、国家与产业、项目跟踪、法律议题与旧文件视图在“更多”。`#/events` 转入研究事件库。
- **美股 SEC**（`#/us?v=events`）：重大商业事件为主，资本市场流水作为特色栏目，旧文件视图在“更多”。
- **港股 HKEX**（`#/hk-market?v=events`）：连续事件为主，收购与私有化作为特色栏目，旧文件视图在“更多”。
- 三市场详情均使用 `#/event/:id` 研究文章；二级主导航统一为总览 / 事件库 / 市场特色栏目 / 方法。
- **出口管制**（`#/export`）：BIS / OFAC / UFLPA，三栏目 = 执法案例更新 / 清单更新 / 规则更新；
  原 SDN 筛查并入为「观察名单比对」子视图（**同名≠命中**，仅名称相同只记「名称相似」）。

纪律：禁止虚构数据；发布时过滤空字段与内部占位值；缺少的关键事实进入具体观察问题；每条陈述区分 disclosed（公司披露）/
external（外部事实，附来源）/ analysis（系统分析，写依据）。事件结构见 `docs/schema.md`
（`scripts/schema.py` 实现），质检见 `scripts/validate.py`（报告在 #/about → 质检报告）。

## 数据链路（保留原有自动更新发布）

```
定时任务（代理平台，每交易日 1 个日批次，批次号 D-YYYYMMDD；同日多轮合并展示）
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

**批次命名**（docs/schema.md §6）：日批次 `D-YYYYMMDD`（同一自然日多轮运行合并进同一批次）；
回溯批次 `B-YYYYMMDD`（存量旧记录 `B-BF-*` 在展示层归并为 B- 系列）；出口管制周批 `W-YYYYWW`。
首页「本次更新带」与批次简报按日批次展示，回溯补入单列；存量 `B-YYYYMMDD-HHMM` 旧批次
不改原始记录，由 `scripts/build_data.py` 聚合为日批次视图（`batches_daily`）。
采集脚本统一支持 `--date YYYY-MM-DD`（扫描该日北京时间 00:00–24:00）与
`--backfill-days N`（默认 20）：`run_once.py` / `hkex_pull.py` / `sec_pull.py` /
`backfill_pull.py`（后者用 `--end + --backfill-days`）。
巨潮 PDF 原文链接在构建层升级为 https（`http://static.cninfo.com.cn` 在部分网络被断；
仅改写 assets/data.js 展示层，state/ 原始记录不动）。

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
| 更新频率 | 日批次（D-YYYYMMDD） | 每交易日日批次（D-YYYYMMDD），回溯补入单列（B-YYYYMMDD） |

模式二部署：仓库根目录即站点；Pages Source 选 GitHub Actions；保留 `.github/workflows/ingest.yml`
（不要加会响应 repository_dispatch 的第二个 workflow）。运行器在仓库外管理认证；不得将任何 token 写入仓库或日志。当前 ops 只采集、审核、验证与构建，提交及发布由调度方执行。

迭代记录：v1–v3 见 CHANGELOG.md；v4（六轮：信息层级/工作台布局/渠道字段/检索机制/真实数据/打磨验证）见 迭代记录v4.md。
