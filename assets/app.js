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
    // 口径前缀：金额为注册资本/认购价等非交易对价时保留名目，避免误读为交易额
    var pre = "";
    if (/^注册资本/.test(t)) pre = "注册资本 ";
    else if (/^(认购|出资)/.test(t)) pre = "出资 ";
    var m = String(t).match(/([0-9][0-9,]*\.?[0-9]*)\s*(亿|万)?\s*(美元|港元|人民币|元|澳元|欧元|新元|迪拉姆)/);
    if (m) return pre + m[0].replace(/\s+/g, "");
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
  // 国家归一（看板矩阵/筛选用）：取 geo 文本「（」前第一段、按全半角分隔符拆分后
  // 首个非「中国」的国家/地区（出海语境下中国为来源地）；多国事项计入首列国，口径在矩阵下注明。
  // 附加归一：剥离「：」后口径说明；城市/港口级表述按国名前缀归一（埃及亚历山大省阿拉伯堡市→埃及）
  var GEO_SKIP = { "全球": "多国/全球", "海外": "多国/全球", "境外": "多国/全球", "国际市场": "多国/全球" };
  function countryOf(geoText) {
    if (!geoText) return "未披露";
    var t = String(geoText).split(/[（(]/)[0].trim();
    var parts = t.split(/[、，,·\/；;＋／]/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (!parts.length) return "未披露";
    var c = parts[0];
    for (var i = 0; i < parts.length; i++) {
      if (parts[i] !== "中国" && parts[i] !== "中国大陆") { c = parts[i]; break; }
    }
    // 剥离「：口径说明」尾巴（如「国际市场：144A口径向美境内…发售」→ 国际市场 → 多国/全球）
    c = c.split(/[：:]/)[0].trim();
    if (c === "香港" || c === "中国香港") return "中国香港";
    if (GEO_SKIP[c]) return GEO_SKIP[c];
    // 城市/港口级表述归一到国名（如「埃及亚历山大省阿拉伯堡市」→ 埃及、「中国上海」→ 中国）
    var GEO_PREFIX = ["澳大利亚", "埃及", "中国"];
    for (var j = 0; j < GEO_PREFIX.length; j++) {
      var k = GEO_PREFIX[j];
      if (c !== k && c.indexOf(k) === 0) { c = k; break; }
    }
    return c;
  }
  // 金额解析：scale 文本首个「数字+万/亿+币种」→ {val(亿), cur}；无则 null（不推测）
  var CUR_TOKENS = ["美元", "港元", "人民币", "澳元", "欧元", "英镑", "日元", "新元", "迪拉姆", "卢比", "加元", "瑞郎"];
  function amtParse(text) {
    if (!text) return null;
    var m = String(text).match(/([0-9][0-9,]*\.?[0-9]*)\s*(亿|万)?\s*(美元|港元|人民币|澳元|欧元|英镑|日元|新元|迪拉姆|卢比|加元|瑞郎|元)/);
    if (!m) return null;
    var v = parseFloat(m[1].replace(/,/g, ""));
    if (isNaN(v)) return null;
    var unit = m[2] || "";
    var cur = m[3] === "元" ? "人民币" : m[3];
    var yi = unit === "亿" ? v : unit === "万" ? v / 10000 : v / 1e8;
    return { val: yi, cur: cur };
  }
  // 跟踪点期限解析：取文本中首个 20xx(-mm(-dd)) / 20xx年；无日期返回 null（列后，不猜）。
  // 「2025年度」为会计期间而非期限，年粒度匹配须排除「年度」；早于数据同步日的日期视为已过节点。
  function parseDeadline(text) {
    if (!text) return null;
    var m = String(text).match(/(20\d{2})[-年.\/](\d{1,2})[-月.\/](\d{1,2})日?/);
    // 「2026年1-6月」为会计期间区间而非期限，不取
    if (m && !/^20\d{2}[-年.\/]\d{1,2}[-–~—]\d{1,2}月/.test(String(text).slice(m.index)))
      return m[1] + "-" + ("0" + m[2]).slice(-2) + "-" + ("0" + m[3]).slice(-2);
    m = String(text).match(/(20\d{2})[-年.\/](\d{1,2})(?!度)/);
    if (m && !/^20\d{2}[-年.\/]\d{1,2}[-–~—]\d{1,2}月/.test(String(text).slice(m.index)))
      return m[1] + "-" + ("0" + m[2]).slice(-2);
    var re = /(20\d{2})年?/g;
    while ((m = re.exec(String(text)))) {
      // 「2025年度 / 2026上半年 / 2026年报 / 2026年1-6月」等为会计期间引用，不是期限，跳过往后找
      if (/^(度|报|上半年|下半年|中报|季报|一季|三季)/.test(String(text).slice(re.lastIndex, re.lastIndex + 3))) continue;
      if (/^20\d{2}年\d{1,2}[-–~—]\d{1,2}月/.test(String(text).slice(m.index))) continue;
      return m[1];
    }
    return null;
  }
  // 日期加减（UTC 计算，避免本地时区经 toISOString 产生一天偏移）
  function addDaysISO(iso, n) {
    var p = String(iso).split("-");
    return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] + n)).toISOString().slice(0, 10);
  }
  function syncDate() { return (DB.synced || "").slice(0, 10); }
  var EVX = EV.map(function (e) {
    var latest = e.sources[e.sources.length - 1];
    var first = e.sources[0];
    var sc = e.scale ? e.scale.text : "";
    var ap = amtParse(sc);
    return {
      e: e,
      id: e.event_id,
      date: latest ? latest.date : "",
      firstDate: first ? first.date : "",
      title: e.title_fact ? e.title_fact.text : e.event_id,
      subject: e.parties && e.parties[0] ? e.parties[0].name : "—",
      mt: e.matter_type ? e.matter_type.value : null,
      stage: e.stage_current,
      status: e.status,
      ut: e.update_type_latest,
      geo: e.geo ? e.geo.text : null,
      country: countryOf(e.geo ? e.geo.text : null),
      amt: sc ? amtShort(sc) : "",
      amtVal: ap ? ap.val : null,
      cur: ap ? ap.cur : null,
      chans: unique(e.sources.map(function (s) { return s.channel; }))
    };
  });
  EVX.sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  // 事件议题码（归一类，渲染期经 issueOf 计算；分析层产物）
  function evIssues(e) {
    return unique((e.legal_triggers || []).map(function (t) { return issueOf(t)[0]; }).filter(function (c) { return c !== "I0"; }));
  }
  function evById(id) { for (var i = 0; i < EV.length; i++) if (EV[i].event_id === id) return EV[i]; return null; }
  function docByAid(aid) { for (var i = 0; i < D.length; i++) if (D[i]._aid === aid) return D[i]; return null; }
  // 法律触发点处理状态四态中文名（事件详情总表 / 议题库共用）
  var TR_STATUS = { disclosed_cleared: "已披露·已通过", disclosed_pending: "已披露·未完成", not_disclosed: "未披露", not_applicable: "不适用", disclosed: "已披露" };
  // 状态 pill：disclosed+not_applicable（原始分类/多地披露等纯事实行）不显示审批语义，标「原文事实」
  function trPill(t) {
    if (t.status === "not_applicable" && t.layer === "disclosed") return pill("原文事实·无审批状态", "");
    return pill(TR_STATUS[t.status] || t.status || "—", t.status === "not_disclosed" ? "warn" : "");
  }
  // trigger_fact 摘要清洗：剥离「语料提及「…」（字段：…）」包装，只留片段本体
  function trigFactShort(t) {
    var f = t.trigger_fact || t.text || "";
    var m = f.match(/^语料提及「([\s\S]*)」（字段：[^）]*）$/);
    return m ? m[1] : f;
  }

  /* ═════════ 首页（R04）：本次更新带 → 头条 → 重点观察 → 关键数据 → 持续跟踪 → 入口 ═════════ */
  function vHome() {
    var maxDate = EVX.length ? EVX[0].date : "";
    var d7 = maxDate ? addDaysISO(maxDate, -6) : "";
    var recent7 = EVX.filter(function (x) { return x.date >= d7; }).length;
    var BD = DB.batches_daily || [];
    var lb = null;
    for (var bi = 0; bi < BD.length; bi++) if (BD[bi].kind === "daily") { lb = BD[bi]; break; }
    if (!lb) lb = B[0] || {};

    var h = '<div class="ph"><h1>总览</h1><span class="sub">本页回答：本批变了什么、最重要的一件事是什么、接下来盯什么</span></div>';

    /* ── ① 本次更新带（日批次五类计数，可展开到事件；回溯补入单列） ── */
    var todayB = null;
    for (var ti = 0; ti < BD.length; ti++) if (BD[ti].kind === "daily") { todayB = BD[ti]; break; }
    var bdDate = todayB ? todayB.day.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3") : "";
    // 计数按事件去重：同一事件同类的多条 changelog 合并为一条（日期取最新，说明合并）
    var upd = { "新增": {}, "进展": {}, "重复": {}, "修正": {}, "失效": {} };
    EV.forEach(function (e) {
      (e.changelog || []).forEach(function (c) {
        var inWin = bdDate ? c.date >= bdDate : c.date >= d7;
        if (inWin && upd[c.type]) {
          var slot = upd[c.type][e.event_id];
          if (!slot) slot = upd[c.type][e.event_id] = { e: e, date: c.date, notes: [] };
          if (c.date > slot.date) slot.date = c.date;
          if (c.note && slot.notes.indexOf(c.note) < 0) slot.notes.push(c.note);
        }
      });
    });
    var updTypes = ["新增", "进展", "重复", "修正", "失效"];
    var updN = {};
    updTypes.forEach(function (k) { updN[k] = Object.keys(upd[k]).length; });
    var updTotal = updTypes.reduce(function (a, k) { return a + updN[k]; }, 0);
    h += '<div class="panel"><div class="panel-h"><h2>本次更新带</h2><span class="note">'
      + (todayB ? "日批次 " + esc(todayB.id) + "（" + esc(bdDate) + (todayB.runs > 1 ? "，" + todayB.runs + " 轮合并" : "") + "，含批次日后的人工修正记录）；计数来自事件层 changelog，按事件去重（同一事件同类多条合并）；点击分类可展开到事件"
                : "窗口 " + esc(d7 || "—") + " ~ " + esc(maxDate) + "；计数来自事件层 changelog，按事件去重") + '</span></div><div class="panel-b">'
      + '<div style="display:flex;gap:18px;flex-wrap:wrap;margin-bottom:10px">'
      + statCard(updN["新增"], "新增", "本批新入库事件") + statCard(updN["进展"], "进展", "阶段前移或新字段") + statCard(updN["重复"], "重复", "主键去重，不入库") + statCard(updN["修正"], "修正", "改记旧值留痕") + statCard(updN["失效"], "失效", "误收 / 作废，改记留痕") + "</div>"
      + (updTotal ? updTypes.map(function (k) {
          if (!updN[k]) return "";
          var items = Object.keys(upd[k]).map(function (id) { return upd[k][id]; })
            .sort(function (a, b) { return a.date < b.date ? 1 : -1; });
          return '<details class="updcat"' + (k === "新增" || k === "进展" ? " open" : "") + '><summary>' + pill(k, k === "进展" ? "blue" : k === "修正" || k === "失效" ? "warn" : "") + '<span class="dim" style="font-size:12px;margin-left:6px">' + updN[k] + " 条</span></summary>"
            + items.map(function (u) {
              return '<div class="ev"><span class="pg">' + esc(u.date) + '</span><span><a href="#/event/' + u.e.event_id + '">' + esc(u.e.title_fact ? u.e.title_fact.text : "") + "</a>"
                + (u.notes.length ? '<br/><span class="dim" style="font-size:12px">' + esc(u.notes.join("；")) + "</span>" : "") + "</span></div>";
            }).join("") + "</details>";
        }).join("")
        : '<div class="empty">本批（' + esc(bdDate || (d7 + " ~ " + maxDate)) + "）扫描 " + (todayB && todayB.scanned != null ? todayB.scanned : "—") + " 条，未发现新增出海事件</div>")
      + "</div>";
    // 回溯补入单列
    var bf = BD.filter(function (g) { return g.kind === "backfill"; });
    if (bf.length) {
      h += '<div style="border-top:1px dashed var(--line);padding:12px 24px 16px"><div class="sec" style="border:none;padding:0 0 6px"><span class="sk">回溯补入（历史区间补采，不计入日批次口径）</span></div>'
        + bf.map(function (g) {
          return '<div class="ev"><span class="pg mono">' + esc(g.id) + '</span><span>' + esc((g.source || "回溯").slice(0, 30)) + '</span><span class="dim" style="margin-left:auto">扫 ' + g.scanned + " / 收 " + g.kept + " / 剔 " + g.excluded + "</span></div>";
        }).join("") + "</div>";
    }
    h += "</div>";

    /* ── ② 头条事件（R04：近 7 日有实质更新且重要性 A 者优先；窗口按 changelog 变更日而非来源日） ── */
    var leadCands = [];
    EVX.forEach(function (x) {
      var last = "";
      (x.e.changelog || []).forEach(function (c) {
        if ((c.type === "进展" || c.type === "修正") && c.date >= d7 && c.date > last) last = c.date;
      });
      if (last) leadCands.push({ x: x, last: last });
    });
    leadCands.sort(function (a, b) { return a.last < b.last ? 1 : -1; });
    var lead = null, leadWhy = "";
    for (var i = 0; i < leadCands.length; i++) {
      var imp = leadCands[i].x.e.importance;
      if (imp && imp.level === "A") {
        lead = leadCands[i].x;
        leadWhy = "重要性 A（" + (imp.reason || "") + "），近 7 日有实质更新（" + leadCands[i].last + " · " + lead.ut + "）";
        break;
      }
    }
    if (!lead && leadCands.length) { lead = leadCands[0].x; leadWhy = "近 7 日有实质更新（" + leadCands[0].last + " · " + lead.ut + "）"; }
    if (!lead) for (var j = 0; j < EVX.length; j++) if (EVX[j].status === "活跃") { lead = EVX[j]; leadWhy = "最新活跃事件"; break; }
    if (!lead && EVX.length) { lead = EVX[0]; leadWhy = "最新收录事件"; }
    if (lead) {
      var e = lead.e;
      var q0 = null, s0 = e.sources[e.sources.length - 1];
      for (var k = e.sources.length - 1; k >= 0 && !q0; k--) if (e.sources[k].quotes && e.sources[k].quotes[0]) { q0 = e.sources[k].quotes[0]; s0 = e.sources[k]; }
      // 关注理由：执业提示优先、跟踪点次之，取 2–3 条（均为 analysis 层，带依据）
      var reasons = (e.practice_notes || []).concat(e.watch_points || []).filter(function (r) { return r && r.text; }).slice(0, 3);
      h += '<div class="lede"><div class="lede-t">头条事件 · ' + esc(lead.date) + " · " + esc(lead.id) + " · 入选依据：" + esc(leadWhy) + '</div>'
        + '<p style="font-size:18px;font-weight:700;line-height:1.7;margin-bottom:8px">' + esc(lead.title) + "</p>"
        + '<div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:10px">'
        + pill(lead.mt, "solid") + pill("阶段：" + lead.stage, "blue") + pill(lead.status) + (lead.amt ? pill(lead.amt, "blue") : "") + pill(lead.country) + "</div>";
      // 阶段链位置
      if (e.stage_chain && e.stage_chain.length) {
        h += '<div style="font-size:12.5px;color:var(--ink-3);margin-bottom:10px">阶段链位置：'
          + e.stage_chain.map(function (c, ci) {
            var cur = ci === e.stage_chain.length - 1;
            return (ci ? " → " : "") + (cur ? "<b style='color:var(--blue)'>" : "") + esc(c.stage) + " " + esc(c.date) + (cur ? "</b>" : "");
          }).join("") + "</div>";
      }
      if (e.scale && e.scale.text) h += '<div class="sec" style="border:none;padding:2px 0"><span class="sk">规模 ' + layerBadge(e.scale.layer || "disclosed") + (e.scale.basis ? ' <span class="dim">' + esc(e.scale.basis) + "</span>" : "") + '</span>' + esc(e.scale.text) + "</div>";
      if (reasons.length) {
        h += '<div style="margin:6px 0 4px"><span class="sk" style="font-size:12px;color:var(--ink-3);display:block;margin-bottom:4px">关注理由（系统分析，逐条附依据）</span>'
          + reasons.map(function (r, ri) {
            return '<div class="sec" style="padding:5px 0"><span class="sk">' + layerBadge(r.layer || "analysis") + (r.basis ? ' <span class="dim">依据：' + esc(r.basis) + "</span>" : "") + "</span>" + esc(r.text) + "</div>";
          }).join("") + "</div>";
      }
      if (q0) h += '<div class="em-q">「' + esc(q0.text) + "」<a href='" + esc(s0.url) + "#page=" + (q0.page || 1) + "' target='_blank' rel='noopener'>原文 P" + (q0.page || "?") + " ↗</a></div>";
      h += '<div style="font-size:13px;display:flex;gap:14px;flex-wrap:wrap;margin-top:12px">'
        + '<a href="#/event/' + lead.id + '"><b>完整分析 →</b></a>'
        + (s0 ? '<a href="' + esc(s0.url) + '" target="_blank" rel="noopener">最新原文 ↗</a>' : "")
        + "</div></div>";
    } else {
      h += '<div class="lede"><div class="lede-t">头条事件</div><p>当前样本期内无收录事件。</p></div>';
    }

    /* ── ③ 重点观察（判断 + 证据链接 + 适用范围；同方向 <3 件标「观察线索」） ── */
    var obs = [];
    var scopeAll = "样本：全库 " + EV.length + " 事件（三渠道关键词/名单制采样合并，非全市场）；归一与判断均为系统分析层";
    // 注：「近 N 日本批更新清单」由上方「本次更新带」承担，此处不重复同一列表（R04 版面分工）
    var hkEvs = EVX.filter(function (x) { return /H\s*股/.test(x.title); });
    if (hkEvs.length >= 3) {
      var hkSt = {};
      hkEvs.forEach(function (x) { hkSt[x.status] = (hkSt[x.status] || 0) + 1; });
      obs.push({
        judgment: "H 股发行上市相关事件 " + hkEvs.length + " 件，占全库 " + EV.length + " 件的 " + Math.round(hkEvs.length / EV.length * 100)
          + "%（活跃推进 " + (hkSt["活跃"] || 0) + " · 已完成 " + (hkSt["完成"] || 0) + " · 已终止 " + (hkSt["终止"] || 0)
          + "）——A 股公司赴港上市是本样本期最密集的出海资本动作通道，且多数处于意向/协议早期阶段，后续进展披露密度高。",
        basis: "按事件事实标题含「H股」归并统计（分析层归并，含配售/可转债等 H 股融资形态）；状态按 status 计",
        ev: hkEvs.slice(0, 4), scope: scopeAll + "；本条的 " + hkEvs.length + " 件", clue: hkEvs.length < 3
      });
    }
    var mtCnt = countBy(function (x) { return x.mt; });
    var mtTop = Object.keys(mtCnt).sort(function (a, b) { return mtCnt[b] - mtCnt[a]; })[0];
    if (mtTop) {
      var mtEvs = EVX.filter(function (x) { return x.mt === mtTop; });
      obs.push({
        judgment: "「" + mtTop + "」类事件最多（" + mtCnt[mtTop] + " / " + EV.length + "），为本样本期出海披露的主要形态。",
        basis: "按归一事项类型计数（matter_type，分析层归一）",
        ev: mtEvs.slice(0, 4), scope: scopeAll, clue: mtCnt[mtTop] < 3
      });
    }
    var ctyCnt = {};
    EVX.forEach(function (x) { ctyCnt[x.country] = (ctyCnt[x.country] || 0) + 1; });
    var ctyTop = Object.keys(ctyCnt).filter(function (c) { return c !== "未披露"; }).sort(function (a, b) { return ctyCnt[b] - ctyCnt[a]; })[0];
    if (ctyTop) {
      obs.push({
        judgment: "目的地集中于「" + ctyTop + "」（" + ctyCnt[ctyTop] + " / " + EV.length + " 事件）。",
        basis: "取 geo 文本首个非「中国」的国家/地区归一计数；多国事项计入首列国",
        ev: EVX.filter(function (x) { return x.country === ctyTop; }).slice(0, 4), scope: scopeAll, clue: ctyCnt[ctyTop] < 3
      });
    }
    var term = EVX.filter(function (x) { return x.status === "终止"; });
    if (term.length) {
      obs.push({
        judgment: "有 " + term.length + " 件事件已终止/撤回，提示出海事项存在中途退出的实态，立项判断需计入终止概率。",
        basis: "按事件 status=终止 计数",
        ev: term.slice(0, 4), scope: scopeAll, clue: term.length < 3
      });
    }
    if (obs.length) {
      h += '<div class="panel"><div class="panel-h"><h2>重点观察</h2><span class="note">判断 + 证据 + 适用范围，均为系统分析层；同方向事件不足 3 件时标「观察线索」，不称趋势</span></div><div class="panel-b">'
        + obs.slice(0, 5).map(function (o) {
          return '<div class="sec"><span class="sk">' + layerBadge("analysis") + " " + pill(o.clue ? "观察线索" : "重点观察", o.clue ? "warn" : "blue")
            + ' <span class="dim">依据：' + esc(o.basis) + '</span></span>'
            + esc(o.judgment)
            + '<br/><span style="font-size:12.5px">证据：' + o.ev.map(function (x) { return '<a href="#/event/' + x.id + '">' + esc(x.id) + "</a>"; }).join(" · ") + "</span>"
            + '<br/><span class="dim" style="font-size:12px">适用范围：' + esc(o.scope) + "</span></div>";
        }).join("") + "</div></div>";
    }

    /* ── ④ 关键数据（每个数字带口径行） ── */
    var funnel = lb.per_source ? Object.keys(lb.per_source).map(function (k) {
      var p = lb.per_source[k]; return k.replace(/·.*/, "") + " 扫" + p.scanned + "/收" + p.kept;
    }).join("；") : "—";
    h += '<div class="statstrip">'
      + statCard(D.length, "收录披露", "三渠道累计入库，截至最新批次")
      + statCard(EV.length, "事件", "多源/多公告合并后，截至最新批次")
      + statCard(EVX.length ? unique(EVX.map(function (x) { return x.subject; })).length : 0, "跟踪主体", "有出海实质动作披露的主体数")
      + statCard(recent7, "近7日有更新事件", "窗口 " + (d7 || "—") + " ~ " + maxDate + "（含两端共 7 日），按事件最新来源日期")
      + statCard(lb.kept != null ? lb.kept : "—", "最新日批次收录（披露条数）", esc(lb.id || "—") + (lb.runs > 1 ? "（" + lb.runs + " 轮合并）" : "") + "；事件层去重后新增见上方更新带")
      + "</div>";
    h += '<div class="note" style="margin:-10px 0 20px">口径：最新日批次扫描漏斗（' + esc(lb.id || "—") + " · " + esc(lb.time || "—") + "）：" + esc(funnel) + "；金额保留原文币种，未做汇率换算。</div>";

    /* ── ⑤ 持续跟踪（跟踪点按临近期限排序；与更新带/观察不重复同一列表） ── */
    var refD = syncDate();
    var nodes = [];
    EVX.forEach(function (x) {
      if (x.status !== "活跃") return;
      (x.e.watch_points || []).forEach(function (w) {
        var dl = parseDeadline(w.text);
        nodes.push({ x: x, w: w, dl: dl, past: !!(dl && refD && dl < refD) });
      });
    });
    nodes.sort(function (a, b) {
      var ra = a.dl ? (a.past ? 1 : 0) : 2, rb = b.dl ? (b.past ? 1 : 0) : 2;
      if (ra !== rb) return ra - rb;
      if (a.dl && b.dl) return a.past ? (a.dl > b.dl ? -1 : 1) : (a.dl < b.dl ? -1 : 1);
      return a.x.date < b.x.date ? 1 : -1;
    });
    var pastN = nodes.filter(function (n) { return n.past; }).length;
    h += '<div class="panel"><div class="panel-h"><h2>持续跟踪</h2><span class="note">活跃事件跟踪点 ' + nodes.length + " 条；期限自跟踪点文本解析（「2025年度」等会计期间不作期限；无明确日期的列后），按临近排序"
      + (pastN ? "；早于数据日 " + refD + " 的 " + pastN + " 条标「已过」列于临近节点之后" : "")
      + "；节点为系统分析</span></div><div class='panel-b'>"
      + (nodes.length ? nodes.slice(0, 10).map(function (n) {
        return '<div class="ev"><span class="pg">' + (n.past ? "已过 " : "") + esc(n.dl || "无期限") + '</span><span><a href="#/event/' + n.x.id + '">' + esc(n.x.title) + "</a>"
          + '<br/><span class="dim" style="font-size:12px">' + esc((n.w.text || "").slice(0, 76)) + ((n.w.text || "").length > 76 ? "…" : "") + "</span></span></div>";
      }).join("") : '<div class="empty">当前无活跃事件跟踪点</div>') + "</div></div>";

    /* ── ⑥ 入口 ── */
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

  /* ═════════ 事件库：卡片 / 表格（自定义列+导出） / 时间线 / 港股名单，筛选入 URL ═════════ */
  // 表格自定义列（借鉴投行天下 /ipo-review/a-stock：自定义列 + 导出当前筛选全部结果）
  var EV_COLS = [
    ["date", "最近更新"], ["firstDate", "首次披露"], ["title", "事件"], ["subject", "发行人"],
    ["country", "国家/地区"], ["mt", "事项"], ["stage", "阶段"], ["amt", "金额/规模"],
    ["cur", "币种"], ["issues", "议题码"], ["chans", "渠道"], ["status", "状态"], ["ut", "更新类型"]
  ];
  var EV_COLS_DEFAULT = ["date", "title", "subject", "country", "mt", "stage", "amt", "status", "ut"];
  var F = { q: "", ch: "全部", mt: "全部", stage: "全部", geo: "全部", country: "全部", ut: "全部", status: "全部",
            cur: "全部", amtmin: "", amtmax: "", dfrom: "", dto: "", issue: "全部",
            view: "cards", mode: "month", cols: EV_COLS_DEFAULT.slice() };
  function evFiltered() {
    var q = F.q.trim().toLowerCase();
    var amin = parseFloat(F.amtmin), amax = parseFloat(F.amtmax);
    return EVX.filter(function (x) {
      if (F.ch !== "全部" && x.chans.indexOf(F.ch) < 0) return false;
      if (F.issue !== "全部" && !evMatchIssue(x.e, F.issue)) return false;
      if (F.mt !== "全部" && x.mt !== F.mt) return false;
      if (F.stage !== "全部" && x.stage !== F.stage) return false;
      if (F.geo !== "全部" && (x.geo || "").indexOf(F.geo) < 0) return false;
      if (F.country !== "全部" && x.country !== F.country) return false;
      if (F.ut !== "全部" && x.ut !== F.ut) return false;
      if (F.status !== "全部" && x.status !== F.status) return false;
      if (F.cur !== "全部" && x.cur !== F.cur) return false;
      if (!isNaN(amin) || !isNaN(amax)) {
        // 金额区间：按原文币种数值（折算为亿）比较；未披露金额/非金额规模不入选
        if (x.amtVal == null) return false;
        if (!isNaN(amin) && x.amtVal < amin) return false;
        if (!isNaN(amax) && x.amtVal > amax) return false;
      }
      if (F.dfrom && x.date < F.dfrom) return false;
      if (F.dto && x.date > F.dto) return false;
      if (q && (x.title + " " + x.subject + " " + (x.geo || "") + " " + x.id).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
  }
  function evSyncURL() {
    var p = [];
    if (F.view !== "cards") p.push("view=" + F.view);
    if (F.mode !== "month") p.push("mode=" + F.mode);
    ["q", "ch", "mt", "stage", "geo", "country", "ut", "status", "cur", "amtmin", "amtmax", "dfrom", "dto", "issue"].forEach(function (k) {
      if (F[k] && F[k] !== "全部") p.push(k + "=" + encodeURIComponent(F[k]));
    });
    if (F.cols.join(",") !== EV_COLS_DEFAULT.join(",")) p.push("cols=" + F.cols.join(","));
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
  // 单元格取值：未取得字段显示「暂未取得」（R07）；title/subject 必有
  function evCell(x, key) {
    switch (key) {
      case "date": return '<td class="mono">' + esc(x.date || "暂未取得") + "</td>";
      case "firstDate": return '<td class="mono">' + esc(x.firstDate || "暂未取得") + "</td>";
      case "title": return "<td><b>" + esc(x.title) + "</b></td>";
      case "subject": return "<td>" + esc(shortCo(x.subject)) + "</td>";
      case "country": return "<td>" + (x.country === "未披露" ? '<span class="na">【未披露】</span>' : esc(x.country)) + "</td>";
      case "mt": return "<td>" + (x.mt ? pill(x.mt) : '<span class="na">暂未取得</span>') + "</td>";
      case "stage": return "<td>" + esc(x.stage || "暂未取得") + "</td>";
      case "amt": return '<td class="money">' + (x.amt ? esc(x.amt) : '<span class="na">【未披露】</span>') + "</td>";
      case "cur": return "<td>" + (x.cur ? esc(x.cur) : '<span class="na">暂未取得</span>') + "</td>";
      case "issues": return "<td>" + (evIssues(x.e).map(function (c) { return pill(c, "blue"); }).join(" ") || '<span class="na">暂未取得</span>') + "</td>";
      case "chans": return "<td>" + x.chans.map(function (c) { return (CH_META[c] ? '<span class="chtag ' + CH_META[c].cls + '">' + CH_META[c].short + "</span>" : esc(c)); }).join(" ") + "</td>";
      case "status": return "<td>" + esc(x.status) + "</td>";
      case "ut": return "<td>" + pill(x.ut, x.ut === "进展" ? "blue" : x.ut === "修正" ? "warn" : "") + "</td>";
    }
    return "<td></td>";
  }
  // 导出当前筛选的全部结果 CSV（列=当前自定义列；带 BOM 供 Excel；本机生成不经服务器）
  function evExportCSV() {
    var rows = evFiltered();
    var cols = F.cols.filter(function (c) { return EV_COLS.some(function (d) { return d[0] === c; }); });
    var head = cols.map(function (c) { return EV_COLS.filter(function (d) { return d[0] === c; })[0][1]; });
    function txt(x, key) {
      switch (key) {
        case "date": return x.date || "暂未取得";
        case "firstDate": return x.firstDate || "暂未取得";
        case "title": return x.title;
        case "subject": return x.subject;
        case "country": return x.country === "未披露" ? "【未披露】" : x.country;
        case "mt": return x.mt || "暂未取得";
        case "stage": return x.stage || "暂未取得";
        case "amt": return x.amt || "【未披露】";
        case "cur": return x.cur || "暂未取得";
        case "issues": return evIssues(x.e).join(" ") || "暂未取得";
        case "chans": return x.chans.join(" ");
        case "status": return x.status;
        case "ut": return x.ut;
      }
      return "";
    }
    function csvCell(v) { v = String(v == null ? "" : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
    var lines = [head.map(csvCell).join(",")].concat(rows.map(function (x) {
      return cols.map(function (c) { return csvCell(txt(x, c)); }).join(",");
    }));
    var blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "pubx-events-" + rows.length + "rows-" + ((DB.build && DB.build.batch) || "snap") + ".csv";
    a.click();
  }
  function vEvents() {
    var h = '<div class="ph"><h1>事件库</h1><span class="sub">本页回答：最近有哪些出海实质动作，按渠道/类型/阶段/国家/更新类型/状态筛选</span>'
      + '<span class="right">' + pill("合并自：信息流 / 披露总表 / 港股跟踪 / 项目·生命周期·日历", "") + "</span></div>";
    h += '<div class="panel"><div class="filterbar">'
      + '<input class="finput" id="evq" placeholder="搜索主体 / 事件 / 国家…" value="' + esc(F.q) + '"/>'
      + '<select class="fsel" id="evch">' + optList(["全部", "A股·巨潮", "港股·披露易", "美股·EDGAR"], F.ch, (function () { var m = {}; EVX.forEach(function (x) { x.chans.forEach(function (c) { m[c] = (m[c] || 0) + 1; }); }); return m; })()) + "</select>"
      + '<select class="fsel" id="evmt">' + optList(["全部", "设厂", "并购", "合资", "销售", "融资", "退出", "诉讼", "监管"], F.mt, countBy(function (x) { return x.mt; })) + "</select>"
      + '<select class="fsel" id="evstage">' + optList(unique(["全部"].concat(EV.map(function (e) { return e.stage_current; }))), F.stage, countBy(function (x) { return x.stage; })) + "</select>"
      + '<select class="fsel" id="evcountry">' + optList(["全部"].concat(unique(EVX.map(function (x) { return x.country; })).sort()), F.country, countBy(function (x) { return x.country; })) + "</select>"
      + '<select class="fsel" id="evut">' + optList(["全部", "新增", "进展", "修正"], F.ut, countBy(function (x) { return x.ut; })) + "</select>"
      + '<select class="fsel" id="evst">' + optList(["全部", "活跃", "完成", "终止"], F.status, countBy(function (x) { return x.status; })) + "</select>"
      + '<select class="fsel" id="evissue" title="法律议题码（与议题库同一判定）">'
      + (function () {
        var opts = [["全部", "议题码·全部"]];
        TAX.forEach(function (fl) {
          opts.push([fl.code, fl.code + " " + fl.name]);
          fl.sub.forEach(function (s) { opts.push([s[0], "　" + s[0] + " " + s[1]]); });
        });
        var cnt = {}; opts.forEach(function (o) { if (o[0] !== "全部") cnt[o[0]] = EVX.filter(function (x) { return evMatchIssue(x.e, o[0]); }).length; });
        return opts.map(function (o) {
          return '<option value="' + esc(o[0]) + '"' + (o[0] === F.issue ? " selected" : "") + ">" + esc(o[1]) + (o[0] === "全部" ? "" : "（" + (cnt[o[0]] || 0) + "）") + "</option>";
        }).join("");
      })() + "</select>"
      + '<button class="btn" id="evreset">清空</button>'
      + '<span class="note" id="evcount" style="margin-left:auto"></span></div>';
    // 第二行：金额/日期区间（口径注释随控件）
    h += '<div class="filterbar" style="border-bottom:1px solid var(--line);padding-top:0">'
      + '<span class="note">金额区间（亿·原文币种）</span>'
      + '<select class="fsel" id="evcur">' + optList(["全部"].concat(unique(EVX.map(function (x) { return x.cur; })).sort()), F.cur, countBy(function (x) { return x.cur; })) + "</select>"
      + '<input class="finput" id="evmin" style="min-width:70px;width:80px" placeholder="≥" value="' + esc(F.amtmin) + '"/>'
      + '<input class="finput" id="evmax" style="min-width:70px;width:80px" placeholder="≤" value="' + esc(F.amtmax) + '"/>'
      + '<span class="note">最近更新日期</span>'
      + '<input class="finput" id="evfrom" style="min-width:120px" type="date" value="' + esc(F.dfrom) + '"/>'
      + '<input class="finput" id="evto" style="min-width:120px" type="date" value="' + esc(F.dto) + '"/>'
      + '<span class="note">金额按原文币种折算为亿比较，不跨币种合计；未披露金额的事件在设区间时不入选</span></div>';
    h += '<div class="subnav wrap" style="padding:8px 24px 0;border-bottom:1px solid var(--line)">'
      + [["cards", "卡片"], ["table", "表格"], ["timeline", "时间线"], ["hk", "港股名单"]].map(function (x) {
        return '<a href="javascript:;" data-evview="' + x[0] + '"' + (F.view === x[0] ? ' class="on"' : "") + ">" + x[1] + "</a>";
      }).join("")
      + (F.view === "timeline" ? '<span style="margin-left:auto;display:flex;gap:2px">'
        + [["month", "按月"], ["stage", "按阶段"]].map(function (x) {
          return '<a href="javascript:;" data-evmode="' + x[0] + '"' + (F.mode === x[0] ? ' class="on"' : "") + ">" + x[1] + "</a>";
        }).join("") + "</span>" : "")
      + (F.view === "table" ? '<span style="margin-left:auto;display:flex;gap:8px;align-items:center">'
        + '<a href="javascript:;" id="evcolbtn">自定义列（' + F.cols.length + "）</a>"
        + '<a href="javascript:;" id="evcsv"><b>导出 CSV（全部筛选结果）</b></a></span>' : "")
      + "</div>";
    h += '<div class="panel-b" id="evrows"></div></div>';
    return h;
  }
  function evRows() {
    var rows = evFiltered();
    var cnt = $("evcount"); if (cnt) cnt.textContent = "显示 " + rows.length + " / " + EVX.length
      + (F.issue !== "全部" ? " · 议题码「" + F.issue + "」（与议题库同一判定函数）" : "")
      + (F.geo !== "全部" ? " · 地区文本筛选「" + F.geo + "」（跨页链接带入，清空可解除）" : "");
    var box = $("evrows"); if (!box) return;
    if (F.view === "table") {
      box.innerHTML = '<div class="tbl-wrap"><table class="tbl"><thead><tr>'
        + F.cols.map(function (c) { return "<th>" + esc(EV_COLS.filter(function (d) { return d[0] === c; })[0][1]) + "</th>"; }).join("")
        + '</tr></thead><tbody>'
        + rows.map(function (x) {
          return '<tr class="click" data-href="#/event/' + x.id + '">'
            + F.cols.map(function (c) { return evCell(x, c); }).join("") + "</tr>";
        }).join("") + "</tbody></table></div>"
        + '<div class="secnote">表格可横向滚动；导出 CSV 含当前筛选的全部 ' + rows.length + " 行（非仅本页），列=当前自定义列。</div>";
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
    [["evch", "ch"], ["evmt", "mt"], ["evstage", "stage"], ["evcountry", "country"], ["evut", "ut"], ["evst", "status"], ["evcur", "cur"], ["evissue", "issue"]].forEach(function (x) {
      $(x[0]).addEventListener("change", function (e) { F[x[1]] = e.target.value; evSyncURL(); evRows(); });
    });
    [["evmin", "amtmin"], ["evmax", "amtmax"], ["evfrom", "dfrom"], ["evto", "dto"]].forEach(function (x) {
      $(x[0]).addEventListener("change", function (e) { F[x[1]] = e.target.value; evSyncURL(); evRows(); });
    });
    $("evreset").addEventListener("click", function () {
      F = { q: "", ch: "全部", mt: "全部", stage: "全部", geo: "全部", country: "全部", ut: "全部", status: "全部",
            cur: "全部", amtmin: "", amtmax: "", dfrom: "", dto: "", issue: "全部", view: F.view, mode: F.mode, cols: EV_COLS_DEFAULT.slice() };
      view.innerHTML = vEvents(); bindEvents(); evRows(); evSyncURL();
    });
    document.querySelectorAll("[data-evview]").forEach(function (a) {
      a.addEventListener("click", function () { F.view = a.getAttribute("data-evview"); view.innerHTML = vEvents(); bindEvents(); evRows(); evSyncURL(); });
    });
    document.querySelectorAll("[data-evmode]").forEach(function (a) {
      a.addEventListener("click", function () { F.mode = a.getAttribute("data-evmode"); view.innerHTML = vEvents(); bindEvents(); evRows(); evSyncURL(); });
    });
    var csvBtn = $("evcsv");
    if (csvBtn) csvBtn.addEventListener("click", evExportCSV);
    var colBtn = $("evcolbtn");
    if (colBtn) colBtn.addEventListener("click", function () {
      var box = $("evrows");
      var panel = document.createElement("div");
      panel.id = "evcolpick";
      panel.style.cssText = "border:1px dashed var(--line-2);border-radius:8px;padding:10px 14px;margin-bottom:12px;display:flex;gap:12px;flex-wrap:wrap";
      panel.innerHTML = '<span class="note" style="width:100%">勾选表格列（即时生效，随 URL 参数 cols 可分享）：</span>'
        + EV_COLS.map(function (c) {
          return '<label class="fchk"><input type="checkbox" data-col="' + c[0] + '"' + (F.cols.indexOf(c[0]) >= 0 ? " checked" : "") + "/>" + esc(c[1]) + "</label>";
        }).join("");
      box.parentNode.insertBefore(panel, box);
      colBtn.style.pointerEvents = "none";
      panel.querySelectorAll("[data-col]").forEach(function (cb) {
        cb.addEventListener("change", function () {
          F.cols = EV_COLS.filter(function (c) { return panel.querySelector('[data-col="' + c[0] + '"]').checked; }).map(function (c) { return c[0]; });
          if (!F.cols.length) F.cols = ["title"];
          evRows(); evSyncURL();
        });
      });
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
      + (e.geo && e.geo.text ? pill(e.geo.text.length > 36 ? e.geo.text.slice(0, 36) + "…" : e.geo.text) : "") + favBtn("event", e.event_id) + "</div>"
      + '<div style="margin-top:8px;font-size:12.5px;display:flex;gap:16px;flex-wrap:wrap">'
      + '<span class="dim">更新日期 ' + esc((e.changelog && e.changelog.length ? e.changelog[e.changelog.length - 1].date : (latest ? latest.date : "—"))) + "</span>"
      + (latest ? '<a href="' + esc(latest.url) + '#page=1" target="_blank" rel="noopener">查看原文（' + esc(latest.channel || "") + " " + esc(latest.date) + "）↗</a>" : "")
      + "</div>"
      + '<div class="note" style="margin-top:10px">' + layerBadge(e.title_fact ? e.title_fact.layer : "analysis")
      + (e.title_fact && e.title_fact.basis ? " 依据：" + esc(e.title_fact.basis) : "") + "</div>"
      + '<div class="note" style="margin-top:4px">三分层 ' + layerBadge("disclosed") + " 公司披露（附原文出处）　" + layerBadge("external") + " 外部事实（附来源）　" + layerBadge("analysis") + " 系统分析（附依据）；原文未载明一律写【未披露】，不推测</div></div>";

    /* R05 固定 11 节（李成式逐题拆解；对齐 docs/schema.md §(b)/(e) 红隼样板） */
    var srcById = {};
    e.sources.forEach(function (s) { srcById[s.doc_id] = s; });
    function evHtml(ev) {
      if (!ev || !ev.quote) return "";
      var s = srcById[ev.doc_id];
      var pg = "P" + (ev.page || "?");
      var ln = s && s.url ? '<a href="' + esc(s.url) + "#page=" + (ev.page || 1) + '" target="_blank" rel="noopener">' + pg + " ↗</a>" : pg;
      return '<div class="dim" style="font-size:12px">证据：「' + esc(ev.quote) + "」 " + esc(ev.doc_id || "") + " " + ln + "</div>";
    }
    function anaItem(x) {
      return '<div class="sec">' + layerBadge(x.layer || "analysis")
        + (x.basis ? ' <span class="dim">依据：' + esc(x.basis) + "</span>" : "")
        + "<br/>" + esc(x.text || "") + evHtml(x.evidence) + "</div>";
    }
    var TERMS_ROWS = [["payment", "价款与支付"], ["conditions_precedent", "先决条件"], ["approvals", "审批 / 备案"],
      ["contingent", "或有对价"], ["completion_adjustment", "完成调整"], ["deposit", "定金 / 预付"],
      ["long_stop_date", "长停止日"], ["breach", "违约与终止"], ["reps_warranties", "陈述与保证"],
      ["transition", "过渡期安排"], ["tax", "税费"], ["dispute_resolution", "争议解决"]];

    var main = '<div class="panel"><div class="sech"><span class="sno">①</span><h2>主体及关系</h2></div><div style="padding:4px 24px 16px">'
      + e.parties.map(function (p) {
        return '<div class="sec"><span class="sk">' + esc(p.role) + " " + layerBadge(p.layer || "disclosed") + '</span>' + esc(p.name)
          + (p.relation_to_listed ? ' <span class="dim">（' + esc(p.relation_to_listed) + "）</span>" : "")
          + (p.stake_pct != null ? ' <span class="dim">持股 ' + esc(String(p.stake_pct)) + (typeof p.stake_pct === "number" ? "%" : "") + "</span>" : "")
          + (p.basis ? ' <span class="dim">（' + esc(p.basis) + "）</span>" : "") + evHtml(p.evidence) + "</div>";
      }).join("")
      + (e.holding_chain && e.holding_chain.text ? '<div class="sec"><span class="sk">持股链 ' + layerBadge(e.holding_chain.layer || "disclosed") + "</span>"
        + esc(e.holding_chain.text) + (e.holding_chain.basis ? ' <span class="dim">（' + esc(e.holding_chain.basis) + "）</span>" : "") + evHtml(e.holding_chain.evidence) + "</div>" : "")
      + "</div></div>";

    main += '<div class="panel"><div class="sech"><span class="sno">②</span><h2>地点</h2></div><div class="kv">'
      + '<div class="dl"><span class="k">国家 / 地区</span><span class="v">' + na(e.geo && e.geo.text) + (e.geo ? " " + layerBadge(e.geo.layer || "disclosed") : "") + evHtml(e.geo && e.geo.evidence) + "</span></div></div></div>";

    // 双层分类（Vault 做法）：原文类别逐源保留（disclosed），归一事项类型仅作分析产物
    var rawCats = [];
    e.sources.forEach(function (s) {
      for (var di = 0; di < D.length; di++) {
        if (D[di]._aid === s.doc_id) { var rc = D[di]["公告类型"]; if (rc && rawCats.indexOf(rc) < 0) rawCats.push(rc); break; }
      }
    });

    main += '<div class="panel"><div class="sech"><span class="sno">③</span><h2>事项与阶段链</h2><span class="note">'
      + (e.matter_type ? esc(e.matter_type.value) + " " : "") + '当前阶段：' + esc(e.stage_current || "unknown") + '</span></div>'
      + '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>日期</th><th>阶段</th><th>事实</th><th>出处</th></tr></thead><tbody>'
      + e.stage_chain.map(function (c) {
        var doc = srcById[c.doc_id];
        return "<tr><td class='mono'>" + esc(c.date || "—") + "</td><td>" + pill(c.stage || "—", "blue") + "</td>"
          + "<td style='font-size:12.5px'>" + esc(c.note || "") + " " + layerBadge(c.layer || "disclosed") + evHtml(c.evidence) + "</td>"
          + "<td style='font-size:12px'>" + (doc ? '<a href="' + esc(doc.url) + '" target="_blank" rel="noopener">' + esc((doc.file || c.doc_id).slice(0, 34)) + " ↗</a>" : esc(c.doc_id || "—")) + "</td></tr>";
      }).join("") + "</tbody></table></div>"
      + '<div class="secnote" style="border-top:1px dashed var(--line)">原文类别 ' + layerBadge("disclosed") + "：" + (rawCats.length ? rawCats.map(function (r) { return esc(r); }).join("；") : "—（披露表未留原文分类）")
      + "<br/>归一事项类型 " + layerBadge("analysis") + "：" + (e.matter_type ? esc(e.matter_type.value) + (e.matter_type.basis ? '（依据：' + esc(e.matter_type.basis) + "）" : "") : "未归类") + "；归一映射只作分析产物，不回写原文分类</div></div>";

    main += '<div class="panel"><div class="sech"><span class="sno">④</span><h2>规模与资金</h2></div><div style="padding:4px 24px 16px">'
      + '<div class="sec" style="border:none"><span class="sk">金额 / 规模 ' + (e.scale ? layerBadge(e.scale.layer || "disclosed") : "") + (e.scale && e.scale.basis ? ' <span class="dim">' + esc(e.scale.basis) + "</span>" : "") + '</span>'
      + (e.scale && e.scale.text ? esc(e.scale.text) + evHtml(e.scale.evidence) : '<span class="na">【未披露】</span>') + "</div></div></div>";

    main += '<div class="panel"><div class="sech"><span class="sno">⑤</span><h2>交易条款</h2>'
      + (e.terms && !Array.isArray(e.terms) && e.terms.completeness ? '<span class="note">条款完整性 ' + layerBadge("analysis") + "：" + esc(e.terms.completeness) + (e.terms.completeness_basis ? "（" + esc(e.terms.completeness_basis) + "）" : "") + "</span>" : "")
      + '</div><div style="padding:4px 24px 16px">'
      + (function () {
        var t = e.terms;
        if (!t) return '<div class="na">【未披露】</div>';
        if (Array.isArray(t)) {  // 旧形态兼容（未重抽事件）
          return t.map(function (x) { return '<div class="sec">' + layerBadge(x.layer) + " " + esc(x.text) + (x.basis ? ' <span class="dim">（' + esc(x.basis) + "）</span>" : "") + "</div>"; }).join("");
        }
        return '<div class="tbl-wrap"><table class="tbl"><tbody>'
          + TERMS_ROWS.map(function (r) {
            var f = (t.fields || {})[r[0]] || {};
            var v = f.value;
            var cell = v == null ? '<span class="na">【未披露】</span>'
              : (v === "unknown" ? '<span class="na">unknown（尚未核查）</span>' : esc(v) + evHtml(f.evidence));
            return "<tr><td style='white-space:nowrap;font-size:12.5px;color:var(--ink-3)'>" + r[1] + "</td><td style='font-size:13px'>" + cell + "</td></tr>";
          }).join("") + "</tbody></table></div>";
      })() + "</div></div>";

    // ⑥ 法律问题总表（R06）：I1–I13 全覆盖，触发列明细，未触发列「—」+理由，保证覆盖完整
    main += '<div class="panel"><div class="sech"><span class="sno">⑥</span><h2>法律问题总表</h2><span class="note">'
      + "覆盖全部 13 个一级议题：触发点逐条挂二级码（docs/schema.md §c / state/issues_taxonomy.json）；未触发议题列「—」并给理由，不代表无合规义务"
      + '</span></div>'
      + (function () {
        var trs = e.legal_triggers || [];
        if (!TAX.length) {  // 编码表缺失时退回旧渲染
          return trs.length
            ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>议题</th><th>触发事实</th><th>状态</th><th>层</th></tr></thead><tbody>'
              + trs.map(function (a) {
                return "<tr><td style='white-space:nowrap'>" + pill(trigCode(a) || "—", "blue") + "</td>"
                  + "<td style='font-size:12.5px'>" + esc(a.text || "") + "</td><td>" + esc(TR_STATUS[a.status] || a.status || "—") + "</td><td>" + layerBadge(a.layer) + "</td></tr>";
              }).join("") + "</tbody></table></div>"
            : '<div style="padding:4px 24px 16px"><div class="na">入库分析未识别到具体触发点；不代表无合规义务</div></div>';
        }
        var byFl = {};
        trs.forEach(function (t) { var c = trigCode(t); var fc = c ? c.split(".")[0] : "I0"; (byFl[fc] = byFl[fc] || []).push(t); });
        return '<div class="tbl-wrap"><table class="tbl"><thead><tr><th style="width:200px">议题（一级）</th><th>触发点明细（二级码 / 触发事实 / 状态 / 层 / 依据）</th></tr></thead><tbody>'
          + TAX.map(function (fl) {
            var list = byFl[fl.code] || [];
            var cell = list.length
              ? list.map(function (a) {
                return '<div style="padding:3px 0;border-bottom:1px dashed var(--line)">' + pill(a.issue_code || "—", "blue") + " "
                  + '<span style="font-size:12.5px">' + esc(a.trigger_fact || a.text || "") + "</span> "
                  + trPill(a)
                  + " " + layerBadge(a.layer)
                  + (a.basis ? '<div class="dim" style="font-size:12px">依据：' + esc(a.basis) + "</div>" : "") + evHtml(a.evidence) + "</div>";
              }).join("")
              : '<span class="dim">— ' + esc(fl.na_reason || "已核事实未涉及本议题要素") + "</span>";
            return "<tr><td style='font-size:12.5px'><b>" + esc(fl.code) + "</b> " + esc(fl.name) + "</td><td>" + cell + "</td></tr>";
          }).join("")
          + "</tbody></table></div>"
          + ((byFl.I0 || []).length ? '<div class="secnote">未归码触发点（待人工核定）：' + byFl.I0.map(function (a) { return "「" + esc(a.text || "") + "」"; }).join(" ") + "</div>" : "")
          + ((e.legal_notes_unmapped || []).length ? '<div class="secnote">旧轮分析文本未归码片段（保留待人工核定，' + e.legal_notes_unmapped.length + " 片）："
            + e.legal_notes_unmapped.map(function (u) { return "「" + esc(u.text) + "」"; }).join(" ") + "</div>" : "")
          + '<div class="secnote">归码口径 ' + layerBadge("analysis") + '：scripts/legal_map.py 确定性规则生成；状态四态：已披露·已通过（原文有完成类措辞） / 已披露·未完成（含进行中、尚需取得——含原文将批准列为先决条件但结果未逐项确认的情形） / 未披露 / 不适用；原文未载审批字样的不写「已审批」；原始分类行标「原文事实·无审批状态」。横向比较见 <a href="#/issues">法律议题库</a>。</div>';
      })() + "</div>";

    main += '<div class="panel"><div class="sech"><span class="sno">⑦</span><h2>影响</h2></div><div style="padding:4px 24px 16px">'
      + (e.impact && e.impact.length ? e.impact.map(anaItem).join("") : '<div class="na">入库分析未标注影响</div>') + "</div></div>";

    main += '<div class="panel"><div class="sech"><span class="sno">⑧</span><h2>跟踪点</h2></div><div style="padding:4px 24px 16px">'
      + (e.watch_points && e.watch_points.length ? e.watch_points.map(anaItem).join("") : '<div class="na">入库分析未标注跟踪点</div>') + "</div></div>";

    main += '<div class="panel"><div class="sech"><span class="sno">⑨</span><h2>信息缺口</h2><span class="note">原文未披露：缺什么 / 为何重要 / 去哪找</span></div>'
      + (e.gaps && e.gaps.length
        ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>缺口</th><th>为何重要</th><th>去哪找</th></tr></thead><tbody>'
          + e.gaps.map(function (g) {
            if (g.item != null) {
              return "<tr><td style='font-size:12.5px'>" + esc(g.item) + "</td><td style='font-size:12.5px'>" + esc(g.why || "—") + "</td><td style='font-size:12.5px'>" + esc(g.where || "—") + "</td></tr>";
            }
            return "<tr><td colspan='3' style='font-size:12.5px'>" + layerBadge(g.layer || "analysis") + " " + esc(g.text || "") + (g.basis ? ' <span class="dim">（' + esc(g.basis) + "）</span>" : "") + "</td></tr>";
          }).join("") + "</tbody></table></div>"
        : '<div style="padding:4px 24px 16px"><div class="na">无记录</div>') + "</div>";

    main += '<div class="panel"><div class="sech"><span class="sno">⑩</span><h2>执业提示</h2><span class="note">写给办同类交易的法务：可迁移的核查动作</span></div><div style="padding:4px 24px 16px">'
      + (e.practice_notes && e.practice_notes.length ? e.practice_notes.map(anaItem).join("") : '<div class="na">入库分析未填写</div>') + "</div></div>";

    main += '<div class="panel"><div class="sech"><span class="sno">⑪</span><h2>来源</h2><span class="note">' + e.sources.length + " 份披露文件；引文链接带 #page 可定位原文页</span></div>"
      + '<div class="evlist">' + e.sources.map(function (s) {
        return '<div class="ev"><span class="pg">' + esc(s.date) + '</span><span class="qt">'
          + chTag({ "渠道": s.channel }) + " <b>" + esc(s.file) + '</b>　<a href="' + esc(s.url) + '#page=1" target="_blank" rel="noopener">原文 ↗</a>'
          + (s.new_info ? '<div class="dim" style="font-size:12px;margin-top:2px">本来源新增信息：' + esc(s.new_info) + "</div>" : "")
          + (s.quotes || []).map(function (q) {
            return '<div class="evi"><div class="qt">「' + esc(q.text) + '」</div><div class="ops"><a href="' + esc(s.url) + "#page=" + (q.page || 1) + '" target="_blank" rel="noopener">定位 P' + (q.page || "?") + " ↗</a><button data-copy='" + esc(q.text) + "'>复制引文</button></div></div>";
          }).join("") + "</span></div>";
      }).join("") + "</div>"
      + (e.source_diff ? '<div class="secnote" style="border-top:1px solid var(--line)">跨来源口径差异 ' + layerBadge(e.source_diff.layer || "analysis") + "：" + esc(e.source_diff.text) + (e.source_diff.basis ? '（依据：' + esc(e.source_diff.basis) + "）" : "") + "</div>"
        : e.sources.length === 1 ? '<div class="secnote" style="border-top:1px solid var(--line)">单一来源事件：无第二来源可供口径比对；同主体其他披露见右侧「同主体其他事件」。</div>' : "")
      + "</div>";

    main += '<div class="panel"><div class="sech"><h2>更新记录</h2></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>日期</th><th>类型</th><th>来源文件</th><th>说明</th></tr></thead><tbody>'
      + e.changelog.map(function (c) {
        return '<tr><td class="mono">' + esc(c.date) + '</td><td>' + pill(c.type, c.type === "进展" ? "blue" : c.type === "修正" ? "warn" : "") + '</td>'
          + '<td style="font-size:12px">' + esc(c.doc_id) + '</td><td style="font-size:12.5px">' + esc(c.note || "") + "</td></tr>";
      }).join("") + "</tbody></table></div></div>";

    var siblings = EVX.filter(function (x) { return x.subject === e.parties[0].name && x.id !== e.event_id; });
    var rail = '<div class="rail">'
      + '<div class="panel"><div class="rail-h">关联</div><div style="padding:8px 18px 14px;font-size:13px">'
      + '<div style="padding:3px 0"><a href="#/company/' + encodeURIComponent(e.parties[0].name) + '">主体档案 →</a></div>'
      + '<div style="padding:3px 0"><a href="#/events">事件库 →</a></div>'
      + (siblings.length ? '<div style="border-top:1px dashed var(--line);margin-top:8px;padding-top:8px"><span class="dim" style="font-size:12px">同主体其他事件（' + siblings.length + '）</span>'
        + siblings.map(function (x) {
          return '<div style="padding:4px 0"><a href="#/event/' + x.id + '"><b>' + esc(x.id) + "</b> " + esc(x.title.length > 30 ? x.title.slice(0, 30) + "…" : x.title) + '</a><br/><span class="dim" style="font-size:12px">' + esc(x.date) + " · " + esc(x.stage || "—") + " · " + esc(x.status) + "</span></div>";
        }).join("") + "</div>" : "")
      + "</div></div>"
      + '<div class="panel"><div class="rail-h">个人备注（本机保存）</div><div style="padding:8px 18px 16px">'
      + '<textarea id="pnote" data-note="' + esc(e.event_id) + '" style="width:100%;min-height:80px;border:1px solid var(--line-2);border-radius:8px;padding:8px 10px;font-size:13px;font-family:inherit" placeholder="记录核验结论、待办或质疑…">' + esc(ANN.notes[e.event_id] || "") + "</textarea></div></div>"
      + "</div>";
    return h + '<div class="split"><div>' + main + "</div>" + rail + "</div>";
  }

  /* ═════════ 法律议题库：议题 → 公司 → 事件 → 出处（R06 Vault 式；编码表唯一来源 state/issues_taxonomy.json） ═════════ */
  var TAX = (DB.issues_taxonomy && DB.issues_taxonomy.first_level) || [];
  var TAX_SUB = {};   // 二级码 → {name, fc, fname}
  TAX.forEach(function (fl) { fl.sub.forEach(function (s) { TAX_SUB[s[0]] = { name: s[1], fc: fl.code, fname: fl.name }; }); });
  var HINTS = (DB.issues_taxonomy && DB.issues_taxonomy.practice_hints) || {};   // 二级码 → 执业提示（analysis 层通用核查动作）
  function trigCode(t) { return t.issue_code || t.code || null; }
  // 旧轮无码 trigger 的关键词兜底归组（仅兼容；legal_map 重跑后全部带码）
  var ISSUE_TAX = [
    ["I4", "出口管制", ["出口管制", "实体清单", "EAR", "FDPR", "两用物项"]],
    ["I5", "制裁", ["制裁", "SDN", "OFAC", "UFLPA", "强迫劳动"]],
    ["I2", "东道国投资准入", ["外资审查", "FIRB", "CFIUS", "投资准入", "矿权", "采矿权", "特许", "准入", "审批", "东道国"]],
    ["I1", "中国境内出境监管", ["ODI", "境外投资备案", "发改", "商务部", "外汇", "国资", "出境"]],
    ["I9", "劳动与ESG", ["环保", "劳工", "原住民", "工会", "ESG", "社区"]],
    ["I7", "贸易与海关", ["关税", "海关", "退税", "认证", "原产地", "反倾销"]],
    ["I6", "数据与网络", ["数据", "个人信息", "网络安全", "GDPR"]],
    ["I8", "税务", ["税务", "预提税", "常设机构", "转让定价", "税法"]],
    ["I11", "知识产权", ["知识产权", "专利", "商标", "337"]],
    ["I12", "争议与处罚", ["诉讼", "仲裁", "处罚", "整改", "争议解决"]],
    ["I3", "竞争法与交易分类", ["竞争", "经营者集中", "关联交易", "关连", "须予披露"]],
    ["I10", "交易与合同", ["或有", "对价", "先决条件", "担保", "融资", "银团", "贷款", "交割", "合同", "价款", "定金"]],
    ["I13", "信息披露与资本市场", ["披露同步", "H股", "H 股", "GDR", "两地上市", "上市规则"]]
  ];
  function issueOf(t) {
    var c = trigCode(t);
    if (c && TAX_SUB[c]) return [TAX_SUB[c].fc, TAX_SUB[c].fname];
    if (c) return [c.split(".")[0], ""];
    for (var j = 0; j < ISSUE_TAX.length; j++) {
      var kws = ISSUE_TAX[j][2];
      for (var k = 0; k < kws.length; k++) if ((t.text || "").indexOf(kws[k]) >= 0) return ISSUE_TAX[j];
    }
    return ["I0", "其他 / 未归类", []];
  }
  // 议题页/筛选共用的唯一判定：事件是否命中某议题码（一级码前缀匹配二级码）
  function evMatchIssue(e, code) {
    return (e.legal_triggers || []).some(function (t) { var c = trigCode(t); return c && (c === code || c.indexOf(code + ".") === 0); });
  }
  function srcPageLink(s) {
    if (!s || !s.url) return "";
    var pg = (s.quotes && s.quotes[0] && s.quotes[0].page) || 1;
    return '<a href="' + esc(s.url) + "#page=" + pg + '" target="_blank" rel="noopener">原文 P' + pg + " ↗</a>";
  }
  // 触发点证据定位：在事件全部来源的 quote 中与触发片段做字符级匹配，
  // 命中则链到该 quote 所在页；否则回退到首条来源（通常为主披露）首页
  function trigSrcLink(x) {
    var snip = trigFactShort(x.t).replace(/^[…\s]+|[…\s]+$/g, "");
    var core = snip.replace(/[^一-龥A-Za-z0-9]/g, "");
    var best = null, bestScore = 0;
    (x.e.sources || []).forEach(function (s) {
      (s.quotes || []).forEach(function (q) {
        var qt = (q.text || "").replace(/[^一-龥A-Za-z0-9]/g, "");
        if (!qt || !core) return;
        var score = 0;
        if (qt.indexOf(core.slice(0, 12)) >= 0 || core.indexOf(qt.slice(0, 12)) >= 0) {
          score = Math.min(core.length, qt.length) + 100;
        } else {
          for (var i = 0; i + 4 <= Math.min(core.length, 48); i += 4) {
            if (qt.indexOf(core.substr(i, 4)) >= 0) score += 4;
          }
        }
        if (score > bestScore) { bestScore = score; best = { s: s, q: q }; }
      });
    });
    if (best && bestScore >= 12) {
      var pg = best.q.page || 1;
      return '<a href="' + esc(best.s.url) + '#page=' + pg + '" target="_blank" rel="noopener">原文 P' + pg + " ↗</a>";
    }
    // 未匹配到摘录（触发点来自分析字段/审批状态表述）：只链原文首页，不断言页码
    var s0 = (x.e.sources || [])[0] || {};
    return s0.url ? '<a href="' + esc(s0.url) + '" target="_blank" rel="noopener" title="触发点未匹配到逐字摘录，链接为主披露原文首页">原文 ↗</a>' : "";
  }
  function vIssues() {
    // 聚合：事件 legal_triggers → 二级议题桶；事件数 / 触发条数双口径（Vault 做法）
    var bySub = {}, total = 0, evWith = 0, unMapped = 0, legacyNoCode = 0;
    EV.forEach(function (e) {
      var trs = e.legal_triggers || [];
      if (trs.length) evWith++;
      unMapped += (e.legal_notes_unmapped || []).length;
      trs.forEach(function (t) {
        total++;
        var c = trigCode(t);
        if (!c || !TAX_SUB[c]) { legacyNoCode++; return; }
        (bySub[c] = bySub[c] || []).push({ e: e, t: t });
      });
    });
    var lm = DB.legal_map || {};
    var h = '<div class="ph"><h1>法律议题库</h1><span class="sub">本页回答：某个法律问题在哪些公司、哪些事件中如何出现、原文处理到哪一步、证据在第几页</span></div>';
    h += '<div class="statstrip">'
      + statCard(total, "触发条数", "全部事件法律触发点合计（每事件≥1条，R06 验收口径）")
      + statCard(evWith, "涉及事件", "至少 1 条触发点；总事件 " + EV.length)
      + statCard(Object.keys(bySub).length + " / " + Object.keys(TAX_SUB).length, "有命中二级议题", "编码表 I1–I13 共 " + Object.keys(TAX_SUB).length + " 个二级码")
      + statCard(unMapped + legacyNoCode, "待人工归码", "旧轮自由文本拆片未命中编码表，保留在事件详情「法律问题总表」底部")
      + "</div>";
    h += '<div class="note" style="margin:-10px 0 16px">归码口径 ' + layerBadge("analysis")
      + "：scripts/legal_map.py 确定性规则（版本 " + esc(lm.version || "—") + "，运行于 " + esc(lm.run || "—")
      + "），每条触发点只挂一个二级码；trigger_fact 引用事件已有字段或原文摘录上下文；原文未载处理状态的一律「未披露」，不从「交割完成」倒推审批；命中自先决条件/审批字段（disclosed）的标「已披露·未完成（尚需取得）」，命中自分析文本的不据措辞推断状态。"
      + '原始分类（巨潮公告类型 / 披露易 headline / SEC 表格）逐源保留在 I3.3，标「原文事实·无审批状态」（不得读作「已通过」），与归一议题双层并存。议题数与 <a href="#/events">事件库</a>议题筛选结果一致（同一判定函数）。</div>';

    // 一级议题总览矩阵（李成工作站「总览表先行」做法：先给全覆盖索引，再展开明细）
    h += '<div class="panel"><div class="panel-h"><h2>一级议题总览</h2>'
      + '<span class="note">点击议题码直达下方明细；事件数与 <a href="#/events">事件库</a>议题筛选同口径</span></div>'
      + '<div class="tbl-wrap"><table class="tbl"><thead><tr><th style="width:90px">议题码</th><th>一级议题</th><th>事件数</th><th>触发条数</th><th>有命中二级议题</th><th></th></tr></thead><tbody>'
      + TAX.map(function (fl) {
        var flEv = {}, flN = 0, hitSub = 0;
        fl.sub.forEach(function (s) {
          var items = bySub[s[0]] || [];
          if (items.length) hitSub++;
          items.forEach(function (x) { flEv[x.e.event_id] = 1; flN++; });
        });
        return "<tr" + (flN ? "" : " style='opacity:.55'") + '><td><a href="javascript:;" onclick="document.getElementById(\'iss-' + fl.code + '\').scrollIntoView({behavior:\'smooth\'})"><b>' + esc(fl.code) + "</b></a></td>"
          + '<td style="font-size:12.5px">' + esc(fl.name) + "</td>"
          + '<td class="mono">' + Object.keys(flEv).length + '</td><td class="mono">' + flN + "</td>"
          + '<td class="mono">' + hitSub + " / " + fl.sub.length + "</td>"
          + '<td style="font-size:12px">' + (flN ? '<a href="#/events?issue=' + fl.code + '">事件库筛选 →</a>' : '<span class="dim">样本内暂无触发</span>') + "</td></tr>";
      }).join("") + "</tbody></table></div></div>";

    h += TAX.map(function (fl) {
      var flEv = {}, flN = 0;
      fl.sub.forEach(function (s) {
        (bySub[s[0]] || []).forEach(function (x) { flEv[x.e.event_id] = 1; flN++; });
      });
      return '<div class="panel" id="iss-' + esc(fl.code) + '"><div class="panel-h"><h2>' + esc(fl.code) + " " + esc(fl.name) + '</h2>'
        + '<span class="note">事件 ' + Object.keys(flEv).length + " · 触发条数 " + flN + '　<a href="#/events?issue=' + fl.code + '">事件库筛选 →</a></span>'
        + '<div class="tbl-wrap"><table class="tbl"><thead><tr><th style="width:230px">二级议题</th><th>事件数</th><th>触发条数</th><th>明细（公司 → 事件 → 原文页）</th></tr></thead><tbody>'
        + fl.sub.map(function (s) {
          var items = bySub[s[0]] || [];
          var evN = unique(items.map(function (x) { return x.e.event_id; })).length;
          var det;
          if (!items.length) {
            det = '<span class="dim">— 样本内暂无触发（口径：当前 ' + EV.length + " 事件）</span>"
              + (HINTS[s[0]] ? '<br/><span class="dim">执业提示 ' + layerBadge("analysis") + "：" + esc(HINTS[s[0]]) + "</span>" : "");
          } else {
            // 处理方式分布（四态计数）；常见触发事实（清洗包装后去重前 3）；公司→事件→原文页
            var stN = { disclosed_cleared: 0, disclosed_pending: 0, not_disclosed: 0, not_applicable: 0 };
            items.forEach(function (x) { stN[x.t.status] = (stN[x.t.status] || 0) + 1; });
            var stTxt = ["disclosed_cleared", "disclosed_pending", "not_disclosed", "not_applicable"]
              .filter(function (k) { return stN[k]; })
              .map(function (k) { return TR_STATUS[k] + " " + stN[k]; }).join(" · ");
            var facts = unique(items.map(function (x) { return trigFactShort(x.t).replace(/^…|…$/g, "").slice(0, 42); })
              .filter(Boolean)).slice(0, 3);
            var byCo = {};
            items.forEach(function (x) {
              var co = x.e.parties && x.e.parties[0] ? x.e.parties[0].name : "—";
              var evs = byCo[co] = byCo[co] || {};
              (evs[x.e.event_id] = evs[x.e.event_id] || []).push(x);   // 同事件可有多条同码触发点，全列
            });
            det = '<details id="det-' + esc(s[0]) + '"><summary>展开 ' + evN + " 事件 / " + items.length + " 条</summary>"
              + '<div class="secnote" style="border:none;padding-left:0">处理方式分布（四态口径）：' + esc(stTxt) + "<br/>"
              + "常见触发事实：" + facts.map(function (f) { return "「" + esc(f) + "…」"; }).join(" ") + "<br/>"
              + (HINTS[s[0]] ? "执业提示 " + layerBadge("analysis") + "：" + esc(HINTS[s[0]]) + "<br/>" : "")
              + "个案层提示见各事件详情 §⑩（事件级，非议题级结论）；「原文 Pn」按触发片段与来源摘录的字符级匹配定位页码</div>"
              + Object.keys(byCo).map(function (co) {
                var evs = byCo[co];
                return '<div style="padding:4px 0"><a href="#/company/' + encodeURIComponent(co) + '"><b>' + esc(shortCo(co)) + "</b></a>　"
                  + Object.keys(evs).map(function (eid) {
                    return evs[eid].map(function (x) {
                      return '<span style="display:block;margin:2px 10px 2px 0"><a href="#/event/' + eid + '">' + eid + "</a> "
                        + trPill(x.t)
                        + " " + layerBadge(x.t.layer)
                        + " " + trigSrcLink(x)
                        + '<br/><span class="dim" style="font-size:12px">' + esc(trigFactShort(x.t)) + '</span></span>';
                    }).join("");
                  }).join("") + "</div>";
              }).join("") + "</details>";
          }
          return "<tr" + (items.length ? "" : " style='opacity:.55'") + "><td style='font-size:12.5px'><b>" + esc(s[0]) + "</b> " + esc(s[1])
            + (items.length ? '<br/><a href="#/events?issue=' + s[0] + '" style="font-size:12px">事件库筛选 →</a>' : "")
            + '<br/><a href="#/issues?code=' + s[0] + '" style="font-size:11.5px" class="dim" title="本议题深链（展开并定位）"># 深链</a>' + "</td>"
            + '<td class="mono">' + evN + '</td><td class="mono">' + items.length + "</td><td style='font-size:12.5px'>" + det + "</td></tr>";
        }).join("") + "</tbody></table></div></div>";
    }).join("");
    return h;
  }

  /* ═════════ 项目看板（R07，借鉴投行天下）：阶段×国家 / 阶段×事项双矩阵含合计可穿透；KPI 注口径；节点临近；资金透视 ═════════ */
  var STAGE_ORDER = ["意向", "协议", "中标/签约", "实施", "变更", "投产/运营", "完成"];
  function vBoard() {
    var stages = unique(EV.map(function (e) { return e.stage_current; }).filter(Boolean))
      .sort(function (a, b) { var ia = STAGE_ORDER.indexOf(a), ib = STAGE_ORDER.indexOf(b); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); });
    var mts = unique(EVX.map(function (x) { return x.mt; }).filter(Boolean)).sort(function (a, b) { return countBy(function (x) { return x.mt; })[b] - countBy(function (x) { return x.mt; })[a]; });
    var ctys = unique(EVX.map(function (x) { return x.country; }).filter(function (c) { return c !== "未披露"; }))
      .sort(function (a, b) { return countBy(function (x) { return x.country; })[b] - countBy(function (x) { return x.country; })[a]; });
    var noGeo = EVX.filter(function (x) { return x.country === "未披露"; }).length;
    var inFlight = EVX.filter(function (x) { return x.status === "活跃"; });
    var done = EVX.filter(function (x) { return x.status === "完成"; });
    var term = EVX.filter(function (x) { return x.status === "终止"; });
    var lb = (DB.batches_daily || [])[0] || {};

    var h = '<div class="ph"><h1>项目看板</h1><span class="sub">本页回答：在途事件处于什么阶段、分布在哪；点击矩阵格子穿透到事件库对应筛选</span></div>';
    // KPI（每个注口径，仿投行天下注释）
    h += '<div class="statstrip">'
      + statCard(EV.length, "在库事件", "多源合并后；截至 " + esc(lb.id || "—"))
      + statCard(inFlight.length, "在途（活跃）", "status=活跃；不含完成/终止")
      + statCard(done.length, "已完成", "status=完成（交割/挂牌等）")
      + statCard(term.length, "已终止", "status=终止（撤回/终止公告）")
      + statCard(noGeo, "未披露国家", "不计入国家矩阵")
      + "</div>";

    // 矩阵渲染助手：rows=阶段, cols=国家或事项；合计行列；格子穿透 #/events?stage=..&country/mt=..
    function matrix(cols, keyFn, paramName, caliber) {
      var cell = {}, rowSum = {}, colSum = {};
      EVX.forEach(function (x) {
        var s = x.stage || "未定", m = keyFn(x);
        if (m == null) return;
        cell[s + "|" + m] = (cell[s + "|" + m] || 0) + 1;
        rowSum[s] = (rowSum[s] || 0) + 1;
        colSum[m] = (colSum[m] || 0) + 1;
      });
      var rows = stages.concat(Object.keys(rowSum).filter(function (s) { return stages.indexOf(s) < 0; }));
      var total = Object.keys(colSum).reduce(function (a, k) { return a + colSum[k]; }, 0);
      return '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>阶段 ＼ ' + esc(paramName === "country" ? "国家/地区" : "事项") + '</th>'
        + cols.map(function (m) { return "<th>" + esc(m) + "</th>"; }).join("") + "<th>合计</th></tr></thead><tbody>"
        + rows.map(function (s) {
          return "<tr><th class='rowh'>" + esc(s) + "</th>"
            + cols.map(function (m) {
              var n = cell[s + "|" + m] || 0;
              return '<td class="mono">' + (n ? '<a href="#/events?stage=' + encodeURIComponent(s) + "&" + paramName + "=" + encodeURIComponent(m) + '"><b>' + n + "</b></a>" : '<span class="dim">·</span>') + "</td>";
            }).join("")
            + '<td class="mono"><b><a href="#/events?stage=' + encodeURIComponent(s) + '">' + (rowSum[s] || 0) + "</a></b></td></tr>";
        }).join("")
        + "<tr><th class='rowh'>合计</th>" + cols.map(function (m) {
          return '<td class="mono"><b><a href="#/events?' + paramName + "=" + encodeURIComponent(m) + '">' + (colSum[m] || 0) + "</a></b></td>";
        }).join("")
        + '<td class="mono"><b>' + total + "</b></td></tr></tbody></table></div>"
        + '<div class="secnote">' + caliber + "</div>";
    }

    h += '<div class="panel"><div class="panel-h"><h2>阶段 × 国家/地区矩阵</h2><span class="note">口径：当前事件层 ' + EV.length + ' 个事件按 stage_current × 国家归一计数；国家取 geo 文本首个非「中国」的国家/地区（中国为来源地），多国事项计入首列国；合计行列与事件库筛选结果一致</span></div>'
      + matrix(ctys, function (x) { return x.country === "未披露" ? null : x.country; }, "country",
        "样本口径：仅覆盖已收录披露合并成的事件（三渠道关键词/名单制采样，非全市场）；未披露国家 " + noGeo + " 个事件不计入矩阵；不作全市场结论。") + "</div>";

    h += '<div class="panel"><div class="panel-h"><h2>阶段 × 事项类型矩阵</h2><span class="note">口径：stage_current × matter_type（归一类，分析层）计数</span></div>'
      + matrix(mts, function (x) { return x.mt; }, "mt",
        "未归类事项类型的事件不计入本矩阵；矩阵合计 = 事件库对应筛选数，可逐格点击核验。") + "</div>";

    // 节点临近表：跟踪点中有日期的按日期升序（最近的在前），早于数据日的标「已过」列后，无日期的列最后并注明
    var refD2 = syncDate();
    var nodes = [];
    EVX.forEach(function (x) {
      (x.e.watch_points || []).forEach(function (w) {
        var dl = parseDeadline(w.text);
        nodes.push({ x: x, w: w, dl: dl, past: !!(dl && refD2 && dl < refD2) });
      });
    });
    nodes.sort(function (a, b) {
      var ra = a.dl ? (a.past ? 1 : 0) : 2, rb = b.dl ? (b.past ? 1 : 0) : 2;
      if (ra !== rb) return ra - rb;
      if (a.dl && b.dl) return a.past ? (a.dl > b.dl ? -1 : 1) : (a.dl < b.dl ? -1 : 1);
      return a.x.date < b.x.date ? 1 : -1;
    });
    var pastN2 = nodes.filter(function (n) { return n.past; }).length;
    h += '<div class="panel"><div class="panel-h"><h2>节点临近表</h2><span class="note">全部事件跟踪点 ' + nodes.length + " 条；日期自跟踪点文本解析（「2025年度」等会计期间不作期限；无明确日期列后）"
      + (pastN2 ? "；早于数据日 " + refD2 + " 的 " + pastN2 + " 条标「已过」" : "")
      + "；节点为系统分析，依据见事件详情 §⑦</span></div><div class='panel-b'>"
      + '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>期限</th><th>事件</th><th>节点</th><th>来源</th></tr></thead><tbody>'
      + (nodes.length ? nodes.map(function (n) {
        return '<tr><td class="mono">' + (n.past ? "已过 " : "") + esc(n.dl || "无明确日期") + '</td>'
          + '<td style="font-size:12.5px"><a href="#/event/' + n.x.id + '">' + esc(n.x.title.slice(0, 40)) + (n.x.title.length > 40 ? "…" : "") + "</a></td>"
          + '<td style="font-size:12.5px">' + esc((n.w.text || "").slice(0, 60)) + ((n.w.text || "").length > 60 ? "…" : "") + "</td>"
          + '<td><a href="#/event/' + n.x.id + '">详情 §⑦</a></td></tr>';
      }).join("") : '<tr><td colspan="4"><div class="empty">当前无跟踪点</div></td></tr>') + "</tbody></table></div></div></div>";

    // 资金透视（R07）：按币种分列，不做跨币种合计，除非原文给出折算
    var funds = (V.funds || []);
    var byCcy = {};
    funds.forEach(function (f) {
      var k = f.ccy || "未识别";
      var yi = f.scale === "亿" ? f.num : f.scale === "万" ? f.num / 10000 : f.num / 1e8;
      (byCcy[k] = byCcy[k] || { n: 0, sum: 0 }).n++;
      byCcy[k].sum += yi;
    });
    var ccyKeys = Object.keys(byCcy).sort(function (a, b) { return byCcy[b].n - byCcy[a].n; });
    h += '<div class="panel"><div class="panel-h"><h2>资金透视</h2><span class="note">'
      + funds.length + " 条金额解析自披露原文；按币种分列，不做跨币种合计；同一公告的原币与折算人民币分别成条</span></div>"
      + '<div class="statstrip" style="margin:14px 24px 0">'
      + ccyKeys.map(function (k) {
        return statCard(byCcy[k].sum >= 100 ? Math.round(byCcy[k].sum) : (Math.round(byCcy[k].sum * 100) / 100), "亿" + k, byCcy[k].n + " 条解析 · 原文币种");
      }).join("") + "</div>"
      + '<div class="panel-b" style="padding-top:8px"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>日期</th><th>主体</th><th>金额（原文）</th><th>类型</th><th>方向</th><th></th></tr></thead><tbody>'
      + funds.slice(0, 30).map(function (f) {
        var ev = EDOC[f.aid];
        return '<tr><td class="mono">' + esc(f.date) + '</td><td style="font-size:12.5px">' + esc(shortCo(f.company)) + '</td>'
          + '<td class="money">' + esc(f.raw) + '</td><td>' + pill(f.ftype || "—") + '</td><td style="font-size:12px">' + esc(f.direction || "—") + '</td>'
          + '<td>' + (ev ? '<a href="#/event/' + ev.event_id + '">事件 →</a>' : '<span class="dim">未挂事件</span>') + "</td></tr>";
      }).join("") + "</tbody></table></div>"
      + '<div class="secnote">口径：金额由披露「投资金额」字段解析（derive.py），仅覆盖有明确金额的披露；最近 30 条，全量见事件库金额区间筛选。</div></div></div>';
    return h;
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

  /* ═════════ 出口管制：页面体在 assets/page_ex.js（window.render_ex / window.bind_ex），此处仅做路由分发与兜底 ═════════ */
  var EXC = { col: "enforcement" };
  var EX_COLS = [["enforcement", "执法案例更新"], ["lists", "清单更新"], ["rules", "规则更新"], ["watch", "观察名单比对"]];
  function vExport() {
    var h = '<div class="ph"><h1>出口管制</h1><span class="sub">本页回答：BIS / OFAC / UFLPA 最近有哪些执法案例、清单与规则更新；观察名单主体与制裁名单比对是否有命中</span></div>';
    h += '<div class="panel"><div class="panel-h"><h2>口径说明</h2></div><div class="panel-b" style="line-height:1.9;font-size:13px">'
      + "来源：美国 BIS（出口管制执法与实体清单）、OFAC（制裁名单与执法）、UFLPA 相关公开文件；分「执法案例更新 / 清单更新 / 规则更新」三栏目。"
      + "原 SDN 筛查并入本页为「观察名单比对」子视图：<b>同名≠命中</b>，仅名称相同而无地址/证件/国籍等佐证时只记「名称相似」。"
      + "本页与其他分页面的数据文件、统计口径<b>互不混用</b>。</div></div>";
    h += '<div id="exbody"></div>';
    return h;
  }
  // SDN 名单版本指纹与变化：从逐轮批次说明中提取（外部事实，依据批次记录原文）；清单更新与观察名单比对两栏共用
  function sdnMeta() {
    var sdnB = B.filter(function (b) { return b.per_source && b.per_source["OFAC·SDN"]; });
    var sha = null, chg = null;
    for (var bi = 0; bi < sdnB.length; bi++) {
      var nt = sdnB[bi].note || "";
      if (!sha) { var m = nt.match(/sha[=（(]?([0-9a-f]{4,})[…\.]{1,3}([0-9a-f]{4,})/i); if (m) sha = m[1] + "…" + m[2]; }
      if (!chg) { var c = nt.match(/SDN[^；。]*?变化[^；。]*?(新增\s*\d+\s*条[^；。]*)/); if (c) chg = { batch: sdnB[bi].id, text: c[1] }; }
    }
    return { rows: sdnB, sha: sha, chg: chg,
      scanned: sdnB.length ? sdnB[0].per_source["OFAC·SDN"].scanned : null,
      batch: sdnB.length ? sdnB[0].id : null };
  }
  function exBody() {
    var box = $("exbody"); if (!box) return;
    if (EXC.col === "lists") {
      // SDN 快照 diff 已随监测批次上线（OpenSanctions delta 思路：added/removed 留痕）；其余清单如实标注未上线
      var sm = sdnMeta();
      box.innerHTML = (sm.rows.length ? '<div class="panel"><div class="panel-h"><h2>OFAC SDN 清单 · 版本比对</h2><span class="note">已上线 · 口径：仅 SDN 一个清单的快照 diff，随监测批次比对；不等于全部清单更新</span></div><div class="panel-b" style="font-size:13px;line-height:1.9">'
        + "名单条目（单轮全量）<b>" + esc(String(sm.scanned)) + '</b> · 版本指纹 <span class="mono">' + esc(sm.sha || "—") + '</span> · 最近轮次 <span class="mono">' + esc(sm.batch) + "</span>"
        + (sm.chg ? '<br/><span class="st manual">名单变化</span> ' + esc(sm.chg.batch) + "：" + esc(sm.chg.text) + "（名单侧新增条目均经受检主体比对，0 命中；样本详见该批次说明）" : "<br/>近批名单版本无变化")
        + '<br/><a href="#/export?col=watch">受检主体逐项比对记录见「观察名单比对」→</a></div></div>' : "")
        + '<div class="panel"><div class="panel-b" style="padding:30px 24px;text-align:center">'
        + '<div style="font-size:15px;font-weight:700;margin-bottom:8px">其余清单 · 数据采集尚未上线</div>'
        + '<div class="note" style="max-width:560px;margin:0 auto;line-height:1.9">覆盖范围：实体清单 / SDN / 未经核实清单 / UFLPA 实体清单。其中 SDN 版本比对已上线（见上）；BIS 实体清单、UVL、UFLPA 实体清单采集尚未接入，不展示推测或占位内容。</div>'
        + '<div class="note" style="max-width:620px;margin:14px auto 0;line-height:1.9;text-align:left;border-top:1px dashed var(--line);padding-top:12px">'
        + "采集设计：trade.gov 合并筛查清单（CSL，13 个清单）快照 diff 产生 added/removed/revised；Federal Register API 取 BIS 实体清单规则与 UFLPA 列入通知回填依据；removed 条目保留历史卡片。注意：CSL 官方 API 只含当前在列条目，历史须靠本站自启动日起累积快照；且 UFLPA 实体清单不在 CSL 内（归国土安全部单列），须单独来源，不能仅靠 CSL 覆盖本页全部清单（2026-10-23 实测）。</div></div></div>";
      return;
    }
    if (EXC.col !== "watch") {
      var nm = { enforcement: "执法案例更新", rules: "规则更新" }[EXC.col];
      var src = { enforcement: "BIS 执法行动 / OFAC 执法案例 / UFLPA 执法", rules: "EAR 规则修订 / OFAC 法规与通用许可 / UFLPA 指引" }[EXC.col];
      var plan = {
        enforcement: "采集设计：OFAC recent-actions/enforcement-actions 列表与和解详情（金额/违规笔数/VSD/egregious）＋ BIS bis.gov/enforcement 和解文书与新闻稿；案例级字段含 statutory max / base penalty / 加重与减轻因素，缺失照【未披露】。",
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
    // 名单版本指纹与名单变化（两栏共用的提取逻辑）
    var sm2 = sdnMeta();
    var sha = sm2.sha, chg = sm2.chg;
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
  function vExportFallback() {
    return '<div class="ph"><h1>出口管制</h1><span class="sub">BIS / OFAC / UFLPA 执法、清单与规则更新；观察名单比对</span></div>'
      + '<div class="panel"><div class="panel-b" style="padding:30px;text-align:center">'
      + '<div style="font-size:15px;font-weight:700;margin-bottom:8px">页面模块未加载</div>'
      + '<div class="note">assets/page_ex.js 未就绪，请检查构建。</div></div></div>';
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
  var AB = { tab: "coverage" };
  function vAbout() {
    var h = '<div class="ph"><h1>方法与来源</h1><span class="sub">本页回答：数据怎么来、覆盖到哪、排除了什么、质量如何、怎样取用</span></div>';
    h += '<div class="subnav wrap" style="margin-bottom:16px">'
      + [["coverage", "覆盖与排除"], ["health", "来源健康"], ["batches", "批次简报"], ["records", "更新记录"], ["diff", "版本比较"], ["validate", "质检报告"], ["export", "导出"]].map(function (x) {
        return '<a href="javascript:;" data-abt="' + x[0] + '"' + (AB.tab === x[0] ? ' class="on"' : "") + ">" + x[1] + "</a>";
      }).join("") + "</div><div id=\"abbody\"></div>";
    return h;
  }
  function abBody() {
    var box = $("abbody"); if (!box) return;
    var H = DB.health || [];
    if (AB.tab === "coverage") {
      // R06-5：各渠道覆盖范围（观察名单/检索方式/频率/起止日期）+ 排除清单及理由；全部取自 config/库内实际数据，缺项如实标注
      var dates = D.map(function (r) { return r["披露日期与时间"]; }).filter(Boolean).sort();
      var span = dates.length ? dates[0].slice(0, 10) + " ~ " + dates[dates.length - 1].slice(0, 10) : "—";
      var tot = { scanned: 0, kept: 0, excluded: 0, failed: 0 };
      (DB.batches || []).forEach(function (b) { ["scanned", "kept", "excluded", "failed"].forEach(function (k) { tot[k] += b[k] || 0; }); });
      var lm = DB.legal_map || {};
      box.innerHTML = '<div class="statstrip">'
        + statCard(span, "收录披露日期范围", "库内 " + D.length + " 条披露（出海信批归纳模块）；非全市场口径")
        + statCard(tot.scanned, "累计扫描（批次合计）", "各批次 scanned 求和；跨批次窗口重叠，非去重值")
        + statCard(tot.kept, "累计收录", "kept 合计；命中率低属正常（关键词召回+人工门控）")
        + statCard(tot.excluded, "累计剔除", "门控剔除：非出海相关 / 噪声类别 / 程序性公告")
        + "</div>"
        + '<div class="panel"><div class="panel-h"><h2>渠道覆盖范围</h2><span class="note">接入方式/频率/名单来自 state/config.json 静态配置；收录与起止日期为库内实数；巨潮关键词取自 scripts/cninfo.py（采集脚本唯一来源）</span></div>'
        + '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>渠道</th><th>检索方式与关键词/名单</th><th>频率</th><th>去重主键</th><th>收录</th><th>起止日期</th></tr></thead><tbody>'
        + H.map(function (c) {
          return "<tr><td style='white-space:nowrap'><b>" + esc(c.name) + "</b><br/><a href='" + esc(c.url) + "' target='_blank' rel='noopener' style='font-size:12px'>来源 ↗</a></td>"
            + "<td style='font-size:12.5px'>" + esc(c.method)
            + (c.keywords ? '<div class="dim" style="font-size:12px">关键词（' + c.keywords.length + "）：" + esc(c.keywords.join(" / ")) + "</div>" : "")
            + (c.watch ? "<br/>观察名单 " + c.watch + " 家" : "") + (c.note ? '<div class="dim" style="font-size:12px">' + esc(c.note) + "</div>" : "") + "</td>"
            + "<td style='font-size:12.5px'>" + esc(c.cadence || "—") + "</td><td style='font-size:12.5px'>" + esc(c.cursor || "—") + "</td>"
            + "<td class='mono'>" + c.count + "</td><td class='mono' style='white-space:nowrap'>" + (c.earliest ? esc(String(c.earliest).slice(0, 10)) + " ~<br/>" + esc(String(c.latest || "").slice(0, 10)) : esc(c.latest || "—")) + "</td></tr>";
        }).join("") + "</tbody></table></div>"
        + '<div class="secnote">制裁名单筛查（OFAC SDN）为比对机制而非采集渠道：同名 ≠ 命中，需名称+国籍/地址/注册号等多项佐证；个案见 <a href="#/export">出口管制分页 → 观察名单比对</a>。'
        + "议题归码：scripts/legal_map.py 确定性规则（版本 " + esc(lm.version || "—") + "，" + esc(lm.run || "—") + "），编码表 state/issues_taxonomy.json v" + esc((DB.issues_taxonomy || {}).version || "—") + "。</div></div>"
        + '<div class="panel"><div class="panel-h"><h2>排除清单及理由</h2><span class="note">门控剔除规则与逐条异常记录；不静默丢数据</span></div><div class="panel-b">'
        + '<div class="sec"><span class="sk">类别级排除（规则）</span>'
        + "巨潮：制度文件、调研记录、公告制度等噪声类别不入库（config 渠道 note）；披露易：翌日披露报表、月报表等程序性类别进原始库但不进事件流；EDGAR：仅观察名单 CIK 的 6-K/20-F/10-K/8-K/F-1/F-3/424B 表格；召回关键词未命中的披露不在样本内（检索召回口径，非全市场）。</div>"
        + ((DB.exceptions || []).length
          ? '<div class="sec" style="border:none"><span class="sk">逐条异常 / 排除记录（' + (DB.exceptions || []).length + "）</span>"
            + (DB.exceptions || []).map(function (x) { return '<div class="ev"><span class="qt">' + esc(typeof x === "string" ? x : JSON.stringify(x)) + "</span></div>"; }).join("") + "</div>"
          : '<div class="sec" style="border:none"><span class="sk">逐条异常</span>当前无异常记录。</div>')
        + "</div></div>";
      return;
    }
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
      box.innerHTML = (BD.length ? '<div class="note" style="margin-bottom:12px">日批次视图：同一自然日多轮运行合并为 D-YYYYMMDD（runs 记轮数）；回溯补入单列 B-YYYYMMDD。2026-10-22 前为每 2 小时一轮的旧批次（B-YYYYMMDD-HHMM），逐轮结论按轮次号原文保留于下方（不改写历史记录）；逐轮扫描计数见「更新记录」。</div>' : "")
        + list.map(function (b) {
        var ps = Object.keys(b.per_source || {}).map(function (k) {
          var p = b.per_source[k]; return esc(k) + "：扫 " + p.scanned + " / 收 " + p.kept + " / 剔 " + p.excluded + (p.failed ? " / 败 " + p.failed : "");
        }).join("<br/>");
        var note;
        if (b.notes && b.notes.length) {
          var seen = {};
          var rows = [];
          b.notes.forEach(function (n) {
            var run = typeof n === "string" ? "" : (n.run || "");
            var txt = typeof n === "string" ? n : (n.text || "");
            var key = run + "|" + txt;
            if (seen[key]) return;
            seen[key] = 1;
            rows.push('<div style="margin:2px 0">' + (run ? '<span class="mono dim" style="font-size:11.5px">[' + esc(run) + "]</span> " : "") + esc(txt) + "</div>");
          });
          note = rows.join("") || "—";
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
        + (VR.pages ? '<div class="panel"><div class="panel-h"><h2>页面检查（无头浏览器）</h2><span class="note">'
          + "每条路由 × " + (VR.pages.widths || []).join("/") + "px：唯一 H1、无横向溢出、无 JS 报错、旧路由跳转；站内链接全局去重检查 "
          + (VR.pages.links_checked || 0) + " 条；失败 " + VR.pages.failed + " / " + VR.pages.routes_checked + "</span></div>"
          + '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>路由</th><th>类型</th><th>H1 / 跳转结果</th><th>横向溢出</th><th>JS报错</th><th>结果</th></tr></thead><tbody>'
          + (VR.pages.results || []).map(function (r) {
            var ov = Object.keys(r.overflow || {}).filter(function (w) { return r.overflow[w]; });
            return "<tr><td class='mono'>" + esc(r.route) + "</td><td>" + (r.expect === "redirect" ? "旧路由跳转" : "内容页") + "</td>"
              + "<td class='mono'>" + (r.expect === "redirect" ? "→ " + esc(r.final || "—") : (r.h1 == null ? "—" : r.h1)) + "</td>"
              + "<td>" + (ov.length ? '<span class="st bad">' + ov.join("/") + "</span>" : '<span class="st ok">无</span>') + "</td>"
              + "<td class='mono'>" + (r.js_errors && r.js_errors.length ? '<span class="st bad">' + r.js_errors.length + "</span>" : "0") + "</td>"
              + "<td>" + (r.ok ? '<span class="st ok">通过</span>' : '<span class="st bad">失败</span>') + "</td></tr>";
          }).join("") + "</tbody></table></div>"
          + ((VR.pages.dead_links || []).length ? '<div class="secnote">站内死链：' + VR.pages.dead_links.map(function (l) { return esc(l); }).join(" · ") + "</div>"
            : '<div class="secnote">站内死链：0 条（' + (VR.pages.links_checked || 0) + " 条去重链接全部可渲染）</div>") + "</div>"
          : '<div class="panel"><div class="panel-b"><div class="empty">本次质检未含页面检查（无 playwright 环境时跳过，详见下方 SKIP 项）</div></div></div>')
        + '<div class="panel"><div class="panel-h"><h2>检查项明细</h2><span class="note">JSON 可解析 · id 唯一 · 必填字段 · 三分层 basis · external 来源 · 阶段链/changelog 一致 · doc 唯一归属 · 审批表述依据 · 金额口径 · 引文回原文 · 来源链接抽样 · 批次命名 · 依据引用可解析 · 前端资源</span></div><div class="panel-b">'
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
      /* 出口管制二级导航由 assets/page_ex.js 页内栏目切换（带条目计数）承担，避免重复 */
      export: []
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
      F.stage = qs.get("stage") || "全部"; F.geo = qs.get("geo") || "全部"; F.country = qs.get("country") || "全部";
      F.ut = qs.get("ut") || "全部"; F.status = qs.get("status") || "全部";
      F.cur = qs.get("cur") || "全部"; F.amtmin = qs.get("amtmin") || ""; F.amtmax = qs.get("amtmax") || "";
      F.dfrom = qs.get("dfrom") || ""; F.dto = qs.get("dto") || "";
      F.issue = qs.get("issue") || "全部";
      F.view = qs.get("view") || "cards"; F.mode = qs.get("mode") || "month";
      var colq = qs.get("cols");
      F.cols = colq ? colq.split(",").filter(function (c) { return EV_COLS.some(function (d) { return d[0] === c; }); }) : EV_COLS_DEFAULT.slice();
      if (!F.cols.length) F.cols = EV_COLS_DEFAULT.slice();
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
    else if (name === "us") {
      section = "us"; sub = "";
      html = window.render_us ? '<div id="usroot"></div>' : vMarket("us");
    }
    else if (name === "hk-market") { section = "hk"; sub = ""; html = window.render_hk ? window.render_hk(qs) : vMarket("hk"); }
    else if (name === "export") {
      section = "export"; EXC.col = qs.get("col") || "enforcement";
      sub = "#/export?col=" + EXC.col;
      html = window.render_ex ? window.render_ex(EXC.col, qs) : vExport();
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
    if (name === "issues") {
      // 深链：#/issues?code=I1.1（或旧式 #/issues/I2）→ 展开对应二级议题并定位
      var icode = qs.get("code") || param || "";
      if (icode) {
        var det0 = $("det-" + icode);
        if (det0) { det0.open = true; det0.scrollIntoView(); }
        else { var p0 = $("iss-" + icode.split(".")[0]); if (p0) p0.scrollIntoView(); }
      }
    }
    if (name === "us" && window.render_us) { window.render_us($("usroot")); }
    if (name === "hk-market" && window.bind_hk) window.bind_hk();
    if (name === "export") { if (window.bind_ex) { window.bind_ex(view, EXC.col, qs); } else { exBody(); } }
    if (name === "cos") { cosRows(""); var ci = $("coq"); if (ci) ci.addEventListener("input", function (e) { cosRows(e.target.value); }); }
    if (name === "topics") { document.querySelectorAll("[data-tpv]").forEach(function (a) { a.addEventListener("click", function () { TPV.v = a.getAttribute("data-tpv"); view.innerHTML = vTopics(); routeBindTopics(); tpBody(); }); }); tpBody(); }
    if (name === "about") { document.querySelectorAll("[data-abt]").forEach(function (a) { a.addEventListener("click", function () { AB.tab = a.getAttribute("data-abt"); view.innerHTML = vAbout(); routeBindAbout(); abBody(); bindExport(); }); }); abBody(); bindExport(); }
    if (name === "event") {
      var ta = $("pnote");
      if (ta) ta.addEventListener("change", function () { ANN.notes[ta.getAttribute("data-note")] = ta.value; saveAnn(); });
    }
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
