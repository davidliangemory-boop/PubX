/* ═════════ PubX 港股（HKEX）全量重大事项页 #/hk-market ═════════
   独立模块：数据 window.HKDB（assets/hk_data.js，由 scripts/hkex_market_pull.py 生成）。
   与「出海信批归纳」数据文件、统计口径互不混用。
   app.js 仅以 window.render_hk(qs) / window.bind_hk() 两个钩子调用本文件。 */
(function () {
  "use strict";
  var CAT6 = ["融资类", "投并购", "运营", "法律（诉讼/监管处罚）", "对外投资", "经营战略重大事项"];
  var STAGES = ["首次披露", "进展", "完成", "终止", "条款变更", "延迟"];
  var CH_OPTS = ["全部渠道", "HKEX·披露易（全市场）", "SFC·執法新聞"];
  var PAGE = 50;
  var HKF = { q: "", cat6: "全部", stage: "全部", ch: "全部渠道", cn: "全部", from: "", to: "", page: 1, band: 0, open: "" };

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
  function isSfc(d) { return d.doc_id.indexOf("sfc_") === 0; }
  function stagePill(d) {
    var s = d.stage || "";
    if (!s || s === "—") return "";
    var cls = s === "终止" ? "pill warn" : (s === "完成" ? "pill blue" : "pill");
    return '<span class="' + cls + '" title="披露阶段为系统规则推断（analysis）：依据港交所二级类别码（16600 終止/16100 延誤/16700 條款更改等）与标题关键词，非原文表述">' + esc(s) + "</span>";
  }
  /* 中国关联：仅标签（名称/标题弱启发式），表格内短显，依据放 title */
  function cnCell(d) {
    if ((d.cn_related || "").indexOf("是") === 0) {
      return '<span title="' + esc(d.cn_related) + '（仅标签，不作筛选前提）">是·弱启发</span>';
    }
    return '<span class="dim" title="名称/标题未检出中资关联线索（弱启发式，仅标签，不作筛选前提）">未检出</span>';
  }

  function filtered() {
    var q = HKF.q.trim().toLowerCase();
    return docs().filter(function (d) {
      if (HKF.cat6 !== "全部" && d.cat6 !== HKF.cat6) return false;
      if (HKF.stage !== "全部" && (d.stage || "—") !== HKF.stage) return false;
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
    if (HKF.stage !== "全部") p.set("stage", HKF.stage);
    if (HKF.ch !== "全部渠道") p.set("ch", HKF.ch);
    if (HKF.cn !== "全部") p.set("cn", HKF.cn);
    if (HKF.from) p.set("from", HKF.from);
    if (HKF.to) p.set("to", HKF.to);
    if (HKF.page > 1) p.set("page", HKF.page);
    var s = p.toString();
    history.replaceState(null, "", "#/hk-market" + (s ? "?" + s : ""));
  }

  /* ── 本次更新带（按扫描日取最新日批/回溯批；忽略未完成的历史滚动 H- 窗） ── */
  function bandHtml() {
    var bs = batches().slice().filter(function (x) {
      var id = String(x.batch_id || "");
      if (id.charAt(0) === "H") return false; /* 历史滚动窗不占更新带 */
      return true;
    }).sort(function (a, b) {
      return String(a.date || "") < String(b.date || "") ? -1 : 1;
    });
    if (!bs.length) {
      bs = batches().slice().sort(function (a, b) {
        return String(a.date || "") < String(b.date || "") ? -1 : 1;
      });
    }
    if (!bs.length) return "";
    var latest = bs[bs.length - 1];
    var b = latest;
    if (!(b.new > 0 || b.sfc_new > 0)) {
      for (var i = bs.length - 1; i >= 0; i--) {
        if (bs[i].new > 0 || bs[i].sfc_new > 0) { b = bs[i]; break; }
      }
    }
    var kind = b.batch_id.charAt(0) === "D" ? "日批次" : "回溯批次";
    var newDocs = b.new_ids
      ? b.new_ids.map(function (id) { return docs().find(function (d) { return d.doc_id === id; }); }).filter(Boolean)
      : docs().filter(function (d) { return d.pub_date === b.date; });
    var h = '<div class="panel"><div class="panel-h"><h2>本次更新带</h2><span class="dim" style="font-size:12px">'
      + esc(b.batch_id) + "（" + kind + " · 扫描日 " + esc(b.date) + "，香港时间=北京时间）— 口径：白名单类别，扫描 "
      + b.scanned + " / 收录 " + b.kept + " / 新增 " + b.new + " / 已见重复 " + b.dup + " / 排除程序性 " + b.excluded
      + (b.sfc_new ? " / SFC执法 +" + b.sfc_new : "") + (b.errors && b.errors.length ? " / 错误 " + b.errors.length : "")
      + '</span></div><div class="panel-b">';
    if (b !== latest) {
      h += '<div class="note" style="margin-bottom:8px">最新批次 ' + esc(latest.batch_id) + "（扫描日 " + esc(latest.date)
        + "）无新增收录（如实留白，可能为周末/盘前）；以下为最近有新增的批次。</div>";
    }
    if (!newDocs.length) {
      h += '<div class="empty">本批次无新增收录（如实留白）。</div>';
    } else {
      var show = HKF.band ? newDocs : newDocs.slice(0, 8);
      h += show.map(function (d) {
        var layerPill = isSfc(d) ? '<span class="pill warn">external</span> ' : '<span class="pill blue">disclosed</span> ';
        return '<div style="padding:6px 0;border-bottom:1px solid var(--line);font-size:13px">'
          + '<span class="dim">' + esc((d.pub_datetime || "").slice(5)) + "</span> "
          + '<span class="pill">' + esc(d.cat6) + '</span> ' + stagePill(d) + " " + layerPill
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

  /* ── 本期重要交易速览（主体→事项→金额→出处，逐条可核对） ── */
  function spotlightHtml() {
    var meta = (window.HKDB && HKDB.meta) || {};
    var dr = meta.date_range || ["—", "—"];
    var big = docs().filter(function (d) {
      return !isSfc(d) && d.cat6 !== "常规程序" && d.amount !== "【未披露】"
        && /非常重大|主要交易|須予披露的交易|關連交易/.test(d.headline_raw || "");
    }).slice(0, 8);
    if (!big.length) return "";
    var h = '<div class="panel"><div class="panel-h"><h2>本期重要交易速览</h2>'
      + '<span class="dim" style="font-size:12px">口径：窗口 ' + esc(dr[0]) + " ~ " + esc(dr[1])
      + ' 内港交所分类为须予披露/主要/非常重大/关连交易、且 PDF 首页抽取到金额的条目，按时间倒序取前 8</span></div>'
      + '<div class="panel-b"><div class="tbl-wrap"><table class="tbl" style="table-layout:fixed;min-width:820px"><colgroup>'
      + '<col style="width:96px"/><col style="width:170px"/><col/><col style="width:200px"/><col style="width:96px"/>'
      + "</colgroup><thead><tr><th>日期</th><th>主体</th><th>事项（公告标题原文）</th><th>金额（原文口径）</th><th>来源</th></tr></thead><tbody>";
    h += big.map(function (d) {
      return "<tr><td>" + esc(d.pub_date) + "</td>"
        + "<td style=\"word-break:break-word\"><b>" + esc(d.stock_name || "—") + "</b> <span class=\"dim\">" + esc(d.stock_code) + "</span></td>"
        + "<td style=\"word-break:break-word\">" + esc(d.title) + "</td>"
        + "<td style=\"word-break:break-word\"><b>" + esc(d.amount) + "</b></td>"
        + '<td><a href="' + esc(d.url) + '" target="_blank" rel="noopener">中</a>'
        + (d.url_en ? ' · <a href="' + esc(d.url_en) + '" target="_blank" rel="noopener">英</a>' : "") + "</td></tr>";
    }).join("");
    return h + "</tbody></table></div></div></div>";
  }

  /* ── 在途事项链（仿 Vault 公司→事项→出处：同一发行人窗口内连续披露按时间串链） ── */
  function chainsHtml() {
    var meta = (window.HKDB && HKDB.meta) || {};
    var dr = meta.date_range || ["—", "—"];
    var byCo = {};
    docs().forEach(function (d) {
      // 剔除「海外監管公告」转登、例行程序文件与自愿性业务更新（A+H 转登/自愿公告非单一事项连续披露，串链无意义）
      if (isSfc(d) || !d.stock_code || d.cat6 === "常规程序") return;
      if (/海外監管公告/.test(d.headline_raw || "")) return;
      if (/業務發展最新情況/.test(d.cat6_sub || "") && /^自願/.test(d.title || "")) return;
      (byCo[d.stock_code] = byCo[d.stock_code] || []).push(d);
    });
    var chains = Object.keys(byCo).map(function (k) {
      var arr = byCo[k].slice().sort(function (a, b) {
        return (a.pub_datetime || "") < (b.pub_datetime || "") ? -1 : 1;
      });
      return arr;
    }).filter(function (arr) { return arr.length >= 2; });
    chains.sort(function (a, b) { return b.length - a.length; });
    if (!chains.length) return "";
    var h = '<div class="panel"><div class="panel-h"><h2>在途事项链</h2>'
      + '<span class="dim" style="font-size:12px">口径：窗口 ' + esc(dr[0]) + " ~ " + esc(dr[1])
      + ' 内同一发行人 ≥2 条收录（剔除「海外監管公告」转登、常规程序文件与自愿性业务更新），按时间排列（共 ' + chains.length + ' 链，取前 10）；阶段为系统规则推断（analysis：类别码+标题关键词），点击公司名穿透到该发行人全部收录</span></div>'
      + '<div class="panel-b">';
    h += chains.slice(0, 10).map(function (arr) {
      var d0 = arr[0];
      // 连续同名披露（如收购守则规则22每日交易披露）折叠为 ×N
      var comp = [];
      arr.forEach(function (d) {
        var last = comp[comp.length - 1];
        if (last && last.d.title === d.title && last.d.stage === d.stage) {
          last.n++; last.tail = d;
        } else {
          comp.push({ d: d, n: 1, tail: d });
        }
      });
      var items = comp.map(function (c) {
        var d = c.d;
        var lbl = d.title.length > 34 ? d.title.slice(0, 34) + "…" : d.title;
        var rng = c.n > 1 ? " ×" + c.n + "（" + (d.pub_date || "").slice(5) + "~" + (c.tail.pub_date || "").slice(5) + "）" : "";
        return '<span>' + '<span class="dim">' + esc((d.pub_date || "").slice(5)) + "</span> "
          + stagePill(d) + ' <a href="' + esc(d.url) + '" target="_blank" rel="noopener" title="'
          + esc(d.headline_raw || "") + '">' + esc(lbl) + "</a>" + esc(rng) + "</span>";
      }).join(' <span class="dim">→</span> ');
      return '<div style="padding:7px 0;border-bottom:1px solid var(--line);font-size:12.5px;line-height:2">'
        + '<a href="javascript:;" data-hkchain="' + esc(d0.stock_code) + '" style="font-weight:700">'
        + esc(d0.stock_name || "—") + " " + esc(d0.stock_code) + "</a>"
        + ' <span class="dim">(' + arr.length + " 条）</span> " + items + "</div>";
    }).join("");
    return h + "</div></div>";
  }

  /* ── 阶段 × 六类矩阵（仿投行天下看板穿透：点格子=组合筛选，每格数字同窗口口径） ── */
  function matrixHtml() {
    var meta = (window.HKDB && HKDB.meta) || {};
    var dr = meta.date_range || ["—", "—"];
    var m = {};
    docs().forEach(function (d) {
      if (isSfc(d)) return;
      var k = d.cat6 + "|" + (d.stage || "首次披露");
      m[k] = (m[k] || 0) + 1;
    });
    var h = '<div class="panel"><div class="panel-h"><h2>阶段 × 类别分布</h2>'
      + '<span class="dim" style="font-size:12px">口径：窗口 ' + esc(dr[0]) + " ~ " + esc(dr[1])
      + ' 库内披露易收录中属六类者（不含 SFC external 与常规程序）；阶段为系统规则推断；点击格子穿透到对应筛选</span></div>'
      + '<div class="panel-b"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>类别</th>'
      + STAGES.map(function (s) { return "<th>" + esc(s) + "</th>"; }).join("") + "<th>合计</th></tr></thead><tbody>";
    CAT6.forEach(function (c) {
      var rowN = 0;
      var cells = STAGES.map(function (s) {
        var n = m[c + "|" + s] || 0;
        rowN += n;
        return n ? '<td><a href="javascript:;" data-hkmatrix="' + esc(c) + "|" + esc(s) + '">' + n + "</a></td>" : "<td class=\"dim\">·</td>";
      }).join("");
      h += "<tr><td>" + esc(c) + "</td>" + cells + "<td><b>" + rowN + "</b></td></tr>";
    });
    return h + "</tbody></table></div></div></div>";
  }

  /* ── 风险与异常信号（负面/异常进展单列：终止·延迟·条款变更·停复牌·清盘·盈警·非标报告） ── */
  function riskHtml() {
    var meta = (window.HKDB && HKDB.meta) || {};
    var dr = meta.date_range || ["—", "—"];
    var rows = docs().filter(function (d) {
      if (isSfc(d) || d.cat6 === "常规程序") return false;
      if (["终止", "延迟", "条款变更"].indexOf(d.stage) >= 0) return true;
      return /停牌|復牌|除牌|清盤|盈利警告|非標準報告/.test((d.title || "") + " " + (d.headline_raw || ""));
    });
    if (!rows.length) return "";
    var h = '<div class="panel"><div class="panel-h"><h2>风险与异常信号</h2>'
      + '<span class="dim" style="font-size:12px">口径：窗口 ' + esc(dr[0]) + " ~ " + esc(dr[1])
      + ' 内阶段（系统推断）为终止/延迟/条款变更，或标题/分类含停牌·复牌·除牌·清盘·盈利警告·非标报告的披露易收录（不含 SFC 与常规程序），共 '
      + rows.length + ' 条，按时间倒序取前 12；判断依据=港交所类别码+标题关键词（analysis），事实以原文为准</span></div>'
      + '<div class="panel-b">';
    h += rows.slice(0, 12).map(function (d) {
      return '<div style="padding:6px 0;border-bottom:1px solid var(--line);font-size:13px">'
        + '<span class="dim">' + esc(d.pub_date) + "</span> " + stagePill(d) + " "
        + '<span class="pill">' + esc(d.cat6) + '</span> '
        + "<b>" + esc(d.stock_name || "—") + "</b> <span class=\"dim\">" + esc(d.stock_code) + "</span> "
        + '<a href="' + esc(d.url) + '" target="_blank" rel="noopener" title="' + esc(d.headline_raw || "") + '">'
        + esc(d.title) + "</a>"
        + (d.amount !== "【未披露】" ? ' <span class="dim">' + esc(d.amount) + "</span>" : "")
        + "</div>";
    }).join("");
    return h + "</div></div>";
  }

  /* ── KPI（每个数字带口径） ── */
  function kpiHtml() {
    var ds = docs(), meta = (window.HKDB && HKDB.meta) || {};
    var dr = meta.date_range || ["—", "—"];
    var cos = {}, sfc = 0, pdfDone = 0, hkN = 0, routine = 0;
    ds.forEach(function (d) {
      if (d.stock_code) cos[d.stock_code] = 1;
      if (isSfc(d)) sfc++; else hkN++;
      if (d.cat6 === "常规程序") routine++;
      if (d.pdf_status === "done") pdfDone++;
    });
    var latest = ds.length ? (ds[0].pub_datetime || "—") : "—";
    return '<div class="statstrip">'
      + statCard(hkN, "披露易收录（条）", "窗口 " + dr[0] + " ~ " + dr[1] + " · 白名单口径；其中常规程序 " + routine + " 条单列")
      + statCard(Object.keys(cos).length, "涉及发行人（家）", "按股票代码去重 · 同上窗口")
      + statCard(sfc, "SFC 执法新闻（条）", "external 外部事实 · newsType=EF · 同窗口")
      + statCard(pdfDone, "PDF 首页已抽取", "金额/摘录来自公告原文第 1 页")
      + statCard(latest, "最新公告时间", "披露易 DATE_TIME 原文")
      + "</div>";
  }

  /* ── 六类分布（点击穿透到筛选） ── */
  function chipsHtml() {
    var cnt = {};
    docs().forEach(function (d) { cnt[d.cat6] = (cnt[d.cat6] || 0) + 1; });
    var h = '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:4px 0 14px;align-items:center">'
      + '<span class="dim" style="font-size:12px">六类分布（库内全窗口，点击筛选）：</span>';
    h += '<a href="javascript:;" class="pill" data-hkcat="全部" style="text-decoration:none'
      + (HKF.cat6 === "全部" ? ";background:var(--blue-bg)" : "") + '">全部 ' + docs().length + "</a>";
    h += CAT6.concat(["常规程序"]).map(function (c) {
      return '<a href="javascript:;" class="pill" data-hkcat="' + esc(c) + '" style="text-decoration:none'
        + (HKF.cat6 === c ? ";background:var(--blue-bg)" : "") + '">' + esc(c) + " " + (cnt[c] || 0) + "</a>";
    }).join("");
    return h + '<span class="dim" style="font-size:11.5px">「常规程序」=例行授权说明函件/集体投资计划文件等，单列不入六类</span></div>';
  }

  /* ── 筛选行 ── */
  function filterHtml() {
    return '<div class="filterbar">'
      + '<input class="finput" id="hkQ" type="text" placeholder="搜索 标题/公司/代码/金额…" value="' + esc(HKF.q) + '"/>'
      + '<select class="fsel" id="hkCat6"><option>全部</option>'
      + CAT6.concat(["常规程序"]).map(function (c) { return '<option' + (HKF.cat6 === c ? " selected" : "") + ">" + c + "</option>"; }).join("")
      + "</select>"
      + '<select class="fsel" id="hkStage" title="披露阶段为系统规则推断（analysis）"><option>全部</option>'
      + STAGES.map(function (c) { return '<option' + (HKF.stage === c ? " selected" : "") + ">" + c + "</option>"; }).join("")
      + '<option' + (HKF.stage === "—" ? " selected" : "") + ">—</option></select>"
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

  /* ── 表格（窄屏横滚，不压缩列） ── */
  function tableHtml(rows) {
    if (!rows.length) return '<div class="empty">当前筛选无收录条目（如实留白，不展示推测内容）。</div>';
    var h = '<div class="tbl-wrap"><table class="tbl" style="table-layout:fixed;min-width:1020px"><colgroup>'
      + '<col style="width:118px"/><col style="width:150px"/><col style="width:180px"/><col/>'
      + '<col style="width:150px"/><col style="width:120px"/><col style="width:96px"/><col style="width:92px"/>'
      + "</colgroup><thead><tr>"
      + "<th>发布时间</th><th>代码·简称</th><th>港交所原文分类</th><th>事项（公告标题原文）</th>"
      + "<th>金额（原文口径）</th><th>类别</th><th>中国关联</th><th>来源</th></tr></thead><tbody>";
    h += rows.map(function (d) {
      var sfc = isSfc(d);
      var layerPill = sfc ? '<span class="pill warn">external</span> ' : '<span class="pill blue">disclosed</span> ';
      var links = sfc
        ? '<a href="' + esc(d.url) + '" target="_blank" rel="noopener">SFC 原文</a>'
        : '<a href="' + esc(d.url) + '" target="_blank" rel="noopener">中</a>'
        + (d.url_en ? ' · <a href="' + esc(d.url_en) + '" target="_blank" rel="noopener">英</a>' : "");
      var open = HKF.open === d.doc_id;
      var excerpt = d.excerpt && !open
        ? '<div class="dim" style="font-size:11.5px;margin-top:3px">摘录P1：' + esc(d.excerpt.slice(0, 90)) + "…</div>" : "";
      var tr = "<tr>"
        + "<td>" + esc(d.pub_datetime || d.pub_date) + "</td>"
        + "<td style=\"word-break:break-word\"><b>" + esc(d.stock_name || "—") + "</b><br/><span class=\"dim\">" + esc(d.stock_code) + "</span></td>"
        + "<td style=\"word-break:break-word;font-size:12px\">" + esc(d.headline_raw || d.cat6_sub) + "</td>"
        + "<td style=\"word-break:break-word\">" + layerPill
        + '<a href="javascript:;" data-hkopen="' + esc(d.doc_id) + '" title="点击展开出处与摘录" style="color:inherit;text-decoration:none">'
        + (open ? "▾ " : "▸ ") + esc(d.title) + "</a>" + excerpt + "</td>"
        + "<td style=\"word-break:break-word;font-size:12.5px\">" + esc(d.amount) + "</td>"
        + "<td><span class=\"pill\">" + esc(d.cat6) + "</span><br/>" + stagePill(d) + "</td>"
        + "<td style=\"font-size:12px\">" + cnCell(d) + "</td>"
        + "<td>" + links + "</td>"
        + "</tr>";
      if (open) {
        tr += '<tr><td colspan="8" style="background:var(--bg,#fafafa);font-size:12.5px;line-height:1.9">'
          + '<b>出处与核对</b> <span class="dim">（' + esc(d.doc_id) + " · " + esc(d.channel) + "）</span><br/>"
          + '<span class="dim">港交所原文分类：</span>' + esc(d.headline_raw || d.cat6_sub || "—") + "<br/>"
          + (d.excerpt ? '<span class="dim">公告首页摘录（繁体原文，pdftotext 第 1 页）：</span>「' + esc(d.excerpt) + (d.excerpt.length >= 160 ? "…" : "") + "」<br/>" : "")
          + '<span class="dim">金额口径：</span>' + esc(d.amount)
          + ' <span class="dim">（PDF 首页原文表述抽取；未抽取到量级表述时显示【未披露】）</span><br/>'
          + '<span class="dim">原文定位：</span>'
          + '<a href="' + esc(d.url + (d.url.slice(-4) === ".pdf" ? "#page=1" : "")) + '" target="_blank" rel="noopener">中文原文 P1</a>'
          + (d.url_en ? ' · <a href="' + esc(d.url_en) + '" target="_blank" rel="noopener">英文原文</a>' : "")
          + "</td></tr>";
      }
      return tr;
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
      + "<b>三分层</b>：披露易公告 = <span class=\"pill blue\">disclosed</span> 公司披露；SFC 执法新闻 = <span class=\"pill warn\">external</span> 外部事实（附来源）；六类归类、披露阶段与中国关联标签 = 系统规则映射（analysis，依据：二级类别码 16600 終止/16100 延誤/16700 條款更改 + 标题关键词；页面注明为推断，不作筛选前提）。<br/>"
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
    HKF.stage = qs.get("stage") || HKF.stage;
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
    var h = '<div class="ph"><h1>港股（HKEX）全量重大事项</h1><span class="sub">本页回答：HKEX 披露易全市场披露中，最近有哪些交易、融资、运营、法律与战略重大事项'
      + '（本页数据构建：' + esc((window.HKDB.build && HKDB.build.time) || "—") + ' HKT，与全站构建时间分开计）</span></div>';
    h += '<div class="panel"><div class="panel-h"><h2>口径说明</h2></div><div class="panel-b" style="line-height:1.9;font-size:13px">'
      + "本页口径：<b>披露易全市场标题检索（stockId=-1，不分中企外企）</b>＋ SFC 执法新闻（external）；"
      + "事项分六类：" + CAT6.join("、") + "（由港交所二级类别码规则映射）；例行授权说明函件、认可集体投资计划（ETF/杠杆产品）文件等入库但单列<b>「常规程序」</b>，不进六类统计。"
      + "本页与「出海信批归纳」（仅中企）及美股、出口管制分页面的数据文件、统计口径<b>互不混用</b>；"
      + "中国关联仅为标签（名称/标题弱启发式），不作筛选前提；披露阶段为系统规则推断（analysis，依据类别码与标题关键词），非港交所原文表述。</div></div>";
    h += bandHtml();
    h += spotlightHtml();
    h += riskHtml();
    h += chainsHtml();
    h += matrixHtml();
    h += kpiHtml();
    h += chipsHtml();
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
    box.querySelectorAll("[data-hkopen]").forEach(function (a) {
      a.addEventListener("click", function () {
        var id = a.getAttribute("data-hkopen");
        HKF.open = HKF.open === id ? "" : id;
        bodyRender();
      });
    });
    var pv = $("hkPrev"), nx = $("hkNext");
    if (pv) pv.addEventListener("click", function () { HKF.page--; syncHash(); bodyRender(); });
    if (nx) nx.addEventListener("click", function () { HKF.page++; syncHash(); bodyRender(); });
  }

  function exportCsv() {
    var rows = filtered();
    var head = ["发布日期", "时间", "代码", "简称", "渠道", "港交所原文分类", "类别", "阶段(系统推断)", "事项标题", "金额(原文口径)", "中国关联", "layer", "中文链接", "英文链接"];
    var lines = [head.join(",")];
    rows.forEach(function (d) {
      var cells = [d.pub_date, (d.pub_datetime || "").slice(11), d.stock_code, d.stock_name, d.channel,
        d.headline_raw || d.cat6_sub, d.cat6, d.stage, d.title, d.amount, d.cn_related, d.layer, d.url, d.url_en || ""];
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
    [["hkCat6", "cat6"], ["hkStage", "stage"], ["hkCh", "ch"], ["hkCn", "cn"], ["hkFrom", "from"], ["hkTo", "to"]].forEach(function (x) {
      var el = $(x[0]);
      if (el) el.addEventListener("change", function (e) { HKF[x[1]] = e.target.value; HKF.page = 1; syncHash(); bodyRender(); });
    });
    document.querySelectorAll("[data-hkcat]").forEach(function (a) {
      a.addEventListener("click", function () {
        HKF.cat6 = a.getAttribute("data-hkcat"); HKF.page = 1;
        var sel = $("hkCat6"); if (sel) sel.value = HKF.cat6;
        syncHash(); bodyRender();
        document.querySelectorAll("[data-hkcat]").forEach(function (x) {
          x.style.background = x.getAttribute("data-hkcat") === HKF.cat6 ? "var(--blue-bg)" : "";
        });
      });
    });
    document.querySelectorAll("[data-hkmatrix]").forEach(function (a) {
      a.addEventListener("click", function () {
        var kv = a.getAttribute("data-hkmatrix").split("|");
        HKF.cat6 = kv[0]; HKF.stage = kv[1]; HKF.page = 1;
        var s1 = $("hkCat6"); if (s1) s1.value = HKF.cat6;
        var s2 = $("hkStage"); if (s2) s2.value = HKF.stage;
        syncHash(); bodyRender();
        var fb = document.querySelector(".filterbar");
        if (fb) fb.scrollIntoView({ block: "start" });
      });
    });
    document.querySelectorAll("[data-hkchain]").forEach(function (a) {
      a.addEventListener("click", function () {
        // 公司穿透意图明确：重置其他筛选，仅按代码检索
        HKF.q = a.getAttribute("data-hkchain"); HKF.page = 1;
        HKF.cat6 = "全部"; HKF.stage = "全部"; HKF.ch = "全部渠道"; HKF.cn = "全部"; HKF.from = ""; HKF.to = "";
        var q0 = $("hkQ"); if (q0) q0.value = HKF.q;
        var s1 = $("hkCat6"); if (s1) s1.value = "全部";
        var s2 = $("hkStage"); if (s2) s2.value = "全部";
        var s3 = $("hkCh"); if (s3) s3.value = "全部渠道";
        var s4 = $("hkCn"); if (s4) s4.value = "全部";
        syncHash(); bodyRender();
        var fb = document.querySelector(".filterbar");
        if (fb) fb.scrollIntoView({ block: "start" });
      });
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
