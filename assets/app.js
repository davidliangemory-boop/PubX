/* 企业出海研究工作台 v3 — PubX
   总览 | 企业与项目 | 专题分析 | 披露档案 ＋ 来源与更新（辅助）
   数据：window.DB（disclosures/batches/cases/derived）· 派生实体见 scripts/derive.py */
(function () {
  var DB = window.DB || { disclosures: [], batches: [], cases: [], derived: {}, sources: [], rules: {}, exceptions: [] };
  var D = DB.disclosures, V = DB.derived || {};
  var view = document.getElementById("view");
  var subnav = document.getElementById("subnav");

  /* ── 基础工具 ── */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function $(id) { return document.getElementById(id); }
  function bySeq(seq) { for (var i = 0; i < D.length; i++) if (D[i]["序号"] == seq) return D[i]; return null; }
  function byAid(aid) { for (var i = 0; i < D.length; i++) if (D[i]["_aid"] === aid) return D[i]; return null; }
  function shortCo(n) { return String(n || "").replace(/^(.*(股份有限公司|集团股份有限公司|有限公司)).*$/, "$1").replace(/股份有限公司|有限责任公司|有限公司/g, ""); }
  function pill(t, cls) { return '<span class="pill ' + (cls || "") + '">' + esc(t) + "</span>"; }
  function money0(s) { return esc((s || "").split(/[，；]/)[0].slice(0, 34)); }
  function projByAid(aid) { var P = V.projects || []; for (var i = 0; i < P.length; i++) if (P[i].aids.indexOf(aid) >= 0) return P[i]; return null; }
  function companyOf(name) { var C = V.companies || []; for (var i = 0; i < C.length; i++) if (C[i].name === name) return C[i]; return null; }
  function caseOf(aid) { for (var i = 0; i < (DB.cases || []).length; i++) if ((DB.cases[i].events || []).indexOf(aid) >= 0) return DB.cases[i]; return null; }
  function dl(k, v) { return '<div class="dl"><div class="k">' + esc(k) + '</div><div class="v">' + (v == null || v === "" ? "—" : v) + "</div></div>"; }
  function na(v) { return v ? esc(v) : '<span class="na">待回填</span>'; }
  function tblHead(cols) { return "<tr>" + cols.map(function (c) { return '<th style="' + (c[1] || "") + '">' + esc(c[0]) + "</th>"; }).join("") + "</tr>"; }
  function linkDoc(r, txt) { return '<a href="#/detail/' + r["序号"] + '">' + esc(txt || "分析") + "</a>"; }
  function linkDocAid(aid, txt) { var r = byAid(aid); return r ? linkDoc(r, txt) : esc(txt || aid); }

  /* ── 个人标注（本机保存，与公开数据分离；可导出） ── */
  var ANN;
  try { ANN = JSON.parse(localStorage.getItem("pubx_ann") || "{}"); } catch (e) { ANN = {}; }
  ANN.favs = ANN.favs || {}; ANN.notes = ANN.notes || {}; ANN.comp = ANN.comp || {};
  function saveAnn() { try { localStorage.setItem("pubx_ann", JSON.stringify(ANN)); } catch (e) { } }
  function favBtn(kind, key, label) {
    var on = ANN.favs[kind + ":" + key];
    return '<button class="btn" data-fav="' + esc(kind + ":" + key) + '" style="padding:3px 10px;font-size:12px">' + (on ? "★ 已关注" : "☆ 关注") + (label ? " " + esc(label) : "") + "</button>";
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-fav]");
    if (b) {
      var k = b.getAttribute("data-fav");
      ANN.favs[k] = !ANN.favs[k]; saveAnn();
      b.textContent = b.textContent.replace(ANN.favs[k] ? "☆ 关注" : "★ 已关注", ANN.favs[k] ? "★ 已关注" : "☆ 关注");
      b.textContent = (ANN.favs[k] ? "★ 已关注" : "☆ 关注") + (b.textContent.replace(/^(★ 已关注|☆ 关注)/, "").indexOf(" ") >= 0 ? b.textContent.replace(/^(★ 已关注|☆ 关注)/, "") : "");
      e.preventDefault(); e.stopPropagation();
    }
  });

  /* ── 抽屉详情面板（图谱/日历/指标等统一入口） ── */
  var drawer = $("drawer"), mask = $("mask");
  function openDrawer(html) { drawer.innerHTML = '<div class="dh"><h3></h3><button class="dx" id="dx">✕</button></div>' + html; drawer.classList.add("show"); mask.classList.add("show"); $("dx").onclick = closeDrawer; }
  function closeDrawer() { drawer.classList.remove("show"); mask.classList.remove("show"); }
  mask.addEventListener("click", closeDrawer);
  function drawerDoc(aid) {
    var r = byAid(aid); if (!r) return;
    var p = projByAid(aid), c = caseOf(aid);
    openDrawer('<div class="dh"><h3>' + esc(r["公告标题"]) + '</h3><button class="dx" id="dx">✕</button></div>'
      + '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">' + pill(r["披露日期与时间"], "blue") + pill(r["公告类型"]) + pill(r["涉及国家/地区"]) + "</div>"
      + '<div style="font-size:13.5px;line-height:1.8">' + esc(r["动作类型"]) + "</div>"
      + '<div style="margin-top:10px;font-size:13px;color:var(--ink-2)">' + esc((r["③法务关注（ODI/FDI审批备案/目标国合规/制裁出口管制/知识产权）"] || "").slice(0, 120)) + "…</div>"
      + '<div style="margin-top:12px;font-size:13px;display:flex;gap:14px;flex-wrap:wrap">'
      + linkDoc(r, "完整六段分析 →")
      + (p ? '　<a href="#/project/' + p.id + '" data-close>所属项目：' + esc(p.name) + " →</a>" : "")
      + (c ? '　<a href="#/case/' + c.id + '" data-close>连续案例 →</a>' : "")
      + '　<a href="' + esc(r["来源链接"]) + '" target="_blank" rel="noopener">原文 PDF ↗</a></div>');
    drawer.querySelectorAll("[data-close]").forEach(function (a) { a.addEventListener("click", closeDrawer); });
  }
  function drawerProject(pid) {
    var p = null; (V.projects || []).forEach(function (x) { if (x.id === pid) p = x; });
    if (!p) return;
    openDrawer('<div class="dh"><h3>' + esc(p.name) + '</h3><button class="dx" id="dx">✕</button></div>'
      + '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">' + pill(p.current_stage, "blue") + pill(p.region) + pill(p.industry) + pill(p.company.replace(/股份有限公司|有限公司/g, "")) + "</div>"
      + '<div style="font-size:13px;color:var(--ink-2);margin-bottom:10px">生命周期位置：' + p.stage_pos + "/" + p.lifecycle_len + " · 最新事件 " + esc(p.latest) + "</div>"
      + '<div style="font-size:13px;display:flex;gap:14px;flex-wrap:wrap"><a href="#/project/' + p.id + '" data-close>项目全览 →</a><a href="#/cos/lifecycle" data-close>生命周期视图 →</a></div>');
    drawer.querySelectorAll("[data-close]").forEach(function (a) { a.addEventListener("click", closeDrawer); });
  }

  /* ── SVG 图表引擎 ── */
  function svgBar(data, opts) {
    /* data: [{label, value, color?, href?}] 横向条形 */
    opts = opts || {};
    var w = opts.width || 720, rh = 26, h = data.length * (rh + 8) + 24;
    var max = Math.max.apply(null, data.map(function (d) { return d.value; }).concat([1]));
    var s = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + " " + h + '">';
    data.forEach(function (d, i) {
      var y = 8 + i * (rh + 8);
      var bw = Math.max(2, (d.value / max) * (w - 250));
      s += '<text x="0" y="' + (y + rh / 2 + 4) + '" class="axt" style="font-size:12px">' + esc(d.label.slice(0, 18)) + "</text>";
      s += '<rect class="bar" x="190" y="' + y + '" width="' + bw + '" height="' + rh + '" rx="5" fill="' + (d.color || "var(--blue)") + '"' + (d.href ? ' data-href="' + esc(d.href) + '" style="cursor:pointer"' : "") + "></rect>";
      s += '<text x="' + (196 + bw) + '" y="' + (y + rh / 2 + 4) + '" class="axt">' + esc(d.disp != null ? d.disp : d.value) + "</text>";
    });
    return s + "</svg>";
  }
  function svgBubble(data, opts) {
    /* data: [{x, y, r, label, color?, href?}]；x/y 为数值，自动定标 */
    opts = opts || {};
    var w = opts.width || 760, h = opts.height || 420, pad = 46;
    var xs = data.map(function (d) { return d.x; }), ys = data.map(function (d) { return d.y; });
    var xmin = Math.min.apply(null, xs.concat([0])), xmax = Math.max.apply(null, xs.concat([1]));
    var ymin = Math.min.apply(null, ys.concat([0])), ymax = Math.max.apply(null, ys.concat([1]));
    function X(v) { return pad + (v - xmin) / ((xmax - xmin) || 1) * (w - 2 * pad); }
    function Y(v) { return h - pad - (v - ymin) / ((ymax - ymin) || 1) * (h - 2 * pad); }
    var s = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + " " + h + '">';
    s += '<line x1="' + pad + '" y1="' + (h - pad) + '" x2="' + (w - pad) + '" y2="' + (h - pad) + '" stroke="var(--line-2)"/>';
    s += '<line x1="' + pad + '" y1="' + pad + '" x2="' + pad + '" y2="' + (h - pad) + '" stroke="var(--line-2)"/>';
    s += '<text x="' + (w / 2) + '" y="' + (h - 8) + '" class="axt" text-anchor="middle">' + esc(opts.xl || "") + "</text>";
    s += '<text x="14" y="' + (h / 2) + '" class="axt" text-anchor="middle" transform="rotate(-90 14 ' + (h / 2) + ')">' + esc(opts.yl || "") + "</text>";
    data.forEach(function (d) {
      s += '<circle class="bubble" cx="' + X(d.x) + '" cy="' + Y(d.y) + '" r="' + d.r + '" fill="' + (d.color || "var(--blue)") + '"' + (d.href ? ' data-href="' + esc(d.href) + '" style="cursor:pointer"' : "") + "><title>" + esc(d.label + " (" + d.x + ", " + d.y + ")") + "</title></circle>";
      s += '<text x="' + X(d.x) + '" y="' + (Y(d.y) - d.r - 5) + '" class="axt" text-anchor="middle" style="font-size:11px">' + esc(d.label.slice(0, 12)) + "</text>";
    });
    return s + "</svg>";
  }
  /* 图表点击代理：带 data-href 的元素跳路由 */
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-href]");
    if (el) { location.hash = el.getAttribute("data-href"); }
  });

  /* ── 子导航定义 ── */
  var SUBS = {
    home: [],
    cos: [["#/cos", "企业档案"], ["#/cos/projects", "项目清单"], ["#/cos/lifecycle", "生命周期"], ["#/cos/funds", "持股与资金结构"], ["#/cos/compliance", "合规事项"], ["#/cos/calendar", "项目日历"]],
    ana: [["#/ana/regions", "国家与产业比较"], ["#/ana/policy", "政策影响"], ["#/ana/supply", "供应链"], ["#/ana/graph", "关系图谱"], ["#/ana/metrics", "指标比较"], ["#/ana/changes", "披露变化"], ["#/ana/judgments", "历史判断检验"]],
    arc: [["#/arc", "检索与筛选"], ["#/arc/batches", "批次简报"], ["#/arc/diff", "版本比较"], ["#/arc/export", "导出"]],
    src: [["#/src", "数据来源"], ["#/src/records", "更新记录"], ["#/src/rules", "扫描规则"]]
  };

  /* ═════════ 总览 ═════════ */
  function vHome() {
    var latest = DB.batches[0];
    var h = '<div class="ph"><h1>本期观察</h1><span class="sub">趋势 → 事件 → 项目变化 → 区域与资金</span>'
      + '<span class="right">' + pill("最近同步 " + DB.synced, "blue") + pill("批次 " + latest.id) + "</span></div>";

    /* 第一层：趋势卡（结论/解释/支持案例/新增证据） */
    h += '<div class="panel"><div class="panel-h"><h2>趋势归纳</h2><span class="note">基于最新批次样本；趋势卡可直接打开支持案例</span></div><div class="trendgrid">';
    var trends = collectTrends();
    if (!trends.length) h += '<div class="empty" style="grid-column:1/-1">本期样本不足，不做趋势判断</div>';
    trends.forEach(function (t) {
      h += '<div class="trendcard"><div class="tc-k">' + esc(t.batch) + " · " + esc(t.date) + '</div>'
        + '<div class="tc-t">' + esc(t.title) + '</div>'
        + '<div class="tc-d">' + esc(t.detail) + "</div>"
        + '<div class="tc-ev">支持案例：' + t.links.map(function (l) { return '<a href="' + esc(l.href) + '">' + esc(l.txt) + "</a>"; }).join(" · ")
        + (t.change ? '　<span class="dim">判断变化：' + esc(t.change) + "</span>" : "") + "</div></div>";
    });
    h += "</div></div>";

    /* 第二层：关键事件（主/次分级）——取最近一个有收录的批次，与趋势批次解耦 */
    h += '<div class="panel"><div class="panel-h"><h2>关键事件</h2><span class="note">主事件与次级事件分级展示</span></div><div class="evgrid">';
    var evBatch = latest;
    for (var bi = 0; bi < DB.batches.length; bi++) { if ((DB.batches[bi].items || []).length) { evBatch = DB.batches[bi]; break; } }
    var items = (evBatch.items || []).map(byAid).filter(Boolean);
    if (items.length) {
      var r0 = items[0];
      h += '<div class="evmaj"><div style="display:flex;gap:6px;margin-bottom:8px">' + pill("主事件", "solid") + pill(r0["披露日期与时间"], "blue") + pill(r0["涉及国家/地区"]) + "</div>"
        + '<div class="em-t">' + esc(shortCo(r0["公司全称"])) + " — " + esc(r0["动作类型"].split("（")[0]) + "</div>"
        + '<div style="font-size:13.5px;color:var(--ink-2);margin:8px 0">' + esc(r0["对主营业务的战略价值"] || "") + "</div>"
        + '<div style="font-size:13px;display:flex;gap:14px;flex-wrap:wrap">' + linkDoc(r0, "完整分析 →") + '<a href="' + esc(r0["来源链接"]) + '" target="_blank" rel="noopener">原文 ↗</a>' + favBtn("doc", r0._aid) + "</div></div>";
      h += '<div class="evmin">';
      items.slice(1, 5).forEach(function (r) {
        h += '<div class="ei"><b>' + esc(shortCo(r["公司全称"])) + "</b> — " + esc(r["动作类型"].split("（")[0])
          + '　<span class="dim">' + esc(r["阶段组"]) + "</span><br/>" + linkDoc(r, "分析") + "　" + favBtn("doc", r._aid) + "</div>";
      });
      if (items.length < 2) h += '<div class="ei dim">本批次其余命中经筛选排除，见批次说明</div>';
      h += "</div>";
    } else {
      h += '<div class="empty" style="grid-column:1/-1">本批次无新增收录（排除情况见批次简报）</div>';
    }
    h += "</div></div>";

    /* 第三层：项目更新 + 区域及资金概览 */
    var P = (V.projects || []).slice().sort(function (a, b) { return a.latest < b.latest ? 1 : -1; });
    h += '<div class="panel"><div class="panel-h"><h2>项目变化</h2><a class="more" href="#/cos/projects">全部项目 →</a></div><div class="projgrid">';
    P.slice(0, 6).forEach(function (p) {
      h += '<div class="projcard"><div class="pj-n"><a href="#/project/' + p.id + '">' + esc(p.name) + "</a></div>"
        + '<div class="pj-m">' + esc(shortCo(p.company)) + " · " + esc(p.region) + " · " + esc(p.industry) + '</div>'
        + stageBar(p) + '<div style="font-size:12px;color:var(--ink-3)">当前阶段 <b style="color:var(--blue)">' + esc(p.current_stage) + "</b> · 最新 " + esc(p.latest) + "</div></div>";
    });
    h += "</div></div>";

    h += '<div class="panel"><div class="panel-h"><h2>区域及资金概览</h2><a class="more" href="#/ana/regions">国家与产业比较 →</a></div><div class="panel-b">';
    var R = (V.regions || []).slice().sort(function (a, b) { return b.project_cnt - a.project_cnt; });
    h += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">';
    R.slice(0, 14).forEach(function (r) {
      h += '<a class="tag" href="#/ana/regions?r=' + encodeURIComponent(r.region) + '" style="font-size:12.5px;padding:3px 10px">' + esc(r.region) + " <b>" + r.project_cnt + "</b></a>";
    });
    h += "</div>";
    var F = V.funds || [];
    var fsum = {};
    F.forEach(function (f) { if (f.num) { var k = f.ccy; fsum[k] = (fsum[k] || 0) + 1; } });
    h += '<div class="note">资金事项 ' + F.length + " 条（可解析金额 " + Object.keys(fsum).map(function (k) { return fsum[k] + " 笔 " + k; }).join("、") + "）· 完整资金流向见 <a href=\"#/ana/metrics\">指标比较</a> / <a href=\"#/cos/funds\">资金结构</a></div>";
    h += "</div></div>";
    return h;
  }
  function collectTrends() {
    /* 从带 trend 的批次提取趋势卡；趋势句以 ①②③ 或分号切分 */
    var out = [];
    DB.batches.forEach(function (b) {
      if (!b.trend || out.length >= 3) return;
      var parts = b.trend.split(/(?=[①②③④])/).map(function (s) { return s.replace(/^[①②③④]\s*/, "").trim(); }).filter(Boolean);
      if (!parts.length) parts = [b.trend];
      parts.slice(0, 3).forEach(function (p, i) {
        if (out.length >= 3) return;
        var sent = p.split(/(?<=。)|；/).filter(Boolean);
        var title = sent[0] ? sent[0].replace(/。$/, "") : p.slice(0, 40);
        var detail = sent.slice(1).join("").replace(/。$/, "") || "";
        out.push({
          batch: b.id, date: b.id.slice(2, 10), title: title.slice(0, 60), detail: detail.slice(0, 120),
          links: (b.items || []).slice(0, 3).map(function (aid) { var r = byAid(aid); return r ? { href: "#/detail/" + r["序号"], txt: shortCo(r["公司全称"]) } : null; }).filter(Boolean),
          change: ""
        });
      });
    });
    return out;
  }
  function stageBar(p) {
    var s = '<div class="stagebar">';
    for (var i = 1; i <= p.lifecycle_len; i++) s += '<i class="' + (i <= p.stage_pos ? "on" : "") + '"></i>';
    return s + "</div>";
  }

  /* ═════════ 企业与项目 ═════════ */
  var cosQ = { q: "", region: "全部", stage: "全部", industry: "全部" };
  function vCompanies() {
    var h = '<div class="ph"><h1>企业档案</h1><span class="sub">海外布局 / 境外主体 / 项目 / 合作方 / 资金 / 历次披露</span></div>';
    h += '<div class="panel"><div class="filterbar">'
      + '<input class="finput" id="cq" placeholder="搜索公司 / 代码 / 合作方…" value="' + esc(cosQ.q) + '"/>'
      + '<select class="fsel" id="cr">' + optList(["全部"].concat((V.regions || []).map(function (r) { return r.region; })), cosQ.region) + "</select>"
      + '<select class="fsel" id="ci">' + optList(["全部"].concat(unique((V.projects || []).map(function (p) { return p.industry; }))), cosQ.industry) + "</select>"
      + '<span class="note" id="ccount" style="margin-left:auto"></span></div>'
      + '<div class="tbl-wrap"><table class="tbl"><thead>' + tblHead([["公司 / 代码", "width:210px"], ["行业", "width:100px"], ["海外区域"], ["项目", "width:56px"], ["主要合作方"], ["资金类型"], ["披露", "width:56px"], ["最新动态", "width:110px"]]) + '</thead><tbody id="crows"></tbody></table></div></div>';
    return h;
  }
  function optList(list, cur) { return list.map(function (x) { return '<option' + (x === cur ? " selected" : "") + ">" + esc(x) + "</option>"; }).join(""); }
  function unique(a) { var s = {}; return a.filter(function (x) { if (!x || s[x]) return false; s[x] = 1; return true; }); }
  function companyRows() {
    var q = cosQ.q.trim().toLowerCase();
    var rows = (V.companies || []).filter(function (c) {
      if (cosQ.region !== "全部" && c.regions.indexOf(cosQ.region) < 0) return false;
      if (cosQ.industry !== "全部" && c.industry !== cosQ.industry) return false;
      if (q && (c.name + c.code + c.partners.join(" ")).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    var cnt = $("ccount"); if (cnt) cnt.textContent = "显示 " + rows.length + " / " + (V.companies || []).length;
    var tb = $("crows"); if (!tb) return;
    tb.innerHTML = rows.map(function (c) {
      return '<tr class="click" data-href="#/company/' + encodeURIComponent(c.name) + '">'
        + '<td><b>' + esc(shortCo(c.name)) + '</b><br/><span class="code">' + esc(c.code) + "</span></td>"
        + "<td>" + esc(c.industry) + "</td>"
        + "<td>" + c.regions.map(function (r) { return '<a class="tag" href="#/ana/regions?r=' + encodeURIComponent(r) + '">' + esc(r) + "</a>"; }).join("") + "</td>"
        + '<td class="mono">' + c.projects.length + "</td>"
        + "<td>" + esc(c.partners.slice(0, 2).join("；")) + (c.partners.length > 2 ? " 等" : "") + "</td>"
        + "<td>" + c.fund_types.map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("") + "</td>"
        + '<td class="mono">' + c.count + "</td>"
        + '<td class="mono">' + esc(c.latest) + "</td></tr>";
    }).join("") || '<tr><td colspan="8"><div class="empty">无匹配公司</div></td></tr>';
  }

  function vCompany(name) {
    var c = companyOf(decodeURIComponent(name));
    if (!c) return '<div class="panel"><div class="empty">公司不存在</div></div>';
    var h = '<div class="panel dhead"><div class="crumbs"><a href="#/cos">企业档案</a> / ' + esc(c.code) + "</div>"
      + "<h1>" + esc(c.name) + '</h1><div class="dtags">' + pill(c.industry, "solid") + pill(c.code) + c.regions.map(function (r) { return pill(r); }).join("") + favBtn("company", c.name) + "</div></div>";
    h += '<div class="panel"><div class="panel-h"><h2>海外布局与项目</h2></div><div class="projgrid" style="grid-template-columns:repeat(2,1fr)">';
    c.projects.forEach(function (pid) {
      var p = null; (V.projects || []).forEach(function (x) { if (x.id === pid) p = x; });
      if (!p) return;
      h += '<div class="projcard"><div class="pj-n"><a href="#/project/' + p.id + '">' + esc(p.name) + "</a></div>"
        + '<div class="pj-m">' + esc(p.region) + " · " + esc(p.industry) + "</div>" + stageBar(p)
        + '<div style="font-size:12.5px;color:var(--ink-2)">阶段 <b>' + esc(p.current_stage) + "</b> · 事件 " + p.events.length + " 个 · 最新 " + esc(p.latest) + "</div></div>";
    });
    h += '</div></div>';
    h += '<div class="panel"><div class="panel-h"><h2>合作方</h2></div><div class="panel-b">'
      + (c.partners.length ? c.partners.map(function (p) { return '<span class="tag" style="font-size:13px;padding:4px 12px">' + esc(p) + "</span>"; }).join("") : '<span class="dim">—</span>') + "</div></div>";
    h += '<div class="panel"><div class="panel-h"><h2>历次披露</h2></div><div class="tbl-wrap"><table class="tbl"><thead>' + tblHead([["日期", "width:100px"], ["标题"], ["阶段", "width:80px"], ["金额 / 规模", "width:220px"], ["原文", "width:52px"]]) + "</thead><tbody>"
      + c.aids.map(function (aid) {
        var r = byAid(aid); if (!r) return "";
        return "<tr><td class='mono'>" + esc(r["披露日期与时间"]) + "</td><td>" + linkDoc(r, r["公告标题"]) + '<br/><span class="dim" style="font-size:12px">' + esc(r["公告类型"]) + "</span></td><td>" + esc(r["阶段组"]) + '</td><td class="money">' + money0(r["投资金额"]) + '</td><td><a href="' + esc(r["来源链接"]) + '" target="_blank" rel="noopener">原文</a></td></tr>';
      }).join("") + "</tbody></table></div></div>";
    return h;
  }

  var pjQ = { stage: "全部", region: "全部" };
  function vProjects() {
    var P = (V.projects || []).slice().sort(function (a, b) { return a.latest < b.latest ? 1 : -1; });
    var h = '<div class="ph"><h1>项目清单</h1><span class="sub">公司 + 主区域聚类；后续披露自动并入原项目时间线</span></div>';
    h += '<div class="panel"><div class="filterbar">'
      + '<select class="fsel" id="pjs">' + optList(["全部", "意向", "签约", "审批", "登记", "交割", "建设", "投产", "运营", "扩产", "退出"], pjQ.stage) + "</select>"
      + '<select class="fsel" id="pjr">' + optList(["全部"].concat((V.regions || []).map(function (r) { return r.region; })), pjQ.region) + "</select>"
      + '<span class="note" style="margin-left:auto">共 ' + P.length + " 个项目</span></div>"
      + '<div class="projgrid" style="grid-template-columns:repeat(3,1fr)">';
    P.forEach(function (p) {
      if (pjQ.stage !== "全部" && p.current_stage !== pjQ.stage) return;
      if (pjQ.region !== "全部" && (p.regions_all || [p.region]).indexOf(pjQ.region) < 0) return;
      h += '<div class="projcard"><div class="pj-n"><a href="#/project/' + p.id + '">' + esc(p.name) + "</a></div>"
        + '<div class="pj-m">' + esc(shortCo(p.company)) + " · " + esc(p.region) + " · " + esc(p.industry) + "</div>"
        + stageBar(p)
        + '<div style="font-size:12px;color:var(--ink-3);margin-bottom:8px">' + esc(p.current_stage) + " · " + p.events.length + " 事件 · 最新 " + esc(p.latest) + "</div>"
        + '<div style="font-size:12.5px">' + favBtn("project", p.id) + '　<a href="#/project/' + p.id + '">项目页 →</a></div></div>';
    });
    return h + "</div></div>";
  }

  function vProject(pid) {
    var p = null; (V.projects || []).forEach(function (x) { if (x.id === pid) p = x; });
    if (!p) return '<div class="panel"><div class="empty">项目不存在</div></div>';
    var c = companyOf(p.company);
    var comps = (V.compliance || []).filter(function (x) { return x.project === pid; });
    var funds = (V.funds || []).filter(function (x) { return x.project === pid && x.num; });
    var r0 = byAid(p.aids[0]);
    var h = '<div class="panel dhead"><div class="crumbs"><a href="#/cos/projects">项目清单</a> / <a href="#/company/' + encodeURIComponent(p.company) + '">' + esc(shortCo(p.company)) + "</a> / " + esc(p.id) + "</div>"
      + "<h1>" + esc(p.name) + '</h1><div class="dtags">'
      + pill(p.current_stage, "solid") + pill(p.region) + pill(p.industry) + pill("最新 " + p.latest, "blue") + favBtn("project", pid) + "</div></div>";

    /* 当前阶段 + 交易结构 + 持股 */
    h += '<div class="panel"><div class="panel-h"><h2>当前状态与交易结构</h2></div><div class="kv">'
      + dl("项目公司 / 主体", esc(p.name)) + dl("所属公司", '<a href="#/company/' + encodeURIComponent(p.company) + '">' + esc(shortCo(p.company)) + "</a>　" + esc(c ? c.code : ""))
      + dl("涉及区域", esc((p.regions_all || []).join("、"))) + dl("当前阶段", esc(p.current_stage) + "（第 " + p.stage_pos + "/" + p.lifecycle_len + " 步）")
      + dl("交易结构 / 对手方", r0 ? esc(r0["合作方"]) : "—")
      + dl("金额 / 规模", r0 ? esc(r0["投资金额"]) : "—")
      + dl("下一节点", p.next_nodes.length ? esc(p.next_nodes[0]) : '<span class="dim">—</span>')
      + "</div></div>";

    /* 生命周期时间线 */
    h += '<div class="panel"><div class="panel-h"><h2>项目时间线</h2><span class="note">同一项目后续披露进入原时间线</span></div>'
      + '<div class="lc-wrap"><div class="lc-flow">';
    for (var i = 0; i < p.lifecycle_len; i++) {
      var st = ["意向", "签约", "审批", "登记", "交割", "建设", "投产", "运营", "扩产", "退出"][i];
      var on = i < p.stage_pos;
      h += '<div class="lc-step' + (on ? " on" : "") + '"><div class="ls-dot"></div><div class="ls-t">' + st + '</div></div>';
      if (i < p.lifecycle_len - 1) h += '<div class="lc-band' + (on ? " on" : "") + '"></div>';
    }
    h += '</div></div><div class="tl">';
    p.events.slice().reverse().forEach(function (ev) {
      h += '<div class="tl-item"><div class="tld">' + esc(ev.date) + "<br/>" + pill(ev.stage, "blue") + '</div><div class="tlt">'
        + linkDocAid(ev.aid, ev.title) + "</div></div>";
    });
    h += '</div></div>';

    /* 资金 */
    h += '<div class="panel"><div class="panel-h"><h2>资金事项</h2><a class="more" href="#/cos/funds">全部资金结构 →</a></div><div class="tbl-wrap"><table class="tbl"><thead>'
      + tblHead([["日期", "width:100px"], ["类型", "width:100px"], ["金额（原文口径）", "width:160px"], ["方向", "width:90px"], ["表述摘录", ""]]) + "</thead><tbody>"
      + funds.map(function (f) {
        return "<tr><td class='mono'>" + esc(f.date) + "</td><td>" + pill(f.ftype, "blue") + "</td><td class='money'>" + esc(f.raw) + " " + esc(f.ccy) + "</td><td>" + esc(f.direction) + "</td><td class='dim' style='font-size:12px'>" + esc(f.text.slice(0, 60)) + "…</td></tr>";
      }).join("") + "</tbody></table>"
      + (funds.length ? "" : '<div class="empty">本项目暂无可解析金额的资金事项</div>') + "</div></div>";

    /* 合规事项 */
    h += '<div class="panel"><div class="panel-h"><h2>合规事项</h2><a class="more" href="#/cos/compliance?p=' + pid + '">全部事项 →</a></div><div class="tbl-wrap"><table class="tbl"><thead>'
      + tblHead([["类别", "width:130px"], ["具体要求", ""], ["依据", "width:200px"], ["状态", "width:80px"], ["证据", "width:56px"]]) + "</thead><tbody>"
      + comps.slice(0, 8).map(function (x) {
        return "<tr><td><b>" + esc(x.category) + "</b></td><td style='font-size:12.5px'>" + esc(x.req.slice(0, 60)) + "…</td><td class='dim' style='font-size:12px'>" + esc(x.basis.slice(0, 40)) + "…</td><td>" + (x.status === "已识别" ? '<span class="st ok">已识别</span>' : '<span class="st plan">待跟踪</span>') + "</td><td>" + (x.evidence.length ? linkDocAid(x.evidence[0].aid, "原文") : "—") + "</td></tr>";
      }).join("") + "</tbody></table></div></div>";

    /* 披露文件 */
    h += '<div class="panel"><div class="panel-h"><h2>披露文件与证据</h2></div><div class="evlist">'
      + p.aids.map(function (aid) {
        var r = byAid(aid); if (!r) return "";
        return '<div class="ev"><span class="pg">' + esc(r["披露日期与时间"]) + '</span><span class="qt">' + linkDoc(r, r["公告标题"]) + '　<a href="' + esc(r["来源链接"]) + '" target="_blank" rel="noopener">原文 ↗</a></span></div>';
      }).join("") + "</div></div>";
    return h;
  }

  function vLifecycle() {
    /* 全项目生命周期看板：阶段漏斗 + 每阶段项目 */
    var stages = ["意向", "签约", "审批", "登记", "交割", "建设", "投产", "运营", "扩产", "退出"];
    var by = {}; stages.forEach(function (s) { by[s] = []; });
    (V.projects || []).forEach(function (p) { if (by[p.current_stage]) by[p.current_stage].push(p); });
    var h = '<div class="ph"><h1>项目生命周期</h1><span class="sub">意向 → 签约 → 审批 → 登记 → 交割 → 建设 → 投产 → 运营 → 扩产 → 退出</span></div>';
    h += '<div class="panel"><div class="lc-wrap"><div class="lc-flow">';
    stages.forEach(function (s, i) {
      var n = by[s].length;
      h += '<div class="lc-step' + (n ? " on" : "") + '"><div class="ls-dot"></div><div class="ls-t">' + s + '</div><div class="ls-n">' + n + " 个项目</div></div>";
      if (i < stages.length - 1) h += '<div class="lc-band' + (n ? " on" : "") + '"></div>';
    });
    h += '</div></div></div>';
    stages.forEach(function (s) {
      if (!by[s].length) return;
      h += '<div class="panel"><div class="panel-h"><h2>' + s + ' · ' + by[s].length + " 个项目</h2></div><div class='tbl-wrap'><table class='tbl'><thead>"
        + tblHead([["项目", ""], ["公司", "width:180px"], ["区域", "width:120px"], ["行业", "width:100px"], ["最新事件", "width:110px"], ["下一节点", ""]]) + "</thead><tbody>"
        + by[s].map(function (p) {
          return '<tr class="click" data-href="#/project/' + p.id + '"><td><b>' + esc(p.name) + "</b></td><td>" + esc(shortCo(p.company)) + "</td><td>" + esc(p.region) + "</td><td>" + esc(p.industry) + "</td><td class='mono'>" + esc(p.latest) + "</td><td class='dim' style='font-size:12.5px'>" + esc(p.next_nodes[0] || "—") + "</td></tr>";
        }).join("") + "</tbody></table></div></div>";
    });
    return h;
  }

  function vFunds() {
    /* 持股与资金结构：资金类型统计 + 按项目列示 */
    var F = V.funds || [];
    var byt = {};
    F.forEach(function (f) { byt[f.ftype] = (byt[f.ftype] || 0) + 1; });
    var h = '<div class="ph"><h1>持股与资金结构</h1><span class="sub">公司承担金额 / 交易整体金额 / 额度上限 / 实际支付分开呈现（以原文表述为准）</span></div>';
    h += '<div class="cards4">'
      + statCard(F.length, "资金事项总数")
      + statCard(Object.keys(byt).length, "资金类型")
      + statCard(F.filter(function (f) { return f.ftype === "股东借款" || f.ftype === "财务资助"; }).length, "借款/资助")
      + statCard(F.filter(function (f) { return f.ftype === "并购投资" || f.ftype === "绿地投资" || f.ftype === "增资"; }).length, "股权类投入")
      + "</div>";
    h += '<div class="panel"><div class="panel-h"><h2>按类型分布</h2></div><div class="chart">'
      + svgBar(Object.keys(byt).map(function (k) { return { label: k, value: byt[k], href: "#/cos/funds?t=" + encodeURIComponent(k) }; }))
      + "</div></div>";
    h += '<div class="panel"><div class="panel-h"><h2>资金事项明细</h2></div><div class="tbl-wrap"><table class="tbl"><thead>'
      + tblHead([["日期", "width:96px"], ["公司", "width:170px"], ["项目", ""], ["类型", "width:90px"], ["金额（原文）", "width:140px"], ["方向", "width:80px"], ["披露", "width:56px"]]) + "</thead><tbody>"
      + F.map(function (f) {
        return "<tr><td class='mono'>" + esc(f.date) + "</td><td>" + esc(shortCo(f.company)) + "</td><td><a href=\"#/project/" + f.project + '">' + esc(projName(f.project)) + "</a></td><td>" + pill(f.ftype, "blue") + "</td><td class='money'>" + esc(f.raw) + " " + esc(f.ccy) + '</td><td>' + esc(f.direction) + "</td><td>" + linkDocAid(f.aid, "原文") + "</td></tr>";
      }).join("") + "</tbody></table></div></div>";
    return h;
  }
  function projName(pid) { var n = pid; (V.projects || []).forEach(function (p) { if (p.id === pid) n = p.name; }); return n; }
  function statCard(n, label) { return '<div class="stat"><div class="n">' + n + '</div><div class="c">' + esc(label) + "</div></div>"; }

  var cpQ = { status: "全部", cat: "全部", p: "" };
  function vCompliance() {
    var url = new URLSearchParams((location.hash.split("?")[1] || ""));
    if (url.get("p")) cpQ.p = url.get("p");
    var C = V.compliance || [];
    var cats = unique(C.map(function (x) { return x.category; }));
    var h = '<div class="ph"><h1>项目合规事项</h1><span class="sub">审批 / 准入 / 许可 / 税务 / 劳工 / 海关 / 数据 / 知产 / 制裁 / 合同承诺</span></div>';
    var stat = { "已识别": 0, "待跟踪": 0 };
    C.forEach(function (x) { stat[x.status] = (stat[x.status] || 0) + 1; });
    h += '<div class="cards4">'
      + statCard(C.length, "事项总数") + statCard(stat["已识别"] || 0, "已有披露证据")
      + statCard(stat["待跟踪"] || 0, "待跟踪（缺口）")
      + statCard(unique(C.map(function (x) { return x.project; })).length, "覆盖项目") + "</div>";
    h += '<div class="panel"><div class="filterbar">'
      + '<select class="fsel" id="cps">' + optList(["全部", "已识别", "待跟踪"], cpQ.status) + "</select>"
      + '<select class="fsel" id="cpc">' + optList(["全部"].concat(cats), cpQ.cat) + "</select>"
      + (cpQ.p ? pill("项目：" + projName(cpQ.p), "blue") + ' <a href="#/cos/compliance" class="note">清除</a>' : "")
      + '<span class="note" style="margin-left:auto">负责人与状态可编辑，本机保存并可在披露档案→导出中导出</span></div>'
      + '<div class="tbl-wrap"><table class="tbl"><thead>'
      + tblHead([["类别", "width:120px"], ["项目", ""], ["适用条件", ""], ["具体要求 / 依据", ""], ["证据", "width:56px"], ["负责人", "width:90px"], ["状态", "width:110px"]]) + "</thead><tbody id=\"cprows\"></tbody></table></div></div>";
    return h;
  }
  function complianceRows() {
    var C = (V.compliance || []).filter(function (x) {
      if (cpQ.p && x.project !== cpQ.p) return false;
      if (cpQ.status !== "全部" && x.status !== cpQ.status) return false;
      if (cpQ.cat !== "全部" && x.category !== cpQ.cat) return false;
      return true;
    });
    var tb = $("cprows"); if (!tb) return;
    tb.innerHTML = C.map(function (x) {
      var ann = ANN.comp[x.id] || {};
      var status = ann.status || x.status;
      return '<tr><td><b>' + esc(x.category) + "</b><br/><span class='dim' style='font-size:11px'>" + esc(x.basis.slice(0, 24)) + "…</span></td>"
        + "<td style='font-size:12.5px'><a href=\"#/project/" + x.project + '">' + esc(projName(x.project)) + "</a></td>"
        + "<td style='font-size:12.5px' class='dim'>" + esc(x.cond.slice(0, 40)) + "…</td>"
        + "<td style='font-size:12.5px'>" + esc(x.req.slice(0, 46)) + "…<br/><span class='dim' style='font-size:11px'>材料：" + esc(x.material.slice(0, 30)) + "…</span></td>"
        + "<td>" + (x.evidence.length ? linkDocAid(x.evidence[0].aid, "原文") : "—") + "</td>"
        + '<td><input class="finput" style="min-width:76px;padding:3px 8px;font-size:12px" data-owner="' + x.id + '" value="' + esc(ann.owner || "") + '" placeholder="填写"/></td>'
        + '<td><select class="fsel" style="padding:3px 6px;font-size:12px" data-status="' + x.id + '">'
        + optList(["待跟踪", "已识别", "办理中", "已完成"], status) + "</select>"
        + (x.gap && status !== "已完成" ? '<div class="note" style="margin-top:3px">' + esc(x.gap) + "</div>" : "") + "</td></tr>";
    }).join("") || '<tr><td colspan="7"><div class="empty">无匹配事项</div></td></tr>';
    tb.querySelectorAll("[data-owner]").forEach(function (i) {
      i.addEventListener("change", function () { var id = i.getAttribute("data-owner"); ANN.comp[id] = ANN.comp[id] || {}; ANN.comp[id].owner = i.value; saveAnn(); });
    });
    tb.querySelectorAll("[data-status]").forEach(function (s) {
      s.addEventListener("change", function () { var id = s.getAttribute("data-status"); ANN.comp[id] = ANN.comp[id] || {}; ANN.comp[id].status = s.value; saveAnn(); });
    });
  }

  function vCalendar() {
    /* 项目日历：按月网格，披露 + 待跟踪节点 */
    var now = DB.synced || "";
    var ym = now.slice(0, 7) || "2026-10";
    var cal = V.calendar || [];
    var items = {};
    cal.forEach(function (x) {
      var d = x.date || "待定";
      items[d] = items[d] || [];
      items[d].push(x);
    });
    var days = new Date(parseInt(ym.slice(0, 4), 10), parseInt(ym.slice(5, 7), 10), 0).getDate();
    var first = new Date(parseInt(ym.slice(0, 4), 10), parseInt(ym.slice(5, 7), 10) - 1, 1).getDay();
    var h = '<div class="ph"><h1>项目日历</h1><span class="sub">审批 / 许可 / 交割 / 建设 / 投产 / 付款 / 承诺履行节点；待定日期待原文披露后补全</span>'
      + '<span class="right">' + pill(ym, "blue") + "</span></div>";
    h += '<div class="panel"><div class="calgrid">';
    for (var i = 0; i < first; i++) h += '<div class="cal-d" style="background:transparent;border:none"></div>';
    for (var d = 1; d <= days; d++) {
      var key = ym + "-" + ("0" + d).slice(-2);
      var its = items[key] || [];
      h += '<div class="cal-d"><div class="cd-n">' + d + "</div>"
        + its.slice(0, 3).map(function (x, j) {
          return '<div class="cal-it ' + (j % 2 ? "t2" : "") + '" data-cal="' + esc(x.type + "|" + (x.aid || "") + "|" + (x.project || "")) + '">' + esc(x.type === "披露" ? "披露" : "待跟踪") + " · " + esc(x.title.slice(0, 20)) + (x.title.length > 20 ? "…" : "") + "</div>";
        }).join("") + "</div>";
    }
    h += '</div><div class="note" style="padding:0 22px 16px">待定节点 ' + (items["待定"] || []).length + " 个（来源：后续观察清单，原文未披露具体日期）</div></div>";
    h += '<div class="panel"><div class="panel-h"><h2>待跟踪节点</h2></div><div class="tl">'
      + (items["待定"] || []).map(function (x) {
        return '<div class="tl-item"><div class="tld">' + pill("待跟踪", "warn") + '</div><div class="tlt">' + esc(x.title) + '　<a href="#/project/' + x.project + '">项目 →</a></div></div>';
      }).join("") + "</div></div>";
    return h;
  }
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-cal]");
    if (!el) return;
    var parts = el.getAttribute("data-cal").split("|");
    if (parts[0] === "披露" && parts[1]) drawerDoc(parts[1]);
    else if (parts[2]) drawerProject(parts[2]);
  });

  /* ═════════ 专题分析 ═════════ */
  function vRegions() {
    var url = new URLSearchParams((location.hash.split("?")[1] || ""));
    var focus = url.get("r") || "";
    var R = (V.regions || []).slice().sort(function (a, b) { return b.project_cnt - a.project_cnt; });
    var h = '<div class="ph"><h1>国家与产业比较</h1><span class="sub">点击国家查看项目与资金；点击图表区间同样联动</span></div>';
    h += '<div class="cards4">'
      + statCard(R.length, "涉及国家/地区")
      + statCard(V.projects.length, "项目总数")
      + statCard((V.funds || []).filter(function (f) { return f.num; }).length, "可解析资金事项")
      + statCard(unique((V.projects || []).map(function (p) { return p.industry; })).length, "覆盖行业")
      + "</div>";
    h += '<div class="panel"><div class="panel-h"><h2>国家/地区项目分布</h2></div><div class="chart">'
      + svgBar(R.map(function (r) { return { label: r.region, value: r.project_cnt, disp: r.project_cnt + " 项目", href: "#/ana/regions?r=" + encodeURIComponent(r.region) }; }))
      + "</div></div>";
    h += '<div class="panel"><div class="panel-h"><h2>区域总表</h2></div><div class="tbl-wrap"><table class="tbl"><thead>'
      + tblHead([["国家/地区", "width:130px"], ["项目数", "width:70px"], ["公司数", "width:70px"], ["行业"], ["项目", ""]]) + "</thead><tbody>"
      + R.map(function (r) {
        return '<tr class="click" data-href="#/ana/regions?r=' + encodeURIComponent(r.region) + '"' + (focus === r.region ? ' style="background:var(--blue-bg)"' : "") + "><td><b>" + esc(r.region) + "</b></td><td class='mono'>" + r.project_cnt + "</td><td class='mono'>" + r.company_cnt + "</td><td>" + r.industries.map(function (x) { return '<span class="tag">' + esc(x) + "</span>"; }).join("") + "</td><td class='dim' style='font-size:12px'>" + r.projects.map(projName).join("；") + "</td></tr>";
      }).join("") + "</tbody></table></div></div>";
    if (focus) {
      var fr = null; R.forEach(function (r) { if (r.region === focus) fr = r; });
      if (fr) {
        h += '<div class="panel"><div class="panel-h"><h2>' + esc(focus) + " · 项目与资金</h2></div><div class='tbl-wrap'><table class='tbl'><thead>"
          + tblHead([["项目", ""], ["公司", "width:180px"], ["行业", "width:100px"], ["阶段", "width:80px"], ["资金事项", "width:90px"], ["最新", "width:100px"]]) + "</thead><tbody>"
          + fr.projects.map(function (pid) {
            var p = null; (V.projects || []).forEach(function (x) { if (x.id === pid) p = x; });
            if (!p) return "";
            var nf = (V.funds || []).filter(function (f) { return f.project === pid && f.num; }).length;
            return '<tr class="click" data-href="#/project/' + pid + '"><td><b>' + esc(p.name) + "</b></td><td>" + esc(shortCo(p.company)) + "</td><td>" + esc(p.industry) + "</td><td>" + esc(p.current_stage) + '</td><td class="mono">' + nf + '</td><td class="mono">' + esc(p.latest) + "</td></tr>";
          }).join("") + "</tbody></table></div></div>";
      }
    }
    return h;
  }

  function vPolicy() {
    var pol = (V.policies || []).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    var lv = { "中国": "blue", "国际": "purple", "目标国": "warn" };
    var h = '<div class="ph"><h1>政策影响</h1><span class="sub">中外投资与贸易政策时间线 · 标注受影响行业与区域</span></div>';
    h += '<div class="panel"><div class="panel-h"><h2>政策时间线</h2></div><div class="tl" style="padding-top:14px">';
    pol.forEach(function (p) {
      h += '<div class="tl-item"><div class="tld">' + esc(p.date) + "<br/>" + pill(p.level, lv[p.level] || "") + '</div><div class="tlt"><b>'
        + esc(p.title) + '</b>　<span class="dim">' + esc(p.issuer) + "</span><br/>"
        + '<span style="font-size:13px;color:var(--ink-2)">' + esc(p.summary) + "</span>"
        + (p.industries.length || p.regions.length ? '<div style="margin-top:4px">' + p.industries.map(function (x) { return '<span class="tag">' + esc(x) + "</span>"; }).join("") + p.regions.map(function (x) { return '<a class="tag" href="#/ana/regions?r=' + encodeURIComponent(x) + '">' + esc(x) + "</a>"; }).join("") + "</div>" : "")
        + "</div></div>";
    });
    return h + "</div></div>";
  }

  function vSupply() {
    var sc = V.supplychain || { capacity: [], clusters: [] };
    var cap = sc.capacity || [], cl = sc.clusters || [];
    var h = '<div class="ph"><h1>供应链与产能布局</h1><span class="sub">海外生产基地 / 扩产 / 迁移 / 产业集群（由披露原文派生）</span></div>';
    h += '<div class="cards4">'
      + statCard(cap.length, "产能布局事项") + statCard(cap.filter(function (c) { return c.type === "新建/扩建产能"; }).length, "新建/扩建")
      + statCard(cap.filter(function (c) { return c.type === "产能迁移"; }).length, "产能迁移")
      + statCard(cl.length, "区域×产业集群") + "</div>";
    h += '<div class="panel"><div class="panel-h"><h2>产业集群（区域 × 行业）</h2></div><div class="tbl-wrap"><table class="tbl"><thead>'
      + tblHead([["区域", "width:130px"], ["行业", "width:120px"], ["项目数", "width:80px"], ["项目", ""]]) + "</thead><tbody>"
      + cl.map(function (c) {
        return '<tr><td><a href="#/ana/regions?r=' + encodeURIComponent(c.region) + '"><b>' + esc(c.region) + "</b></a></td><td>" + esc(c.industry) + '</td><td class="mono">' + c.cnt + "</td><td class='dim' style='font-size:12px'>" + c.projects.map(projName).join("；") + "</td></tr>";
      }).join("") + "</tbody></table></div></div>";
    h += '<div class="panel"><div class="panel-h"><h2>产能布局明细</h2></div><div class="tbl-wrap"><table class="tbl"><thead>'
      + tblHead([["类型", "width:110px"], ["公司", "width:180px"], ["项目", ""], ["区域", "width:110px"], ["行业", "width:100px"], ["阶段", "width:80px"], ["日期", "width:100px"]]) + "</thead><tbody>"
      + cap.map(function (c) {
        return '<tr class="click" data-href="#/project/' + c.project + '"><td>' + pill(c.type, c.type === "产能迁移" ? "warn" : "blue") + "</td><td>" + esc(shortCo(c.company)) + "</td><td>" + esc(projName(c.project)) + "</td><td>" + esc(c.region) + "</td><td>" + esc(c.industry) + "</td><td>" + esc(c.stage) + "</td><td class='mono'>" + esc(c.date) + "</td></tr>";
      }).join("") + "</tbody></table></div></div>";
    return h;
  }

  /* ── 关系图谱 ── */
  var GQ = { kind: "核心", type: "全部", q: "", until: "" };
  var EDGE_TYPES = ["投资/运营", "位于", "合作/交易", "借款", "担保", "增资", "股权", "审批/合规", "披露"];
  var KIND_COLOR = { company: "#1f56a8", project: "#6b4fa3", region: "#1d7a3e", partner: "#b3541e", compliance: "#8a867f", file: "#5c5954" };
  var KIND_LABEL = { company: "公司", project: "项目", region: "国家/地区", partner: "合作方", compliance: "监管事项", file: "披露文件" };
  function vGraph() {
    var h = '<div class="ph"><h1>关系图谱</h1><span class="sub">公司—境外主体—项目—合作方—国家—监管事项—披露文件 · 筛选 / 时间切换 / 表格视图</span></div>';
    h += '<div class="panel"><div class="filterbar">'
      + '<select class="fsel" id="gqk">' + optList(["核心", "全部", "company", "project", "region", "partner", "compliance", "file"].map(function (k) { return k in KIND_LABEL ? KIND_LABEL[k] : k; }), GQ.kind in KIND_LABEL ? KIND_LABEL[GQ.kind] : GQ.kind) + "</select>"
      + '<select class="fsel" id="gqt">' + optList(["全部"].concat(EDGE_TYPES), GQ.type) + "</select>"
      + '<label class="fchk">截至 <input type="date" id="gquntil" value="' + esc(GQ.until) + '" style="border:1px solid var(--line-2);border-radius:6px;padding:4px 8px;font-size:12.5px"/></label>'
      + '<input class="finput" id="gqq" placeholder="搜索节点…" value="' + esc(GQ.q) + '" style="min-width:140px"/>'
      + '<label class="fchk"><input type="checkbox" id="gqtable"/> 表格视图</label>'
      + '<button class="btn" id="gqreset">重置视图</button>'
      + "</div>"
      + '<div class="glegend">'
      + Object.keys(KIND_COLOR).map(function (k) { return '<span><i style="background:' + KIND_COLOR[k] + '"></i>' + KIND_LABEL[k] + "</span>"; }).join("")
      + '<span class="dim">核心视图 = 公司+项目+国家；悬停连线看关系类型，点击节点进详情</span></div>'
      + '<div class="graphwrap" id="gwrap"></div></div>';
    return h;
  }
  function graphData() {
    var g = V.graph || { nodes: [], edges: [] };
    var core = GQ.kind === "核心";
    var nodes = g.nodes.filter(function (n) {
      if (core && ["company", "project", "region"].indexOf(n.kind) < 0) return false;
      if (!core && GQ.kind !== "全部" && GQ.kind !== "核心" && n.kind !== GQ.kind) return false;
      if (GQ.q && n.name.toLowerCase().indexOf(GQ.q.trim().toLowerCase()) < 0) return false;
      return true;
    });
    var ids = {};
    nodes.forEach(function (n) { ids[n.id] = 1; });
    var edges = g.edges.filter(function (e) {
      if (!(ids[e.s] && ids[e.t])) return false;
      if (GQ.type !== "全部" && e.type !== GQ.type) return false;
      if (GQ.until && e.date && e.date > GQ.until) return false;
      return true;
    });
    /* 只保留有连线的节点（孤立点不进图） */
    var used = {};
    edges.forEach(function (e) { used[e.s] = 1; used[e.t] = 1; });
    return { nodes: nodes.filter(function (n) { return used[n.id]; }), edges: edges };
  }
  function renderGraph() {
    var wrap = $("gwrap"); if (!wrap) return;
    var gd = graphData();
    if ($("gqtable") && $("gqtable").checked) {
      wrap.innerHTML = '<div class="tbl-wrap"><table class="tbl"><thead>' + tblHead([["关系", "width:110px"], ["起点", ""], ["终点", ""], ["日期", "width:100px"]]) + "</thead><tbody>"
        + gd.edges.slice(0, 400).map(function (e) {
          var ns = nodeById(e.s), nt = nodeById(e.t);
          return "<tr><td>" + esc(e.type) + "</td><td>" + esc(ns ? ns.name : e.s) + "</td><td>" + esc(nt ? nt.name : e.t) + "</td><td class='mono'>" + esc(e.date || "—") + "</td></tr>";
        }).join("") + "</tbody></table></div>";
      return;
    }
    if (!gd.nodes.length) { wrap.innerHTML = '<div class="empty">无匹配节点</div>'; return; }
    /* 轻量力导布局（确定性，不用外部库） */
    var W = Math.max(wrap.clientWidth || 900, 700), H = 560;
    var idx = {};
    gd.nodes.forEach(function (n, i) { idx[n.id] = i; n.x = W / 2 + Math.cos(i * 2.4) * (80 + i * 6); n.y = H / 2 + Math.sin(i * 2.4) * (60 + i * 5); });
    var kc = gd.kind === "region" ? 1.4 : 1;
    for (var it = 0; it < 160; it++) {
      gd.edges.forEach(function (e) {
        var a = gd.nodes[idx[e.s]], b = gd.nodes[idx[e.t]];
        if (!a || !b) return;
        var dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
        var f = (d - 110 * kc) / d * 0.06;
        a.x += dx * f; a.y += dy * f; b.x -= dx * f; b.y -= dy * f;
      });
      for (var i = 0; i < gd.nodes.length; i++) for (var j = i + 1; j < gd.nodes.length; j++) {
        var A = gd.nodes[i], B = gd.nodes[j];
        var ddx = B.x - A.x, ddy = B.y - A.y, dd = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
        if (dd < 60) { var ff = (60 - dd) / dd * 0.4; A.x -= ddx * ff; A.y -= ddy * ff; B.x += ddx * ff; B.y += ddy * ff; }
      }
      gd.nodes.forEach(function (n, i) {
        n.x += (W / 2 - n.x) * 0.01; n.y += (H / 2 - n.y) * 0.01;
      });
    }
    var s = '<svg viewBox="0 0 ' + W + " " + H + '">';
    gd.edges.forEach(function (e) {
      var a = gd.nodes[idx[e.s]], b = gd.nodes[idx[e.t]];
      if (!a || !b) return;
      s += '<line class="gedge" x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '"><title>' + esc(e.type + (e.date ? " · " + e.date : "")) + "</title></line>";
    });
    gd.nodes.forEach(function (n) {
      var r = n.kind === "company" ? 15 : n.kind === "project" ? 12 : 8;
      s += '<g class="gnode" data-gnode="' + esc(n.id) + '"><circle cx="' + n.x + '" cy="' + n.y + '" r="' + r + '" fill="' + (KIND_COLOR[n.kind] || "#5c5954") + '"/>'
        + '<text x="' + n.x + '" y="' + (n.y + r + 13) + '" text-anchor="middle">' + esc(n.name.slice(0, 14)) + "</text></g>";
    });
    wrap.innerHTML = s + "</svg>";
    wrap.querySelectorAll("[data-gnode]").forEach(function (el) {
      el.addEventListener("click", function () { graphNodeClick(el.getAttribute("data-gnode")); });
    });
  }
  function nodeById(id) { var g = V.graph || { nodes: [] }; for (var i = 0; i < g.nodes.length; i++) if (g.nodes[i].id === id) return g.nodes[i]; return null; }
  function graphNodeClick(id) {
    var n = nodeById(id); if (!n) return;
    if (n.kind === "project") drawerProject(n.id.replace("project:", ""));
    else if (n.kind === "company") location.hash = "#/company/" + encodeURIComponent(n.id.replace("company:", ""));
    else if (n.kind === "file") drawerDoc(n.id.replace("file:", ""));
    else if (n.kind === "region") location.hash = "#/ana/regions?r=" + encodeURIComponent(n.id.replace("region:", ""));
    else if (n.kind === "partner") openDrawer('<div class="dh"><h3>' + esc(n.name) + '</h3><button class="dx" id="dx">✕</button></div><div class="dim">合作方；关联项目见图谱连线</div>');
    else if (n.kind === "compliance") { var c = null; (V.compliance || []).forEach(function (x) { if (x.id === n.id.replace("compliance:", "")) c = x; }); if (c) openDrawer('<div class="dh"><h3>' + esc(c.category) + '</h3><button class="dx" id="dx">✕</button></div><div style="font-size:13px;line-height:1.8">' + esc(c.req) + '<br/><span class="dim">依据：' + esc(c.basis) + "</span></div>"); }
  }

  /* ── 指标比较 ── */
  var MQ = { mode: "company" };
  function vMetrics() {
    var P = V.projects || [];
    var h = '<div class="ph"><h1>指标比较</h1><span class="sub">跨公司 / 跨项目 / 跨期间 · 金额保留原文币种口径，不做汇率换算</span></div>';
    /* 气泡：项目数(x) × 资金事项数(y) × 公司数(size)，按区域着色太复杂，用统一色 */
    var bub = (V.regions || []).map(function (r) {
      return { x: r.project_cnt, y: r.fund_cnt, r: 8 + r.company_cnt * 5, label: r.region, href: "#/ana/regions?r=" + encodeURIComponent(r.region) };
    });
    h += '<div class="panel"><div class="panel-h"><h2>区域气泡：项目数 × 资金事项数 × 公司数</h2></div><div class="chart">'
      + (bub.length ? svgBubble(bub, { xl: "项目数", yl: "资金事项数" }) : '<div class="empty">暂无数据</div>') + "</div></div>";
    /* 基准表：项目 × 关键指标 */
    h += '<div class="panel"><div class="panel-h"><h2>项目基准表</h2></div><div class="tbl-wrap"><table class="tbl"><thead>'
      + tblHead([["项目", ""], ["公司", "width:170px"], ["区域", "width:100px"], ["行业", "width:90px"], ["阶段", "width:70px"], ["资金事项", "width:80px"], ["最新披露", "width:100px"], ["深挖", "width:56px"]]) + "</thead><tbody>"
      + P.map(function (p) {
        var nf = (V.funds || []).filter(function (f) { return f.project === p.id && f.num; }).length;
        return '<tr class="click" data-href="#/project/' + p.id + '"><td><b>' + esc(p.name) + "</b></td><td>" + esc(shortCo(p.company)) + "</td><td>" + esc(p.region) + "</td><td>" + esc(p.industry) + "</td><td>" + esc(p.current_stage) + '</td><td class="mono">' + nf + '</td><td class="mono">' + esc(p.latest) + '</td><td>' + linkDocAid(p.aids[p.aids.length - 1], "披露") + "</td></tr>";
      }).join("") + "</tbody></table></div></div>";
    return h;
  }

  function vChanges() {
    var CH = V.changes || [];
    var h = '<div class="ph"><h1>披露变化</h1><span class="sub">同一主体前后披露对比：阶段 / 金额 / 风险表述 / 合作方变化，前值后值附原文</span></div>';
    if (!CH.length) {
      h += '<div class="panel"><div class="empty">当前库中同一主体均只有一份披露；出现第二份后自动在此生成前值/后值对比（含相关原文与证据位置）</div></div>';
    } else {
      CH.forEach(function (c) {
        h += '<div class="panel"><div class="panel-h"><h2>' + esc(shortCo(c.company)) + '</h2><span class="note mono">' + esc(c.date_b) + " · " + linkDocAid(c.aid_a, "前值原文") + " ↔ " + linkDocAid(c.aid_b, "后值原文") + "</span></div>"
          + '<div class="tbl-wrap"><table class="tbl"><thead>' + tblHead([["变化项", "width:100px"], ["前值", ""], ["后值", ""]]) + "</thead><tbody>"
          + c.items.map(function (it) {
            return "<tr><td>" + pill(it.field, "warn") + "</td><td style='font-size:12.5px'>" + esc(it.before || "—") + '</td><td style="font-size:12.5px">' + esc(it.after || "—") + "</td></tr>";
          }).join("") + "</tbody></table></div></div>";
      });
    }
    /* 风险表述变化（单条披露的看不了变化，给风险集中度视图） */
    var risks = D.map(function (r) { return { r: r, t: r["主要风险与不确定性"] || "" }; }).filter(function (x) { return x.t; });
    h += '<div class="panel"><div class="panel-h"><h2>风险表述集中度</h2><span class="note">各条目风险表述原文（风险漂移检测在 ≥2 份披露后启用）</span></div><div style="padding:6px 22px 16px">'
      + risks.map(function (x) { return '<div class="ei" style="margin:8px 0"><b>' + esc(shortCo(x.r["公司全称"])) + "</b>　" + linkDoc(x.r, "原文") + "<br/><span style='font-size:12.5px;color:var(--ink-2)'>" + esc(x.t.slice(0, 110)) + "…</span></div>"; }).join("")
      + "</div></div>";
    return h;
  }

  function vJudgments() {
    var J = V.judgments || [];
    var h = '<div class="ph"><h1>历史判断检验</h1><span class="sub">当时判断 → 依据 → 后续事实 → 判断调整（连续案例自动累积）</span></div>';
    h += '<div class="panel"><div class="tbl-wrap"><table class="tbl"><thead>'
      + tblHead([["对象", "width:240px"], ["当时判断 / 版本", ""], ["依据", "width:220px"], ["形成日期", "width:100px"], ["后续事实", ""], ["调整", "width:120px"]]) + "</thead><tbody>"
      + J.map(function (j) {
        var obj = j.title ? '<a href="#/case/' + j.case + '">' + esc(j.title) + "</a>" : esc(j.case || "—");
        return "<tr><td>" + obj + '</td><td style="font-size:12.5px">' + esc(j.judgment || "—") + '</td><td class="dim" style="font-size:12px">' + esc((j.basis || "").slice(0, 60)) + "…</td><td class='mono'>" + esc(j.date || "—") + '</td><td class="dim" style="font-size:12px">' + esc(j.follow || "待后续披露检验") + '</td><td>' + (j.adjust ? esc(j.adjust) : '<span class="dim">—</span>') + "</td></tr>";
      }).join("") + "</tbody></table>"
      + (J.length ? "" : '<div class="empty">暂无判断记录</div>') + "</div></div>";
    return h;
  }

  /* ═════════ 披露档案 ═════════ */
  var f = { q: "", mode: "全部", stage: "全部", curve: "全部", sort: "desc", open: null, cmp: [] };
  function vArc() {
    var modes = ["全部", "产能出海", "产品出口", "并购整合", "资产出海", "品牌出海", "工程出海", "供应链出海"];
    var h = '<div class="ph"><h1>披露检索</h1><span class="sub">检索 / 筛选 / 原文 / 证据 / 关注</span></div>';
    h += '<div class="panel"><div class="filterbar">'
      + '<input class="finput" id="fq" placeholder="搜索公司 / 国家 / 公告关键词…" value="' + esc(f.q) + '"/>'
      + '<select class="fsel" id="fmode">' + optList(modes, f.mode) + "</select>"
      + '<select class="fsel" id="fstage">' + optList(["全部", "意向", "协议", "实施", "变更", "投产/运营"], f.stage) + "</select>"
      + '<select class="fsel" id="fcurve">' + optList(["全部", "仅第二曲线", "仅主业延伸"], ["全部", "是", "否"].indexOf(f.curve) >= 0 ? { "全部": "全部", "是": "仅第二曲线", "否": "仅主业延伸" }[f.curve] : "全部") + "</select>"
      + '<label class="fchk"><input type="checkbox" id="fsort"' + (f.sort === "asc" ? " checked" : "") + "/> 最早优先</label>"
      + '<label class="fchk"><input type="checkbox" id="ffav"' + (f.onlyFav ? " checked" : "") + "/> 仅看关注</label>"
      + '<span class="note" id="fcount" style="margin-left:auto"></span></div>'
      + '<div class="tbl-wrap"><table class="tbl"><thead>' + tblHead([["", "width:30px"], ["日期", "width:96px"], ["公司 / 代码", "width:190px"], ["公告类型 / 标题"], ["国家/地区", "width:110px"], ["模式", "width:86px"], ["阶段", "width:70px"], ["金额 / 规模", "width:170px"], ["关注", "width:70px"]]) + '</thead><tbody id="archiveRows"></tbody></table></div></div>';
    return h;
  }
  function archiveRows() {
    var q = f.q.trim().toLowerCase();
    var rows = D.filter(function (r) {
      if (f.mode !== "全部" && (r["出海模式归类"] || "").indexOf(f.mode) < 0) return false;
      if (f.stage !== "全部" && r["阶段组"] !== f.stage) return false;
      if (f.curve === "是" && (r["是否构成第二增长曲线"] || "").indexOf("是") !== 0) return false;
      if (f.curve === "否" && (r["是否构成第二增长曲线"] || "").indexOf("是") === 0) return false;
      if (f.onlyFav && !ANN.favs["doc:" + r._aid]) return false;
      if (q && Object.keys(r).map(function (k) { return r[k]; }).join(" ").toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    rows.sort(function (a, b) { return (a["披露日期与时间"] < b["披露日期与时间"] ? -1 : 1) * (f.sort === "asc" ? 1 : -1); });
    var cnt = $("fcount"); if (cnt) cnt.textContent = "显示 " + rows.length + " / " + D.length;
    var tb = $("archiveRows"); if (!tb) return;
    tb.innerHTML = rows.map(function (r) {
      var open = f.open === r["序号"];
      var curve = (r["是否构成第二增长曲线"] || "").indexOf("是") === 0;
      var p = projByAid(r._aid), c = caseOf(r._aid);
      var row = '<tr class="click" data-seq="' + r["序号"] + '">'
        + '<td class="mono">' + (open ? "−" : "+") + '</td><td class="mono" style="white-space:nowrap">' + esc(r["披露日期与时间"])
        + '</td><td><b>' + esc(shortCo(r["公司全称"])) + '</b><br/><span class="code">' + esc(r["股票代码"]) + "</span></td>"
        + "<td>" + esc(r["公告类型"]) + '<br/><span class="dim" style="font-size:12px">' + esc(r["公告标题"]) + "</span></td>"
        + "<td>" + esc(r["涉及国家/地区"]) + "</td><td>" + pill((r["出海模式归类"] || "").split(/[＋（]/)[0].trim()) + "</td>"
        + "<td>" + esc(r["阶段组"]) + '</td><td class="money">' + money0(r["投资金额"]) + "</td>"
        + "<td>" + favBtn("doc", r._aid) + "</td></tr>";
      if (open) {
        row += '<tr class="exprow"><td colspan="9"><div class="expbox"><div class="expgrid" style="grid-template-columns:repeat(3,1fr)">'
          + dl("动作类型", esc(r["动作类型"])) + dl("动作阶段", esc(r["动作阶段"])) + dl("处理状态", esc(r["处理状态"] || "已发布"))
          + dl("出海模式归类", esc(r["出海模式归类"])) + dl("盈利方式", esc(r["盈利方式"]))
          + dl("法务关注（一句）", esc((r["③法务关注（ODI/FDI审批备案/目标国合规/制裁出口管制/知识产权）"] || "").split(/[。；]/)[0]))
          + '</div><div class="explink">'
          + (p ? '<a href="#/project/' + p.id + '">所属项目：' + esc(p.name) + " →</a>　" : "")
          + (c ? '<a href="#/case/' + c.id + '">连续案例 →</a>　' : "")
          + linkDoc(r, "完整分析 →") + '　<a href="' + esc(r["来源链接"]) + '" target="_blank" rel="noopener">原文 PDF</a></div></div></td></tr>';
      }
      return row;
    }).join("") || '<tr><td colspan="9"><div class="empty">无匹配条目</div></td></tr>';
  }

  function batchNums(b) {
    return '<div class="bnums"><div class="bnum"><b>' + b.scanned + '</b><span>命中</span></div><div class="bnum"><b>' + b.kept + "</b><span>收录</span></div><div class='bnum'><b>" + b.excluded + "</b><span>排除</span></div><div class='bnum'><b>" + b.failed + '</b><span>失败</span></div></div>';
  }
  function batchHTML(b, withItems) {
    var h = '<div class="panel"><div class="panel-h"><h2>' + esc(b.id) + '</h2><span class="note mono">' + esc(b.time) + "</span></div>"
      + '<div class="batch-meta"><span>窗口 <b>' + esc(b.window) + '</b></span><span>来源 <b>' + esc(b.source) + "</b></span>" + batchNums(b) + "</div>";
    if (b.note) h += '<div class="panel-b note">' + esc(b.note) + "</div>";
    if (withItems) {
      if (b.items && b.items.length) {
        h += '<div class="bitems">';
        b.items.forEach(function (aid, i) {
          var r = byAid(aid); if (!r) return;
          h += '<div class="bitem"><span class="no">' + (i + 1) + '</span><span class="bd"><b>' + esc(shortCo(r["公司全称"])) + "</b> — " + esc(r["动作类型"].split(/（/)[0]) + "：" + money0(r["投资金额"]) + '　<span class="dim">' + esc(r["阶段组"]) + "</span>　" + linkDoc(r, "分析") + '　<a href="' + esc(r["来源链接"]) + '" target="_blank" rel="noopener">原文</a></span></div>';
        });
        h += "</div>";
      } else {
        h += '<div class="panel-b"><div class="empty">本批次无新增收录条目</div></div>';
      }
    }
    return h + "</div>";
  }
  function vBatches() {
    return '<div class="ph"><h1>批次简报</h1><span class="sub">扫描批次与已发布事件准确关联</span></div>'
      + DB.batches.map(function (b) { return batchHTML(b, true); }).join("");
  }

  function vDiff() {
    var opts = D.map(function (r) {
      return '<option value="' + r["序号"] + '"' + (f.cmp.indexOf(r["序号"]) >= 0 ? " selected" : "") + ">" + esc(r["披露日期与时间"] + " " + shortCo(r["公司全称"]) + " " + r["股票代码"]) + "</option>";
    }).join("");
    return '<div class="ph"><h1>版本比较</h1><span class="sub">两份披露并排比较（同一项目前后披露对比见「披露变化」）</span></div>'
      + '<div class="panel"><div class="filterbar"><select class="fsel" id="cmpA" style="min-width:320px">' + opts + '</select><select class="fsel" id="cmpB" style="min-width:320px">' + opts + "</select></div>"
      + '<div id="cmpOut" style="overflow-x:auto"></div></div>';
  }
  function cmpOut() {
    var a = bySeq(f.cmp[0]), b = bySeq(f.cmp[1]);
    var out = $("cmpOut"); if (!out) return;
    if (!a || !b) { out.innerHTML = '<div class="empty">选择两个条目进行比较</div>'; return; }
    function row(k, fa, fb) { return "<tr><th class='rowh'>" + esc(k) + "</th><td style='font-size:12.5px'>" + esc(fa || "—") + "</td><td style='font-size:12.5px'>" + esc(fb || "—") + "</td></tr>"; }
    out.innerHTML = '<div class="tbl-wrap"><table class="tbl cmp"><thead><tr><th style="width:120px"></th><th><b>' + esc(shortCo(a["公司全称"])) + '</b><br/><span class="code">' + esc(a["股票代码"] + " · " + a["披露日期与时间"]) + '</span></th><th><b>' + esc(shortCo(b["公司全称"])) + '</b><br/><span class="code">' + esc(b["股票代码"] + " · " + b["披露日期与时间"]) + "</span></th></tr></thead><tbody>"
      + row("公告类型", a["公告类型"], b["公告类型"]) + row("涉及国家/地区", a["涉及国家/地区"], b["涉及国家/地区"])
      + row("动作类型", a["动作类型"], b["动作类型"]) + row("动作阶段", a["动作阶段"], b["动作阶段"])
      + row("投资金额/规模", a["投资金额"], b["投资金额"]) + row("合作方", a["合作方"], b["合作方"])
      + row("出海模式", a["出海模式归类"], b["出海模式归类"]) + row("盈利方式", a["盈利方式"], b["盈利方式"])
      + row("战略价值", a["对主营业务的战略价值"], b["对主营业务的战略价值"])
      + row("营收利润影响", a["对营收结构与利润的预期影响"], b["对营收结构与利润的预期影响"])
      + row("第二曲线", a["是否构成第二增长曲线"], b["是否构成第二增长曲线"])
      + row("主要风险", a["主要风险与不确定性"], b["主要风险与不确定性"])
      + row("先发/后发", a["先发/后发位置判断"], b["先发/后发位置判断"])
      + row("商务关注", a["①商务关注（市场进入/渠道客户/竞争/关税贸易政策）"], b["①商务关注（市场进入/渠道客户/竞争/关税贸易政策）"])
      + row("财务关注", a["②财务关注（投资规模与资金来源/汇率敞口/海外收入占比/利润率现金流）"], b["②财务关注（投资规模与资金来源/汇率敞口/海外收入占比/利润率现金流）"])
      + row("法务关注", a["③法务关注（ODI/FDI审批备案/目标国合规/制裁出口管制/知识产权）"], b["③法务关注（ODI/FDI审批备案/目标国合规/制裁出口管制/知识产权）"])
      + "</tbody></table></div>";
  }

  function csvEsc(s) { return '"' + String(s == null ? "" : s).replace(/"/g, '""') + '"'; }
  function download(name, content, mime) {
    var blob = new Blob([content], { type: mime || "text/plain;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
  }
  function vExport() {
    var favDocs = D.filter(function (r) { return ANN.favs["doc:" + r._aid]; });
    var annComp = Object.keys(ANN.comp).map(function (id) { var c = null; (V.compliance || []).forEach(function (x) { if (x.id === id) c = x; }); return c ? { c: c, a: ANN.comp[id] } : null; }).filter(Boolean);
    return '<div class="ph"><h1>导出</h1><span class="sub">公开数据与个人标注分别导出</span></div>'
      + '<div class="cards4">'
      + statCard(D.length, "披露条目") + statCard(favDocs.length, "已关注披露") + statCard(Object.keys(ANN.favs).filter(function (k) { return ANN.favs[k]; }).length, "关注总数（含项目/公司）") + statCard(annComp.length, "合规标注")
      + "</div>"
      + '<div class="panel"><div class="panel-h"><h2>导出选项</h2></div><div class="panel-b" style="display:flex;gap:10px;flex-wrap:wrap">'
      + '<button class="btn primary" id="exCsv">披露总表 CSV（' + D.length + " 条）</button>"
      + '<button class="btn" id="exFav">我的关注 CSV（' + favDocs.length + " 条）</button>"
      + '<button class="btn" id="exAnn">合规标注 JSON（' + annComp.length + " 条）</button>"
      + '<button class="btn" id="exProj">项目清单 CSV（' + (V.projects || []).length + " 条）</button>"
      + "</div></div>";
  }
  function bindExport() {
    var e1 = $("exCsv");
    if (!e1) return;
    e1.onclick = function () {
      var cols = ["序号", "披露日期与时间", "公司全称", "股票代码", "公告标题", "公告类型", "涉及国家/地区", "动作类型", "动作阶段", "投资金额", "合作方", "出海模式归类", "阶段组", "来源链接"];
      download("pubx-disclosures.csv", "﻿" + cols.map(csvEsc).join(",") + "\n" + D.map(function (r) { return cols.map(function (c) { return csvEsc(r[c]); }).join(","); }).join("\n"), "text/csv;charset=utf-8");
    };
    $("exFav").onclick = function () {
      var cols = ["披露日期与时间", "公司全称", "股票代码", "公告标题", "动作类型", "来源链接"];
      download("pubx-favorites.csv", "﻿" + cols.map(csvEsc).join(",") + "\n" + D.filter(function (r) { return ANN.favs["doc:" + r._aid]; }).map(function (r) { return cols.map(function (c) { return csvEsc(r[c]); }).join(","); }).join("\n"), "text/csv;charset=utf-8");
    };
    $("exAnn").onclick = function () { download("pubx-annotations.json", JSON.stringify(ANN, null, 1), "application/json"); };
    $("exProj").onclick = function () {
      var cols = ["id", "name", "company", "region", "industry", "current_stage", "latest", "events"];
      download("pubx-projects.csv", "﻿" + cols.map(csvEsc).join(",") + "\n" + (V.projects || []).map(function (p) { return cols.map(function (c) { return csvEsc(c === "events" ? p.events.length : p[c]); }).join(","); }).join("\n"), "text/csv;charset=utf-8");
    };
  }

  /* ═════════ 来源与更新 ═════════ */
  function vSrc() {
    return '<div class="ph"><h1>数据来源</h1><span class="sub">实际使用的公开来源与接入安排</span></div>'
      + '<div class="panel"><div class="tbl-wrap"><table class="tbl"><thead>' + tblHead([["来源", "width:180px"], ["接入状态", "width:110px"], ["更新安排"], ["说明"], ["入口", "width:56px"]]) + "</thead><tbody>"
      + (DB.sources || []).map(function (s) {
        var st = s.status.indexOf("已接入") === 0 ? '<span class="st ok">' + esc(s.status) + "</span>" : s.status.indexOf("手动") === 0 ? '<span class="st manual">' + esc(s.status) + "</span>" : '<span class="st plan">' + esc(s.status) + "</span>";
        return "<tr><td><b>" + esc(s.name) + "</b></td><td>" + st + "</td><td>" + esc(s.freq) + "</td><td style='font-size:12.5px'>" + esc(s.note) + '</td><td>' + (s.url && s.url !== "—" ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">链接</a>' : "—") + "</td></tr>";
      }).join("") + "</tbody></table></div></div>";
  }
  function vRecords() {
    return '<div class="ph"><h1>更新记录</h1><span class="sub">扫描批次 · 重叠窗口 + 增量游标</span></div>'
      + '<div class="panel"><div class="tbl-wrap"><table class="tbl"><thead>' + tblHead([["批次", "width:150px"], ["执行时间", "width:130px"], ["窗口"], ["命中", "width:60px"], ["收录", "width:60px"], ["排除", "width:60px"], ["失败", "width:60px"]]) + "</thead><tbody>"
      + DB.batches.map(function (b) {
        return "<tr><td class='mono'>" + esc(b.id) + '</td><td class="mono">' + esc(b.time) + "</td><td style='font-size:12.5px'>" + esc(b.window) + '</td><td class="mono">' + b.scanned + '</td><td class="mono"><b>' + b.kept + '</b></td><td class="mono">' + b.excluded + '</td><td class="mono">' + b.failed + "</td></tr>";
      }).join("") + "</tbody></table></div></div>"
      + (DB.exceptions || []).length ? '<div class="panel"><div class="panel-h"><h2>异常记录</h2></div>'
      + (DB.exceptions || []).map(function (e) { return '<div class="exc"><div class="et">' + esc(e.type) + '<span class="tm">' + esc(e.time) + "</span></div><div>" + esc(e.detail) + '</div></div>'; }).join("") + "</div>" : "";
  }
  function vRules() {
    var R = DB.rules || {};
    return '<div class="ph"><h1>扫描规则</h1></div>'
      + '<div class="panel"><div class="ruleblk"><h3>监测关键词（' + (R.keywords || []).length + " 组）</h3><div>" + (R.keywords || []).map(function (k) { return '<span class="kwtag">' + esc(k) + "</span>"; }).join("") + "</div></div>"
      + '<div class="ruleblk"><h3>收录口径</h3><p>' + esc(R.include || "") + "</p></div>"
      + '<div class="ruleblk"><h3>排除口径</h3><p>' + esc(R.exclude || "") + "</p></div>"
      + '<div class="ruleblk"><h3>去重与增量</h3><p>' + esc(R.dedupe || "") + "</p></div>"
      + '<div class="ruleblk"><h3>事实口径纪律</h3><p>' + esc(R.caliber || "") + "</p></div>"
      + (R.multi_source ? '<div class="ruleblk"><h3>多源归属纪律</h3><p>' + esc(R.multi_source) + "</p></div>" : "") + "</div>";
  }

  /* ═════════ 披露详情（六段 · 阅读顺序：发生什么→为何重要→关键事实→项目进展→专业分析→原文证据→后续事项） ═════════ */
  function secHead(no, t, sub) {
    return '<div class="sech"><span class="sno">' + no + "</span><h2>" + esc(t) + "</h2>" + (sub ? '<span class="note">' + esc(sub) + "</span>" : "") + "</div>";
  }
  function vDetail(seq) {
    var r = bySeq(seq);
    if (!r) return '<div class="panel"><div class="empty">条目不存在</div></div>';
    var p = projByAid(r._aid), c = caseOf(r._aid);
    var av = r["分析版本"];
    var h = '<div class="panel dhead"><div class="crumbs"><a href="#/arc">披露检索</a> / ' + esc(r["披露日期与时间"]) + " / " + esc(r["股票代码"]) + "</div>"
      + "<h1>" + esc(shortCo(r["公司全称"])) + "：" + esc(r["动作类型"].split(/（/)[0]) + (r["投资金额"] ? "（" + esc((r["投资金额"].match(/([\d,.]+\s*(亿|万)?\s*(美元|人民币|澳元|欧元|港元|元)[^，；。]{0,12})/) || [])[0] || "") + "）" : "") + "</h1>"
      + '<div class="dtags">' + pill(r["公告类型"], "solid") + pill(r["涉及国家/地区"]) + pill("阶段：" + r["阶段组"]) + pill(r["出海模式归类"].split(/[＋（]/)[0].trim(), "blue")
      + ((r["是否构成第二增长曲线"] || "").indexOf("是") === 0 ? pill("潜在第二曲线", "blue") : "")
      + pill(r["处理状态"] || "已发布", "ok") + favBtn("doc", r._aid) + "</div>"
      + '<div class="note" style="margin-top:10px">原公告标题：' + esc(r["公告标题"]) + "</div>"
      + (p ? '<div class="casebar">所属项目：<a href="#/project/' + p.id + '">' + esc(p.name) + "</a>（" + esc(p.current_stage) + "）" + (c ? "　|　连续案例：<a href=\"#/case/" + c.id + '">' + esc(c.title) + "</a>" : "") + "</div>" : "")
      + "</div>";

    /* 发生什么 + 关键事实 */
    h += '<div class="panel">' + secHead("①", "发生了什么 · 关键事实")
      + '<div class="kv">'
      + dl("公司", esc(r["公司全称"])) + dl("证券代码 / 市场", esc(r["股票代码"])) + dl("披露日期", esc(r["披露日期与时间"]))
      + dl("动作类型", esc(r["动作类型"])) + dl("动作阶段", esc(r["动作阶段"])) + dl("涉及国家/地区", esc(r["涉及国家/地区"]))
      + dl("投资金额 / 合同规模", esc(r["投资金额"])) + dl("合作方 / 交易对手", esc(r["合作方"])) + dl("公告类型", esc(r["公告类型"]))
      + "</div></div>";

    /* 项目进展 */
    if (p) {
      h += '<div class="panel">' + secHead("②", "项目进展", "同一项目时间线自动累积")
        + '<div class="tl">' + p.events.slice().reverse().map(function (ev) {
          return '<div class="tl-item"><div class="tld">' + esc(ev.date) + "<br/>" + pill(ev.stage, "blue") + '</div><div class="tlt">'
            + (ev.aid === r._aid ? "<b>" + esc(ev.title) + "</b>（本条）" : linkDocAid(ev.aid, ev.title)) + "</div></div>";
        }).join("") + "</div>"
        + '<div style="padding:0 22px 16px;font-size:13px">项目当前阶段：<b style="color:var(--blue)">' + esc(p.current_stage) + "</b>　<a href=\"#/project/" + p.id + '">项目全览 →</a></div></div>';
    }

    /* 为何重要 */
    h += '<div class="panel">' + secHead("③", "为何重要 · 投资与经营意义")
      + '<div style="padding:4px 22px 16px">'
      + '<div class="sec"><span class="sk">与主业和市场关系</span>' + esc(r["对主营业务的战略价值"]) + "</div>"
      + '<div class="sec"><span class="sk">营收与利润影响</span>' + esc(r["对营收结构与利润的预期影响"]) + "</div>"
      + '<div class="sec"><span class="sk">主业延伸 / 第二曲线</span>' + esc(r["是否构成第二增长曲线"]) + "</div>"
      + '<div class="sec"><span class="sk">催化剂与关键假设</span>' + na(r["催化剂与关键假设"]) + "</div>"
      + '<div class="sec"><span class="sk">主要风险与不确定性</span>' + esc(r["主要风险与不确定性"]) + "</div>"
      + "</div></div>";

    /* 专业分析 */
    h += '<div class="panel">' + secHead("④", "商业模式", "模式归类须说明分类依据")
      + '<div style="padding:4px 22px 16px">'
      + '<div class="sec"><span class="sk">出海模式</span>' + esc(r["出海模式归类"]) + "</div>"
      + '<div class="sec"><span class="sk">分类依据</span>' + na(r["模式分类依据"]) + "</div>"
      + '<div class="sec"><span class="sk">盈利方式</span>' + esc(r["盈利方式"]) + "</div>"
      + '<div class="sec"><span class="sk">本地化深度</span>' + esc(r["本地化深度"]) + "</div>"
      + '<div class="sec"><span class="sk">价值链位置与资金回收路径</span>' + na(r["价值链位置与回收路径"]) + "</div>"
      + "</div></div>";

    h += '<div class="panel">' + secHead("⑤", "行业对标与检验", "同行业可比 ≠ 跨行业模式类比；比较注明期间、币种、口径")
      + '<div style="padding:4px 22px 16px">';
    if (r["可比案例"] && r["可比案例"].length) {
      r["可比案例"].forEach(function (k) {
        h += '<div class="casemini"><div class="cmh"><b>' + esc(k.name || "—") + '</b><span class="dim">' + esc(k.time || "") + "</span>" + pill(k.ctype || "同行业可比", k.ctype && k.ctype.indexOf("跨行业") >= 0 ? "blue" : "") + "</div>"
          + '<div class="cmr"><span class="sk">做法</span>' + esc(k.practice || "—") + "</div>"
          + '<div class="cmr"><span class="sk">可比理由</span>' + esc(k.why || "—") + "</div>"
          + '<div class="cmr"><span class="sk">异同</span>' + esc(k.diff || "—") + "</div>"
          + '<div class="cmr"><span class="sk">期间/币种/口径</span>' + esc(k.caliber || "—") + "</div></div>";
      });
    } else {
      h += '<div class="sec"><span class="sk">同行业可比案例</span>' + esc(r["同行业可比出海案例（公司+时间+做法+成效）"] || "—") + "</div>"
        + '<div class="sec"><span class="sk">与本公司异同</span>' + esc(r["与本公司动作的异同"] || "—") + "</div>";
    }
    h += '<div class="sec"><span class="sk">先发 / 后发位置</span>' + esc(r["先发/后发位置判断"]) + "</div></div></div>";

    h += '<div class="panel">' + secHead("⑥", "商务 / 财务 / 法务三要素", "按具体事实识别；已发生与潜在分层")
      + '<div style="padding:4px 22px 16px">'
      + '<div class="aitem"><span class="sk">商务/投资 · 总览</span><span class="ab">' + esc(r["①商务关注（市场进入/渠道客户/竞争/关税贸易政策）"]) + "</span></div>"
      + '<div class="aitem sub"><span class="sk">客户与订单结构</span><span class="ab">' + na(r["客户与订单结构"]) + "</span></div>"
      + '<div class="aitem sub"><span class="sk">定价权与交付能力</span><span class="ab">' + na(r["定价权与交付能力"]) + "</span></div>"
      + '<div class="aitem sub"><span class="sk">收入实现条件</span><span class="ab">' + na(r["收入实现条件"]) + "</span></div>"
      + '<div class="aitem"><span class="sk">财务 · 总览</span><span class="ab">' + esc(r["②财务关注（投资规模与资金来源/汇率敞口/海外收入占比/利润率现金流）"]) + "</span></div>"
      + '<div class="aitem sub"><span class="sk">实际投入 vs 承诺上限</span><span class="ab">' + na(r["实际投入与承诺上限"]) + "</span></div>"
      + '<div class="aitem sub"><span class="sk">资金来源/成本/币种/期限</span><span class="ab">' + na(r["资金来源成本币种期限"]) + "</span></div>"
      + '<div class="aitem sub"><span class="sk">并表或权益法影响</span><span class="ab">' + na(r["并表或权益法影响"]) + "</span></div>"
      + '<div class="aitem sub"><span class="sk">资金占用/汇率/减值/回款退出</span><span class="ab">' + na(r["资金占用与退出"]) + "</span></div>"
      + '<div class="aitem"><span class="sk">法务 · 识别</span><span class="ab">' + na(r["法律问题识别"]) + "</span></div>"
      + '<div class="aitem"><span class="sk">法务 · 总览</span><span class="ab">' + esc(r["③法务关注（ODI/FDI审批备案/目标国合规/制裁出口管制/知识产权）"]) + "</span></div>"
      + '<div class="aitem sub"><span class="sk">已发生法律事实</span><span class="ab">' + na(r["已发生法律事实"]) + "</span></div>"
      + '<div class="aitem sub"><span class="sk">潜在关注事项</span><span class="ab">' + na(r["潜在关注事项"]) + "</span></div>"
      + "</div></div>";

    /* 原文证据 + 后续事项 */
    h += '<div class="panel">' + secHead("⑦", "原文证据与后续事项", "披露事实 / 计算 / 分析推断 / 未披露事项 四层")
      + '<div class="evlist">' + (r["摘录"] || []).map(function (q) {
        return '<div class="ev"><span class="pg">P' + (q.page || "?") + '</span><span class="qt">「' + esc(q.text) + "」</span></div>";
      }).join("") + "</div>"
      + '<div style="padding:8px 22px 0">'
      + '<div class="layer"><div class="lk"><span class="no">1</span>披露事实（原文明示）</div><div class="lv">' + esc(r["动作类型"]) + "；" + esc(r["动作阶段"]) + "；" + esc(r["涉及国家/地区"]) + "。</div></div>"
      + '<div class="layer"><div class="lk"><span class="no">2</span>金额与计算（输入/公式/期间/口径）</div><div class="lv">' + esc(r["投资金额"] || "—") + "</div></div>"
      + '<div class="layer"><div class="lk"><span class="no">3</span>分析推断（依据与限制）</div><div class="lv"><b>模式归类：</b>' + esc(r["出海模式归类"]) + '<div class="note" style="margin-top:4px">推断受披露完整度限制；原文未披露的字段一律标注，不自行补齐。</div></div></div>'
      + '<div class="layer"><div class="lk"><span class="no">4</span>未披露 / 待验证</div><div class="lv">' + esc(r["未披露事项"]) + "</div></div>"
      + "</div>"
      + '<div style="padding:10px 22px 16px">'
      + '<div class="sec"><span class="sk">后续观察清单</span>'
      + (r["后续观察清单"] && r["后续观察清单"].length ? '<ul class="obsv">' + r["后续观察清单"].map(function (o) { return "<li>" + esc(o) + "</li>"; }).join("") + "</ul>" : na(null))
      + "</div>"
      + '<div class="note" style="padding-top:6px">分析版本：' + (av ? esc(av.v || "v2") + " · " + esc(av.model || "") + " · " + esc(av.at || "") : "v1 · " + esc(DB.synced) + " · 口径 v2 新增段待回填")
      + '　|　原文：<a href="' + esc(r["来源链接"]) + '" target="_blank" rel="noopener">' + esc(r["来源链接"]) + "</a></div>"
      + "</div></div>";
    return h;
  }

  function vCase(id) {
    var c = null; (DB.cases || []).forEach(function (x) { if (x.id === id) c = x; });
    if (!c) return '<div class="panel"><div class="empty">案例不存在</div></div>';
    var h = '<div class="panel dhead"><div class="crumbs"><a href="#/arc">披露检索</a> / ' + esc(c.id) + "</div><h1>" + esc(c.title) + '</h1><div class="dtags">'
      + pill(c.status, "solid") + pill(c.region) + pill(c.code) + "</div></div>";
    h += '<div class="panel"><div class="panel-h"><h2>案例时间线</h2></div><div class="tl">';
    var evs = c.events.map(byAid).filter(Boolean).sort(function (a, b) { return a["披露日期与时间"] < b["披露日期与时间"] ? -1 : 1; });
    evs.forEach(function (r) {
      h += '<div class="tl-item"><div class="tld">' + esc(r["披露日期与时间"]) + "<br/>" + pill(r["阶段组"], "blue") + '</div><div class="tlt">' + linkDoc(r, r["公告标题"]) + '<br/><span class="dim" style="font-size:12px">' + money0(r["投资金额"]) + '</span></div></div>';
    });
    h += '</div><div class="checkbox" style="padding:0 22px 16px"><b>判断检验：</b>' + esc(c.check) + "</div></div>";
    return h;
  }

  /* ═════════ 路由 ═════════ */
  function setSub(section, cur) {
    var items = SUBS[section] || [];
    subnav.innerHTML = items.map(function (x) {
      return '<a href="' + x[0] + '"' + (x[0] === cur ? ' class="on"' : "") + ">" + esc(x[1]) + "</a>";
    }).join("");
  }
  function route() {
    var hraw = location.hash.replace(/^#/, "") || "/";
    var hpath = hraw.split("?")[0];
    var parts = hpath.split("/").filter(Boolean);
    var name = parts[0] || "home", param = parts[1] ? decodeURIComponent(parts[1]) : null;
    var html, section = "home", sub = "";
    closeDrawer();
    if (name === "cos" || name === "company" || name === "project") {
      section = "cos";
      if (name === "cos" || name === "") { sub = "#/cos"; html = name === "project" ? vProject(param) : (name === "company" ? vCompany(param || "") : vCompanies()); }
      if (name === "cos" && param === "projects") { sub = "#/cos/projects"; html = vProjects(); }
      if (name === "cos" && param === "lifecycle") { sub = "#/cos/lifecycle"; html = vLifecycle(); }
      if (name === "cos" && param === "funds") { sub = "#/cos/funds"; html = vFunds(); }
      if (name === "cos" && param === "compliance") { sub = "#/cos/compliance"; html = vCompliance(); }
      if (name === "cos" && param === "calendar") { sub = "#/cos/calendar"; html = vCalendar(); }
      if (name === "company") { sub = "#/cos"; html = vCompany(param || ""); }
      if (name === "project") { sub = "#/cos/projects"; html = vProject(param); }
    }
    else if (name === "ana") {
      section = "ana";
      var sub2 = param || "regions";
      sub = "#/ana/" + sub2;
      html = { regions: vRegions, policy: vPolicy, supply: vSupply, graph: vGraph, metrics: vMetrics, changes: vChanges, judgments: vJudgments }[sub2] || vRegions;
      html = html();
    }
    else if (name === "arc" || name === "detail" || name === "case") {
      section = "arc";
      if (name === "detail") { sub = "#/arc"; html = vDetail(param); }
      else if (name === "case") { sub = "#/arc"; html = vCase(param); }
      else if (param === "batches") { sub = "#/arc/batches"; html = vBatches(); }
      else if (param === "diff") { sub = "#/arc/diff"; html = vDiff(); }
      else if (param === "export") { sub = "#/arc/export"; html = vExport(); }
      else { sub = "#/arc"; html = vArc(); }
    }
    else if (name === "src") {
      section = "src";
      if (param === "records") { sub = "#/src/records"; html = vRecords(); }
      else if (param === "rules") { sub = "#/src/rules"; html = vRules(); }
      else { sub = "#/src"; html = vSrc(); }
    }
    else { section = "home"; sub = "#/"; html = vHome(); }
    view.innerHTML = html;
    setSub(section, sub);
    var links = document.querySelectorAll(".mainnav a");
    for (var i = 0; i < links.length; i++) links[i].classList.toggle("on", links[i].getAttribute("data-r") === section);
    window.scrollTo(0, 0);
    bindRoute(name, param);
  }
  function bindRoute(name, param) {
    if (name === "cos" && !param) {
      companyRows();
      $("cq").addEventListener("input", function (e) { cosQ.q = e.target.value; companyRows(); });
      $("cr").addEventListener("change", function (e) { cosQ.region = e.target.value; companyRows(); });
      $("ci").addEventListener("change", function (e) { cosQ.industry = e.target.value; companyRows(); });
    }
    if (name === "cos" && param === "projects") {
      $("pjs").addEventListener("change", function (e) { pjQ.stage = e.target.value; route(); });
      $("pjr").addEventListener("change", function (e) { pjQ.region = e.target.value; route(); });
    }
    if (name === "cos" && param === "compliance") complianceRows();
    if (name === "ana" && param === "graph") {
      renderGraph();
      var KIND_REV = {}; Object.keys(KIND_LABEL).forEach(function (k) { KIND_REV[KIND_LABEL[k]] = k; });
      $("gqk").addEventListener("change", function (e) { GQ.kind = KIND_REV[e.target.value] || e.target.value; renderGraph(); });
      $("gqt").addEventListener("change", function (e) { GQ.type = e.target.value; renderGraph(); });
      $("gquntil").addEventListener("change", function (e) { GQ.until = e.target.value; renderGraph(); });
      $("gqq").addEventListener("input", function (e) { GQ.q = e.target.value; renderGraph(); });
      $("gqtable").addEventListener("change", renderGraph);
      $("gqreset").addEventListener("click", function () { GQ = { kind: "核心", type: "全部", q: "", until: "" }; route(); });
      window.addEventListener("resize", function rs() { window.removeEventListener("resize", rs); renderGraph(); });
    }
    if (name === "arc" && !param) {
      archiveRows();
      $("fq").addEventListener("input", function (e) { f.q = e.target.value; archiveRows(); });
      $("fmode").addEventListener("change", function (e) { f.mode = e.target.value; archiveRows(); });
      $("fstage").addEventListener("change", function (e) { f.stage = e.target.value; archiveRows(); });
      $("fcurve").addEventListener("change", function (e) { f.curve = e.target.value; archiveRows(); });
      $("fsort").addEventListener("change", function (e) { f.sort = e.target.checked ? "asc" : "desc"; archiveRows(); });
      var ff = $("ffav"); if (ff) ff.addEventListener("change", function (e) { f.onlyFav = e.target.checked; archiveRows(); });
      $("archiveRows").addEventListener("click", function (e) {
        if (e.target.closest("a,button,input")) return;
        var tr = e.target.closest("tr.click"); if (!tr) return;
        var seq = tr.getAttribute("data-seq");
        f.open = f.open === seq ? null : seq;
        archiveRows();
      });
    }
    if (name === "arc" && param === "diff") {
      if (!f.cmp.length) f.cmp = [D[0] && D[0]["序号"], D[1] && D[1]["序号"]];
      var selA = $("cmpA"), selB = $("cmpB");
      if (selA && bySeq(f.cmp[0])) selA.value = f.cmp[0];
      if (selB && bySeq(f.cmp[1])) selB.value = f.cmp[1];
      function upd() { f.cmp = [selA.value, selB.value]; cmpOut(); }
      selA.addEventListener("change", upd); selB.addEventListener("change", upd);
      cmpOut();
    }
    if (name === "arc" && param === "export") bindExport();
    var cp = $("cps");
    if (name === "cos" && param === "compliance" && cp) {
      cp.addEventListener("change", function (e) { cpQ.status = e.target.value; complianceRows(); });
      $("cpc").addEventListener("change", function (e) { cpQ.cat = e.target.value; complianceRows(); });
    }
  }

  /* ── 初始化 ── */
  $("sideSync").textContent = DB.synced || "—";
  var fs = $("footSync"); if (fs) fs.textContent = "最近同步 " + (DB.synced || "—");
  $("burger").addEventListener("click", function () { $("mainnav").classList.toggle("open"); });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".mainnav") && !e.target.closest("#burger")) $("mainnav").classList.remove("open");
  });
  window.addEventListener("hashchange", route);
  route();
})();
