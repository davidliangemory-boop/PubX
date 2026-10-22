/* PubX 美股（SEC）全量重大事项页 —— 独立分页面 #/us
 * 数据：assets/us_data.js（window.US_DATA，由 scripts/sec_market_pull.py 生成，按需懒加载）
 * 口径：EDGAR 全量，不分中企外企；与「出海信批归纳」数据文件、统计互不混用。
 * 暴露 window.render_us(root)，由 app.js 路由分发调用。
 */
(function () {
  "use strict";
  var PAGE = 50;
  var CATS = ["全部", "交易类", "融资类", "运营", "法律（诉讼/监管处罚）", "对外投资", "经营战略重大事项"];
  var AMT_B = ["全部", "【未披露】", "<100万美元", "100万–1亿美元", "1亿–10亿美元", "≥10亿美元", "非美元/其他"];
  var CN_B = ["全部", "是", "未知"];
  var UF = { from: "", to: "", cat: "全部", sub: "全部", form: "全部", amt: "全部", cn: "全部", q: "", page: 1 };
  var bound = false;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function $(id) { return document.getElementById(id); }

  function amtBucket(a) {
    if (!a || a === "【未披露】") return "【未披露】";
    var m = String(a).match(/(US\$|USD|\$|€|£|RMB|CNY|HK\$)\s?([\d,]*\.?\d+)\s?(million|billion|trillion|thousand)?/i);
    if (!m) return "非美元/其他";
    if (!/US\$|USD|\$/i.test(m[1])) return "非美元/其他";
    var v = parseFloat(m[2].replace(/,/g, ""));
    var mult = { thousand: 1e3, million: 1e6, billion: 1e9, trillion: 1e12 }[(m[3] || "").toLowerCase()] || 1;
    var usd = v * mult;
    if (usd < 1e6) return "<100万美元";
    if (usd < 1e8) return "100万–1亿美元";
    if (usd < 1e9) return "1亿–10亿美元";
    return "≥10亿美元";
  }

  function parseQS() {
    var hraw = location.hash.replace(/^#/, "");
    var qs = new URLSearchParams(hraw.split("?")[1] || "");
    UF.from = qs.get("from") || ""; UF.to = qs.get("to") || "";
    UF.cat = qs.get("cat") || "全部"; UF.sub = qs.get("sub") || "全部";
    UF.form = qs.get("form") || "全部"; UF.amt = qs.get("amt") || "全部";
    UF.cn = qs.get("cn") || "全部"; UF.q = qs.get("q") || "";
    UF.page = parseInt(qs.get("page") || "1", 10) || 1;
  }
  function syncQS() {
    var p = [];
    if (UF.from) p.push("from=" + UF.from);
    if (UF.to) p.push("to=" + UF.to);
    ["cat", "sub", "form", "amt", "cn", "q"].forEach(function (k) {
      if (UF[k] && UF[k] !== "全部") p.push(k + "=" + encodeURIComponent(UF[k]));
    });
    if (UF.page > 1) p.push("page=" + UF.page);
    history.replaceState(null, "", "#/us" + (p.length ? "?" + p.join("&") : ""));
  }

  function entries() { return (window.US_DATA && window.US_DATA.entries) || []; }
  function meta() { return (window.US_DATA && window.US_DATA.meta) || {}; }

  function filtered() {
    var q = UF.q.trim().toLowerCase();
    return entries().filter(function (e) {
      if (UF.from && e.date < UF.from) return false;
      if (UF.to && e.date > UF.to) return false;
      if (UF.cat !== "全部" && e.category !== UF.cat) return false;
      if (UF.sub !== "全部" && e.subtype !== UF.sub) return false;
      if (UF.form !== "全部" && e.form !== UF.form) return false;
      if (UF.cn !== "全部" && e.china !== UF.cn) return false;
      if (UF.amt !== "全部" && amtBucket(e.amount) !== UF.amt) return false;
      if (q) {
        var hay = (e.company + " " + (e.ticker || "") + " " + e.summary + " " +
                   e.counterparty + " " + e.subtype + " " + e.cik).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
  }

  function statCard(n, c, d) {
    return '<div class="stat"><div class="n">' + esc(n) + '</div><div class="c">' + esc(c) + "</div>" +
           (d ? '<div class="d">' + esc(d) + "</div>" : "") + "</div>";
  }
  function opts(list, cur) {
    return list.map(function (x) {
      return '<option value="' + esc(x) + '"' + (x === cur ? " selected" : "") + ">" + esc(x) + "</option>";
    }).join("");
  }

  function exportCSV(rows) {
    var head = ["发布日期", "公司", "CIK", "代码", "表格类型", "Items", "类别", "子类",
                "一句话事项", "金额(原文币种)", "交易对方", "中国关联", "原文链接", "索引页"];
    var lines = [head.join(",")];
    rows.forEach(function (e) {
      var r = [e.date, e.company, e.cik, e.ticker || "", e.form,
               (e.items || []).join(" "), e.category, e.subtype,
               e.summary, e.amount, e.counterparty, e.china, e.url, e.index_url];
      lines.push(r.map(function (v) {
        v = String(v == null ? "" : v).replace(/"/g, '""');
        return /[",\n]/.test(v) ? '"' + v + '"' : v;
      }).join(","));
    });
    var blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "pubx_us_sec_" + (meta().date_range || []).join("_") + "_" + rows.length + "rows.csv";
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  }

  function render() {
    var root = $("usroot");
    if (!root) return;
    if (!window.US_DATA) {
      root.innerHTML = '<div class="panel"><div class="panel-b" style="padding:34px 24px;text-align:center">'
        + '<div style="font-size:15px;font-weight:700;margin-bottom:8px">数据加载中…</div>'
        + '<div class="note">正在载入 assets/us_data.js（首次访问需下载完整数据文件）</div></div></div>';
      if (!window.__us_data_loading) {
        window.__us_data_loading = true;
        var s = document.createElement("script");
        s.src = "./assets/us_data.js";
        s.onload = function () { render(); };
        s.onerror = function () {
          root.innerHTML = '<div class="panel"><div class="panel-b"><div class="empty">'
            + "assets/us_data.js 缺失：请先运行 scripts/sec_market_pull.py 生成数据。</div></div></div>";
        };
        document.body.appendChild(s);
      }
      return;
    }

    parseQS();
    var M = meta(), all = entries(), rows = filtered();
    var dr = M.date_range || [];
    var batches = M.batches || [];
    var lastB = batches[batches.length - 1] || {};
    var nDays = Object.keys(lastB.dates || {}).filter(function (d) {
      return lastB.dates[d].status === "ok";
    }).length;
    var byCat = {};
    all.forEach(function (e) { byCat[e.category] = (byCat[e.category] || 0) + 1; });

    var h = '<div class="ph"><h1>美股（SEC）· 全量重大事项</h1>'
      + '<span class="sub">本页回答：SEC EDGAR 全量披露（不分中企外企）中，最近有哪些交易、融资、运营、法律与战略重大事项</span></div>';

    h += '<div class="statstrip">'
      + statCard(all.length, "收录条目（筛选后 " + rows.length + "）",
                 "窗口 " + (dr[0] || "—") + " ~ " + (dr[1] || "—") + " · 白名单口径")
      + statCard(lastB.batch_id || "—", "最近批次",
                 (lastB.new_entries != null ? "新增 " + lastB.new_entries + " 条 · " : "") + "索引可用 " + nDays + " 天")
      + statCard(dr[1] || "—", "数据至（EDGAR T+1）", "当日索引未发布属正常")
      + statCard((byCat["交易类"] || 0) + " / " + (byCat["融资类"] || 0), "交易类 / 融资类", "全窗口计数")
      + "</div>";

    h += '<div class="panel"><div class="panel-b us-fbar">'
      + '<label>日期 <input type="date" id="uffrom" value="' + esc(UF.from) + '"/> – '
      + '<input type="date" id="ufto" value="' + esc(UF.to) + '"/></label>'
      + '<select class="fsel" id="ufcat">' + opts(CATS, UF.cat) + "</select>"
      + '<select class="fsel" id="ufsub"></select>'
      + '<select class="fsel" id="ufform"></select>'
      + '<select class="fsel" id="ufamt">' + opts(AMT_B, UF.amt) + "</select>"
      + '<select class="fsel" id="ufcn">' + opts(CN_B, UF.cn) + "</select>"
      + '<input type="search" id="ufq" placeholder="关键词：公司/代码/事项/对方…" value="' + esc(UF.q) + '"/>'
      + '<button class="btn primary" id="ufcsv">导出 CSV（筛选后全部 ' + rows.length + ' 行）</button>'
      + "</div></div>";

    var totalPages = Math.max(1, Math.ceil(rows.length / PAGE));
    if (UF.page > totalPages) UF.page = totalPages;
    var slice = rows.slice((UF.page - 1) * PAGE, UF.page * PAGE);
    h += '<div class="panel"><div class="tbl-wrap"><table class="tbl us-tbl"><thead><tr>'
      + "<th>日期</th><th>公司 / 代码</th><th>表格</th><th>Items（8-K）</th><th>类别 · 子类</th>"
      + "<th>一句话事项（原文抽取）</th><th>金额</th><th>交易对方</th><th>中国关联</th><th>原文</th>"
      + "</tr></thead><tbody>";
    if (!slice.length) {
      h += '<tr><td colspan="10"><div class="empty">当前筛选无结果'
        + (all.length ? "" : "：采集尚无收录数据，如实留白") + "</div></td></tr>";
    }
    slice.forEach(function (e) {
      var items = (e.items || []).map(function (it, i) {
        return '<span class="pill" title="' + esc((e.item_names || [])[i] || "") + '">' + esc(it) + "</span>";
      }).join(" ");
      h += "<tr>"
        + '<td class="code">' + esc(e.date) + "</td>"
        + "<td><b>" + esc(e.company) + "</b><br/><span class=\"code\">"
        + esc(e.ticker ? e.ticker + " · " : "") + "CIK " + esc(e.cik) + "</span></td>"
        + '<td><span class="pill blue">' + esc(e.form) + "</span></td>"
        + "<td>" + (items || '<span class="code">—</span>') + "</td>"
        + "<td>" + esc(e.category) + '<br/><span class="code">' + esc(e.subtype) + "</span></td>"
        + '<td class="us-sum">' + esc(e.summary) + "</td>"
        + '<td class="money">' + esc(e.amount) + "</td>"
        + "<td>" + esc(e.counterparty) + "</td>"
        + '<td><span class="pill ' + (e.china === "是" ? "warn" : "") + '" title="' + esc(e.china_basis || "") + '">'
        + esc(e.china) + "</span></td>"
        + '<td><a href="' + esc(e.url) + '" target="_blank" rel="noopener">主文档</a> · '
        + '<a href="' + esc(e.index_url) + '" target="_blank" rel="noopener">索引</a></td>'
        + "</tr>";
    });
    h += "</tbody></table></div>"
      + '<div class="panel-b us-pager">'
      + '<button class="densbtn" id="uprev"' + (UF.page <= 1 ? " disabled" : "") + ">上一页</button>"
      + '<span class="note">第 ' + UF.page + " / " + totalPages + " 页 · 每页 " + PAGE + " 条 · 共 " + rows.length + " 条</span>"
      + '<button class="densbtn" id="unext"' + (UF.page >= totalPages ? " disabled" : "") + ">下一页</button>"
      + "</div></div>";

    h += '<div class="panel"><div class="panel-h"><h2>口径说明</h2></div>'
      + '<div class="panel-b" style="line-height:1.9;font-size:13px">'
      + esc(M.caliber || "")
      + "<br/><b>分层</b>：一句话事项/金额为原文正则抽取（disclosed）；类别/子类/中国关联为系统规则推断（analysis，依据=表格类型+Item 编号+关键词）。"
      + "中国关联仅作标签：<b>是</b>=CIK 命中出海观察名单或公司名含中国地名/中概关键词；<b>未知</b>=未进一步核查，不代表「否」。"
      + "本页与「出海信批归纳」（仅中企）及港股、出口管制分页面的数据文件、统计口径<b>互不混用</b>。"
      + "</div></div>";

    root.innerHTML = h;

    // 子类 / 表格选项按当前数据与类别联动
    var subs = ["全部"], forms = ["全部"];
    all.forEach(function (e) {
      if ((UF.cat === "全部" || e.category === UF.cat) && subs.indexOf(e.subtype) < 0) subs.push(e.subtype);
      if (forms.indexOf(e.form) < 0) forms.push(e.form);
    });
    forms.sort(function (a, b) { return a === "全部" ? -1 : b === "全部" ? 1 : a.localeCompare(b); });
    if (subs.indexOf(UF.sub) < 0) UF.sub = "全部";
    $("ufsub").innerHTML = opts(subs, UF.sub);
    $("ufform").innerHTML = opts(forms, UF.form);

    function re(page1) {
      if (page1) UF.page = 1;
      syncQS(); render();
    }
    [["uffrom", "from"], ["ufto", "to"], ["ufcat", "cat"], ["ufsub", "sub"],
     ["ufform", "form"], ["ufamt", "amt"], ["ufcn", "cn"]].forEach(function (x) {
      $(x[0]).addEventListener("change", function (e) { UF[x[1]] = e.target.value; re(true); });
    });
    var qt;
    $("ufq").addEventListener("input", function (e) {
      clearTimeout(qt);
      qt = setTimeout(function () { UF.q = e.target.value; re(true); }, 350);
    });
    $("ufcsv").addEventListener("click", function () { exportCSV(filtered()); });
    $("uprev").addEventListener("click", function () { if (UF.page > 1) { UF.page--; syncQS(); render(); } });
    $("unext").addEventListener("click", function () { if (UF.page < totalPages) { UF.page++; syncQS(); render(); } });
    bound = true;
  }

  window.render_us = function (root) {
    if (root && root.id !== "usroot") root.id = "usroot";
    render();
  };
})();
