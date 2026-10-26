# R08 采集与更新衔接

## 运行

调度方先同步仓库。`PUBX_DRY_RUN=1 bash ops/run_daily.sh` 可审阅实际 prompt；移除变量后调用 PATH 中的 `kimi -p`。可用 `PUBX_ENGINE` 指定运行器、`PUBX_REPO` 指定仓库、`PUBX_LOG_DIR` 指定日志目录。没有任何 token 写入仓库。三个运行器共享 flock，避免并发覆盖。它们不 pull、stash、commit 或 push；构建、自检后把结果留给调度方。

- `bash ops/run_daily.sh`：按北京时间昨日运行日批次。
- `bash ops/run_backfill.sh`：20 天重叠补漏；失败窗口续接 state/backfill_cursor.json。
- `bash ops/run_weekly_exportcontrol.sh`：最近一周出口管制三栏目。

`python3 scripts/run_once.py --date YYYY-MM-DD` 只扫该日，不混入 20 天窗口。`--backfill-days 20` 扫今天前 20 天到昨天，批次 B-运行日；失败候选不加入 scanned。待审原文与审核结果可重用，重跑不新建同主键事件。默认日批次 D-扫描日。出口管制维持 ISO 周批 W-YYYYWW。各模块数据与统计独立。

## Kimi Code 直接阅读原文

run_once 首轮把候选落到 state/pending/<doc_id>.json，原文落到 raw/<doc_id>.txt（页间 form feed）。待审时返回非零，不代表成功零新增。Kimi Code 读取原文及既有事件，生成 state/analysis/<doc_id>.json，再重跑相同命令。最小结构如下（示意结构，不是数据）：

```json
{
  "gate": {"include": true, "category": "境外投资", "reason": "填写实际依据"},
  "steps": {
    "extract_facts": [{"field": "字段名", "value": null, "layer": "disclosed", "evidence": {"doc_id": "原文ID", "page": 1, "quote": "原文逐字摘录"}}],
    "legal_map": [{"issue_code": "I2.1", "status": "not_disclosed", "layer": "analysis", "basis": "触发事实与原文定位"}],
    "judge": [{"text": "填写影响、跟踪点、缺口或执业提示", "layer": "analysis", "basis": "填写判断依据"}]
  },
  "result": {"fields": {"公司全称": "原文主体", "动作类型": "原文事实", "动作阶段": "原文阶段"}, "quotes": ["原文逐字摘录"], "undisclosed": "经核查未披露的事项"},
  "event": {"event_id": "稳定事件ID", "sources": [{"doc_id": "原文ID"}]},
  "update_type": "new",
  "target_id": null,
  "reason": "实际归并或修正依据",
  "case_update": {"summary": "同一事项摘要", "check": "维持/修正/推翻及理由"}
}
```

event 必须使用 state/events.json 中完整 event v2（上述只展示接口，不可直接当作完整事件）。原文没有的事实为 null，前端显示【未披露】；unknown 表示尚未核查。新采集不再生成同行可比、先发/后发等自由发挥字段。所有引文 ≤60 字且须在原文出现；analysis 必须有 basis；external 必须有 source。

## 归并与恢复

`scripts/event_merge.py` 按来源主键幂等；同主体/标的/国家相似度仅提供候选，审核后显式给 target_id。进展追加来源和阶段链，不改既有事实；修正保存 old/new/reason；终止设 terminated。跨渠道先查 docs 索引。`python3 scripts/replay_batches.py` 在内存回放最近三个非空批次，不改变生产事件。

`python3 scripts/recover_state.py` 只创建缺失的去重文件，不覆盖已有文件；不能反推的扫描历史见 missing_state.md。

manifest 记录 Git HEAD、逐脚本 SHA-256、prompt 版本、模型记录和批次。HEAD 对应检出的提交，工作区修改由 SHA-256 精确标识。构建不冒充执行过模型分析，未记录模型如实显示。

## 已知边界

run_once 的自动检索入口目前是巨潮。观察名单 HKEX/SEC 需按 prompt 另外运行对应 pull 脚本，读取候选和原文后按同一审核契约入库，不能声称 run_once 自身已完成三渠道或 IR。SEC --date 新采集按 ACCEPTANCE-DATETIME 换算北京时间，从相邻美东索引取数据；既有数据保留旧申报日，不伪造转换。没有 acceptance 的新申报不消费主键，等待重试。HKEX 未核实的英文 PDF 链接为空，保留原始类别与繁体摘录。
