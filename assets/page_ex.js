/* PubX 出口管制分页面（#/export）——独立前端文件，合并约束：
   仅向 window 暴露 render_ex(col, qs) 与 bind_ex(view, col, qs)；
   app.js 只做路由分发调用，本文件自含全部渲染与交互。
   数据源：assets/export_data.js（window.EXDATA，由 scripts/export_pull.py / sdn_screen.py 生成）。 */
(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function layerBadge(layer) {
    if (layer === "disclosed") return '<span class="st ok" title="公司披露，附原文出处">披露</span>';
    if (layer === "external") return '<span class="st manual" title="外部事实，附官方来源">外部</span>';
    return '<span class="st plan" title="系统分析，须写依据">分析</span>';
  }
  function pill(t, cls) { return t == null || t === "" ? "" : '<span class="pill ' + (cls || "") + '">' + esc(t) + "</span>"; }
  function statCard(n, c, d, href) {
    var inner = '<div class="n">' + n + '</div><div class="c">' + esc(c) + "</div>" + (d ? '<div class="d">' + esc(d) + "</div>" : "");
    return href
      ? '<a class="stat" style="text-decoration:none;color:inherit" href="' + esc(href) + '" title="点击穿透到对应筛选">' + inner + "</a>"
      : '<div class="stat">' + inner + "</div>";
  }
  var NA = '<span class="na">【未披露】</span>';
  var COL_META = {
    enforcement: { name: "执法案例更新", src: "BIS 行政执法/和解 · OFAC 执法公告 · CBP/UFLPA 执法" },
    lists: { name: "清单更新", src: "Federal Register 实体清单新增/移除 · OFAC Recent Actions SDN 增删 · DHS UFLPA 实体清单" },
    rules: { name: "规则更新", src: "EAR/OFAC 法规 · 通用许可 · FAQ · 指南" },
    watch: { name: "观察名单比对", src: "原 SDN 筛查（R09）并入；同名≠命中" }
  };

  function data() { return window.EXDATA || null; }

  /* ── 筛选（状态进 URL，可分享） ── */
  var PAGE_SIZE = 12;
  function filtersFromQs(qs) {
    return {
      agency: qs.get("agency") || "全部",
      from: qs.get("from") || "",
      to: qs.get("to") || "",
      cn: qs.get("cn") || "全部",
      act: qs.get("act") || "",
      q: (qs.get("q") || "").trim(),
      pg: Math.max(1, parseInt(qs.get("pg") || "1", 10) || 1)
    };
  }
  function money(n) {
    if (n == null) return "";
    if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return "$" + (n / 1e3).toFixed(0) + "K";
    return "$" + n;
  }
  function applyFilters(items, f) {
    return items.filter(function (it) {
      if (f.agency !== "全部" && (it.agency || "").indexOf(f.agency) < 0) return false;
      if (f.from && (it.date || "") < f.from) return false;
      if (f.to && (it.date || "") > f.to) return false;
      if (f.cn !== "全部" && (it.china_link ? it.china_link.value : "否") !== f.cn) return false;
      if (f.act && (it.action || "") !== f.act) return false;
      if (f.q) {
        var hay = [it.title, it.doc_no, (it.parties || []).join(" "),
          (it.points || []).map(function (p) { return p.text; }).join(" ")].join(" ").toLowerCase();
        if (hay.indexOf(f.q.toLowerCase()) < 0) return false;
      }
      return true;
    });
  }
  function agenciesOf(items) {
    var s = {};
    items.forEach(function (it) { if (it.agency) s[it.agency] = 1; });
    return Object.keys(s).sort();
  }

  /* ── 条目卡 ── */
  function itemCard(it) {
    var cn = it.china_link || { value: "否" };
    var h = '<div class="ex-item">'
      + '<div class="ex-item-h"><span class="pg mono">' + esc(it.date || "—") + "</span>"
      + pill(it.agency, "blue") + (it.action ? pill({ added: "新增", removed: "移除", revised: "修订" }[it.action] || it.action, it.action === "removed" ? "" : "solid") : "")
      + (it.also_enforcement ? '<span class="pill" title="本条同时含清单更新内容，亦收录于清单更新栏">混合行动</span>' : "")
      + (it.penalty && it.penalty.amount_usd != null ? '<span class="pill solid" title="' + esc(it.penalty.suspended ? "缓期执行（suspended），违约即激活" : "和解/罚款金额") + '">' + esc(money(it.penalty.amount_usd)) + (it.penalty.suspended ? " 缓期" : "") + "</span>" : "");
    /* 执法条目：从 external 要点提取定性/VSD 徽章（文本均出自下方要点，呈现层归并） */
    if (it.column === "enforcement" || it.also_enforcement) {
      var pts = (it.points || []).map(function (p) { return p.text; }).join(" ");
      var em = pts.match(/定性：([\w-]+)/);
      if (em) h += pill(em[1] === "egregious" ? "定性 egregious" : "定性 non-egregious", em[1] === "egregious" ? "solid" : "");
      if (/未经自愿披露/.test(pts)) h += pill("未经自愿披露", "solid");
      else if (/自愿披露/.test(pts)) h += pill("涉自愿披露情节", "");
    }
    h += (cn.value === "是" ? '<span class="st ex-cn" title="' + esc(cn.basis || "") + '">中国关联</span>' : "")
      + (it.doc_no ? '<span class="mono dim" style="font-size:11.5px">' + esc(it.doc_no) + "</span>" : "")
      + "</div>"
      + '<div class="ex-item-t"><a href="' + esc(it.url || "#") + '" target="_blank" rel="noopener">' + esc(it.title) + "</a></div>";
    if (it.parties && it.parties.length) {
      h += '<div class="ex-ps"><span class="dim">涉及主体（' + it.parties.length + "，全文启发式抽取，以原文为准）：</span>"
        + it.parties.slice(0, 12).map(function (p) { return '<span class="tag">' + esc(p) + "</span>"; }).join("")
        + (it.parties.length > 12 ? '<span class="dim">…等 ' + it.parties.length + " 个</span>" : "") + "</div>";
    }
    (it.points || []).forEach(function (p) {
      h += '<div class="ex-pt">' + layerBadge(p.layer) + " " + esc(p.text)
        + (p.source ? ' <a class="ex-src" href="' + esc(p.source) + '" target="_blank" rel="noopener">来源 ↗</a>' : "") + "</div>";
    });
    if (it.impact) {
      h += '<div class="ex-pt ex-imp">' + layerBadge("analysis") + " <b>合规影响：</b>" + esc(it.impact.text)
        + '<div class="dim" style="font-size:12px;margin-top:2px">依据：' + esc(it.impact.basis || "") + "</div></div>";
    }
    h += '<div class="ex-links">'
      + '<a href="' + esc(it.url || "#") + '" target="_blank" rel="noopener">原文链接 ↗</a>'
      + (it.pdf_url ? ' <a href="' + esc(it.pdf_url) + '" target="_blank" rel="noopener">PDF ↗</a>' : "")
      + '<span class="dim">' + esc((it.source || {}).channel || "") + " · 抓取 " + esc((it.source || {}).retrieved_at || "—") + "</span></div>";
    return h + "</div>";
  }

  /* ── 筛选条 ── */
  function qsFor(col, f, extra) {
    var p = ["col=" + col];
    var v = Object.assign({}, f, extra);
    if (v.agency && v.agency !== "全部") p.push("agency=" + encodeURIComponent(v.agency));
    if (v.from) p.push("from=" + v.from);
    if (v.to) p.push("to=" + v.to);
    if (v.cn && v.cn !== "全部") p.push("cn=" + encodeURIComponent(v.cn));
    if (v.act) p.push("act=" + v.act);
    if (v.q) p.push("q=" + encodeURIComponent(v.q));
    if (v.pg && v.pg > 1) p.push("pg=" + v.pg);
    return "#/export?" + p.join("&");
  }
  function filterBar(col, f, agencies) {
    var h = '<div class="ex-fbar">'
      + '<label>机构 <select id="exf-agency"><option>全部</option>'
      + agencies.map(function (a) { return '<option' + (f.agency === a ? " selected" : "") + ">" + esc(a) + "</option>"; }).join("")
      + '</select></label>'
      + '<label>日期 <input type="date" id="exf-from" value="' + esc(f.from) + '"/> ~ <input type="date" id="exf-to" value="' + esc(f.to) + '"/></label>'
      + '<label>中国关联 <select id="exf-cn">'
      + ["全部", "是", "否"].map(function (v) { return "<option" + (f.cn === v ? " selected" : "") + ">" + v + "</option>"; }).join("")
      + '</select></label>'
      + '<label>关键词 <input type="text" id="exf-q" value="' + esc(f.q) + '" placeholder="标题 / 主体 / 要点"/></label>'
      + '<button class="btn" id="exf-go">筛选</button>'
      + ' <a class="btn" href="' + qsFor(col, f, { agency: "全部", from: "", to: "", cn: "全部", q: "", pg: 1 }) + '">重置</a>'
      + '<button class="btn primary" id="exf-csv" style="margin-left:auto">导出当前筛选 CSV</button>'
      + "</div>";
    return h;
  }

  /* ── 分页器 ── */
  function pager(col, f, total) {
    var pages = Math.ceil(total / PAGE_SIZE);
    if (pages <= 1) return "";
    var h = '<div class="ex-pager">'
      + (f.pg > 1 ? '<a class="btn" href="' + qsFor(col, f, { pg: f.pg - 1 }) + '">‹ 上一页</a>' : '<span class="btn" style="opacity:.4">‹ 上一页</span>');
    var lo = Math.max(1, f.pg - 3), hi = Math.min(pages, f.pg + 3);
    for (var i = lo; i <= hi; i++) {
      h += i === f.pg ? '<span class="btn primary">' + i + "</span>"
        : '<a class="btn" href="' + qsFor(col, f, { pg: i }) + '">' + i + "</a>";
    }
    h += (f.pg < pages ? '<a class="btn" href="' + qsFor(col, f, { pg: f.pg + 1 }) + '">下一页 ›</a>' : '<span class="btn" style="opacity:.4">下一页 ›</span>')
      + '<span class="dim" style="font-size:12px;margin-left:8px">共 ' + total + " 条 / " + pages + " 页</span></div>";
    return h;
  }

  /* ── 栏目汇总带（每个数字注口径；可点击穿透到对应筛选） ── */
  function colSummary(col, colItems, f) {
    if (col === "enforcement") {
      var withPen = colItems.filter(function (x) { return x.penalty && x.penalty.amount_usd != null; });
      var total = withPen.reduce(function (a, x) { return a + x.penalty.amount_usd; }, 0);
      var max = withPen.slice().sort(function (a, b) { return b.penalty.amount_usd - a.penalty.amount_usd; })[0];
      var latest = colItems.slice().sort(function (a, b) { return (a.date || "") < (b.date || "") ? 1 : -1; })[0];
      return '<div class="statstrip">'
        + statCard(colItems.length, "窗口内执法案件", "BIS 行政执法/和解 + OFAC 执法公告；含混合行动中的和解内容（条内已标注）")
        + statCard(withPen.length ? money(total) : "—", "罚款合计（USD）", "口径：仅详情页/文书可解析金额，" + withPen.length + "/" + colItems.length + " 条；含缓期执行金额")
        + statCard(max ? money(max.penalty.amount_usd) : "—", "最大单笔", max ? esc(((max.parties || [])[0] || max.title).slice(0, 40)) : "")
        + statCard(latest ? esc(latest.date) : "—", "最新案件", latest ? esc(((latest.parties || [])[0] || latest.title).slice(0, 40)) : "")
        + "</div>";
    }
    if (col === "rules") {
      /* 主题分布带（按标题关键词归类；点击穿透到关键词筛选） */
      var TOPICS = [
        ["委内瑞拉", /venezuela/i], ["伊朗", /iran/i], ["古巴", /cuba/i],
        ["俄罗斯/白俄", /russia|belarus|ukraine/i], ["反恐/毒品", /terror|narcotic|illicit drug/i],
        ["EAR 出口管制", /export administration|entity list|unverified list|drone|export control/i],
        ["UFLPA/涉疆", /uflpa|uyghur/i]
      ];
      var tc = {}, other = 0;
      colItems.forEach(function (x) {
        var hit = null;
        for (var i = 0; i < TOPICS.length; i++) { if (TOPICS[i][1].test(x.title || "")) { hit = TOPICS[i][0]; break; } }
        if (hit) tc[hit] = (tc[hit] || 0) + 1; else other++;
      });
      var pillsHtml = TOPICS.filter(function (t) { return tc[t[0]]; }).map(function (t) {
        var kw = t[1].source.split("|")[0];
        return '<a class="pill" style="text-decoration:none" href="' + qsFor(col, f, { q: kw, pg: 1 }) + '" title="点击筛选该主题">' + esc(t[0]) + " " + tc[t[0]] + "</a>";
      }).join("") + (other ? '<span class="pill">其他 ' + other + "</span>" : "");
      return '<div class="panel"><div class="panel-h"><h2>主题分布</h2>'
        + '<span class="note">按标题关键词归类（external 层线索），点击穿透到关键词筛选；同一文档只归一类</span></div>'
        + '<div class="panel-b" style="display:flex;gap:8px;flex-wrap:wrap">' + (pillsHtml || '<span class="dim">窗口内无条目</span>') + "</div></div>";
    }
    if (col === "lists") {
      var cnt = { added: 0, removed: 0, revised: 0, other: 0 };
      colItems.forEach(function (x) { cnt[x.action || "other"] = (cnt[x.action || "other"] || 0) + 1; });
      return '<div class="statstrip">'
        + statCard("+" + cnt.added, "新增类条目", "按标题/文书动作归类（added）；点击穿透", qsFor(col, f, { act: "added", pg: 1 }))
        + statCard("-" + cnt.removed, "移除类条目", "按标题/文书动作归类（removed）；点击穿透", qsFor(col, f, { act: "removed", pg: 1 }))
        + statCard("~" + cnt.revised, "修订/增删并存", "revised 或同日增删并存；点击穿透", qsFor(col, f, { act: "revised", pg: 1 }))
        + statCard(cnt.other, "未细分动作", "官方未在标题标明动作类型")
        + "</div>";
    }
    return "";
  }

  /* ── 涉中主体速览（清单栏）：主体 → 变动 → 日期 → 出处，点击主体穿透到关键词筛选 ── */
  function cnPartyBoard(col, colItems) {
    if (col !== "lists") return "";
    var rows = [];
    colItems.forEach(function (it) {
      (it.cn_parties || []).forEach(function (cp) {
        rows.push({ name: cp.name, kind: cp.kind, date: it.date || "", agency: it.agency || "", url: it.url || "", title: it.title || "" });
      });
    });
    if (!rows.length) return "";
    rows.sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    var CAP = 10;
    var shown = rows.slice(0, CAP);
    function rowHtml(r) {
      return "<tr><td><a href=\"" + qsFor(col, {}, { q: r.name, cn: "全部", act: "", pg: 1 }) + "\"><b>" + esc(r.name) + "</b></a></td>"
        + "<td>" + pill(r.kind, r.kind === "新增" ? "solid" : "") + "</td>"
        + '<td class="mono">' + esc(r.date) + "</td><td>" + esc(r.agency) + "</td>"
        + '<td><a class="ex-src" href="' + esc(r.url) + '" target="_blank" rel="noopener" title="' + esc(r.title) + '">原文 ↗</a></td></tr>';
    }
    return '<div class="panel"><div class="panel-h"><h2>涉中主体速览</h2>'
      + '<span class="note">清单栏「中国关联=是」条目的涉中主体聚合（external 层，逐名动作与别名以原文为准）；点击主体名穿透到该主体筛选</span></div>'
      + '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>主体</th><th>变动</th><th>日期</th><th>机构</th><th>出处条目</th></tr></thead><tbody>'
      + shown.map(rowHtml).join("")
      + "</tbody></table></div>"
      + (rows.length > shown.length
        ? '<details class="ex-more"><summary>展开其余 ' + (rows.length - shown.length) + " 条（共 " + rows.length + " 条）</summary>"
          + '<div class="tbl-wrap"><table class="tbl"><tbody>' + rows.slice(CAP).map(rowHtml).join("") + "</tbody></table></div></details>"
        : "")
      + "</div>";
  }

  /* ── UFLPA 实体清单在列快照（清单栏子视图；DHS 页解析，含依据小节与生效批次） ── */
  function uflpaView() {
    var d = data();
    var u = d && d.uflpa;
    if (!u || !u.entries || !u.entries.length) return "";
    var entries = u.entries;
    /* 按列入依据小节分布 */
    var secCnt = {};
    entries.forEach(function (e) { secCnt[e.section || "【未披露】"] = (secCnt[e.section || "【未披露】"] || 0) + 1; });
    /* 按生效日聚合批次时间线 */
    var byDate = {};
    entries.forEach(function (e) { if (e.effective) byDate[e.effective] = (byDate[e.effective] || 0) + 1; });
    var dates = Object.keys(byDate).sort().reverse();
    var batchRows = dates.map(function (dt) {
      return "<tr><td class='mono'>" + esc(dt) + "</td><td>" + byDate[dt] + "</td></tr>";
    });
    var BATCH_CAP = 8;
    var rowHtml = function (e) {
      return "<tr class='ex-uf-row'><td><b>" + esc(e.name) + "</b>"
        + (e.aliases && e.aliases.length ? '<div class="dim" style="font-size:11.5px">别名：' + esc(e.aliases.join("；")) + "</div>" : "")
        + "</td><td class='mono'>" + esc(e.effective || "—") + "</td><td class='mono'>" + esc(e.section || "【未披露】") + "</td></tr>";
    };
    return '<div class="panel"><div class="panel-h"><h2>UFLPA 实体清单 · 在列快照</h2>'
      + '<span class="note">DHS 页整页解析（external 层）；快照 sha256 ' + esc((u.sha256 || "").slice(0, 16)) + "… · 抓取 " + esc(u.retrieved_at || "—") + "</span></div>"
      + '<div class="panel-b">'
      + '<div class="statstrip">'
      + statCard(u.count != null ? u.count : entries.length, "在列实体总数", "当前快照口径；历史变动以 FR 通知与上方条目为准")
      + statCard(Object.keys(secCnt).map(function (k) { return secCnt[k]; }).join(" / "), "按列入依据小节分布", Object.keys(secCnt).join(" · "))
      + statCard(dates.length ? dates[0] : "—", "最近生效批次", dates.length ? "该批 " + byDate[dates[0]] + " 个实体" : "")
      + "</div>"
      + '<h3 style="margin:10px 0 6px">批次时间线（按生效日期聚合）</h3>'
      + '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>生效日期</th><th>本批实体数</th></tr></thead><tbody>'
      + batchRows.slice(0, BATCH_CAP).join("") + "</tbody></table></div>"
      + (batchRows.length > BATCH_CAP
        ? '<details class="ex-more"><summary>展开全部 ' + batchRows.length + " 个批次</summary>"
          + '<div class="tbl-wrap"><table class="tbl"><tbody>' + batchRows.slice(BATCH_CAP).join("") + "</tbody></table></div></details>"
        : "")
      + '<h3 style="margin:14px 0 6px">在列实体（' + entries.length + '）<input type="text" id="ex-uflpa-q" placeholder="筛选名称/别名…" style="margin-left:10px;border:1px solid var(--line-2);border-radius:6px;padding:4px 8px;font-size:12.5px;width:200px"/></h3>'
      + '<div class="dim" style="font-size:12px;margin-bottom:6px">名单条目为 external 层事实（DHS 原文）；列入依据小节来自 DHS 页分节标题，地址等细节以对应 Federal Register 通知为准。</div>'
      + '<div class="tbl-wrap" style="max-height:420px;overflow:auto"><table class="tbl"><thead><tr><th>实体（含别名）</th><th>生效日期</th><th>列入依据</th></tr></thead><tbody id="ex-uflpa-tb">'
      + entries.map(rowHtml).join("")
      + "</tbody></table></div>"
      + "</div></div>";
  }

  function toCSV(items) {
    var head = ["发布日期", "栏目", "机构", "文件号", "标题", "涉及主体", "罚款(USD)", "罚款备注", "中国关联", "中国关联依据", "合规影响(analysis)", "依据", "原文链接"];
    function cell(v) { return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"'; }
    var rows = items.map(function (it) {
      return [it.date, (COL_META[it.column] || {}).name || it.column, it.agency, it.doc_no, it.title,
        (it.parties || []).join("；"),
        it.penalty && it.penalty.amount_usd != null ? it.penalty.amount_usd : "",
        it.penalty ? (it.penalty.text + (it.penalty.suspended ? "（缓期执行）" : "")) : "",
        (it.china_link || {}).value, (it.china_link || {}).basis,
        it.impact ? it.impact.text : "", it.impact ? it.impact.basis : "", it.url].map(cell).join(",");
    });
    return "﻿" + head.map(cell).join(",") + "\n" + rows.join("\n");
  }

  /* ── 观察名单比对子视图 ── */
  function watchView() {
    var d = data();
    var w = d && d.watch;
    if (!w) {
      return '<div class="panel"><div class="panel-b" style="padding:30px;text-align:center">'
        + '<div style="font-weight:700;margin-bottom:8px">观察名单比对尚未运行</div>'
        + '<div class="note">运行 <span class="mono">python3 scripts/sdn_screen.py</span> 后此处展示名单版本、条目数、sha、受检主体与各态数量。本页不展示推测内容。</div></div></div>';
    }
    var r = w.results || {};
    var subs = w.subjects || [];
    /* 受检主体来源构成（external：本站点观察名单与事件库 parties） */
    var srcCnt = {};
    subs.forEach(function (s) { var k = (s.source || "").split("·")[0]; srcCnt[k] = (srcCnt[k] || 0) + 1; });
    var srcNote = Object.keys(srcCnt).map(function (k) { return k + " " + srcCnt[k]; }).join(" · ");
    var h = '<div class="statstrip">'
      + statCard(esc(w.list_version || "—"), "名单版本", w.list + " · 抓取 " + esc(w.retrieved_at || "—"))
      + statCard(w.entry_count, "名单条目数", "sha256 " + esc((w.sha256 || "").slice(0, 16)) + "…")
      + statCard(w.subject_count, "受检主体数", srcNote || "观察名单（港股/美股）+ 事件 parties")
      + statCard(r.no_hit != null ? r.no_hit : "—", "无命中 no_hit", "")
      + statCard(r.name_match_only != null ? r.name_match_only : "—", "仅名称相似", "同名≠命中 · 需人工核验")
      + statCard(r.confirmed != null ? r.confirmed : "—", "确认命中 confirmed", "名称+独立标识一致；脚本不自动置位")
      + "</div>";
    h += '<div class="panel"><div class="panel-h"><h2>比对方法</h2></div><div class="panel-b" style="line-height:1.9;font-size:13px">'
      + esc(w.method || "") + " <b>同名≠命中</b>：仅名称相同而无地址/证件/国别等独立标识佐证时只记「名称相似 · 需人工核验」，不写「命中」。</div></div>";
    if (w.matches && w.matches.length) {
      h += '<div class="panel"><div class="panel-h"><h2>名称相似记录（' + w.matches.length + '）</h2><span class="note">均需人工核验，不作为命中</span></div>'
        + '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>受检主体</th><th>主体来源</th><th>SDN 条目</th><th>SDN 名称/别名</th><th>制裁项目</th><th>匹配依据</th></tr></thead><tbody>'
        + w.matches.map(function (m) {
          return "<tr><td><b>" + esc(m.subject) + "</b></td><td class='dim'>" + esc(m.subject_source) + "</td>"
            + "<td class='mono'>" + esc(m.sdn_entry.num) + "</td>"
            + "<td>" + esc(m.sdn_entry.name) + (m.sdn_entry.aliases.length ? '<div class="dim" style="font-size:11.5px">别名：' + esc(m.sdn_entry.aliases.join("；")) + "</div>" : "") + "</td>"
            + "<td class='mono'>" + esc(m.sdn_entry.program || "—") + "</td>"
            + "<td>" + (m.match_basis || []).map(function (b) {
              return '<div style="font-size:11.5px;line-height:1.6"><b>' + esc(b.field) + "</b>：" + esc(b.sdn) + " ｜ 我方：" + esc(b.ours) + " → " + esc(b.verdict) + "</div>";
            }).join("") + '<div class="dim" style="font-size:11.5px">' + esc(m.note) + "</div></td></tr>";
        }).join("") + "</tbody></table></div></div>";
    } else {
      h += '<div class="panel"><div class="panel-b empty">本次比对 0 条名称相似记录，0 命中（如实记录，不为展示造例）。</div></div>';
    }
    /* 受检主体名册（主体 → 出处，可筛选；三态结果按上表计数，未逐名列示 no_hit 以外的结论） */
    if (subs.length) {
      h += '<div class="panel"><div class="panel-h"><h2>受检主体名册（' + subs.length + '）</h2>'
        + '<span class="note">external 层：主体来自本站观察名单（港股/美股）与事件库 parties；逐个与 SDN 名单归一比对，结果计入上方三态</span></div>'
        + '<div class="panel-b"><input type="text" id="ex-watch-q" placeholder="筛选主体 / 出处…" style="border:1px solid var(--line-2);border-radius:6px;padding:4px 8px;font-size:12.5px;width:240px;margin-bottom:8px"/>'
        + '<div class="tbl-wrap" style="max-height:420px;overflow:auto"><table class="tbl"><thead><tr><th>受检主体</th><th>出处</th></tr></thead><tbody id="ex-watch-tb">'
        + subs.map(function (s) { return "<tr><td><b>" + esc(s.name) + "</b></td><td class='dim'>" + esc(s.source) + "</td></tr>"; }).join("")
        + "</tbody></table></div></div></div>";
    }
    return h;
  }

  /* ── 主渲染 ── */
  window.render_ex = function (col, qs) {
    var d = data();
    var meta = (d && d.meta) || {};
    var items = (d && d.items) || [];
    var f = filtersFromQs(qs);

    var h = '<div class="ph"><h1>出口管制</h1><span class="sub">本页回答：BIS / OFAC / UFLPA 最近有哪些执法案例、清单与规则更新；观察名单主体与制裁名单比对是否有命中</span></div>';

    /* 口径说明（周更）；最近批次 = 窗口截止日最大者（并列取运行时间最新），避免被单日补扫/补解析批次误导 */
    var batches = (d && d.batches) || [];
    var lastBatch = null;
    batches.forEach(function (b) {
      if (!(b.window && b.window.lte)) return;
      if (!lastBatch || b.window.lte > lastBatch.window.lte
          || (b.window.lte === lastBatch.window.lte && (b.time || "") > (lastBatch.time || ""))) lastBatch = b;
    });
    if (!lastBatch && batches.length) lastBatch = batches[batches.length - 1];
    var KIND_ZH = { weekly: "周批", backfill: "回溯补入", enrich: "补解析" };
    h += '<div class="panel"><div class="panel-h"><h2>口径说明</h2>'
      + '<span class="note">' + esc(meta.cadence || "周更") + (lastBatch ? " · 最近批次 " + esc(lastBatch.batch_id) + "（" + esc(lastBatch.time)
        + (lastBatch.window && lastBatch.window.gte ? "，窗口 " + esc(lastBatch.window.gte) + " ~ " + esc(lastBatch.window.lte) : "")
        + (lastBatch.kind && lastBatch.kind !== "weekly" ? "，" + (KIND_ZH[lastBatch.kind] || lastBatch.kind) : "") + "）" : "") + "</span></div>"
      + '<div class="panel-b" style="line-height:1.9;font-size:13px">'
      + "来源：" + ((meta.sources || []).map(function (s) { return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.name) + "</a>（" + esc(s.note) + "）"; }).join("；") || "—") + "。"
      + "分「执法案例更新 / 清单更新 / 规则更新」三栏目 + 「观察名单比对」子视图（原 SDN 筛查并入：<b>同名≠命中</b>）。"
      + "要点为 external（外部事实，附官方来源）；合规影响为 analysis（系统分析，写依据）；原文未载显示【未披露】。"
      + "本页数据文件（state/export.json）与统计口径同其他分页面<b>互不混用</b>。"
      + (meta.caliber ? "<br/>" + esc(meta.caliber) : "") + "</div></div>";

    if (!d) {
      return h + '<div class="panel"><div class="panel-b" style="padding:30px;text-align:center">'
        + '<div style="font-weight:700;margin-bottom:8px">数据文件未加载</div>'
        + '<div class="note">缺少 assets/export_data.js。运行 <span class="mono">python3 scripts/export_pull.py --backfill-days 90</span> 生成。</div></div></div>';
    }

    /* 栏目切换（hash 链接，筛选参数保留在 URL）；执法栏计数含混合行动（also_enforcement） */
    h += '<div class="ex-cols">'
      + Object.keys(COL_META).map(function (k) {
        var n = items.filter(function (x) { return x.column === k || (k === "enforcement" && x.also_enforcement); }).length;
        return '<a href="#/export?col=' + k + '"' + (col === k ? ' class="on"' : "") + ">"
          + COL_META[k].name + (k !== "watch" ? ' <span class="dim">' + n + "</span>" : "") + "</a>";
      }).join("") + "</div>";

    if (col === "watch") {
      return h + watchView();
    }

    var colItems = items.filter(function (x) { return x.column === col || (col === "enforcement" && x.also_enforcement); });
    var agencies = agenciesOf(colItems);
    var shown = applyFilters(colItems, f);

    /* KPI（本栏目口径；中国关联卡可穿透） */
    var cnN = colItems.filter(function (x) { return x.china_link && x.china_link.value === "是"; }).length;
    var dates = colItems.map(function (x) { return x.date || ""; }).sort();
    var newest = dates.length ? dates[dates.length - 1] : "";
    h += '<div class="statstrip">'
      + statCard(colItems.length, COL_META[col].name + " · 累计条目", "窗口内采集并留存；去重按文件号/链接")
      + statCard(shown.length, "当前筛选结果", "筛选条件进 URL 可分享")
      + statCard(cnN, "中国关联条目", "external 层：原文/文书全文关键词命中，附依据；点击穿透", qsFor(col, f, { cn: "是", act: "", pg: 1 }))
      + statCard(esc(newest || "—"), "最新发布日期", "按来源发布日排序")
      + "</div>";

    h += colSummary(col, colItems, f);
    h += cnPartyBoard(col, colItems);
    if (col === "lists") h += uflpaView();

    /* 动作筛选生效提示（由汇总带穿透而来） */
    if (f.act) {
      var ACT_ZH = { added: "新增", removed: "移除", revised: "修订/增删并存" };
      h += '<div style="margin:0 0 10px"><span class="pill solid">动作：' + esc(ACT_ZH[f.act] || f.act) + "</span> "
        + '<a class="btn" href="' + qsFor(col, f, { act: "", pg: 1 }) + '">清除动作筛选 ×</a></div>';
    }

    var pages = Math.ceil(shown.length / PAGE_SIZE) || 1;
    if (f.pg > pages) f.pg = pages;
    var pageItems = shown.slice((f.pg - 1) * PAGE_SIZE, f.pg * PAGE_SIZE);

    h += '<div class="panel"><div class="panel-h"><h2>' + COL_META[col].name + '</h2><span class="note">覆盖：' + esc(COL_META[col].src) + "</span></div>"
      + '<div class="panel-b">' + filterBar(col, f, agencies);
    if (!shown.length) {
      h += '<div class="empty">当前筛选无结果' + (colItems.length ? "（本栏目累计 " + colItems.length + " 条，请放宽筛选）" : "（该栏目窗口内无官方更新，如实留白）") + "</div>";
    } else {
      h += pager(col, f, shown.length)
        + pageItems.map(itemCard).join("")
        + pager(col, f, shown.length);
    }
    return h + "</div></div>";
  };

  /* ── 绑定（由 app.js 路由后调用） ── */
  window.bind_ex = function (view, col, qs) {
    ["#ex-uflpa-q", "#ex-watch-q"].forEach(function (sel) {
      var inp = view.querySelector(sel);
      if (!inp) return;
      var tb = sel === "#ex-uflpa-q" ? "#ex-uflpa-tb tr" : "#ex-watch-tb tr";
      inp.addEventListener("input", function () {
        var kw = inp.value.trim().toLowerCase();
        var rows = view.querySelectorAll(tb);
        for (var i = 0; i < rows.length; i++) {
          rows[i].style.display = !kw || rows[i].textContent.toLowerCase().indexOf(kw) >= 0 ? "" : "none";
        }
      });
    });
    var go = view.querySelector("#exf-go");
    if (!go) return;
    function cur() {
      return {
        agency: view.querySelector("#exf-agency").value,
        from: view.querySelector("#exf-from").value,
        to: view.querySelector("#exf-to").value,
        cn: view.querySelector("#exf-cn").value,
        q: view.querySelector("#exf-q").value.trim(),
        act: qs.get("act") || ""
      };
    }
    function nav() {
      var f = cur();
      var p = ["col=" + col];
      if (f.agency !== "全部") p.push("agency=" + encodeURIComponent(f.agency));
      if (f.from) p.push("from=" + f.from);
      if (f.to) p.push("to=" + f.to);
      if (f.cn !== "全部") p.push("cn=" + encodeURIComponent(f.cn));
      if (f.q) p.push("q=" + encodeURIComponent(f.q));
      var act = qs.get("act");
      if (act) p.push("act=" + act);
      location.hash = "#/export?" + p.join("&");
    }
    go.addEventListener("click", nav);
    view.querySelector("#exf-q").addEventListener("keydown", function (e) { if (e.key === "Enter") nav(); });
    view.querySelector("#exf-csv").addEventListener("click", function () {
      var d = data(); if (!d) return;
      var colItems = (d.items || []).filter(function (x) { return x.column === col || (col === "enforcement" && x.also_enforcement); });
      var shown = applyFilters(colItems, cur());
      var blob = new Blob([toCSV(shown)], { type: "text/csv;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "pubx-export-" + col + "-" + shown.length + "条.csv";
      a.click();
    });
  };
})();
