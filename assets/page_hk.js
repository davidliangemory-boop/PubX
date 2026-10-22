/* ═════════ PubX 港股（HKEX）全量重大事项页 #/hk-market ═════════
   独立模块：数据 window.HKDB（assets/hk_data.js，由 scripts/hkex_market_pull.py 生成）。
   与「出海信批归纳」数据文件、统计口径互不混用。
   app.js 仅以 window.render_hk(qs) / window.bind_hk() 两个钩子调用本文件。 */
(function () {
  "use strict";
  var CAT6 = ["融资类", "投并购", "运营", "法律（诉讼/监管处罚）", "对外投资", "经营战略重大事项"];
  var CH_OPTS = ["全部渠道", "HKEX·披露易（全市场）", "SFC·執法新聞"];
  var PAGE = 50;
  var HKF = { q: "", cat6: "全部", ch: "全部渠道", cn: "全部", from: "", to: "", page: 1, band: 0 };

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function statCard(n, label, note) {
    return '<div class="stat"><div class="n">' + esc(n) + '</div><div class="c">' + esc(label) + '</div>'
      + (note ? '<div class="d">' + esc(note) + "</div>" : "") + "</div>";
  }
  function docs() { return (window.HKDB && HKDB.docs) || []; }
  function batches() { return (window.HKDB && HKDB.batches) || []; }

  function filtered() {
    var q = HKF.q.trim().toLowerCase();
    return docs().filter(function (d) {
      if (HKF.cat6 !== "全部" && d.cat6 !== HKF.cat6) return false;
      if (HKF.ch !== "全部渠道" && d.channel !== HKF.ch) return false;
      if (HKF.cn === "是" && !(d.cn_related || "").startsWith("是")) return false;
      if (HKF.cn === "未知" && d.cn_related !== "未知") return false;
      if (HKF.from && (d.pub_date || "") < HKF.from) return false;
      if (HKF.to && (d.pub_date || "") > HKF.to) return false;
      if (q) {
        var blob = ((d.title || "") + " " + (d.stock_name || "") + " " + (d.stock_code || "")
          + " " + (d.headline_raw || "") + " " + (d.amount || "")).toLowerCase();
        if (blob.indexOf(q) < 0) return false;
      }
      return true;
    });
  }

  function syncHash() {
    var p = new URLSearchParams();
    if (HKF.q) p.set("q", HKF.q);
    if (HKF.cat6 !== "全部") p.set("cat6", HKF.cat6);
    if (HKF.ch !== "全部渠道") p.set("ch", HKF.ch);
    if (HKF.cn !== "全部") p.set("cn", HKF.cn);
    if (HKF.from) p.set("from", HKF.from);
    if (HKF.to) p.set("to", HKF.to);
    if (HKF.page > 1) p.set("page", HKF.page);
    var s = p.toString();
    history.replaceState(null, "", "#/hk-market" + (s ? "?" + s : ""));
  }

  /* ── 本次更新带（日批次） ── */
  function bandHtml() {
    var bs = batches();
    if (!bs.length) return "";
    var b = bs[bs.length - 1];
    var kind = b.batch_id.charAt(0) === "D" ? "日批次" : "回溯批次";
    var newDocs = b.new_ids
      ? b.new_ids.map(function (id) { return docs().find(function (d) { return d.doc_id === id; }); }).filter(Boolean)
      : docs().filter(function (d) { return d.pub_date === b.date && d.layer === "disclosed"; });
    var h = '<div class="panel"><div class="panel-h"><h2>本次更新带</h2><span class="dim" style="font-size:12px">'
      + esc(b.batch_id) + "（" + kind + " · 扫描日 " + esc(b.date) + "，香港时间=北京时间）— 口径：白名单类别，扫描 "
      + b.scanned + " / 收录 " + b.kept + " / 新增 " + b.new + " / 已见重复 " + b.dup + " / 排除程序性 " + b.excluded
      + (b.sfc_new ? " / SFC执法 +" + b.sfc_new : "") + (b.errors && b.errors.length ? " / 错误 " + b.errors.length : "")
      + '</span></div><div class="panel-b">';
    if (!newDocs.length) {
      h += '<div class="empty">本批次无新增收录（如实留白）。</div>';
    } else {
      var show = HKF.band ? newDocs : newDocs.slice(0, 8);
      h += show.map(function (d) {
        return '<div style="padding:6px 0;border-bottom:1px solid var(--line);font-size:13px">'
          + '<span class="dim">' + esc((d.pub_datetime || "").slice(5)) + "</span> "
          + '<span class="pill">' + esc(d.cat6) + '</span> '
          + "<b>" + esc(d.stock_name || "—") + "</b> <span class=\"dim\">" + esc(d.stock_code) + "</span> "
          + '<a href="' + esc(d.url) + '" target="_blank" rel="noopener">' + esc(d.title) + "</a>"
          + ' <span class="dim">' + esc(d.amount) + "</span></div>";
      }).join("");
      if (newDocs.length > 8) {
        h += '<div style="margin-top:8px"><a href="javascript:;" id="hkBandMore">'
          + (HKF.band ? "收起" : "展开全部 " + newDocs.length + " 条") + "</a>"
          + (b.new_ids ? "" : '<span class="dim" style="font-size:11.5px;margin-left:10px">（按公告日期归属本批次）</span>')
          + "</div>";
      }
    }
    h += "</div></div>";
    return h;
  }

  /* ── KPI（每个数字带口径） ── */
  function kpiHtml() {
    var ds = docs(), meta = (window.HKDB && HKDB.meta) || {};
    var dr = meta.date_range || ["—", "—"];
    var cos = {}, sfc = 0, pdfDone = 0, hkN = 0;
    ds.forEach(function (d) {
      if (d.stock_code) cos[d.stock_code] = 1;
      if (d.doc_id.indexOf("sfc_") === 0) sfc++; else hkN++;
      if (d.pdf_status === "done") pdfDone++;
    });
    var latest = ds.length ? (ds[0].pub_datetime || "—") : "—";
    return '<div class="statstrip">'
      + statCard(hkN, "披露易收录（条）", "窗口 " + dr[0] + " ~ " + dr[1] + " · 白名单类别口径")
      + statCard(Object.keys(cos).length, "涉及发行人（家）", "按股票代码去重 · 同上窗口")
      + statCard(sfc, "SFC 执法新闻（条）", "external 外部事实 · newsType=EF · 同窗口")
      + statCard(pdfDone, "PDF 首页已抽取", "金额/摘录来自公告原文第 1 页")
      + statCard(latest, "最新公告时间", "披露易 DATE_TIME 原文")
      + "</div>";
  }

  /* ── 筛选行 ── */
  function filterHtml() {
    return '<div class="filterbar">'
      + '<input class="finput" id="hkQ" type="text" placeholder="搜索 标题/公司/代码/金额…" value="' + esc(HKF.q) + '"/>'
      + '<select class="fsel" id="hkCat6"><option>全部</option>'
      + CAT6.map(function (c) { return '<option' + (HKF.cat6 === c ? " selected" : "") + ">" + c + "</option>"; }).join("")
      + "</select>"
      + '<select class="fsel" id="hkCh">'
      + CH_OPTS.map(function (c) { return '<option' + (HKF.ch === c ? " selected" : "") + ">" + c + "</option>"; }).join("")
      + "</select>"
      + '<select class="fsel" id="hkCn">'
      + ["全部", "是", "未知"].map(function (c) { return '<option' + (HKF.cn === c ? " selected" : "") + ">" + (c === "全部" ? "中国关联·全部" : "中国关联·" + c) + "</option>"; }).join("")
      + "</select>"
      + '<input class="fsel" id="hkFrom" type="date" value="' + esc(HKF.from) + '"/>'
      + '<input class="fsel" id="hkTo" type="date" value="' + esc(HKF.to) + '"/>'
      + '<button class="btn" id="hkCsv">导出当前筛选全部 CSV</button>'
      + '<span class="dim" id="hkCnt" style="font-size:12px"></span>'
      + "</div>";
  }

  /* ── 表格 ── */
  function tableHtml(rows) {
    if (!rows.length) return '<div class="empty">当前筛选无收录条目（如实留白，不展示推测内容）。</div>';
    var h = '<div class="tbl-wrap"><table class="tbl" style="table-layout:fixed"><colgroup>'
      + '<col style="width:118px"/><col style="width:150px"/><col style="width:180px"/><col/>'
      + '<col style="width:150px"/><col style="width:120px"/><col style="width:104px"/><col style="width:92px"/>'
      + "</colgroup><thead><tr>"
      + "<th>发布时间</th><th>代码·简称</th><th>港交所原文分类</th><th>事项（公告标题原文）</th>"
      + "<th>金额（原文口径）</th><th>类别</th><th>中国关联</th><th>来源</th></tr></thead><tbody>";
    h += rows.map(function (d) {
      var isSfc = d.doc_id.indexOf("sfc_") === 0;
      var layerPill = isSfc ? '<span class="pill warn">external</span> ' : '<span class="pill blue">disclosed</span> ';
      var links = isSfc
        ? '<a href="' + esc(d.url) + '" target="_blank" rel="noopener">SFC 原文</a>'
        : '<a href="' + esc(d.url) + '" target="_blank" rel="noopener">中</a>'
        + (d.url_en ? ' · <a href="' + esc(d.url_en) + '" target="_blank" rel="noopener">英</a>' : "");
      var excerpt = d.excerpt
        ? '<div class="dim" style="font-size:11.5px;margin-top:3px">摘录P1：' + esc(d.excerpt.slice(0, 90)) + "…</div>" : "";
      return "<tr>"
        + "<td>" + esc(d.pub_datetime || d.pub_date) + "</td>"
        + "<td style=\"word-break:break-word\"><b>" + esc(d.stock_name || "—") + "</b><br/><span class=\"dim\">" + esc(d.stock_code) + "</span></td>"
        + "<td style=\"word-break:break-word;font-size:12px\">" + esc(d.headline_raw || d.cat6_sub) + "</td>"
        + "<td style=\"word-break:break-word\">" + layerPill + esc(d.title) + excerpt + "</td>"
        + "<td style=\"word-break:break-word;font-size:12.5px\">" + esc(d.amount) + "</td>"
        + "<td><span class=\"pill\">" + esc(d.cat6) + "</span></td>"
        + "<td style=\"font-size:12px\">" + esc(d.cn_related) + "</td>"
        + "<td>" + links + "</td>"
        + "</tr>";
    }).join("");
    return h + "</tbody></table></div>";
  }

  function pageHtml(total) {
    var pages = Math.max(1, Math.ceil(total / PAGE));
    if (pages <= 1) return "";
    var h = '<div style="display:flex;gap:6px;align-items:center;margin:12px 0;flex-wrap:wrap;font-size:13px">';
    h += '<button class="btn" id="hkPrev"' + (HKF.page <= 1 ? " disabled" : "") + ">上一页</button>";
    h += "<span class=\"dim\">第 " + HKF.page + " / " + pages + " 页 · 每页 " + PAGE + " 条</span>";
    h += '<button class="btn" id="hkNext"' + (HKF.page >= pages ? " disabled" : "") + ">下一页</button></div>";
    return h;
  }

  /* ── 方法与数据源状态 ── */
  function methodHtml() {
    var meta = (window.HKDB && HKDB.meta) || {};
    var bs = batches().slice(-10).reverse();
    var h = '<div class="panel"><div class="panel-h"><h2>数据源与批次日志</h2></div><div class="panel-b" style="font-size:13px;line-height:1.9">'
      + "<b>采集口径</b>：" + esc(meta.scope || "—") + "<br/>"
      + "<b>类别字典版本</b>：" + esc(meta.tier2_dict_version || "—")
      + "（披露易 tierone/tiertwo 官方 JSON 缓存）· <b>去重主键</b>：NEWS_ID / SFC newsRefNo · <b>数据文件</b>：state/hk_market.json（追加不覆盖）<br/>"
      + "<b>三分层</b>：披露易公告 = <span class=\"pill blue\">disclosed</span> 公司披露；SFC 执法新闻 = <span class=\"pill warn\">external</span> 外部事实（附来源）；六类归类与中国关联标签 = 系统规则映射（类别码/关键词，页面注明为标签，不作筛选前提）。<br/>"
      + "<b>金额</b>：仅抓取白名单命中公告 PDF 首页抽取原文表述；原文未披露显示【未披露】；PDF 待补条目金额暂为【未披露】。"
      + "</div>";
    if (bs.length) {
      h += '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>批次</th><th>扫描日</th><th>扫描</th><th>收录</th><th>新增</th><th>重复</th><th>排除</th><th>PDF</th><th>错误</th></tr></thead><tbody>'
        + bs.map(function (b) {
          return "<tr><td>" + esc(b.batch_id) + "</td><td>" + esc(b.date) + "</td><td>" + b.scanned + "</td><td>"
            + b.kept + "</td><td>" + b.new + "</td><td>" + b.dup + "</td><td>" + b.excluded + "</td><td>"
            + (b.pdf_fetched || 0) + "</td><td>" + ((b.errors && b.errors.length) || 0) + "</td></tr>";
        }).join("") + "</tbody></table></div>";
    }
    return h + "</div>";
  }

  /* ── 主渲染 ── */
  window.render_hk = function (qs) {
    qs = qs || new URLSearchParams();
    HKF.q = qs.get("q") || HKF.q || "";
    HKF.cat6 = qs.get("cat6") || HKF.cat6;
    HKF.ch = qs.get("ch") || HKF.ch;
    HKF.cn = qs.get("cn") || HKF.cn;
    HKF.from = qs.get("from") || HKF.from;
    HKF.to = qs.get("to") || HKF.to;
    if (qs.get("page")) HKF.page = parseInt(qs.get("page"), 10) || 1;
    if (!window.HKDB) {
      return '<div class="ph"><h1>港股（HKEX）全量重大事项</h1><span class="sub">本页回答：HKEX 披露易全市场披露中，最近有哪些交易、融资、运营、法律与战略重大事项</span></div>'
        + '<div class="panel"><div class="panel-b" style="padding:34px 24px;text-align:center">'
        + '<div style="font-size:15px;font-weight:700;margin-bottom:8px">数据文件未生成</div>'
        + '<div class="note" style="max-width:560px;margin:0 auto;line-height:1.9">assets/hk_data.js 不存在——请先运行 scripts/hkex_market_pull.py。本页不展示推测或占位内容。</div>'
        + "</div></div>";
    }
    var h = '<div class="ph"><h1>港股（HKEX）全量重大事项</h1><span class="sub">本页回答：HKEX 披露易全市场披露中，最近有哪些交易、融资、运营、法律与战略重大事项</span></div>';
    h += '<div class="panel"><div class="panel-h"><h2>口径说明</h2></div><div class="panel-b" style="line-height:1.9;font-size:13px">'
      + "本页口径：<b>披露易全市场标题检索（stockId=-1，不分中企外企）</b>＋ SFC 执法新闻（external）；"
      + "事项分六类：" + CAT6.join("、") + "（由港交所二级类别码规则映射）。"
      + "本页与「出海信批归纳」（仅中企）及美股、出口管制分页面的数据文件、统计口径<b>互不混用</b>；"
      + "中国关联仅为标签（名称/标题弱启发式），不作筛选前提。</div></div>";
    h += bandHtml();
    h += kpiHtml();
    h += filterHtml();
    h += '<div id="hkBody"></div>';
    h += methodHtml();
    return h;
  };

  function bodyRender() {
    var box = $("hkBody");
    if (!box) return;
    var rows = filtered();
    var pages = Math.max(1, Math.ceil(rows.length / PAGE));
    if (HKF.page > pages) HKF.page = pages;
    var slice = rows.slice((HKF.page - 1) * PAGE, HKF.page * PAGE);
    var cnt = $("hkCnt");
    if (cnt) cnt.textContent = "筛选命中 " + rows.length + " 条 / 库内共 " + docs().length + " 条";
    box.innerHTML = tableHtml(slice) + pageHtml(rows.length);
    var pv = $("hkPrev"), nx = $("hkNext");
    if (pv) pv.addEventListener("click", function () { HKF.page--; syncHash(); bodyRender(); });
    if (nx) nx.addEventListener("click", function () { HKF.page++; syncHash(); bodyRender(); });
  }

  function exportCsv() {
    var rows = filtered();
    var head = ["发布日期", "时间", "代码", "简称", "渠道", "港交所原文分类", "类别", "事项标题", "金额(原文口径)", "中国关联", "layer", "中文链接", "英文链接"];
    var lines = [head.join(",")];
    rows.forEach(function (d) {
      var cells = [d.pub_date, (d.pub_datetime || "").slice(11), d.stock_code, d.stock_name, d.channel,
        d.headline_raw || d.cat6_sub, d.cat6, d.title, d.amount, d.cn_related, d.layer, d.url, d.url_en || ""];
      lines.push(cells.map(function (c) {
        c = String(c == null ? "" : c);
        return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c;
      }).join(","));
    });
    var blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "pubx-hkex-market-" + (HKF.from || "all") + "_" + (HKF.to || "all") + ".csv";
    a.click();
  }

  window.bind_hk = function () {
    if (!window.HKDB) return;
    bodyRender();
    var q = $("hkQ");
    if (q) q.addEventListener("input", function (e) { HKF.q = e.target.value; HKF.page = 1; syncHash(); bodyRender(); });
    [["hkCat6", "cat6"], ["hkCh", "ch"], ["hkCn", "cn"], ["hkFrom", "from"], ["hkTo", "to"]].forEach(function (x) {
      var el = $(x[0]);
      if (el) el.addEventListener("change", function (e) { HKF[x[1]] = e.target.value; HKF.page = 1; syncHash(); bodyRender(); });
    });
    var csv = $("hkCsv");
    if (csv) csv.addEventListener("click", exportCsv);
    var bm = $("hkBandMore");
    if (bm) bm.addEventListener("click", function () {
      HKF.band = !HKF.band;
      var view = document.getElementById("view");
      view.innerHTML = window.render_hk(new URLSearchParams());
      window.bind_hk();
    });
  };
})();
