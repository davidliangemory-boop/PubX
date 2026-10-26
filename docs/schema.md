# PubX 统一事件 Schema（event schema v1，四模块共用骨架）

> 版本：2026-10-23 ｜ 代码实现：`scripts/schema.py` ｜ 校验：`scripts/validate.py`
> 纪律：`null` = 已核原文但未披露（页面显示【未披露】）；`"unknown"` = 尚未核查；禁止虚构。

## 1. 模块（module）与数据文件

四个分页面数据文件、统计口径**互不混用**。每条记录的 `module` 决定它进入哪个分页面：

| module | 分页面 | 数据文件 | 口径 |
|---|---|---|---|
| `cn_outbound` | 出海信批归纳（#/ 及 7 个二级页） | `state/events.json` + `state/db.json` | 仅中企出海相关披露（巨潮 / 披露易 / EDGAR 中概名单） |
| `us_market` | 美股 SEC（#/us） | `state/events_us.json`（采集未上线） | SEC EDGAR 全量，不分中外企 |
| `hk_market` | 港股 HKEX（#/hk-market） | `state/events_hk.json`（采集未上线） | HKEX 披露易全量，不分中外企 |
| `export_control` | 出口管制（#/export） | `state/events_export.json`（采集未上线） | BIS / OFAC / UFLPA：执法案例、清单、规则更新 |

`us_market` / `hk_market` 的事项类型分类：交易类、融资类、运营、法律（诉讼/监管处罚）、对外投资、经营战略重大事项。
`export_control` 的栏目（`column` 扩展字段）：`enforcement` 执法案例更新、`lists` 清单更新、`rules` 规则更新；原 SDN 筛查并入为「观察名单比对」子视图（同名≠命中）。

## 2. 共用记录骨架

```jsonc
{
  "event_id": "E-001",              // 稳定 ID，跨批次不变，全局唯一
  "module": "cn_outbound",          // 见上表；缺省兼容映射：存量 events.json 全部视为 cn_outbound
  "title_fact": { "text": "标题=具体事实", "layer": "disclosed", "basis": "出处说明" },
  "status": "活跃",                  // 生命周期：活跃 | 完成 | 终止
  "update_type_latest": "新增",      // 见 §4 状态枚举映射
  "parties": [ { "name": "", "role": "披露主体|收购方|标的|卖方|对手方|…",
                 "layer": "disclosed", "basis": "" } ],   // 主体及关系
  "geo": { "text": "国家/地区", "layer": "disclosed", "basis": "" },   // null = 未披露
  "matter_type": { "value": "设厂|并购|合资|销售|融资|退出|诉讼|监管|…", "layer": "analysis", "basis": "归类依据" },
  "stage_current": "意向|协议|实施|变更|投产/运营|完成",
  "stage_chain": [ { "date": "2026-10-01", "stage": "完成", "doc_id": "", "note": "", "layer": "disclosed" } ],
  "scale": { "text": "金额+币种+口径", "layer": "disclosed", "basis": "" },   // 规模：金额/币种/持股/产能；null = 未披露
  // terms（R05 起为结构化字典；存量 list 形态兼容渲染）：
  "terms": {
    "completeness": "全文已披露|仅摘要条款|未披露协议条款",
    "completeness_basis": "判断依据",
    "fields": {                              // 12 个条款字段一个不能少；value=null=已核原文未披露，"unknown"=尚未核查
      "payment": { "value": "…或 null", "evidence": { "doc_id": "", "page": 1, "quote": "≤60字原文子串" } },
      "conditions_precedent": {}, "approvals": {}, "contingent": {},
      "completion_adjustment": {}, "deposit": {}, "long_stop_date": {},
      "breach": {}, "reps_warranties": {}, "transition": {}, "tax": {}, "dispute_resolution": {}
    }
  },
  "holding_chain": { "text": "持股链：母公司→收购主体(控股)→标的 x%", "layer": "disclosed", "basis": null, "evidence": null },
  "impact": [ { "text": "", "layer": "disclosed|analysis", "basis": "" } ],   // 影响（R05 起独立成第⑦节）
  "watch_points": [ { "text": "", "layer": "analysis", "basis": "" } ],   // 跟踪点
  // legal_triggers（R06 起由 scripts/legal_map.py 确定性规则生成，编码表 state/issues_taxonomy.json）：
  "legal_triggers": [ { "issue_code": "I2.1",              // 必填；议题二级码，每条只挂一个，须在编码表内
                        "issue": "外资审查（FIRB/…）",      // 冗余名称，便于阅读
                        "trigger_fact": "触发事实：只引用事件已有字段或原文摘录上下文，禁止推测",
                        "text": "= trigger_fact（兼容旧前端/校验）",
                        "status": "disclosed_cleared|disclosed_pending|not_disclosed|not_applicable",
                        "layer": "disclosed|analysis",     // 原文无审批字样一律 not_disclosed，禁止倒推「已审批」；
                                                           // 原始分类/多渠道披露等纯事实行标 not_applicable（无审批状态含义）
                        "basis": "命中规则 id + 字段 + 判定说明" } ],
  "legal_notes_unmapped": [ { "text": "旧轮自由文本未归码片段", "basis": "" } ],  // 保留待人工核定，不丢不编
  "gaps": [ { "item": "缺什么", "why": "为何重要", "where": "去哪找", "layer": "analysis", "basis": "" } ],  // R05 三段式；存量 {text} 兼容
  "practice_notes": [ { "text": "", "layer": "analysis", "basis": "" } ],
  "sources": [ { "doc_id": "", "channel": "", "file": "文件名", "date": "发布日期",
                 "url": "", "new_info": "该来源新增信息（R05 起）",
                 "quotes": [ { "text": "短引文（原文逐字）", "page": 1 } ] } ],
  "source_diff": null,              // 多来源口径差异；null = 无
  "changelog": [ { "date": "", "type": "新增|进展|修正", "doc_id": "", "note": "" } ]
}
```

