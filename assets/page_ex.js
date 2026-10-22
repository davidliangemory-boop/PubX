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
  function statCard(n, c, d) {
    return '<div class="stat"><div class="n">' + n + '</div><div class="c">' + esc(c) + "</div>" + (d ? '<div class="d">' + esc(d) + "</div>" : "") + "</div>";
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
  function filtersFromQs(qs) {
    return {
      agency: qs.get("agency") || "全部",
      from: qs.get("from") || "",
      to: qs.get("to") || "",
      cn: qs.get("cn") || "全部",
      q: (qs.get("q") || "").trim()
    };
  }
  function applyFilters(items, f) {
    return items.filter(function (it) {
      if (f.agency !== "全部" && (it.agency || "").indexOf(f.agency) < 0) return false;
      if (f.from && (it.date || "") < f.from) return false;
      if (f.to && (it.date || "") > f.to) return false;
      if (f.cn !== "全部" && (it.china_link ? it.china_link.value : "否") !== f.cn) return false;
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
      + (cn.value === "是" ? '<span class="st ex-cn" title="' + esc(cn.basis || "") + '">中国关联</span>' : "")
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
  function filterBar(col, f, agencies) {
    function qs(extra) {
      var p = ["col=" + col];
      var v = Object.assign({}, f, extra);
      if (v.agency !== "全部") p.push("agency=" + encodeURIComponent(v.agency));
      if (v.from) p.push("from=" + v.from);
      if (v.to) p.push("to=" + v.to);
      if (v.cn !== "全部") p.push("cn=" + encodeURIComponent(v.cn));
      if (v.q) p.push("q=" + encodeURIComponent(v.q));
      return "#/export?" + p.join("&");
    }
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
      + ' <a class="btn" href="' + qs({ agency: "全部", from: "", to: "", cn: "全部", q: "" }) + '">重置</a>'
      + '<button class="btn primary" id="exf-csv" style="margin-left:auto">导出当前筛选 CSV</button>'
      + "</div>";
    return h;
  }

  function toCSV(items) {
    var head = ["发布日期", "栏目", "机构", "文件号", "标题", "涉及主体", "中国关联", "中国关联依据", "合规影响(analysis)", "依据", "原文链接"];
    function cell(v) { return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"'; }
    var rows = items.map(function (it) {
      return [it.date, (COL_META[it.column] || {}).name || it.column, it.agency, it.doc_no, it.title,
        (it.parties || []).join("；"), (it.china_link || {}).value, (it.china_link || {}).basis,
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
    var h = '<div class="statstrip">'
      + statCard(esc(w.list_version || "—"), "名单版本", w.list + " · 抓取 " + esc(w.retrieved_at || "—"))
      + statCard(w.entry_count, "名单条目数", "sha256 " + esc((w.sha256 || "").slice(0, 16)) + "…")
      + statCard(w.subject_count, "受检主体数", "观察名单（港股/美股）+ 事件 parties")
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
    return h;
  }

  /* ── 主渲染 ── */
  window.render_ex = function (col, qs) {
    var d = data();
    var meta = (d && d.meta) || {};
    var items = (d && d.items) || [];
    var f = filtersFromQs(qs);

    var h = '<div class="ph"><h1>出口管制</h1><span class="sub">本页回答：BIS / OFAC / UFLPA 最近有哪些执法案例、清单与规则更新；观察名单主体与制裁名单比对是否有命中</span></div>';

    /* 口径说明（周更） */
    var lastBatch = d && d.batches && d.batches.length ? d.batches[d.batches.length - 1] : null;
    h += '<div class="panel"><div class="panel-h"><h2>口径说明</h2>'
      + '<span class="note">' + esc(meta.cadence || "周更") + (lastBatch ? " · 最近批次 " + esc(lastBatch.batch_id) + "（" + esc(lastBatch.time) + "，窗口 " + esc(lastBatch.window.gte) + " ~ " + esc(lastBatch.window.lte) + (lastBatch.kind === "backfill" ? "，回溯补入" : "") + "）" : "") + "</span></div>"
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

    /* 栏目切换（hash 链接，筛选参数保留在 URL） */
    h += '<div class="ex-cols">'
      + Object.keys(COL_META).map(function (k) {
        return '<a href="#/export?col=' + k + '"' + (col === k ? ' class="on"' : "") + ">"
          + COL_META[k].name + (k !== "watch" ? ' <span class="dim">' + items.filter(function (x) { return x.column === k; }).length + "</span>" : "") + "</a>";
      }).join("") + "</div>";

    if (col === "watch") {
      return h + watchView();
    }

    var colItems = items.filter(function (x) { return x.column === col; });
    var agencies = agenciesOf(colItems);
    var shown = applyFilters(colItems, f);

    /* KPI（本栏目口径） */
    var cnN = colItems.filter(function (x) { return x.china_link && x.china_link.value === "是"; }).length;
    var dates = colItems.map(function (x) { return x.date || ""; }).sort();
    var newest = dates.length ? dates[dates.length - 1] : "";
    h += '<div class="statstrip">'
      + statCard(colItems.length, COL_META[col].name + " · 累计条目", "窗口内采集并留存；去重按文件号/链接")
      + statCard(shown.length, "当前筛选结果", "筛选条件进 URL 可分享")
      + statCard(cnN, "中国关联条目", "external 层：原文关键词命中，附依据")
      + statCard(esc(newest || "—"), "最新发布日期", "按来源发布日排序")
      + "</div>";

    h += '<div class="panel"><div class="panel-h"><h2>' + COL_META[col].name + '</h2><span class="note">覆盖：' + esc(COL_META[col].src) + "</span></div>"
      + '<div class="panel-b">' + filterBar(col, f, agencies);
    if (!shown.length) {
      h += '<div class="empty">当前筛选无结果' + (colItems.length ? "（本栏目累计 " + colItems.length + " 条，请放宽筛选）" : "（该栏目窗口内无官方更新，如实留白）") + "</div>";
    } else {
      h += shown.map(itemCard).join("");
    }
    return h + "</div></div>";
  };

  /* ── 绑定（由 app.js 路由后调用） ── */
  window.bind_ex = function (view, col, qs) {
    var go = view.querySelector("#exf-go");
    if (!go) return;
    function cur() {
      return {
        agency: view.querySelector("#exf-agency").value,
        from: view.querySelector("#exf-from").value,
        to: view.querySelector("#exf-to").value,
        cn: view.querySelector("#exf-cn").value,
        q: view.querySelector("#exf-q").value.trim()
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
      location.hash = "#/export?" + p.join("&");
    }
    go.addEventListener("click", nav);
    view.querySelector("#exf-q").addEventListener("keydown", function (e) { if (e.key === "Enter") nav(); });
    view.querySelector("#exf-csv").addEventListener("click", function () {
      var d = data(); if (!d) return;
      var colItems = (d.items || []).filter(function (x) { return x.column === col; });
      var shown = applyFilters(colItems, cur());
      var blob = new Blob([toCSV(shown)], { type: "text/csv;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "pubx-export-" + col + "-" + shown.length + "条.csv";
      a.click();
    });
  };
})();
