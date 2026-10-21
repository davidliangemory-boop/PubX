# 企业出海研究工作台（PubX / cninfo-watch）

面向商务、投资、财务、法务的企业出海研究工作台：**理解趋势 → 发现企业动作 → 深入项目 →
分析经营及合规影响 → 跟踪后续变化 → 核验原文**。

## 功能结构

- **总览**：本期观察（趋势卡 / 关键事件 / 项目变化 / 区域及资金概览）
- **企业与项目**：企业档案、项目清单、生命周期看板、持股与资金结构、合规事项矩阵（负责人/状态可标注）、项目日历
- **专题分析**：国家与产业比较、政策时间线、供应链与产能布局、关系图谱（筛选/时间切换/表格）、指标比较（气泡/自选公司对比/基准表）、披露变化、历史判断检验
- **披露档案**：检索筛选、批次简报、单条六段深度分析（事实→项目进展→意义→商业模式→对标→三要素→证据与后续）、版本比较、CSV/JSON 导出
- **来源与更新**：数据源接入状态、更新记录、扫描规则

## 数据链路（保留原有自动更新发布）

```
定时任务（代理平台，每交易日 08:00–18:00 每 2 小时）
  → 巨潮 / SEC EDGAR / IR / SDN 多源扫描 + 实质筛选 + 25字段 + 六段深度分析
  → state/web_db.json（唯一准绳，含 backfill 回填队列）
  → scripts/sync_github.py 推送到本仓库
  → scripts/build_data.py + scripts/derive.py 生成 assets/data.js（含派生实体）
  → ingest.yml 部署 GitHub Pages（同一链接自动更新）
```

- 派生实体（公司/项目/区域/资金/合规/图谱/变化/判断/日历/政策）全部由 21+ 条真实披露
  与现行法规映射生成（见 `scripts/derive.py`），每条可回溯到披露原文与页码。
- 合规事项状态分「已识别（有原文证据）/待跟踪（缺口）」，不虚构完成度。
- 关注、个人备注、合规标注保存在浏览器本机（localStorage），可在「披露档案 → 导出」导出 JSON/CSV。
- 个人工作标注与公开披露数据分离保存。

## 运行模式（二选一）

| | 模式一：GitHub 原生 | 模式二：混合模式（零 API 费用，当前使用） |
|---|---|---|
| 分析在哪里跑 | GitHub Actions 调 Moonshot API | 外部定时任务（订阅额度） |
| GitHub 需要的配置 | Secrets：`MOONSHOT_API_KEY` | 无 Secrets |
| 更新频率 | 每 2 小时 | 每交易日每 2 小时 |

模式二部署：仓库根目录即站点；Pages Source 选 GitHub Actions；保留 `.github/workflows/ingest.yml`
（不要加会响应 repository_dispatch 的第二个 workflow）。任务侧配置 `state/github_repo.txt` 与
`state/github_token.txt`（classic PAT，repo 范围）。

10 轮迭代的实际改动记录见 CHANGELOG.md。