### 字段规则
- **id**：`event_id` 必填、全局唯一（跨模块也不得重复）。
- **发布日期**：以 `sources[].date`（披露日期）与 `stage_chain[].date` 为准，格式 `YYYY-MM-DD`。
- **三分层（layer）**：`disclosed` 公司披露（必须有 sources 支撑）/ `external` 外部事实（必须附外部来源）/ `analysis` 系统分析（必须写 `basis` 依据）。所有叙事字段（`text` + `layer` + `basis`）都遵守此约定。
- **字段级 evidence（R05 起）**：A 级事件（importance.level=A）的 parties/geo/stage_chain/scale/terms.fields 等字段可带 `evidence={doc_id, page, quote≤60字}`；`quote` 必须是 `raw/<doc_id>.txt` 对应页（`\f` 分页）的原文逐字子串，由 `scripts/validate.py` 的「字段级 evidence 回原文」逐项比对；重抽片段先经 `scripts/r05_verify.py` 核验再由 `scripts/r05_apply.py` 合并。
- **sources[]**：每份来源必须有 `file`（文件名）、`date`（日期）、`url`；引文 `quotes[].text` 必须是原文逐字子串（有原文缓存时由 validate.py 回原文比对），`page` 给页码或章节定位。
- **scale**：金额必须带币种（美元/港元/人民币/澳元/欧元/…），保留原文口径，不做汇率换算；`null` 显示【未披露】。
- **gaps**：信息缺口，即「原文未披露但影响判断」的事项清单。
- 各模块可在骨架之外扩展字段（如 export_control 的 `column`、list_version；us/hk 的 `form_type`、`ticker`），扩展字段不得与骨架字段同名异义。

## 3. 状态枚举映射（status / update_type）

规格英文枚举 ↔ 库内中文枚举（兼容映射，不丢数据）：

| 规格 | 库内 | 含义 |
|---|---|---|
| new | 新增 | 无匹配事件，新建 |
| progress | 进展 | 同事件阶段前移或补充披露（追加 stage_chain/sources） |
| duplicate | 重复 | 渠道主键或同标题同日已收，不入库不建卡 |
| corrected | 修正 | 新披露与已记录字段矛盾，改字段并留痕 changelog |
| invalid | 失效 | 终止/撤回，事件 status 置「终止」 |

生命周期 `status`：活跃 | 完成 | 终止。

## 4. 存量兼容映射（state/events.json）

现有 `state/events.json`（60 事件 / 63 文档）已符合本骨架，仅做以下映射，不丢数据：
- 缺 `module` → 视为 `cn_outbound`；
- `matter_type` 使用 `value` 键（视为 `text` 别名），其余叙事字段用 `text`；
- `update_type_latest ∈ {新增,进展,修正}` → 见 §3 映射；
- `terms/scale/geo/source_diff = null` → 【未披露】；`scale.text` 以 "—/未披露/未载" 开头视为未披露说明；
- 披露条目层仍在 `state/db.json`，经 `docs` 映射（doc_id → event_id）挂到事件。

## 5. 校验

`python3 scripts/validate.py`：JSON 可解析、id 唯一、必填字段、layer/basis 约定、金额带币种、quote 回原文子串（有原文缓存时）、前端静态资源完整。输出 `state/validate_report.json`，并在 #/about「质检报告」展示。

## 6. 批次命名与采集参数

| 批次 | id 形式 | 说明 |
|---|---|---|
| 日批次 | `D-YYYYMMDD` | 每交易日 1 批；同一自然日多轮运行**合并**进同一批次（计数累加、说明追加、`runs` 记轮数），不再按 HHMM 另立批次 |
| 回溯批次 | `B-YYYYMMDD` | 历史回补（backfill_pull.py 链路，取回补窗口 end 日）；存量旧记录 `B-BF-YYYYMMDD` 在展示层归并到 B- 系列 |
| 出口管制周批 | `W-YYYYWW` | 出口管制分页面采集上线后使用（ISO 周） |

- 存量旧批次 `B-YYYYMMDD-HHMM` / `B-YYYYMMDD-SEC|HKEX|…` 为旧轮次的历史记录（现改为日批次），**不改原始数据**；`scripts/build_data.py` 派生 `batches_daily`（按自然日聚合为 D-YYYYMMDD，回溯单列），首页「本次更新带」与 #/about「批次简报」按此展示。
- 采集脚本统一参数：`--date YYYY-MM-DD`（扫描该日北京时间 00:00–24:00）、`--backfill-days N`（回溯重叠窗口天数，默认 20）。适用：`run_once.py`、`hkex_pull.py`、`sec_pull.py`；`backfill_pull.py` 用 `--end YYYY-MM-DD --backfill-days N`。
- 去重不因日批次合并而放松：巨潮 announcementId、披露易 NEWS_ID、EDGAR accessionNumber 主键去重照旧；重叠窗口内重复候选按 collected 清单跳过。
