/* 出海情报台 · PubX — P1 版：一级导航四分页面
   出海信批归纳（#/，仅中企；二级：总览/事件库/事件详情/法律议题/企业档案/专题研究/项目看板/方法与来源）
   美股SEC #/us · 港股HKEX #/hk-market（全量不分中外企，骨架）· 出口管制 #/export（BIS/OFAC/UFLPA + 观察名单比对）
   四分页面数据文件、统计口径互不混用。
   纪律：原文未载 → null 显示【未披露】；未核查 → unknown；叙事字段分层 disclosed/external/analysis。 */
(function () {
  "use strict";
  var D = DB.disclosures || [];
  var V = DB.derived || { companies: [], projects: [], regions: [], funds: [], partners: [], policies: [], supplychain: { capacity: [], clusters: [] } };
  var EV = DB.events || [];
  var EDOC = DB.event_docs || {};
  var B = DB.batches || [];
  var view = document.getElementById("view");
  var subnav = document.getElementById("subnav");

  /* ── 基础工具 ── */
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function unique(a) { var s = {}; return (a || []).filter(function (x) { if (x == null || x === "") return false; if (s[x]) return false; s[x] = 1; return true; }); }
  function shortCo(name) {
    name = name || "";
    for (var i = 0; i < SUFFIX.length; i++) if (name.endsWith(SUFFIX[i])) return name.slice(0, -SUFFIX[i].length);
    return name;
  }
  var SUFFIX = ["集团股份有限公司", "股份有限公司", "有限责任公司", "有限公司"];
  function pill(t, cls) { return t == null || t === "" ? "" : '<span class="pill ' + (cls || "") + '">' + esc(t) + "</span>"; }
  function layerBadge(layer) {
    if (layer === "disclosed") return '<span class="st ok" title="公司披露，附原文出处">披露</span>';
    if (layer === "external") return '<span class="st manual" title="外部事实，须附来源">外部</span>';
    return '<span class="st plan" title="系统分析，须写依据">分析</span>';
  }
  var CH_META = {
    "A股·巨潮": { short: "A股", cls: "a" },
    "港股·披露易": { short: "港股", cls: "hk" },
    "美股·EDGAR": { short: "美股", cls: "us" }
  };
  function chOf(r) {
    if (r["渠道"] && CH_META[r["渠道"]]) return r["渠道"];
    var c = r["股票代码"] || "";
    if (/\.HK$/i.test(c)) return "港股·披露易";
    if (/\.(SH|SZ|BJ)$/i.test(c)) return "A股·巨潮";
    if (r["SEC表格"] || r["CIK"]) return "美股·EDGAR";
    return "其他来源";
  }
  function chTag(r) { var m = CH_META[chOf(r)] || { short: "其他", cls: "ot" }; return '<span class="chtag ' + m.cls + '">' + m.short + "</span>"; }
  function amtShort(t) {
    if (!t) return "";
    var m = String(t).match(/([0-9][0-9,]*\.?[0-9]*)\s*(亿|万)?\s*(美元|港元|人民币|元|澳元|欧元|新元|迪拉姆)/);
    if (m) return m[0].replace(/\s+/g, "");
    return String(t).slice(0, 24);
  }
  function statCard(n, c, d) {
    return '<div class="stat"><div class="n">' + n + '</div><div class="c">' + esc(c) + "</div>" + (d ? '<div class="d">' + esc(d) + "</div>" : "") + "</div>";
  }
  function na(v) { return v ? esc(v) : '<span class="na">【未披露】</span>'; }

  /* ── 个人标注（本机保存） ── */
  var ANN = { favs: {}, notes: {} };
  try { var a = JSON.parse(localStorage.getItem("pubx_ann") || "{}"); ANN.favs = a.favs || {}; ANN.notes = a.notes || {}; } catch (e) { }
  function saveAnn() { try { localStorage.setItem("pubx_ann", JSON.stringify(ANN)); } catch (e) { } }
  function favBtn(kind, key) {
    var on = ANN.favs[kind + ":" + key];
    return '<button class="btn" style="padding:2px 10px;font-size:11.5px" data-fav="' + esc(kind + ":" + key) + '">' + (on ? "★ 已关注" : "☆ 关注") + "</button>";
  }

  /* ── 事件派生索引 ── */
  var EVX = EV.map(function (e) {
    var latest = e.sources[e.sources.length - 1];
    return {
      e: e,
      id: e.event_id,
      date: latest ? latest.date : "",
      title: e.title_fact ? e.title_fact.text : e.event_id,
      subject: e.parties && e.parties[0] ? e.parties[0].name : "—",
      mt: e.matter_type ? e.matter_type.value : null,
      stage: e.stage_current,
      status: e.status,
      ut: e.update_type_latest,
      geo: e.geo ? e.geo.text : null,
      amt: e.scale ? amtShort(e.scale.text) : "",
      chans: unique(e.sources.map(function (s) { return s.channel; }))
    };
  });
  EVX.sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  function evById(id) { for (var i = 0; i < EV.length; i++) if (EV[i].event_id === id) return EV[i]; return null; }
  function docByAid(aid) { for (var i = 0; i < D.length; i++) if (D[i]._aid === aid) return D[i]; return null; }

  /* ═════════ 首页：本期最重要事件 → 数据卡 → 跟踪 → 更新一览 → 入口 ═════════ */
  function vHome() {
    var maxDate = EVX.length ? EVX[0].date : "";
    var d7 = "";
    if (maxDate) { var dt = new Date(maxDate.replace(/-/g, "/")); dt.setDate(dt.getDate() - 7); d7 = dt.toISOString().slice(0, 10); }
    var recent7 = EVX.filter(function (x) { return x.date >= d7; }).length;
    var BD = DB.batches_daily || [];
    var lb = null;
    for (var bi = 0; bi < BD.length; bi++) if (BD[bi].kind === "daily") { lb = BD[bi]; break; }
    if (!lb) lb = B[0] || {};

    // 头条：优先"进展"事件，否则最近的活跃事件
    var lead = null;
    for (var i = 0; i < EVX.length; i++) if (EVX[i].ut === "进展") { lead = EVX[i]; break; }
    if (!lead) for (var j = 0; j < EVX.length; j++) if (EVX[j].status === "活跃") { lead = EVX[j]; break; }
    if (!lead && EVX.length) lead = EVX[0];

    var h = '<div class="ph"><h1>总览</h1><span class="sub">本页回答：本期最重要的出海事件是什么、为什么值得关注、接下来盯什么</span></div>';
    if (lead) {
      var e = lead.e;
      var q0 = null, s0 = e.sources[e.sources.length - 1];
      for (var k = e.sources.length - 1; k >= 0 && !q0; k--) if (e.sources[k].quotes && e.sources[k].quotes[0]) { q0 = e.sources[k].quotes[0]; s0 = e.sources[k]; }
      h += '<div class="lede"><div class="lede-t">本期重点 · ' + esc(lead.date) + " · " + esc(lead.id) + '</div>'
        + '<p style="font-size:17px;font-weight:700;line-height:1.7;margin-bottom:8px">' + esc(lead.title) + "</p>"
        + '<div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:10px">'
        + pill(lead.mt, "solid") + pill("阶段：" + lead.stage, "blue") + pill(lead.status) + (lead.amt ? pill(lead.amt, "blue") : "") + "</div>";
      if (e.terms && e.terms[0]) h += '<div class="sec" style="border:none;padding:2px 0"><span class="sk">关键条件 ' + layerBadge("disclosed") + '</span>' + esc(e.terms[0].text) + (e.terms.length > 1 ? '<span class="dim">（另 ' + (e.terms.length - 1) + " 项见事件详情）</span>" : "") + "</div>";
      if (q0) h += '<div class="em-q">「' + esc(q0.text) + "」<a href='" + esc(s0.url) + "#page=" + (q0.page || 1) + "' target='_blank' rel='noopener'>原文 P" + (q0.page || "?") + " ↗</a></div>";
      h += '<div style="font-size:13px;display:flex;gap:14px;flex-wrap:wrap;margin-top:12px">'
        + '<a href="#/event/' + lead.id + '"><b>完整分析 →</b></a>'
        + (s0 ? '<a href="' + esc(s0.url) + '" target="_blank" rel="noopener">最新原文 ↗</a>' : "")
        + '<span class="note">判断与风险分析见事件详情（避免重复呈现）</span></div></div>';
    } else {
      h += '<div class="lede"><div class="lede-t">本期重点</div><p>当前样本期内无收录事件。</p></div>';
    }

    // 关键数据卡（注明口径）
    var funnel = lb.per_source ? Object.keys(lb.per_source).map(function (k) {
      var p = lb.per_source[k]; return k.replace(/·.*/, "") + " 扫" + p.scanned + "/收" + p.kept;
    }).join("；") : "—";
    h += '<div class="statstrip">'
      + statCard(D.length, "收录披露", "三渠道累计入库")
      + statCard(EV.length, "事件", "多源/多公告合并后")
      + statCard(EVX.length ? unique(EVX.map(function (x) { return x.subject; })).length : 0, "跟踪主体", "有出海实质动作披露")
      + statCard(recent7, "近7日新增事件", "窗口 " + (d7 || "—") + " ~ " + maxDate)
      + statCard(lb.kept != null ? lb.kept : "—", "最新日批次收录", esc(lb.id || "—") + (lb.runs > 1 ? "（" + lb.runs + " 轮合并）" : ""))
      + "</div>";
    h += '<div class="note" style="margin:-10px 0 20px">口径：最新日批次扫描漏斗（' + esc(lb.id || "—") + " · " + esc(lb.time || "—") + "）：" + esc(funnel) + "；金额保留原文币种，未做汇率换算。</div>";

    // 近期变化 / 观察线索（标题级，不含摘要）
    h += '<div class="panel"><div class="panel-h"><h2>近期变化 · 观察线索</h2><span class="note">近 7 日有更新的活跃事件，按日期倒序</span><a class="more" href="#/events">事件库 →</a></div>'
      + '<div class="panel-b">' + (function () {
        var rows = EVX.filter(function (x) { return x.date >= d7; }).slice(0, 8);
        if (!rows.length) return '<div class="empty">近 7 日无事件更新</div>';
        return rows.map(function (x) {
          return '<div class="ev"><span class="pg">' + esc(x.date) + '</span><span>' + pill(x.ut === "进展" ? "进展" : "新增", x.ut === "进展" ? "blue" : "") + ' <a href="#/event/' + x.id + '"><b>' + esc(x.title) + "</b></a></span><span class='dim' style='margin-left:auto'>" + esc(x.stage || "") + (x.amt ? " · " + esc(x.amt) : "") + "</span></div>";
        }).join("");
      })() + "</div></div>";

    // 持续跟踪（活跃事件标题级）
    var active = EVX.filter(function (x) { return x.status === "活跃"; }).slice(0, 8);
    h += '<div class="panel"><div class="panel-h"><h2>持续跟踪</h2><span class="note">状态为活跃的事件：条件兑现、审批、交割、投产节点</span></div><div class="panel-b">'
      + (active.length ? active.map(function (x) {
        return '<div class="ev"><span class="pg">' + esc(x.date) + '</span><span><a href="#/event/' + x.id + '">' + esc(x.title) + "</a></span><span class='dim' style='margin-left:auto'>" + esc(x.mt || "") + " · " + esc(x.stage || "") + "</span></div>";
      }).join("") : '<div class="empty">当前无活跃事件</div>') + "</div></div>";

    // 本次更新带：按日批次展示（回溯补入单列）
    var todayB = null;
    for (var ti = 0; ti < BD.length; ti++) if (BD[ti].kind === "daily") { todayB = BD[ti]; break; }
    var bdDate = todayB ? todayB.day.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3") : "";
    var upd = { "新增": [], "进展": [], "重复": 0, "修正": 0 };
    EV.forEach(function (e) {
      (e.changelog || []).forEach(function (c) {
        var inWin = bdDate ? c.date === bdDate : c.date >= d7;
        if (upd[c.type] instanceof Array && inWin) upd[c.type].push({ e: e, c: c });
      });
    });
    h += '<div class="panel"><div class="panel-h"><h2>本次更新带</h2><span class="note">'
      + (todayB ? "日批次 " + esc(todayB.id) + "（" + esc(bdDate) + (todayB.runs > 1 ? "，" + todayB.runs + " 轮合并" : "") + "）；计数来自事件层 changelog"
                : "窗口 " + esc(d7 || "—") + " ~ " + esc(maxDate) + "；计数来自事件层 changelog") + '</span></div><div class="panel-b">'
      + '<div style="display:flex;gap:18px;flex-wrap:wrap;margin-bottom:10px">'
      + statCard(upd["新增"].length, "新增", "") + statCard(upd["进展"].length, "进展", "") + statCard(upd["重复"], "重复", "主键去重，不入库") + statCard(upd["修正"], "修正", "改记旧值留痕") + "</div>"
      + (upd["新增"].concat(upd["进展"]).slice(0, 10).map(function (u) {
        return '<div class="ev"><span class="pg">' + esc(u.c.date) + '</span><span>' + pill(u.c.type, u.c.type === "进展" ? "blue" : "") + ' <a href="#/event/' + u.e.event_id + '">' + esc(u.e.title_fact ? u.e.title_fact.text : "") + "</a></span></div>";
      }).join("") || '<div class="empty">该批次无新增 / 进展记录</div>') + "</div>";
    // 回溯补入单列
    var bf = BD.filter(function (g) { return g.kind === "backfill"; });
    if (bf.length) {
      h += '<div style="border-top:1px dashed var(--line);padding:12px 24px 16px"><div class="sec" style="border:none;padding:0 0 6px"><span class="sk">回溯补入（历史区间补采，不计入日批次口径）</span></div>'
        + bf.map(function (g) {
          return '<div class="ev"><span class="pg mono">' + esc(g.id) + '</span><span>' + esc((g.source || "回溯").slice(0, 30)) + '</span><span class="dim" style="margin-left:auto">扫 ' + g.scanned + " / 收 " + g.kept + " / 剔 " + g.excluded + "</span></div>";
        }).join("") + "</div>";
    }
    h += "</div>";

    // 入口
    h += '<div class="feedch"><h2>进入各库</h2></div><div class="cards4">'
      + '<a class="stat" style="text-decoration:none" href="#/events"><div class="n">' + EV.length + '</div><div class="c">事件库</div><div class="d">筛选 / 表格 / 时间线 / 港股名单</div></a>'
      + '<a class="stat" style="text-decoration:none" href="#/cos"><div class="n">' + unique(EVX.map(function (x) { return x.subject; })).length + '</div><div class="c">企业档案</div><div class="d">主体事件链与筛查记录</div></a>'
      + '<a class="stat" style="text-decoration:none" href="#/topics"><div class="n">3</div><div class="c">专题研究</div><div class="d">国家产业 / 供应链 / 政策</div></a>'
      + '<a class="stat" style="text-decoration:none" href="#/about"><div class="n">' + (DB.health || []).length + '</div><div class="c">方法与来源</div><div class="d">渠道健康 / 批次 / 导出</div></a>'
      + "</div>";
    // 其余三个分页面入口
    h += '<div class="feedch"><h2>其他分页面</h2><span class="note">数据文件与统计口径与本模块互不混用</span></div><div class="cards3">'
      + '<a class="stat" style="text-decoration:none" href="#/us"><div class="n">SEC</div><div class="c">美股</div><div class="d">EDGAR 全量 · 不分中外企</div></a>'
      + '<a class="stat" style="text-decoration:none" href="#/hk-market"><div class="n">HKEX</div><div class="c">港股</div><div class="d">披露易全量 · 不分中外企</div></a>'
      + '<a class="stat" style="text-decoration:none" href="#/export"><div class="n">BIS·OFAC</div><div class="c">出口管制</div><div class="d">执法 / 清单 / 规则 · 观察名单比对</div></a>'
      + "</div>";
    return h;
  }

  /* ═════════ 事件库：卡片 / 表格 / 时间线 / 港股名单，筛选入 URL ═════════ */
  var F = { q: "", ch: "全部", mt: "全部", stage: "全部", geo: "全部", ut: "全部", status: "全部", view: "cards", mode: "month" };
  function evFiltered() {
    var q = F.q.trim().toLowerCase();
    return EVX.filter(function (x) {
      if (F.ch !== "全部" && x.chans.indexOf(F.ch) < 0) return false;
      if (F.mt !== "全部" && x.mt !== F.mt) return false;
      if (F.stage !== "全部" && x.stage !== F.stage) return false;
      if (F.geo !== "全部" && (x.geo || "").indexOf(F.geo) < 0) return false;
      if (F.ut !== "全部" && x.ut !== F.ut) return false;
      if (F.status !== "全部" && x.status !== F.status) return false;
      if (q && (x.title + " " + x.subject + " " + (x.geo || "") + " " + x.id).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
  }
  function evSyncURL() {
    var p = [];
    if (F.view !== "cards") p.push("view=" + F.view);
    if (F.mode !== "month") p.push("mode=" + F.mode);
    ["q", "ch", "mt", "stage", "geo", "ut", "status"].forEach(function (k) { if (F[k] && F[k] !== "全部") p.push(k + "=" + encodeURIComponent(F[k])); });
    var h2 = "#/events" + (p.length ? "?" + p.join("&") : "");
    if (location.hash.split("?")[0] !== "#/events" || h2 !== location.hash) {
      history.replaceState(null, "", h2);
    }
  }
  function optList(arr, cur, counts) {
    // counts 提供时选项带计数（借鉴李成工作站列表页「北交所(57)」）；value 保持原值
    return arr.map(function (o) {
      var c = counts && o !== "全部" ? "（" + (counts[o] || 0) + "）" : "";
      return '<option value="' + esc(o) + '"' + (o === cur ? " selected" : "") + ">" + esc(o) + c + "</option>";
    }).join("");
  }
  function countBy(fn) { var m = {}; EVX.forEach(function (x) { var k = fn(x); if (k) m[k] = (m[k] || 0) + 1; }); return m; }
  function vEvents() {
    var h = '<div class="ph"><h1>事件库</h1><span class="sub">本页回答：最近有哪些出海实质动作，按渠道/类型/阶段/国家/更新类型/状态筛选</span>'
      + '<span class="right">' + pill("合并自：信息流 / 披露总表 / 港股跟踪 / 项目·生命周期·日历", "") + "</span></div>";
    h += '<div class="panel"><div class="filterbar">'
      + '<input class="finput" id="evq" placeholder="搜索主体 / 事件 / 国家…" value="' + esc(F.q) + '"/>'
      + '<select class="fsel" id="evch">' + optList(["全部", "A股·巨潮", "港股·披露易", "美股·EDGAR"], F.ch, (function () { var m = {}; EVX.forEach(function (x) { x.chans.forEach(function (c) { m[c] = (m[c] || 0) + 1; }); }); return m; })()) + "</select>"
      + '<select class="fsel" id="evmt">' + optList(["全部", "设厂", "并购", "合资", "销售", "融资", "退出", "诉讼", "监管"], F.mt, countBy(function (x) { return x.mt; })) + "</select>"
      + '<select class="fsel" id="evstage">' + optList(unique(["全部"].concat(EV.map(function (e) { return e.stage_current; }))), F.stage, countBy(function (x) { return x.stage; })) + "</select>"
      + '<select class="fsel" id="evgeo">' + optList(["全部"].concat(unique(EVX.map(function (x) { return x.geo; })).slice(0, 40)), F.geo) + "</select>"
      + '<select class="fsel" id="evut">' + optList(["全部", "新增", "进展", "修正"], F.ut, countBy(function (x) { return x.ut; })) + "</select>"
      + '<select class="fsel" id="evst">' + optList(["全部", "活跃", "完成", "终止"], F.status, countBy(function (x) { return x.status; })) + "</select>"
      + '<button class="btn" id="evreset">清空</button>'
      + '<span class="note" id="evcount" style="margin-left:auto"></span></div>';
    h += '<div class="subnav wrap" style="padding:8px 24px 0;border-bottom:1px solid var(--line)">'
      + [["cards", "卡片"], ["table", "表格"], ["timeline", "时间线"], ["hk", "港股名单"]].map(function (x) {
        return '<a href="javascript:;" data-evview="' + x[0] + '"' + (F.view === x[0] ? ' class="on"' : "") + ">" + x[1] + "</a>";
      }).join("")
      + (F.view === "timeline" ? '<span style="margin-left:auto;display:flex;gap:2px">'
        + [["month", "按月"], ["stage", "按阶段"]].map(function (x) {
          return '<a href="javascript:;" data-evmode="' + x[0] + '"' + (F.mode === x[0] ? ' class="on"' : "") + ">" + x[1] + "</a>";
        }).join("") + "</span>" : "")
      + "</div>";
    h += '<div class="panel-b" id="evrows"></div></div>';
    return h;
  }
  function evRows() {
    var rows = evFiltered();
    var cnt = $("evcount"); if (cnt) cnt.textContent = "显示 " + rows.length + " / " + EVX.length;
    var box = $("evrows"); if (!box) return;
    if (F.view === "table") {
      box.innerHTML = '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>日期</th><th>事件</th><th>主体</th><th>类型</th><th>阶段</th><th>金额/规模</th><th>状态</th><th>渠道</th><th>更新</th></tr></thead><tbody>'
        + rows.map(function (x) {
          return '<tr class="click" data-href="#/event/' + x.id + '"><td class="mono">' + esc(x.date) + '</td>'
            + '<td><b>' + esc(x.title) + "</b></td><td>" + esc(shortCo(x.subject)) + "</td>"
            + '<td>' + pill(x.mt || "—") + '</td><td>' + esc(x.stage || "—") + '</td>'
            + '<td class="money">' + esc(x.amt || "—") + '</td><td>' + esc(x.status) + '</td>'
            + '<td>' + x.chans.map(function (c) { return (CH_META[c] ? '<span class="chtag ' + CH_META[c].cls + '">' + CH_META[c].short + "</span>" : esc(c)); }).join(" ") + "</td>"
            + '<td>' + pill(x.ut, x.ut === "进展" ? "blue" : "") + "</td></tr>";
        }).join("") + "</tbody></table></div>";
      box.querySelectorAll("tr.click").forEach(function (tr) { tr.addEventListener("click", function () { location.hash = tr.getAttribute("data-href"); }); });
      return;
    }
    if (F.view === "timeline") {
      var groups = {}, order = [];
      rows.forEach(function (x) {
        var g = F.mode === "stage" ? (x.stage || "未定") : (x.date || "").slice(0, 7) || "未定";
        if (!groups[g]) { groups[g] = []; order.push(g); }
        groups[g].push(x);
      });
      order.sort(function (a, b) { return F.mode === "stage" ? a.localeCompare(b, "zh") : (a < b ? 1 : -1); });
      box.innerHTML = order.map(function (g) {
        return '<div class="feedch" style="margin:16px 0 6px"><h2 style="font-size:15px">' + esc(g) + '</h2><span class="note">' + groups[g].length + " 件</span></div>"
          + groups[g].map(function (x) {
            return '<div class="ev"><span class="pg">' + esc(x.date) + '</span><span>' + pill(x.mt || "—") + ' <a href="#/event/' + x.id + '">' + esc(x.title) + "</a></span><span class='dim' style='margin-left:auto'>" + esc(x.stage || "") + (x.amt ? " · " + esc(x.amt) : "") + "</span></div>";
          }).join("");
      }).join("") || '<div class="empty">无匹配事件</div>';
      return;
    }
    if (F.view === "hk") {
      var watch = (DB.watch && DB.watch.hk) || [];
      var hkDocs = D.filter(function (r) { return chOf(r) === "港股·披露易"; });
      var byCode = {};
      hkDocs.forEach(function (r) { var c = (r["股票代码"] || "").replace(/\.HK$/i, ""); (byCode[c] = byCode[c] || []).push(r); });
      box.innerHTML = '<div class="feedch" style="margin:6px 0 6px"><h2 style="font-size:15px">观察名单（' + watch.length + ' 家，含 A+H）</h2><span class="note">按代码经披露易公开接口拉取，NEWS_ID 去重；无新披露的公司如实留白</span></div>'
        + '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>代码</th><th>公司</th><th>收录</th><th>最新披露</th><th>最近事项</th></tr></thead><tbody>'
        + watch.map(function (w) {
          var docs = byCode[w.code] || [];
          var last = docs[0];
          return "<tr><td class='mono'>" + esc(w.code) + "</td><td><b>" + esc(w.name) + "</b>" + (w.ah ? ' <span class="tag">A+H</span>' : "") + "</td>"
            + "<td class='mono'>" + (docs.length || "—") + "</td><td class='mono'>" + (last ? esc(last["披露日期与时间"]) : "—") + "</td>"
            + "<td style='font-size:12.5px'>" + (last ? esc(last["公告标题"].slice(0, 40)) : "—") + "</td></tr>";
        }).join("") + "</tbody></table></div>"
        + '<div class="secnote">数值仅统计已入库条目；接口对长期停牌证券不返回结果。收录的港股披露如下（点击进事件详情）：</div>'
        + hkDocs.map(function (r) {
          var ev = EDOC[r._aid];
          return '<div class="ev"><span class="pg">' + esc(r["披露日期与时间"]) + '</span><span>' + chTag(r) + " <b>" + esc(shortCo(r["公司全称"])) + "</b> " + esc(r["公告标题"].slice(0, 44)) + (ev ? ' → <a href="#/event/' + ev.event_id + '">' + esc(ev.event_id) + "</a>" : "") + "</span></div>";
        }).join("");
      return;
    }
    // 卡片视图：title_fact + 阶段 + 金额 + 日期（无摘要）
    box.innerHTML = rows.map(function (x) {
      return '<a class="fcard" href="#/event/' + x.id + '"><div class="fc-top">' + pill(x.mt || "—", "solid") + pill("阶段：" + (x.stage || "—"), "blue") + pill(x.status) + pill(x.ut, x.ut === "进展" ? "blue" : "") + x.chans.map(function (c) { return CH_META[c] ? '<span class="chtag ' + CH_META[c].cls + '">' + CH_META[c].short + "</span>" : ""; }).join("") + "</div>"
        + '<div class="fc-title">' + esc(x.title) + (x.amt ? ' <span class="amt">' + esc(x.amt) + "</span>" : "") + "</div>"
        + '<div class="fc-meta"><span>' + esc(x.date) + '</span><span>' + esc(shortCo(x.subject)) + '</span><span>' + esc(x.geo || "") + "</span>" + favBtn("event", x.id) + "</div></a>";
    }).join("") || '<div class="empty">无匹配事件</div>';
  }
  function bindEvents() {
    $("evq").addEventListener("input", function (e) { F.q = e.target.value; evSyncURL(); evRows(); });
    [["evch", "ch"], ["evmt", "mt"], ["evstage", "stage"], ["evgeo", "geo"], ["evut", "ut"], ["evst", "status"]].forEach(function (x) {
      $(x[0]).addEventListener("change", function (e) { F[x[1]] = e.target.value; evSyncURL(); evRows(); });
    });
    $("evreset").addEventListener("click", function () {
      F = { q: "", ch: "全部", mt: "全部", stage: "全部", geo: "全部", ut: "全部", status: "全部", view: F.view, mode: F.mode };
      view.innerHTML = vEvents(); bindEvents(); evRows(); evSyncURL();
    });
    document.querySelectorAll("[data-evview]").forEach(function (a) {
      a.addEventListener("click", function () { F.view = a.getAttribute("data-evview"); view.innerHTML = vEvents(); bindEvents(); evRows(); evSyncURL(); });
    });
    document.querySelectorAll("[data-evmode]").forEach(function (a) {
      a.addEventListener("click", function () { F.mode = a.getAttribute("data-evmode"); view.innerHTML = vEvents(); bindEvents(); evRows(); evSyncURL(); });
    });
  }

  /* ═════════ 事件详情：一事件一记录，摘要全文只在此页出现 ═════════ */
  function anaBlock(arr, emptyText) {
    if (!arr || !arr.length) return '<div class="na">【未披露】' + (emptyText ? " · " + esc(emptyText) : "") + "</div>";
    return arr.map(function (a) {
      return '<div class="sec"><span class="sk">' + layerBadge(a.layer) + (a.basis ? ' <span class="dim">' + esc(a.basis) + "</span>" : "") + "</span>" + esc(a.text) + "</div>";
    }).join("");
  }
  function vEvent(id) {
    var e = evById(id);
    if (!e) return '<div class="panel"><div class="empty">事件不存在</div></div>';
    var latest = e.sources[e.sources.length - 1];
    var h = '<div class="ph"><span class="phl">事件详情</span><span class="sub">本页回答：这件事的事实、规模、条件、风险与证据分别是什么，哪些还没披露</span></div>';
    h += '<div class="panel dhead"><div class="crumbs"><a href="#/events">事件库</a> / ' + esc(e.event_id) + "</div>"
      + "<h1>" + esc(e.title_fact ? e.title_fact.text : e.event_id) + "</h1>"
      + '<div class="dtags">'
      + (e.matter_type ? pill(e.matter_type.value, "solid") : pill("类型未归类"))
      + pill("阶段：" + (e.stage_current || "unknown"), "blue")
      + pill(e.status) + pill("更新：" + e.update_type_latest, e.update_type_latest === "进展" ? "blue" : "")
      + (e.geo && e.geo.text ? pill(e.geo.text) : "") + favBtn("event", e.event_id) + "</div>"
      + '<div style="margin-top:8px;font-size:12.5px;display:flex;gap:16px;flex-wrap:wrap">'
      + '<span class="dim">更新日期 ' + esc((e.changelog && e.changelog.length ? e.changelog[e.changelog.length - 1].date : (latest ? latest.date : "—"))) + "</span>"
      + (latest ? '<a href="' + esc(latest.url) + '" target="_blank" rel="noopener">查看原文（' + esc(latest.channel || "") + " " + esc(latest.date) + "）↗</a>" : "")
      + "</div>"
      + '<div class="note" style="margin-top:10px">' + layerBadge(e.title_fact ? e.title_fact.layer : "analysis")
      + (e.title_fact && e.title_fact.basis ? " 依据：" + esc(e.title_fact.basis) : "") + "</div></div>";

    var main = '<div class="panel">' + '<div class="sech"><span class="sno">①</span><h2>阶段链</h2></div><div class="tl">'
      + e.stage_chain.map(function (c) {
        var doc = null;
        for (var i = 0; i < e.sources.length; i++) if (e.sources[i].doc_id === c.doc_id) doc = e.sources[i];
        return '<div class="tl-item"><div class="tld">' + esc(c.date) + "<br/>" + pill(c.stage || "—", "blue") + '</div><div class="tlt">'
          + (doc ? '<a href="' + esc(doc.url) + '" target="_blank" rel="noopener">' + esc((doc.file || "").slice(0, 52)) + " ↗</a>" : esc(c.doc_id))
          + '<br/><span class="dim" style="font-size:12px">' + esc(c.note || "") + " " + layerBadge(c.layer || "disclosed") + "</span></div></div>";
      }).join("") + "</div></div>";

    main += '<div class="panel"><div class="sech"><span class="sno">②</span><h2>主体、规模与关键条件</h2></div><div class="kv">'
      + '<div class="dl"><span class="k">主体及关系</span><span class="v">' + e.parties.map(function (p) { return esc(p.name) + "（" + esc(p.role) + "）"; }).join("；") + "</span></div>"
      + '<div class="dl"><span class="k">国家 / 地区</span><span class="v">' + na(e.geo && e.geo.text) + "</span></div>"
      + '<div class="dl"><span class="k">事项类型</span><span class="v">' + (e.matter_type ? esc(e.matter_type.value) + " " + layerBadge("analysis") : '<span class="na">【未披露】</span>') + "</span></div>"
      + '<div class="dl"><span class="k">金额 / 规模</span><span class="v">' + na(e.scale && e.scale.text) + (e.scale ? " " + layerBadge("disclosed") : "") + "</span></div>"
      + '<div class="dl"><span class="k">最新披露</span><span class="v">' + (latest ? esc(latest.date) + " · " + esc(latest.file) : "—") + "</span></div></div>"
      + '<div style="padding:4px 24px 16px"><div class="sec"><span class="sk">关键条件（审批 / 先决条件 / 义务 / 时间节点）</span>'
      + (e.terms ? e.terms.map(function (t) { return '<div style="padding:3px 0">' + layerBadge(t.layer) + " " + esc(t.text) + (t.basis ? ' <span class="dim">（' + esc(t.basis) + "）</span>" : "") + "</div>"; }).join("") : '<span class="na">【未披露】</span>') + "</div></div></div>";

    main += '<div class="panel"><div class="sech"><span class="sno">③</span><h2>影响、风险与跟踪点</h2></div><div style="padding:4px 24px 16px">'
      + '<div class="sec"><span class="sk">后续跟踪点（analysis）</span></div>' + anaBlock(e.watch_points, "入库分析未标注跟踪点")
      + '<div class="sec"><span class="sk">信息缺口（原文未披露）</span></div>' + anaBlock(e.gaps, "无记录")
      + "</div></div>";

    main += '<div class="panel"><div class="sech"><span class="sno">④</span><h2>法律合规触发点</h2><span class="note">仅列实际触发事项，非模板清单</span></div>'
      + '<div style="padding:4px 24px 16px">' + anaBlock(e.legal_triggers, "入库分析未识别到具体触发点；不代表无合规义务") + "</div></div>";

    main += '<div class="panel"><div class="sech"><span class="sno">⑤</span><h2>商务与财务视角</h2></div><div style="padding:4px 24px 16px">'
      + anaBlock(e.practice_notes, "入库分析未填写") + "</div></div>";

    main += '<div class="panel"><div class="sech"><span class="sno">⑥</span><h2>来源与口径</h2><span class="note">' + e.sources.length + " 份披露文件</span></div>"
      + '<div class="evlist">' + e.sources.map(function (s) {
        return '<div class="ev"><span class="pg">' + esc(s.date) + '</span><span class="qt">'
          + chTag({ "渠道": s.channel }) + " <b>" + esc(s.file) + '</b><br/><a href="' + esc(s.url) + '" target="_blank" rel="noopener">原文 ↗</a>'
          + (s.quotes || []).map(function (q) {
            return '<div class="evi"><div class="qt">「' + esc(q.text) + '」</div><div class="ops"><a href="' + esc(s.url) + "#page=" + (q.page || 1) + '" target="_blank" rel="noopener">定位 P' + (q.page || "?") + " ↗</a><button data-copy='" + esc(q.text) + "'>复制引文</button></div></div>";
          }).join("") + "</span></div>";
      }).join("") + "</div>"
      + (e.source_diff ? '<div class="secnote" style="border-top:1px solid var(--line)">跨来源口径差异 ' + layerBadge(e.source_diff.layer) + "：" + esc(e.source_diff.text) + (e.source_diff.basis ? '（依据：' + esc(e.source_diff.basis) + "）" : "") + "</div>" : "")
      + "</div>";

    main += '<div class="panel"><div class="sech"><span class="sno">⑦</span><h2>更新记录</h2></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>日期</th><th>类型</th><th>来源文件</th><th>说明</th></tr></thead><tbody>'
      + e.changelog.map(function (c) {
        return '<tr><td class="mono">' + esc(c.date) + '</td><td>' + pill(c.type, c.type === "进展" ? "blue" : c.type === "修正" ? "warn" : "") + '</td>'
          + '<td style="font-size:12px">' + esc(c.doc_id) + '</td><td style="font-size:12.5px">' + esc(c.note || "") + "</td></tr>";
      }).join("") + "</tbody></table></div></div>";

    var rail = '<div class="rail">'
      + '<div class="panel"><div class="rail-h">关联</div><div style="padding:8px 18px 14px;font-size:13px">'
      + '<div style="padding:3px 0"><a href="#/company/' + encodeURIComponent(e.parties[0].name) + '">主体档案 →</a></div>'
      + '<div style="padding:3px 0"><a href="#/events">事件库 →</a></div>'
      + "</div></div>"
      + '<div class="panel"><div class="rail-h">个人备注（本机保存）</div><div style="padding:8px 18px 16px">'
      + '<textarea id="pnote" data-note="' + esc(e.event_id) + '" style="width:100%;min-height:80px;border:1px solid var(--line-2);border-radius:8px;padding:8px 10px;font-size:13px;font-family:inherit" placeholder="记录核验结论、待办或质疑…">' + esc(ANN.notes[e.event_id] || "") + "</textarea></div></div>"
      + "</div>";
    return h + '<div class="split"><div>' + main + "</div>" + rail + "</div>";
  }

  /* ═════════ 法律议题库（占位 → R06） ═════════ */
  function vIssues() {
    return '<div class="ph"><h1>法律议题库</h1><span class="sub">本页回答：跨事件的法律议题（投资审查/出口管制/制裁/数据/IP/劳动/税务）有哪些，各事件如何落入议题</span></div>'
      + '<div class="panel"><div class="panel-b" style="padding:34px 24px;text-align:center">'
      + '<div style="font-size:15px;font-weight:700;margin-bottom:8px">R06 上线</div>'
      + '<div class="note" style="max-width:560px;margin:0 auto;line-height:1.9">本库将由事件层 legal_triggers 字段按议题维度聚合（投资审查、出口管制、制裁、数据、知识产权、劳动、税务），<br/>并展示议题 → 事件 → 原文证据的落入路径。当前合规触发点已在各事件详情页可查。</div>'
      + '<div style="margin-top:16px"><a class="btn primary" href="#/events">先去事件库查看合规触发点</a></div></div></div>';
  }

  /* ═════════ 项目看板（占位 → R07） ═════════ */
  function vBoard() {
    return '<div class="ph"><h1>项目看板</h1><span class="sub">本页回答：各项目推进到哪个阶段、卡在什么条件、下一步节点是什么</span></div>'
      + '<div class="panel"><div class="panel-b" style="padding:34px 24px;text-align:center">'
      + '<div style="font-size:15px;font-weight:700;margin-bottom:8px">R07 上线</div>'
      + '<div class="note" style="max-width:560px;margin:0 auto;line-height:1.9">看板将按项目聚合事件链，呈现阶段进度、关键条件兑现状态与待跟踪节点。<br/>项目维度信息暂请在事件库时间线视图（按阶段分组）查看。</div>'
      + '<div style="margin-top:16px"><a class="btn primary" href="#/events?view=timeline&mode=stage">按阶段看时间线</a></div></div></div>';
  }

  /* ═════════ 美股（SEC）/ 港股（HKEX）骨架页：全量口径，采集未上线如实留白 ═════════ */
  var MKT_CATS = ["交易类", "融资类", "运营", "法律（诉讼/监管处罚）", "对外投资", "经营战略重大事项"];
  // 栏目 → 源表单/类别映射（口径设计说明，依据标杆调研；采集上线后生效，非数据）
  var MKT_MAP = {
    us: {
      "交易类": "8-K Item 1.01/1.02/2.01（签订/终止重大协议、完成收购处置）；6-K 交易公告",
      "融资类": "8-K Item 2.03/3.02（直接财务义务/未注册增发）、424B 定价文件、Form D 私募",
      "运营": "8-K Item 2.02/7.01/8.01（业绩/Reg FD/其他）、6-K 经营类公告",
      "法律（诉讼/监管处罚）": "8-K Item 8.01 披露的诉讼与监管行动、10-K/20-F Legal Proceedings 章节",
      "对外投资": "8-K Item 1.01/2.01 中的境外投资安排、6-K 对外投资公告",
      "经营战略重大事项": "8-K Item 3.01（退市/转板）/4.01/4.02（审计师变更/财报不可依赖）/5.01/5.02（控制权/董监高）",
      "_note": "双轨口径：8-K 按 Item 免解析分类；6-K（外国私人发行人，含中概股）无 Item 编号，只能正文/附件分析分类，分类结果标 layer=analysis，两类不混算「重大事项数」。依据：SEC Form 8-K（SEC 873 02-25 版）Item 表与 EDGAR 实测。"
    },
    hk: {
      "交易类": "須予公布的交易（标题类别 t2G=6）、關連交易（t2G=1）",
      "融资类": "證券股本（t2G=8，含配售/供股/可转债）、債券及結構性產品（t1=70000）",
      "运营": "海外監管公告-營運業績（t2=19860）、自願公告中的经营数据",
      "法律（诉讼/监管处罚）": "監管者發出的公告（t1=90000）、诉讼/仲裁类公告及通告",
      "对外投资": "須予公布的交易中的境外收购/合资、海外監管公告-業務發展（t2=19820）",
      "经营战略重大事项": "公司狀況變動（t2G=2）、重組股權變動（t2G=7）、於海外交易所上市（t2=17550）",
      "_note": "分类依据披露易标题类别三级体系（t1/t2G/t2，共 293 个明细码），原始类别码保留为 raw_category 供溯源；中英文公告为独立 NEWS_ID，不以后缀互推。依据：HKEXnews titleSearchServlet 实测。"
    }
  };
  function vMarket(mod) {
    var isUS = mod === "us";
    var name = isUS ? "美股（SEC）" : "港股（HKEX）";
    var src = isUS ? "SEC EDGAR" : "HKEX 披露易";
    var ch = isUS ? "美股·EDGAR" : "港股·披露易";
    // 「出海信批归纳」模块内该渠道的存量（中企口径），仅作指引，不并入本页统计
    var n = D.filter(function (r) { return chOf(r) === ch; }).length;
    var h = '<div class="ph"><h1>' + name + '</h1><span class="sub">本页回答：' + src + " 全量披露中，最近有哪些交易、融资、运营、法律与战略重大事项</span></div>";
    h += '<div class="panel"><div class="panel-h"><h2>口径说明</h2></div><div class="panel-b" style="line-height:1.9;font-size:13px">'
      + "本页口径：<b>" + src + " 全量披露，不分中企外企</b>；事项分六类：" + MKT_CATS.join("、") + "。"
      + "本页与「出海信批归纳」（仅中企）及其他分页面的数据文件、统计口径<b>互不混用</b>。</div></div>";
    h += '<div class="panel"><div class="panel-b" style="padding:34px 24px;text-align:center">'
      + '<div style="font-size:15px;font-weight:700;margin-bottom:8px">数据采集尚未上线</div>'
      + '<div class="note" style="max-width:560px;margin:0 auto;line-height:1.9">' + src + " 全量采集（不分中外企）尚未接入，本页暂无任何数据，不展示推测或占位内容。<br/>"
      + "中企出海相关的" + (isUS ? "美股" : "港股") + "披露已收录于「出海信批归纳」模块（当前 " + n + " 条，中企口径，与本页全量口径不混用）。</div>"
      + '<div style="margin-top:16px"><a class="btn primary" href="#/events?ch=' + encodeURIComponent(ch) + '">去「出海信批归纳」查看' + (isUS ? "美股" : "港股") + "披露</a></div></div></div>";
    h += '<div class="feedch"><h2>栏目（上线后按此六类组织）</h2><span class="note">栏目 → 源表单/类别映射为口径设计说明，采集上线后生效</span></div><div class="cards3">'
      + MKT_CATS.map(function (c) {
        return '<div class="stat"><div class="n" style="font-size:15px">' + esc(c) + '</div><div class="d" style="color:var(--ink-3)">数据采集尚未上线</div>'
          + '<div class="d" style="color:var(--ink-3);margin-top:4px;line-height:1.6">' + esc(MKT_MAP[mod][c]) + "</div></div>";
      }).join("") + "</div>"
      + '<div class="note" style="margin-top:-8px;margin-bottom:20px">' + esc(MKT_MAP[mod]._note) + "</div>";
    // 采集设计：实测来源（外部事实，依据 2026-10-23 标杆调研实测，见 REF_us / REF_hk）
    var SRC_DESIGN = {
      us: [
        ["efts.sec.gov 全文检索 API", "按 forms=8-K 过滤＋关键词检索；size 固定 100 条/页、from 翻页、from+size>10000 报错；sort=date 实测不生效——须本地排序"],
        ["data.sec.gov/submissions/CIK##########.json", "公司全量申报历史；8-K 的 items 字段（如 \"1.01,9.01\"）免正文解析即可分栏目；6-K 无 Item 编号须正文/附件分析"],
        ["daily-index/master.YYYYMMDD.idx", "每日全量申报索引（CIK|公司|表格|日期|路径），当晚约 22:00 ET 后发布，当日缺失返回 403"],
        ["访问纪律", "User-Agent 必填（缺失即 403）；当前上限 10 次/秒（SEC 官方 Accessing EDGAR Data 页）"]
      ],
      hk: [
        ["titleSearchServlet 标题检索", "t1/t2G/t2 三级类别码共 293 个明细码；NEWS_ID 主键去重；仅返回交易活跃证券，长期停牌标的不返回"],
        ["全文核读", "标题检索无正文，实质判断须逐份下载 PDF 核读；中英文公告为独立 NEWS_ID"],
        ["访问纪律", "公开接口无需密钥；按代码逐个拉取并限速"]
      ]
    };
    h += '<div class="panel"><div class="panel-h"><h2>采集设计 · 实测来源</h2><span class="note">外部事实 · 依据 2026-10-23 标杆调研对官方接口的实测</span></div>'
      + '<div class="tbl-wrap"><table class="tbl"><thead><tr><th style="width:280px">来源 / 接口</th><th>实测要点（决定口径与字段）</th></tr></thead><tbody>'
      + SRC_DESIGN[mod].map(function (r) { return '<tr><td class="mono" style="font-size:12px">' + esc(r[0]) + '</td><td style="font-size:12.5px">' + esc(r[1]) + "</td></tr>"; }).join("")
      + "</tbody></table></div></div>";
    return h;
  }

  /* ═════════ 出口管制：执法案例 / 清单 / 规则 三栏目 + 观察名单比对（原 SDN 筛查并入） ═════════ */
  var EXC = { col: "enforcement" };
  var EX_COLS = [["enforcement", "执法案例更新"], ["lists", "清单更新"], ["rules", "规则更新"], ["watch", "观察名单比对"]];
  function vExport() {
    var h = '<div class="ph"><h1>出口管制</h1><span class="sub">本页回答：BIS / OFAC / UFLPA 最近有哪些执法案例、清单与规则更新；观察名单主体与制裁名单比对是否有命中</span></div>';
    h += '<div class="panel"><div class="panel-h"><h2>口径说明</h2></div><div class="panel-b" style="line-height:1.9;font-size:13px">'
      + "来源：美国 BIS（出口管制执法与实体清单）、OFAC（制裁名单与执法）、UFLPA 相关公开文件；分「执法案例更新 / 清单更新 / 规则更新」三栏目。"
      + "原 SDN 筛查并入本页为「观察名单比对」子视图：<b>同名≠命中</b>，仅名称相同而无地址/证件/国籍等佐证时只记「名称相似」。"
      + "本页与其他分页面的数据文件、统计口径<b>互不混用</b>。</div></div>";
    h += '<div class="subnav wrap" style="padding:0;margin-bottom:16px">'
      + EX_COLS.map(function (x) {
        return '<a href="javascript:;" data-exc="' + x[0] + '"' + (EXC.col === x[0] ? ' class="on"' : "") + ">" + x[1] + "</a>";
      }).join("") + "</div><div id=\"exbody\"></div>";
    return h;
  }
  function exBody() {
    var box = $("exbody"); if (!box) return;
    if (EXC.col !== "watch") {
      var nm = { enforcement: "执法案例更新", lists: "清单更新", rules: "规则更新" }[EXC.col];
      var src = { enforcement: "BIS 执法行动 / OFAC 执法案例 / UFLPA 执法", lists: "实体清单 / SDN / 未经核实清单 / UFLPA 实体清单", rules: "EAR 规则修订 / OFAC 法规与通用许可 / UFLPA 指引" }[EXC.col];
      var plan = {
        enforcement: "采集设计：OFAC recent-actions/enforcement-actions 列表与和解详情（金额/违规笔数/VSD/egregious）＋ BIS bis.gov/enforcement 和解文书与新闻稿；案例级字段含 statutory max / base penalty / 加重与减轻因素，缺失照【未披露】。",
        lists: "采集设计：trade.gov 合并筛查清单（CSL，13 个清单）快照 diff 产生 added/removed/revised；Federal Register API 取 BIS 实体清单规则与 UFLPA 列入通知回填依据；removed 条目保留历史卡片。注意：CSL 官方 API 只含当前在列条目，历史须靠本站自启动日起累积快照；且 UFLPA 实体清单不在 CSL 内（归国土安全部单列），须单独来源，不能仅靠 CSL 覆盖本页全部清单（2026-10-23 实测）。",
        rules: "采集设计：Federal Register API（免费无 key）按机构 industry-and-security-bureau（id=241，实测含 \"Entity List\" 的 RULE 全历史 679 条）＋ 类型 RULE/PRORULE 增量；term 全文匹配有噪声，须经标题二次过滤；批次号 W-YYYYWW（周批）。"
      }[EXC.col];
      box.innerHTML = '<div class="panel"><div class="panel-b" style="padding:34px 24px;text-align:center">'
        + '<div style="font-size:15px;font-weight:700;margin-bottom:8px">' + nm + " · 数据采集尚未上线</div>"
        + '<div class="note" style="max-width:560px;margin:0 auto;line-height:1.9">覆盖范围：' + src + "。<br/>该栏目采集尚未接入，本栏暂无任何数据，不展示推测或占位内容。</div>"
        + '<div class="note" style="max-width:620px;margin:14px auto 0;line-height:1.9;text-align:left;border-top:1px dashed var(--line);padding-top:12px">' + plan + "</div></div></div>";
      return;
    }
    // 观察名单比对（真实数据：监测批次中的 OFAC·SDN 比对记录；按日批次聚合展示，逐轮原始记录见方法与来源）
    var BD2 = DB.batches_daily || [];
    var sdnD = BD2.filter(function (g) { return g.per_source && g.per_source["OFAC·SDN"]; });
    var sdnB = B.filter(function (b) { return b.per_source && b.per_source["OFAC·SDN"]; });
    var subjects = unique(EVX.map(function (x) { return x.subject; }));
    var watchN = ((DB.watch && DB.watch.hk) || []).length + ((DB.watch && DB.watch.us) || []).length;
    var hits = (sdnD.length ? sdnD : sdnB).reduce(function (a, b) { return a + (b.per_source["OFAC·SDN"].kept || 0); }, 0);
    // 名单版本指纹与名单变化：从逐轮批次说明中提取（外部事实，依据批次记录原文）
    var sha = null, chg = null;
    for (var bi = 0; bi < sdnB.length; bi++) {
      var nt = sdnB[bi].note || "";
      if (!sha) { var m = nt.match(/sha[=（(]?([0-9a-f]{4,})[…\.]{1,3}([0-9a-f]{4,})/i); if (m) sha = m[1] + "…" + m[2]; }
      if (!chg) { var c = nt.match(/SDN[^；。]*?变化[^；。]*?(新增\s*\d+\s*条[^；。]*)/); if (c) chg = { batch: sdnB[bi].id, text: c[1] }; }
    }
    var latestSdn = sdnD.length ? sdnD[0] : sdnB[0];
    box.innerHTML = '<div class="statstrip">'
      + statCard(sdnB.length ? sdnB[0].per_source["OFAC·SDN"].scanned : "—", "名单条目（单轮全量）", "OFAC SDN · 最近轮次 " + (sdnB[0] ? esc(sdnB[0].id) : "—"))
      + statCard(sha ? esc(sha) : "—", "名单版本指纹 sha", "逐轮下载比对，变化即记录")
      + statCard(subjects.length + watchN, "受检主体", "事件主体 " + subjects.length + " + 观察名单 " + watchN)
      + statCard(hits, "命中（近 " + (sdnD.length || sdnB.length) + " 批）", "kept=0 即无疑似命中记录")
      + "</div>"
      + (chg ? '<div class="panel"><div class="panel-b" style="font-size:13px;line-height:1.8"><span class="st manual">名单变化</span> '
        + esc(chg.batch) + "：" + esc(chg.text) + "（名单侧新增条目均经受检主体比对，0 命中；样本详见该批次说明）</div></div>" : "")
      + '<div class="panel"><div class="panel-h"><h2>比对方法</h2></div><div class="panel-b" style="line-height:1.9;font-size:13px">'
      + "OFAC SDN 全量名单与在册公司 / 合作方<b>词级匹配</b>，随监测日批次比对。"
      + "<b>同名≠命中</b>：仅名称相同而无地址 / 证件号 / 国籍等佐证时只记「名称相似 · 待人工核验」，不写「命中」。"
      + "比对不产生披露条目；命中将记入异常记录并在相关主体档案标注。</div></div>"
      + '<div class="panel"><div class="panel-h"><h2>各日比对记录</h2><span class="note">按日批次 D-YYYYMMDD 聚合；同一日多轮合并（扫=各轮累加）</span></div>'
      + '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>日批次</th><th>时间</th><th>轮次</th><th>比对条目</th><th>命中</th></tr></thead><tbody>'
      + (sdnD.length ? sdnD : sdnB).map(function (g) {
        var p = g.per_source["OFAC·SDN"];
        return '<tr><td class="mono">' + esc(g.id) + '</td><td class="mono">' + esc(g.time) + '</td><td class="mono">' + (g.runs || 1) + '</td><td class="mono">' + p.scanned + '</td><td class="mono">' + (p.kept || 0) + "</td></tr>";
      }).join("") + "</tbody></table></div>"
      + '<div class="secnote">逐轮原始记录（B-YYYYMMDD-HHMM）见「方法与来源 → 更新记录」。</div></div>';
  }

  /* ═════════ 企业档案：只列事件链条目，不复制摘要 ═════════ */
  function companyEvents(name) {
    return EVX.filter(function (x) { return x.subject === name; }).sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  }
  function vCos() {
    var names = unique(EVX.map(function (x) { return x.subject; }));
    var h = '<div class="ph"><h1>企业档案</h1><span class="sub">本页回答：哪些主体有出海动作、各自的事件链进展到哪</span></div>';
    h += '<div class="panel"><div class="filterbar"><input class="finput" id="coq" placeholder="搜索主体名称…"/><span class="note" style="margin-left:auto">共 ' + names.length + " 个主体</span></div>";
    h += '<div class="panel-b" id="corows"></div></div>';
    return h;
  }
  function cosRows(q) {
    var box = $("corows"); if (!box) return;
    q = (q || "").trim();
    var names = unique(EVX.map(function (x) { return x.subject; })).filter(function (n) { return !q || n.indexOf(q) >= 0; });
    box.innerHTML = '<div class="projgrid">' + names.map(function (n) {
      var evs = companyEvents(n);
      var geos = unique(evs.map(function (x) { return x.geo; })).filter(Boolean).slice(0, 3);
      var mts = unique(evs.map(function (x) { return x.mt; })).filter(Boolean);
      return '<div class="projcard"><div class="pj-n"><a href="#/company/' + encodeURIComponent(n) + '">' + esc(shortCo(n)) + "</a></div>"
        + '<div class="pj-m">' + evs.length + " 事件 · 最新 " + esc(evs[0] ? evs[0].date : "—") + " · " + geos.map(function (g) { return esc(g); }).join("、") + "</div>"
        + '<div style="font-size:11.5px;margin-bottom:8px">' + mts.map(function (m) { return pill(m); }).join(" ") + "</div>"
        + '<div style="font-size:12px;color:var(--ink-3)">当前阶段 <b style="color:var(--blue)">' + esc(evs[0] ? evs[0].stage || "—" : "—") + "</b> · " + esc(evs[0] ? evs[0].title : "") + "</div></div>";
    }).join("") + "</div>";
  }
  function vCompany(name) {
    var evs = companyEvents(name);
    if (!evs.length) return '<div class="panel"><div class="empty">未找到该主体的事件记录</div></div>';
    var lb = B[0] || {};
    var h = '<div class="panel dhead"><div class="crumbs"><a href="#/cos">企业档案</a> / ' + esc(name) + "</div>"
      + "<h1>" + esc(shortCo(name)) + "</h1>"
      + '<div class="dtags">' + pill(evs.length + " 个事件", "solid") + pill("最新 " + evs[0].date, "blue")
      + unique(evs.map(function (x) { return x.mt; })).filter(Boolean).map(function (m) { return pill(m); }).join("") + "</div></div>";
    h += '<div class="ph" style="margin-top:18px"><span class="phl" style="font-size:18px">事件链</span><span class="sub">本页回答：该主体的出海事件按时间如何推进、当前状态</span></div>';
    h += '<div class="panel"><div class="panel-b">' + evs.map(function (x) {
      return '<div class="ev"><span class="pg">' + esc(x.date) + '</span><span>' + pill(x.mt || "—") + pill(x.ut === "进展" ? "进展" : "", x.ut === "进展" ? "blue" : "") + ' <a href="#/event/' + x.id + '"><b>' + esc(x.title) + "</b></a></span>"
        + '<span class="dim" style="margin-left:auto;white-space:nowrap">' + esc(x.stage || "") + " · " + esc(x.status) + (x.amt ? " · " + esc(x.amt) : "") + "</span></div>";
    }).join("") + "</div></div>";
    // 筛查记录
    h += '<div class="panel"><div class="panel-h"><h2>筛查记录</h2></div><div class="panel-b">'
      + '<div class="sec"><span class="sk">OFAC SDN 比对 ' + layerBadge("analysis") + '</span>'
      + "最近批次 " + esc(lb.id || "—") + "：SDN 全量 " + esc(String((lb.per_source && lb.per_source["OFAC·SDN"] || {}).scanned || "—")) + " 条与观察名单词级比对，本主体 0 命中"
      + (lb.note ? ' <span class="dim">（依据批次说明）</span>' : "") + "</div>"
      + '<div class="sec"><span class="sk">异常记录</span>' + ((DB.exceptions || []).length ? esc(String((DB.exceptions || []).length)) + " 条全局异常（见方法与来源）" : "无") + "</div>"
      + "</div></div>";
    return h;
  }

  /* ═════════ 专题研究：只留有比较/解释/判断的专题 ═════════ */
  var TPV = { v: "regions" };
  function vTopics() {
    var h = '<div class="ph"><h1>专题研究</h1><span class="sub">本页回答：事件在国家、产能与政策维度上呈现出什么结构与变化</span></div>';
    h += '<div class="subnav wrap" style="margin-bottom:16px">'
      + [["regions", "国家与产业"], ["supply", "供应链与产能"], ["policy", "政策影响"]].map(function (x) {
        return '<a href="javascript:;" data-tpv="' + x[0] + '"' + (TPV.v === x[0] ? ' class="on"' : "") + ">" + x[1] + "</a>";
      }).join("") + "</div><div id=\"tpbody\"></div>";
    return h;
  }
  function tpBody() {
    var box = $("tpbody"); if (!box) return;
    var R = (V.regions || []).slice().sort(function (a, b) { return b.project_cnt - a.project_cnt; });
    if (TPV.v === "regions") {
      box.innerHTML = '<div class="panel"><div class="panel-h"><h2>国家与产业比较</h2><span class="note">由 ' + D.length + " 条已收录披露派生；样本有限，仅作结构参考，不作趋势结论</span></div>"
        + '<div class="panel-b"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>国家/地区</th><th>项目数</th><th>公司数</th><th>涉及行业</th><th></th></tr></thead><tbody>'
        + R.map(function (r) {
          return '<tr><td><b>' + esc(r.region) + '</b></td><td class="mono">' + r.project_cnt + '</td><td class="mono">' + r.company_cnt + '</td>'
            + '<td style="font-size:12px">' + esc((r.industries || []).join("、")) + '</td>'
            + '<td><a href="#/events?geo=' + encodeURIComponent(r.region) + '">看事件 →</a></td></tr>';
        }).join("") + "</tbody></table></div></div></div>";
      return;
    }
    if (TPV.v === "supply") {
      var cap = ((V.supplychain || {}).capacity) || [];
      var cl = ((V.supplychain || {}).clusters) || [];
      box.innerHTML = '<div class="statstrip">' + statCard(cap.length, "产能布局事项", "由披露原文派生") + statCard(cl.length, "区域×产业集群", "") + "</div>"
        + '<div class="panel"><div class="panel-h"><h2>产业集群（区域 × 行业）</h2></div><div class="panel-b">'
        + (cl.map(function (c) { return '<a class="tag" href="#/events?geo=' + encodeURIComponent(c.region) + '">' + esc(c.region) + " · " + esc(c.industry) + " <b>" + c.cnt + "</b></a>"; }).join("") || '<div class="empty">无</div>') + "</div></div>"
        + '<div class="panel"><div class="panel-h"><h2>产能布局明细</h2></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>日期</th><th>主体</th><th>区域</th><th>行业</th><th>类型</th></tr></thead><tbody>'
        + cap.map(function (c) {
          return '<tr><td class="mono">' + esc(c.date) + '</td><td>' + esc(shortCo(c.company)) + '</td><td>' + esc(c.region) + '</td><td>' + esc(c.industry) + '</td><td>' + pill(c.type, "blue") + "</td></tr>";
        }).join("") + "</tbody></table></div>"
        + '<div class="secnote">口径：仅覆盖已收录披露提及的产能事项；未披露产能规划的主体不在样本内。</div></div>';
      return;
    }
    var P = V.policies || [];
    box.innerHTML = '<div class="panel"><div class="panel-h"><h2>政策时间线</h2><span class="note">静态维护条目，非监测批次产出；引用前请按"来源"核验现行有效性</span></div>'
      + '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>时间</th><th>政策</th><th>发布</th><th>要点</th></tr></thead><tbody>'
      + P.map(function (p) {
        return '<tr><td class="mono">' + esc(p.date) + '</td><td style="font-size:12.5px"><b>' + esc(p.title) + '</b></td><td>' + esc(p.issuer || "—") + '</td><td style="font-size:12.5px">' + esc(p.summary || "") + "</td></tr>";
      }).join("") + "</tbody></table></div></div>";
  }

  /* ═════════ 方法与来源：health / batches / records / diff / export ═════════ */
  var AB = { tab: "health" };
  function vAbout() {
    var h = '<div class="ph"><h1>方法与来源</h1><span class="sub">本页回答：数据怎么来、多久更新一次、质量如何、怎样取用</span></div>';
    h += '<div class="subnav wrap" style="margin-bottom:16px">'
      + [["health", "来源健康"], ["batches", "批次简报"], ["records", "更新记录"], ["diff", "版本比较"], ["validate", "质检报告"], ["export", "导出"]].map(function (x) {
        return '<a href="javascript:;" data-abt="' + x[0] + '"' + (AB.tab === x[0] ? ' class="on"' : "") + ">" + x[1] + "</a>";
      }).join("") + "</div><div id=\"abbody\"></div>";
    return h;
  }
  function abBody() {
    var box = $("abbody"); if (!box) return;
    var H = DB.health || [];
    if (AB.tab === "health") {
      box.innerHTML = H.map(function (c) {
        return '<div class="panel"><div class="panel-h"><h2>' + esc(c.name) + '</h2>'
          + '<span class="st ' + (c.status === "正常" ? "ok" : c.status === "降级" ? "bad" : "plan") + '">' + esc(c.status) + "</span>"
          + '<span class="note">收录 ' + c.count + " · 最新 " + esc(c.latest || "—") + " · 最近批次 " + esc(c.lastBatch || "—") + "</span></div>"
          + '<div class="kv" style="padding-top:6px">'
          + '<div class="dl"><span class="k">接入方式</span><span class="v">' + esc(c.method) + "</span></div>"
          + '<div class="dl"><span class="k">去重/游标</span><span class="v">' + esc(c.cursor) + "</span></div>"
          + '<div class="dl"><span class="k">频率</span><span class="v">' + esc(c.cadence) + "</span></div>"
          + '<div class="dl"><span class="k">来源</span><span class="v"><a href="' + esc(c.url) + '" target="_blank" rel="noopener">' + esc(String(c.url).replace(/^https?:\/\//, "").slice(0, 48)) + " ↗</a></span></div></div>"
          + (c.note ? '<div class="secnote">' + esc(c.note) + "</div>" : "") + "</div>";
      }).join("") || '<div class="empty">无</div>';
      return;
    }
    if (AB.tab === "batches") {
      var BD = DB.batches_daily || [];
      var list = BD.length ? BD : B;
      box.innerHTML = (BD.length ? '<div class="note" style="margin-bottom:12px">日批次视图：同一自然日多轮运行合并为 D-YYYYMMDD（runs 记轮数）；回溯补入单列 B-YYYYMMDD。逐轮原始记录见「更新记录」。</div>' : "")
        + list.map(function (b) {
        var ps = Object.keys(b.per_source || {}).map(function (k) {
          var p = b.per_source[k]; return esc(k) + "：扫 " + p.scanned + " / 收 " + p.kept + " / 剔 " + p.excluded + (p.failed ? " / 败 " + p.failed : "");
        }).join("<br/>");
        var note;
        if (b.notes) {
          var uniqN = b.notes.filter(function (x, i, a) { return a.indexOf(x) === i; });
          note = esc(uniqN[0] || "—") + (uniqN.length > 1 ? '<div class="dim" style="margin-top:4px">（同日另有 ' + (uniqN.length - 1) + " 轮说明，见「更新记录」逐轮原始记录）</div>" : "");
        } else {
          note = esc(b.trend || b.note || "—");
        }
        return '<div class="panel"><div class="panel-h"><h2>' + esc(b.id) + '</h2>'
          + (b.kind === "backfill" ? '<span class="st manual">回溯补入</span>' : "")
          + (b.runs > 1 ? '<span class="st plan">' + b.runs + ' 轮合并</span>' : "")
          + '<span class="note mono">' + esc(b.time) + (b.window ? " · " + esc(b.window) : "") + "</span></div>"
          + '<div class="panel-b"><div class="sec"><span class="sk">本期结论</span>' + note + '</div>'
          + (b.notes ? "" : '<div class="sec"><span class="sk">检索机制说明</span>' + esc(b.note || "—") + "</div>")
          + '<div class="sec" style="border:none"><span class="sk">分项统计（扫/收/剔/败）</span>' + ps + "</div>"
          + (b.runs_ids && b.runs_ids.length > 1 ? '<div class="secnote">合并批次：' + esc(b.runs_ids.join("、")) + "</div>" : "") + "</div></div>";
      }).join("") || '<div class="empty">无</div>';
      return;
    }
    if (AB.tab === "records") {
      box.innerHTML = '<div class="panel"><div class="panel-h"><h2>批次运行记录</h2></div><div class="tbl-wrap"><table class="tbl">'
        + "<thead><tr><th>批次</th><th>时间</th><th>扫描</th><th>收录</th><th>剔除</th><th>失败</th></tr></thead><tbody>"
        + B.map(function (b) {
          return '<tr><td class="mono">' + esc(b.id) + '</td><td class="mono">' + esc(b.time) + '</td><td class="mono">' + b.scanned + '</td><td class="mono">' + b.kept + '</td><td class="mono">' + b.excluded + '</td><td class="mono">' + b.failed + "</td></tr>";
        }).join("") + "</tbody></table></div></div>"
        + ((DB.exceptions || []).length ? '<div class="panel"><div class="panel-h"><h2>异常记录</h2></div><div class="panel-b">'
          + (DB.exceptions || []).map(function (x) { return '<div class="ev"><span class="qt">' + esc(typeof x === "string" ? x : JSON.stringify(x)) + "</span></div>"; }).join("") + "</div></div>" : "");
      return;
    }
    if (AB.tab === "diff") {
      var opts = D.map(function (r) { return '<option value="' + esc(r._aid) + '">' + esc(r["披露日期与时间"] + " · " + shortCo(r["公司全称"]) + " · " + r["公告标题"].slice(0, 26)) + "</option>"; }).join("");
      box.innerHTML = '<div class="panel"><div class="panel-h"><h2>两份披露并排比较</h2><span class="note">用于同一主体前后披露对比</span></div>'
        + '<div class="filterbar"><select class="fsel" id="dfA" style="min-width:320px">' + opts + '</select><span class="dim">↔</span><select class="fsel" id="dfB" style="min-width:320px">' + opts + '</select></div>'
        + '<div id="dfout" style="padding:14px 24px 18px"></div></div>';
      if (D.length > 1) { $("dfB").selectedIndex = 1; }
      var run = function () {
        var A = docByAid($("dfA").value), C = docByAid($("dfB").value);
        if (!A || !C) return;
        var FIELDS = ["动作类型", "动作阶段", "投资金额", "涉及国家/地区", "合作方", "主要风险与不确定性", "公告类型"];
        $("dfout").innerHTML = '<div class="tbl-wrap"><table class="tbl cmp"><thead><tr><th style="width:110px">字段</th><th>前值（A）</th><th>后值（B）</th></tr></thead><tbody>'
          + FIELDS.map(function (f) {
            var va = A[f] || "—", vb = C[f] || "—";
            return '<tr' + (va !== vb ? ' style="background:var(--blue-bg)"' : "") + '><th class="rowh">' + esc(f) + "</th><td style='font-size:12.5px'>" + esc(va) + "</td><td style='font-size:12.5px'>" + esc(vb) + "</td></tr>";
          }).join("") + "</tbody></table></div>";
      };
      $("dfA").addEventListener("change", run); $("dfB").addEventListener("change", run); run();
      return;
    }
    if (AB.tab === "validate") {
      var VR = DB.validate;
      if (!VR || !VR.summary) {
        box.innerHTML = '<div class="panel"><div class="empty">尚无质检报告（由 scripts/validate.py 生成 state/validate_report.json 后随构建发布）</div></div>';
        return;
      }
      var sm = VR.summary;
      box.innerHTML = '<div class="statstrip">'
        + statCard(sm.ERROR, "ERROR", sm.ERROR === 0 ? "结构错误须为 0" : "须修复")
        + statCard(sm.WARN, "WARN", "数据质量提示")
        + statCard(sm.SKIP, "SKIP", "条件未满足而跳过（如原文缓存缺失）")
        + statCard(esc(VR.generated || "—"), "最近质检时间", "scripts/validate.py")
        + "</div>"
        + '<div class="panel"><div class="panel-h"><h2>检查项明细</h2><span class="note">JSON 可解析 · id 唯一 · 必填字段 · 三分层 basis · 金额口径 · 引文回原文 · 前端资源</span></div><div class="panel-b">'
        + ((VR.issues || []).length ? (VR.issues || []).map(function (i) {
          return '<div class="ev"><span class="pg">' + esc(i.level) + '</span><span><b>' + esc(i.check) + "</b> " + esc(i.detail) + "</span></div>";
        }).join("") : '<div class="empty">无 ERROR / WARN / SKIP 项——全部检查通过</div>')
        + "</div></div>";
      return;
    }
    box.innerHTML = '<div class="panel"><div class="panel-h"><h2>导出</h2><span class="note">公开数据与个人标注分别导出（本机生成，不经服务器）</span></div>'
      + '<div class="panel-b" style="display:flex;gap:10px;flex-wrap:wrap">'
      + '<button class="btn primary" data-exp="disclosures">披露条目 JSON（' + D.length + "）</button>"
      + '<button class="btn primary" data-exp="events">事件层 JSON（' + EV.length + "）</button>"
      + '<button class="btn" data-exp="ann">个人关注与备注</button>'
      + "</div><div class='secnote'>口径：导出内容为当前站点快照（构建 " + esc((DB.build && DB.build.time) || DB.synced || "—") + " · 批次 " + esc((DB.build && DB.build.batch) || "—") + "）。金额保留原文币种。</div></div>";
  }

  /* ═════════ 全局搜索（替代原 ask 证据问答） ═════════ */
  function openSearch(q) { $("searchov").classList.add("show"); var i = $("soq"); i.value = q || ""; i.focus(); soRender(); }
  function closeSearch() { $("searchov").classList.remove("show"); }
  function soRender() {
    var q = $("soq").value.trim().toLowerCase();
    var out = $("sores");
    if (!q) { out.innerHTML = '<div class="so-g">输入公司 / 事件 / 国家 / 公告关键词</div>'; return; }
    var evs = EVX.filter(function (x) { return (x.title + " " + x.subject + " " + (x.geo || "")).toLowerCase().indexOf(q) >= 0; }).slice(0, 6);
    var cos = unique(EVX.map(function (x) { return x.subject; })).filter(function (n) { return n.toLowerCase().indexOf(q) >= 0; }).slice(0, 4);
    var docs = D.filter(function (r) { return (r["公告标题"] + r["公司全称"] + (r["动作类型"] || "")).toLowerCase().indexOf(q) >= 0; }).slice(0, 6);
    var h = '<a class="so-ask" href="#/events?q=' + encodeURIComponent(q) + '" data-close>在事件库中筛选「' + esc(q) + '」 →</a>';
    if (evs.length) h += '<div class="so-g">事件</div>' + evs.map(function (x) { return '<a class="so-it" href="#/event/' + x.id + '" data-close><b>' + esc(x.title) + '</b><br/><span class="dim">' + esc(x.date) + " · " + esc(x.stage || "") + " · " + esc(x.status) + "</span></a>"; }).join("");
    if (cos.length) h += '<div class="so-g">主体</div>' + cos.map(function (n) { return '<a class="so-it" href="#/company/' + encodeURIComponent(n) + '" data-close>' + esc(shortCo(n)) + "</a>"; }).join("");
    if (docs.length) h += '<div class="so-g">披露原文</div>' + docs.map(function (r) { return '<a class="so-it" href="' + esc(r["来源链接"]) + '" target="_blank" rel="noopener">' + esc(r["公告标题"].slice(0, 40)) + '<br/><span class="dim">' + esc(r["披露日期与时间"]) + " · " + esc(shortCo(r["公司全称"])) + "</span></a>"; }).join("");
    if (!evs.length && !cos.length && !docs.length) h += '<div class="so-g">未命中</div><div class="empty">已收录数据中未找到相关内容</div>';
    out.innerHTML = h;
    out.querySelectorAll("[data-close]").forEach(function (a) { a.addEventListener("click", closeSearch); });
  }

  /* ═════════ 路由（一级四分页面 + 出海信批归纳 7 个二级页 + 旧路由 301 式重定向） ═════════ */
  function setSub(section, cur) {
    var SUBS = {
      cn: [["#/", "总览"], ["#/events", "事件库"], ["#/issues", "法律议题"], ["#/cos", "企业档案"],
           ["#/topics", "专题研究"], ["#/board", "项目看板"], ["#/about", "方法与来源"]],
      us: [], hk: [],
      export: EX_COLS.map(function (x) { return ["#/export?col=" + x[0], x[1]]; })
    };
    subnav.innerHTML = (SUBS[section] || []).map(function (x) {
      return '<a href="' + x[0] + '"' + (x[0] === cur ? ' class="on"' : "") + ">" + esc(x[1]) + "</a>";
    }).join("");
  }
  function redirectTo(h) { location.replace(h); }
  function route() {
    var hraw = location.hash.replace(/^#/, "") || "/";
    var hpath = hraw.split("?")[0];
    var qs = new URLSearchParams(hraw.split("?")[1] || "");
    var parts = hpath.split("/").filter(Boolean);
    var name = parts[0] || "home", param = parts[1] ? decodeURIComponent(parts[1]) : null;
    closeSearch();
    var html, section = "cn", sub = "#/";
    if (name === "events") {
      section = "cn"; sub = "#/events";
      F.q = qs.get("q") || ""; F.ch = qs.get("ch") || "全部"; F.mt = qs.get("mt") || "全部";
      F.stage = qs.get("stage") || "全部"; F.geo = qs.get("geo") || "全部"; F.ut = qs.get("ut") || "全部";
      F.status = qs.get("status") || "全部"; F.view = qs.get("view") || "cards"; F.mode = qs.get("mode") || "month";
      html = vEvents();
    }
    else if (name === "event") { section = "cn"; sub = "#/events"; html = vEvent(param || ""); }
    else if (name === "issues") { section = "cn"; sub = "#/issues"; html = vIssues(); }
    else if (name === "board") { section = "cn"; sub = "#/board"; html = vBoard(); }
    else if (name === "cos") {
      if (param) { redirectTo("#/events"); return; }  // 旧子路由 projects/lifecycle/calendar/funds/compliance
      section = "cn"; sub = "#/cos"; html = vCos();
    }
    else if (name === "company") { section = "cn"; sub = "#/cos"; html = vCompany(param || ""); }
    else if (name === "topics") {
      section = "cn"; sub = "#/topics"; TPV.v = qs.get("view") || "regions";
      html = vTopics();
    }
    else if (name === "about") {
      section = "cn"; sub = "#/about"; AB.tab = qs.get("tab") || "health";
      html = vAbout();
    }
    /* ── 一级分页面：美股 / 港股 / 出口管制 ── */
    else if (name === "us") { section = "us"; sub = ""; html = vMarket("us"); }
    else if (name === "hk-market") { section = "hk"; sub = ""; html = vMarket("hk"); }
    else if (name === "export") {
      section = "export"; EXC.col = qs.get("col") || "enforcement";
      sub = "#/export?col=" + EXC.col; html = vExport();
    }
    /* ── 旧路由 301 式重定向 ── */
    else if (name === "market") { redirectTo("#/us"); return; }
    else if (name === "sanctions") { redirectTo("#/export?col=watch"); return; }
    else if (name === "feed") { redirectTo("#/events" + (qs.get("ch") ? "?ch=" + encodeURIComponent(qs.get("ch")) : "")); return; }
    else if (name === "hk") { redirectTo("#/events?view=hk"); return; }
    else if (name === "arc" && !param) { redirectTo("#/events?view=table"); return; }
    else if (name === "arc" && param === "batches") { redirectTo("#/about?tab=batches"); return; }
    else if (name === "arc" && param === "diff") { redirectTo("#/about?tab=diff"); return; }
    else if (name === "arc" && param === "export") { redirectTo("#/about?tab=export"); return; }
    else if (name === "detail" && param) {
      var r0 = null;
      for (var i0 = 0; i0 < D.length; i0++) if (D[i0]["序号"] === param) r0 = D[i0];
      var m0 = r0 && EDOC[r0._aid];
      redirectTo(m0 ? "#/event/" + m0.event_id : "#/events"); return;
    }
    else if (name === "project" && param) {
      var p0 = null;
      (V.projects || []).forEach(function (p) { if (p.id === param) p0 = p; });
      redirectTo("#/events" + (p0 ? "?q=" + encodeURIComponent(p0.name.slice(0, 12)) : "")); return;
    }
    else if (name === "case" && param) {
      var c0 = null;
      (DB.cases || []).forEach(function (c) { if (c.id === param) c0 = c; });
      if (c0 && c0.events && c0.events[0] && EDOC[c0.events[0]]) { redirectTo("#/event/" + EDOC[c0.events[0]].event_id); return; }
      redirectTo("#/topics"); return;
    }
    else if (name === "cos2") { redirectTo("#/events"); return; }
    else if (name === "src") { redirectTo("#/about" + (param === "records" ? "?tab=records" : "")); return; }
    else if (name === "ana") { redirectTo("#/topics" + (param && param !== "regions" ? "?view=" + encodeURIComponent(param === "policy" ? "policy" : param === "supply" ? "supply" : "regions") : "")); return; }
    else if (name === "ask") { redirectTo("#/"); setTimeout(function () { openSearch(qs.get("q") || ""); }, 60); return; }
    else if (name === "company2") { redirectTo("#/cos"); return; }
    else { section = "cn"; sub = "#/"; html = vHome(); }

    view.innerHTML = html;
    setSub(section, sub);
    document.querySelectorAll(".mainnav a").forEach(function (a) {
      a.classList.toggle("on", (a.getAttribute("data-r") || "cn") === section);
    });
    window.scrollTo(0, 0);
    // 绑定
    if (name === "events") { bindEvents(); evRows(); }
    if (name === "export") { bindExc(); exBody(); }
    if (name === "cos") { cosRows(""); var ci = $("coq"); if (ci) ci.addEventListener("input", function (e) { cosRows(e.target.value); }); }
    if (name === "topics") { document.querySelectorAll("[data-tpv]").forEach(function (a) { a.addEventListener("click", function () { TPV.v = a.getAttribute("data-tpv"); view.innerHTML = vTopics(); routeBindTopics(); tpBody(); }); }); tpBody(); }
    if (name === "about") { document.querySelectorAll("[data-abt]").forEach(function (a) { a.addEventListener("click", function () { AB.tab = a.getAttribute("data-abt"); view.innerHTML = vAbout(); routeBindAbout(); abBody(); bindExport(); }); }); abBody(); bindExport(); }
    if (name === "event") {
      var ta = $("pnote");
      if (ta) ta.addEventListener("change", function () { ANN.notes[ta.getAttribute("data-note")] = ta.value; saveAnn(); });
    }
  }
  function bindExc() {
    document.querySelectorAll("[data-exc]").forEach(function (a) {
      a.addEventListener("click", function () {
        EXC.col = a.getAttribute("data-exc");
        history.replaceState(null, "", "#/export?col=" + EXC.col);
        setSub("export", "#/export?col=" + EXC.col);
        view.innerHTML = vExport(); bindExc(); exBody();
      });
    });
  }
  function routeBindTopics() {
    document.querySelectorAll("[data-tpv]").forEach(function (a) {
      a.addEventListener("click", function () { TPV.v = a.getAttribute("data-tpv"); view.innerHTML = vTopics(); routeBindTopics(); tpBody(); });
    });
  }
  function routeBindAbout() {
    document.querySelectorAll("[data-abt]").forEach(function (a) {
      a.addEventListener("click", function () { AB.tab = a.getAttribute("data-abt"); view.innerHTML = vAbout(); routeBindAbout(); abBody(); bindExport(); });
    });
  }
  function bindExport() {
    document.querySelectorAll("[data-exp]").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-exp");
        var data = k === "disclosures" ? D : k === "events" ? EV : { favs: ANN.favs, notes: ANN.notes };
        var blob = new Blob([JSON.stringify(data, null, 1)], { type: "application/json" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "pubx-" + k + "-" + ((DB.build && DB.build.batch) || "snap") + ".json";
        a.click();
      });
    });
  }

  /* ── 全局事件 ── */
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-fav]");
    if (b) {
      var key = b.getAttribute("data-fav");
      ANN.favs[key] = !ANN.favs[key]; saveAnn();
      b.textContent = ANN.favs[key] ? "★ 已关注" : "☆ 关注";
      return;
    }
    var cp = e.target.closest("[data-copy]");
    if (cp) {
      var txt = cp.getAttribute("data-copy");
      var done = function () { cp.textContent = "已复制"; setTimeout(function () { cp.textContent = "复制引文"; }, 1200); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, done);
      else { var ta2 = document.createElement("textarea"); ta2.value = txt; document.body.appendChild(ta2); ta2.select(); try { document.execCommand("copy"); } catch (x) { } ta2.remove(); done(); }
      return;
    }
    if (e.target === $("searchov")) closeSearch();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(""); }
    if (e.key === "Escape") closeSearch();
  });
  $("gsq").addEventListener("focus", function () { openSearch($("gsq").value); $("gsq").blur(); });
  $("soq").addEventListener("input", soRender);
  $("burger").addEventListener("click", function () { $("mainnav").classList.toggle("open"); });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".mainnav") && !e.target.closest("#burger")) $("mainnav").classList.remove("open");
  });

  /* ── 页头页脚 ── */
  $("sideSync").textContent = "同步 " + (DB.synced || "—");
  var fs = $("footSync"); if (fs) fs.textContent = "最近同步 " + (DB.synced || "—");
  var fb = $("footBuild"); if (fb) fb.textContent = DB.build
    ? ("构建 " + (DB.build.time || "—") + " · 批次 " + (DB.build.batch || "—") + (DB.build.events ? (" · 事件 " + DB.build.events) : ""))
    : "";

  window.addEventListener("hashchange", route);
  route();
})();
