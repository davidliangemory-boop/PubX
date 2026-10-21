# 企业出海披露情报台（cninfo-watch）

监测巨潮资讯网"企业出海"相关披露：定时检索 → PDF正文读取 → 实质筛选 → 25字段结构化分析 →
连续案例跟踪 → 静态网站自动发布。**同一链接永久有效，内容随每次批次自动更新，无人工发布环节。**

本仓库有两种运行模式，**二选一**：

| | 模式一：GitHub 原生 | 模式二：混合模式（零 API 费用） |
|---|---|---|
| 分析在哪里跑 | GitHub Actions 调 Moonshot API | 外部定时任务（Kimi Agent，消耗订阅额度） |
| GitHub 需要的配置 | Secrets：`MOONSHOT_API_KEY` | 无 Secrets |
| 更新频率 | 每2小时 | 每交易日 08:00 / 18:00（跟随任务批次） |
| 适用 | 没有 Kimi 订阅 | 已有 Kimi 订阅（推荐） |

## 模式二：混合模式（推荐，零 API 费用）

分析由你现有的 Kimi 定时监测任务完成（走订阅额度，不产生 API 账单），任务每批次把
`data.js` 推送进本仓库并触发自动部署。GitHub 只是存储和展示层。

部署步骤：

1. **建仓库**：GitHub 新建公开仓库（建议名 `cninfo-watch`），把本文件夹内容推上去
   （浏览器操作：建库 → uploading an existing file → 拖入文件夹内全部内容，注意仓库
   根目录直接就是 index.html；`.github` 隐藏文件夹也要在内）。
2. **只留 ingest**：删除 `.github/workflows/crawl.yml`，保留 `ingest.yml`。
3. **开 Pages**：Settings → Pages → Source 选 **GitHub Actions**（必须部署前完成）。
4. **任务侧配两项**（由任务的维护者操作，不在 GitHub 上）：
   - `state/github_repo.txt` 写入 `owner/repo`
   - `state/github_token.txt` 写入 fine-grained PAT（仅本仓库；Contents: Read/Write +
     Pages: Read/Write），用于推送与触发部署
5. 任务下一批次自动完成首次推送 + 触发部署；也可在 Actions 页手动 Run workflow 验证。

触发链路：任务推送 commit → POST `repository_dispatch(ingest)` → `ingest.yml` 组装站点 →
Pages 部署，约 1~2 分钟生效。日常运行**不需要你的 PAT 一直人工盯着**，但 token 被吊销后
推送会停止（网站停在最后状态，不会下线）。

## 模式一：GitHub 原生（需要 Moonshot API Key）

```
GitHub Actions（每2小时，北京时间 08~22 点）
  ① scripts/run_once.py 编排单批次：
      巨潮API检索（14组关键词，2日重叠窗口）→ 公告ID去重
      → 下载PDF、pdftotext抽正文 → LLM筛选门（排除误匹配/制度文件/资本运作）
      → LLM 25字段分析（数字逐字来自原文，禁止编造）
      → 逐字摘录回原文校验并标注PDF页码（对不上就丢弃，不造假页码）
      → 同一公司新事件触发连续案例判断更新 → state/db.json 入库
  ② git commit & push 回写数据库
  ③ GitHub Pages 自动重新部署 → 同一链接立即显示最新内容
```

部署步骤：

1. 建仓库并推入本文件夹内容（同模式二第1步）。
2. Settings → Secrets and variables → Actions → New repository secret：
   名称 `MOONSHOT_API_KEY`，值为 Kimi 开放平台 API Key（platform.kimi.com 注册即送15元额度）。
3. Settings → Pages → Source 选 **GitHub Actions**。
4. Actions → crawl-and-publish → Run workflow。绿勾后访问
   `https://<用户名>.github.io/cninfo-watch/`——此链接永久固定。

成本：Actions 免费额度内；LLM 每份公告约1毛钱，一个月通常几元，赠送额度大概率够用一年。

## 目录结构

| 路径 | 作用 |
|---|---|
| `index.html` / `assets/` | 前端（无构建静态站）；`assets/data.js` 为生成物，两种模式都靠它驱动 |
| `scripts/cninfo.py` | 巨潮检索、PDF下载、正文抽取、摘录页码定位（模式一用） |
| `scripts/analyze.py` | LLM筛选门 + 25字段分析 + 案例判断更新（模式一用） |
| `scripts/run_once.py` | 单批次编排（模式一用；`--dry-run` 只检索 / `--rebuild` 只重建） |
| `scripts/build_data.py` | `state/db.json` → `assets/data.js`（两种模式共用） |
| `state/db.json` | 主数据库：披露条目、批次、异常、游标、已扫清单 |
| `state/config.json` | 关键词组、数据源、筛选规则、种子案例 |

模式二下 `scripts/cninfo.py / analyze.py / run_once.py` 不参与运行，留在仓库无害
（后续想切回模式一可直接用）。

## 已知风险与对策

| 风险 | 对策 |
|---|---|
| 巨潮 API 拦截 Actions 境外IP（模式一日志里检索持续报错） | 改走模式二（分析挪到能访问巨潮的环境） |
| LLM 输出非法JSON（模式一） | 自动重试1次，仍失败记入批次 failed 与异常页，不脏入库 |
| 摘录与原文对不上 | 丢弃该条摘录（页码只标校验通过的），网站如实呈现 |
| 无新增公告 | 不制造空更新：模式一直接连提交部署都跳过；模式二提示"数据无变化" |

## 数据口径与诚实边界

- 仅覆盖巨潮资讯全站披露；SEC/HKEX/官网渠道未接入（数据源页明示）。
- 收录/排除均留痕：批次简报、排除类别统计、误匹配与失败记入「异常与边界」页。
- 所有金额/比例以公告原文为准；"签约≠收入实现、额度≠已支付、备案≠投产"。
- AI问答检索、OCR、更细粒度扫描未实现，前端不伪装。

## 本地调试

```bash
pip install pypdf
python3 scripts/run_once.py --dry-run   # 只检索+下载+抽正文，不调LLM
python3 scripts/run_once.py --rebuild   # 不抓取，按db.json重建data.js
```
