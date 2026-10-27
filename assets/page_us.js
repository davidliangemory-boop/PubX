// Research event payload loading is owned by app.js / PubXResearch.ensure; legacy views remain synchronous.
/* PubX 美股（SEC）全量重大事项页 —— 独立分页面 #/us
 * 数据：assets/us_data.js（window.US_DATA，由 scripts/sec_market_pull.py 生成，按需懒加载）
 * 口径：EDGAR 全量，不分中企外企；与「出海信披归纳」数据文件、统计互不混用。
 * 暴露 window.render_us(root)，由 app.js 路由分发调用。
 */
(function () {
  "use strict";
  var PAGE = 50;
  var CATS = ["全部", "交易类", "融资类", "运营", "法律（诉讼/监管处罚）", "对外投资", "经营战略重大事项"];
  var AMT_B = ["全部", "【未披露】", "<100万美元", "100万–1亿美元", "1亿–10亿美元", "≥10亿美元", "非美元/其他"];
  var CN_B = ["全部", "是", "未知"];
  var ITEM_ZH = { "1.01": "签订重大协议", "1.02": "终止重大协议", "1.03": "破产/接管",
    "1.05": "网络安全事件", "2.01": "完成收购/处置", "2.02": "经营业绩", "2.03": "产生财务义务",
    "2.04": "财务义务加速", "2.05": "重组退出成本", "2.06": "重大减值",
    "3.01": "退市/上市标准", "3.02": "未注册增发", "3.03": "股东权利修改",
    "4.01": "审计师变更", "4.02": "财报不可依赖", "5.01": "控制权变更", "5.02": "董监高变动",
    "5.03": "章程修订", "5.06": "壳公司状态", "5.07": "股东大会表决", "5.08": "股东提名",
    "7.01": "Reg FD 披露", "8.01": "其他重大事项", "9.01": "财报与附件" };
  var UF = { from: "", to: "", cat: "全部", sub: "全部", form: "全部", amt: "全部", cn: "全部",
             item: "全部", q: "", h424: "0", page: 1 };
  var expanded = {};
  var histState = { loading: false, done: false };

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
    UF.cn = qs.get("cn") || "全部"; UF.item = qs.get("item") || "全部"; UF.q = qs.get("q") || "";
    UF.h424 = qs.get("h424") || "0";
    UF.page = parseInt(qs.get("page") || "1", 10) || 1;
  }
  function syncQS() {
    var p = [];
    if (UF.from) p.push("from=" + UF.from);
    if (UF.to) p.push("to=" + UF.to);
    ["cat", "sub", "form", "amt", "cn", "item", "q"].forEach(function (k) {
      if (UF[k] && UF[k] !== "全部") p.push(k + "=" + encodeURIComponent(UF[k]));
    });
    if (UF.h424 === "1") p.push("h424=1");
    if (UF.page > 1) p.push("page=" + UF.page);
    history.replaceState(null, "", "#/us" + (p.length ? "?" + p.join("&") : ""));
  }

  function entries() { return (window.US_DATA && window.US_DATA.entries) || []; }
  function meta() { return (window.US_DATA && window.US_DATA.meta) || {}; }

  // 历史分片：us_data.js 只内嵌最近若干申报日，更早日期在 state/us_market/YYYY-MM-DD.json
  function unloadedDates() {
    var M = meta();
    if (histState.done) return [];
    var avail = M.available_dates || [], loaded = M.loaded_dates || avail;
    var lset = {};
    loaded.forEach(function (d) { lset[d] = 1; });
    return avail.filter(function (d) { return !lset[d]; });
  }
  function loadHistory(cb) {
    var todo = unloadedDates();
    if (!todo.length) { histState.done = true; if (cb) cb(); return; }
    if (histState.loading) return;
    histState.loading = true;
    var got = 0, add = [];
    todo.forEach(function (d) {
      fetch("./state/us_market/" + d + ".json").then(function (r) {
        if (!r.ok) throw new Error("http " + r.status);
        return r.json();
      }).then(function (j) {
        add = add.concat(j.entries || []);
      }).catch(function () {}).then(function () {
        got++;
        if (got === todo.length) {
          window.US_DATA.entries = entries().concat(add);
          window.US_DATA.meta.loaded_dates = meta().available_dates;
          histState.done = true; histState.loading = false;
          if (cb) cb(); else render();
        }
      });
    });
  }
  // 筛选起点早于已载入窗口时需要历史分片
  function needsHistory() {
    if (!unloadedDates().length) return false;
    var loaded = meta().loaded_dates || [];
    var minLoaded = loaded.length ? loaded[0] : "9999";
    return !!(UF.from && UF.from < minLoaded);
  }

  function filtered() {
    var q = UF.q.trim().toLowerCase();
    return entries().filter(function (e) {
      if (UF.h424 === "1" && (e.form || "").indexOf("424B") === 0) return false;
      if (UF.from && e.date < UF.from) return false;
      if (UF.to && e.date > UF.to) return false;
      if (UF.cat !== "全部" && e.category !== UF.cat) return false;
      if (UF.sub !== "全部" && e.subtype !== UF.sub) return false;
      if (UF.form !== "全部" && e.form !== UF.form) return false;
      if (UF.cn !== "全部" && e.china !== UF.cn) return false;
      if (UF.item !== "全部" && (e.items || []).indexOf(UF.item) < 0) return false;
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
        s.src = window.pubxAsset("us_data.js");
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
    if (needsHistory() && !histState.loading) {
      loadHistory();
    }
    if (histState.loading) {
      root.innerHTML = '<div class="panel"><div class="panel-b" style="padding:34px 24px;text-align:center">'
        + '<div style="font-size:15px;font-weight:700;margin-bottom:8px">正在载入历史分片…</div>'
        + '<div class="note">筛选起点早于默认载入窗口，正在按日分片拉取 state/us_market/ 历史数据</div></div></div>';
      return;
    }
    var M = meta(), all = entries(), rows = filtered();
    var unld = unloadedDates();
    var dr = M.date_range || [];
    var batches = M.batches || [];
    var lastB = batches[batches.length - 1] || {};
    var nDays = Object.keys(lastB.dates || {}).filter(function (d) {
      return lastB.dates[d].status === "ok";
    }).length;
    var byCat = {};
    all.forEach(function (e) { byCat[e.category] = (byCat[e.category] || 0) + 1; });
    var n424 = M.n_424b != null ? M.n_424b
      : all.filter(function (e) { return (e.form || "").indexOf("424B") === 0; }).length;
    var denom = (unld.length && M.total) ? M.total : all.length;
    var pct424 = denom ? Math.round(n424 * 1000 / denom) / 10 : 0;

    var h = '<div class="ph"><h1>美股（SEC）· 全量重大事项</h1>'
      + '<span class="sub">本页回答：SEC EDGAR 全量披露（不分中企外企）中，最近有哪些交易、融资、运营、法律与战略重大事项</span></div>';

    h += '<div class="statstrip">'
      + statCard(M.total != null ? M.total : all.length, "收录条目（筛选后 " + rows.length + "）",
                 "窗口 " + (dr[0] || "—") + " ~ " + (dr[1] || "—")
                 + (unld.length ? " · 当前已载入最近 " + ((M.loaded_dates || []).length) + " 个申报日，历史 "
                    + (M.older_count || 0) + " 条可点筛选栏按钮载入" : " · 全窗口已载入")
                 + " · 其中 424B* 定价补充 " + n424 + " 条（" + pct424 + "%）")
      + statCard(lastB.batch_id || "—", "最近批次",
                 (lastB.new_entries != null ? "新增 " + lastB.new_entries + " 条 · " : "") + "索引可用 " + nDays + " 天")
      + statCard(dr[1] || "—", "数据至（EDGAR T+1）", "按美东申报日切片 · 当日索引未发布属正常")
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
      + '<select class="fsel" id="ufitem"></select>'
      + '<label class="us-chk"><input type="checkbox" id="ufh424"' + (UF.h424 === "1" ? " checked" : "")
      + '/> 隐藏 424B 定价补充</label>'
      + (unld.length
        ? '<button class="densbtn" id="ufhist">载入全部历史（' + (M.older_count || "?") + " 条 · "
          + unld[0] + " 起）</button>"
        : "")
      + '<button class="btn primary" id="ufcsv">导出 CSV（筛选后全部 ' + rows.length + ' 行）</button>'
      + "</div></div>";

    // 逐类拆解（本筛选集六类计数 + 占比条，点击穿透为类别筛选）——借鉴李成工作站逐题拆解 / 投行天下看板穿透
    var catCnt = {};
    rows.forEach(function (e) { catCnt[e.category] = (catCnt[e.category] || 0) + 1; });
    var maxCat = 1;
    CATS.slice(1).forEach(function (c) { if ((catCnt[c] || 0) > maxCat) maxCat = catCnt[c]; });
    h += '<div class="panel"><div class="panel-h"><h2>逐类拆解（当前筛选集 ' + rows.length + ' 条，点击类别穿透）</h2></div>'
      + '<div class="panel-b us-break">';
    CATS.slice(1).forEach(function (c) {
      var n = catCnt[c] || 0;
      var pct = rows.length ? Math.round(n * 1000 / rows.length) / 10 : 0;
      h += '<div class="us-brkrow' + (UF.cat === c ? " on" : "") + '" data-cat="' + esc(c) + '">'
        + '<span class="us-brkname">' + esc(c) + "</span>"
        + '<span class="us-brkbar"><i style="width:' + Math.round(n * 100 / maxCat) + '%"></i></span>'
        + '<span class="us-brknum">' + n + " 条 · " + pct + "%</span></div>";
    });
    h += "</div></div>";

    // Item 分布条（8-K 条目级计数，点击穿透）——借鉴 EDGAR 全文检索 facet 计数
    var itemCnt = {};
    rows.forEach(function (e) {
      (e.items || []).forEach(function (it) { itemCnt[it] = (itemCnt[it] || 0) + 1; });
    });
    var itemKeys = Object.keys(itemCnt).sort(function (a, b) { return itemCnt[b] - itemCnt[a]; });
    if (itemKeys.length) {
      var maxIt = itemCnt[itemKeys[0]];
      h += '<div class="panel"><div class="panel-h"><h2>8-K Item 分布（条目可含多个 Item，合计大于条目数）</h2></div>'
        + '<div class="panel-b us-items">';
      itemKeys.forEach(function (it) {
        h += '<span class="us-itempill' + (UF.item === it ? " on" : "") + '" data-item="' + esc(it) + '" '
          + 'title="点击筛选含 Item ' + esc(it) + " 的条目\">"
          + '<b>' + esc(it) + "</b> " + esc(ITEM_ZH[it] || "") + " × " + itemCnt[it]
          + '<i style="width:' + Math.round(itemCnt[it] * 100 / maxIt) + '%"></i></span>';
      });
      h += "</div></div>";
    }

    // 重点关注：当前筛选集中的高信号事件（法律/网络安全/退市/完成收购/控制权变更/要约/私有化）
    var HI_ITEMS = ["1.05", "2.01", "3.01", "5.01", "1.02", "4.01", "4.02"];
    var HI_FORMS = ["SCTO-T", "SC14D9", "SC13E3", "DEFM14A"];
    var hi = rows.filter(function (e) {
      if (e.category === "法律（诉讼/监管处罚）") return true;
      var f = (e.form || "").replace(/[\s\/]/g, "").toUpperCase().replace(/A$/, "");
      if (HI_FORMS.indexOf(f) >= 0) return true;
      return (e.items || []).some(function (it) { return HI_ITEMS.indexOf(it) >= 0; });
    }).slice(0, 8);
    if (hi.length) {
      h += '<div class="panel"><div class="panel-h"><h2>重点关注（当前筛选集高信号事件 '
        + hi.length + ' 条，按时间倒序）</h2></div><div class="panel-b us-hi">';
      hi.forEach(function (e) {
        h += '<div class="us-hirow" data-eid="' + esc(e.id) + '">'
          + '<span class="code">' + esc(e.date) + '</span> '
          + '<b>' + esc(e.company) + '</b> '
          + '<span class="pill blue">' + esc(e.form) + '</span> '
          + '<span class="pill">' + esc(e.subtype.replace(/（.*$/, "")) + '</span> '
          + '<span class="us-hisum">' + esc(e.summary) + '</span> '
          + '<a href="' + esc(e.url) + '" target="_blank" rel="noopener">原文</a></div>';
      });
      h += "</div></div>";
    }

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
      h += '<tr class="us-row" data-eid="' + esc(e.id) + '">'
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
      if (expanded[e.id]) {
        var qkeys = Object.keys(e.item_quotes || {});
        var quotesHtml = "";
        if (qkeys.length) {
          quotesHtml = '<div class="us-quotes"><b>Item 证据句（原文摘录，disclosed）</b>'
            + qkeys.map(function (k) {
                return '<div class="us-quote"><span class="pill">' + esc(k) + "</span> "
                  + esc(e.item_quotes[k]) + "</div>";
              }).join("") + "</div>";
        }
        h += '<tr class="us-detail"><td colspan="10"><div class="us-dgrid">'
          + "<div><b>Accession</b><br/><span class=\"code\">" + esc(e.accession) + "</span></div>"
          + "<div><b>收录批次</b><br/>" + esc(e.batch || "—") + "</div>"
          + "<div><b>Item 全名</b><br/>" + esc(((e.items || []).map(function (it, i) {
              return it + " " + ((e.item_names || [])[i] || ""); }).join("；")) || "—（非 8-K 无 Item 编号）") + "</div>"
          + "<div><b>中国关联依据</b><br/>" + esc(e.china_basis || "—") + "</div>"
          + "<div><b>字段分层</b><br/>一句话事项/金额/对方/证据句=原文抽取（disclosed"
            + (e.amount === "【未披露】" ? "，金额原文未披露" : "") + "）；类别/子类/中国关联=系统规则推断（analysis，依据=表格+Item+关键词）</div>"
          + '<div><b>出处定位</b><br/><a href="' + esc(e.url) + '" target="_blank" rel="noopener">主文档（一句话事项抽取处）</a> · '
          + '<a href="' + esc(e.index_url) + '" target="_blank" rel="noopener">EDGAR Filing Detail 索引页</a></div>'
          + "</div>" + quotesHtml + "</td></tr>";
      }
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
      + "<br/><b>构成提示</b>：本窗口 424B* 定价/招股补充 " + n424 + " 条，占收录 " + pct424
      + "%（高频低信号，多为结构化票据定价，可用筛选栏「隐藏 424B 定价补充」剔除；属任务白名单口径，默认保留）。"
      + "<br/><b>分层</b>：一句话事项/金额/证据句为原文正则抽取（disclosed）；类别/子类/中国关联为系统规则推断（analysis，依据=表格类型+Item 编号+关键词）。"
      + "中国关联仅作标签：<b>是</b>=CIK 命中出海观察名单或公司名含中国地名/中概关键词；<b>未知</b>=未进一步核查，不代表「否」。"
      + "本页与「出海信披归纳」（仅中企）及港股、出口管制分页面的数据文件、统计口径<b>互不混用</b>。"
      + "<br/><b>批次记录</b>（日批次 D-=按日采集 / 回溯 B-=历史补入）："
      + (batches.length ? batches.map(function (b) {
          var ds = Object.keys(b.dates || {}).map(function (d) {
            var v = b.dates[d];
            if (v.status === "ok") return d + "(收录" + (v.kept || 0) + ")";
            return d + "(" + (/周末/.test(v.status || "") ? "周末无索引" : "索引未发布") + ")";
          }).join("、");
          return '<span class="code">' + esc(b.batch_id) + "</span> 新增 " + (b.new_entries || 0) + " 条：" + esc(ds);
        }).join("<br/>") : "—")
      + "</div></div>";

    root.innerHTML = h;

    // 子类 / 表格 / Item 选项按当前数据与类别联动
    var subs = ["全部"], forms = ["全部"], itemsAll = ["全部"];
    all.forEach(function (e) {
      if ((UF.cat === "全部" || e.category === UF.cat) && subs.indexOf(e.subtype) < 0) subs.push(e.subtype);
      if (forms.indexOf(e.form) < 0) forms.push(e.form);
      (e.items || []).forEach(function (it) {
        var lbl = it + " " + (ITEM_ZH[it] || "");
        if (itemsAll.indexOf(lbl) < 0) itemsAll.push(lbl);
      });
    });
    forms.sort(function (a, b) { return a === "全部" ? -1 : b === "全部" ? 1 : a.localeCompare(b); });
    if (subs.indexOf(UF.sub) < 0) UF.sub = "全部";
    $("ufsub").innerHTML = opts(subs, UF.sub);
    $("ufform").innerHTML = opts(forms, UF.form);
    var itemVals = itemsAll.map(function (x) { return x.split(" ")[0]; });
    $("ufitem").innerHTML = itemsAll.map(function (x, i) {
      return '<option value="' + esc(itemVals[i]) + '"' + (itemVals[i] === UF.item ? " selected" : "") + ">"
        + (x === "全部" ? "8-K Item 全部" : esc(x)) + "</option>";
    }).join("");

    function re(page1) {
      if (page1) UF.page = 1;
      syncQS(); render();
    }
    [["uffrom", "from"], ["ufto", "to"], ["ufcat", "cat"], ["ufsub", "sub"],
     ["ufform", "form"], ["ufamt", "amt"], ["ufcn", "cn"], ["ufitem", "item"]].forEach(function (x) {
      $(x[0]).addEventListener("change", function (e) { UF[x[1]] = e.target.value; re(true); });
    });
    $("ufh424").addEventListener("change", function (e) {
      UF.h424 = e.target.checked ? "1" : "0"; re(true);
    });
    document.querySelectorAll(".us-brkrow").forEach(function (el) {
      el.addEventListener("click", function () {
        var c = el.getAttribute("data-cat");
        UF.cat = (UF.cat === c) ? "全部" : c; UF.sub = "全部"; re(true);
      });
    });
    document.querySelectorAll(".us-itempill").forEach(function (el) {
      el.addEventListener("click", function () {
        var it = el.getAttribute("data-item");
        UF.item = (UF.item === it) ? "全部" : it; re(true);
      });
    });
    document.querySelectorAll(".us-row").forEach(function (el) {
      el.addEventListener("click", function (ev) {
        if (ev.target.closest("a")) return;
        var id = el.getAttribute("data-eid");
        if (expanded[id]) delete expanded[id]; else expanded[id] = 1;
        render();
      });
    });
    document.querySelectorAll(".us-hirow").forEach(function (el) {
      el.addEventListener("click", function (ev) {
        if (ev.target.closest("a")) return;
        var id = el.getAttribute("data-eid");
        expanded[id] = 1;
        var idx = -1;
        for (var i = 0; i < rows.length; i++) if (rows[i].id === id) { idx = i; break; }
        if (idx >= 0) UF.page = Math.floor(idx / PAGE) + 1;
        syncQS(); render();
        var tr = document.querySelector('.us-row[data-eid="' + id + '"]');
        if (tr) tr.scrollIntoView({ block: "center" });
      });
    });
    var qt;
    $("ufq").addEventListener("input", function (e) {
      clearTimeout(qt);
      qt = setTimeout(function () { UF.q = e.target.value; re(true); }, 350);
    });
    var ufhist = $("ufhist");
    if (ufhist) ufhist.addEventListener("click", function () { loadHistory(); render(); });
    $("ufcsv").addEventListener("click", function () {
      if (unloadedDates().length) { loadHistory(function () { exportCSV(filtered()); }); render(); }
      else exportCSV(filtered());
    });
    $("uprev").addEventListener("click", function () { if (UF.page > 1) { UF.page--; syncQS(); render(); } });
    $("unext").addEventListener("click", function () { if (UF.page < totalPages) { UF.page++; syncQS(); render(); } });
  }

  window.render_us = function (root) {
    if (root && root.id !== "usroot") root.id = "usroot";
    render();
  };
})();
