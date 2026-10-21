/* 企业出海披露情报台 — 路由与视图 */
(function () {
  var DB = window.DB || { disclosures: [], batches: [], cases: [], sources: [], rules: {}, exceptions: [] };
  var D = DB.disclosures;
  var view = document.getElementById("view");
  var pageTitle = document.getElementById("pageTitle");

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function bySeq(seq) { for (var i = 0; i < D.length; i++) if (D[i]["序号"] == seq) return D[i]; return null; }
  function byAid(aid) { for (var i = 0; i < D.length; i++) if (D[i]["_aid"] === aid) return D[i]; return null; }
  function shortCo(name) { return String(name || "").replace(/^(.*(股份有限公司|集团股份有限公司|有限公司)).*$/, "$1"); }
  function pill(t, cls) { return '<span class="pill ' + (cls || "") + '">' + esc(t) + "</span>"; }
  document.getElementById("sideSync").textContent = DB.synced || "—";

  /* ───────── 通用组件 ───────── */
  function tblHead(cols) {
    return "<tr>" + cols.map(function (c) { return '<th style="' + (c[1] || "") + '">' + esc(c[0]) + "</th>"; }).join("") + "</tr>";
  }
  function eventRow(r, i, opts) {
    opts = opts || {};
    return '<tr class="click" data-href="#/detail/' + r["序号"] + '">'
      + "<td>" + (i != null ? i : "") + '</td><td class="mono" style="white-space:nowrap">' + esc(r["披露日期与时间"])
      + '</td><td><b>' + esc(shortCo(r["公司全称"])) + '</b><br/><span class="code">' + esc(r["股票代码"]) + "</span></td>"
      + "<td>" + esc(r["公告标题"]) + (opts.sub ? '<br/><span class="dim" style="font-size:12px">' + esc(r["公告类型"]) + "</span>" : "") + "</td>"
      + "<td>" + esc(r["公告类型"].split(/（/)[0]) + "</td>"
      + "<td>" + esc(r["涉及国家/地区"]) + "</td>"
      + "<td>" + pill((r["出海模式归类"] || "").split(/[＋（]/)[0].trim()) + "</td>"
      + '<td class="money">' + esc((r["投资金额"] || "").split(/[，；]/)[0].slice(0, 30)) + '<br/><span class="dim">' + esc(r["阶段组"]) + "</span></td>"
      + '<td><a href="' + esc(r["来源链接"]) + '" target="_blank" rel="noopener" onclick="event.stopPropagation()">原文</a></td></tr>';
  }
  function batchNums(b) {
    return '<div class="bnums">'
      + '<div class="bnum"><b>' + b.scanned + "</b><span>命中</span></div>"
      + '<div class="bnum"><b>' + b.kept + "</b><span>收录</span></div>"
      + '<div class="bnum"><b>' + b.excluded + "</b><span>排除</span></div>"
      + '<div class="bnum"><b>' + b.failed + '</b><span>失败</span></div></div>';
  }
  function batchHTML(b, withItems) {
    var h = '<div class="panel"><div class="panel-h"><h2>' + esc(b.id) + '</h2><span class="note mono">' + esc(b.time) + "</span></div>"
      + '<div class="batch-meta"><span>窗口 <b>' + esc(b.window) + '</b></span><span>来源 <b>' + esc(b.source) + "</b></span>" + batchNums(b) + "</div>";
    if (b.note) h += '<div class="panel-b note" style="padding-bottom:8px">' + esc(b.note) + "</div>";
    if (withItems && b.items && b.items.length) {
      h += '<div class="bitems">';
      b.items.forEach(function (aid) {
        var r = byAid(aid); if (!r) return;
        h += '<div class="bitem"><span class="dt">' + esc(r["披露日期与时间"]) + '</span><span class="bd"><b>' + esc(shortCo(r["公司全称"])) + "</b> — " + esc(r["动作类型"].split(/（/)[0]) + "：" + esc((r["投资金额"] || "").split(/[，；]/)[0]) + '　<a href="#/detail/' + r["序号"] + '">分析</a>　<a href="' + esc(r["来源链接"]) + '" target="_blank" rel="noopener">原文</a></span></div>';
      });
      h += "</div>";
    } else if (withItems) {
      h += '<div class="panel-b"><div class="empty" style="padding:18px 0">本批次无新增收录条目</div></div>';
    }
    return h + "</div>";
  }

  /* ───────── 披露首页 ───────── */
  function vHome() {
    var regions = {}, curve = 0;
    D.forEach(function (r) {
      (r["涉及国家/地区"] || "").split(/[、，,]/).forEach(function (x) { x = x.trim(); if (x) regions[x] = 1; });
      if ((r["是否构成第二增长曲线"] || "").indexOf("是") === 0) curve++;
    });
    var recent = D.filter(function (r) { return r["披露日期与时间"] >= "2026-10-15"; });
    var latest = DB.batches[0], prev = DB.batches[1];
    var h = '<div class="cards4">'
      + '<div class="stat"><div class="n">' + D.length + '</div><div class="c">累计收录披露</div></div>'
      + '<div class="stat"><div class="n">' + D.length + '</div><div class="c">本月新增（2026-10）</div></div>'
      + '<div class="stat"><div class="n">14</div><div class="c">监测关键词组合</div></div>'
      + '<div class="stat"><div class="n" style="font-size:17px;padding-top:8px">' + esc(DB.synced) + '</div><div class="c">最近同步（北京时间）</div></div></div>';

    h += '<div class="panel"><div class="panel-h"><h2>最新批次简报</h2><a class="more" href="#/batches">全部批次 →</a></div>'
      + '<div class="batch-meta"><span>批次 <b>' + esc(latest.id) + '</b></span><span>窗口 <b>' + esc(latest.window) + '</b></span><span>来源 <b>' + esc(latest.source) + "</b></span>" + batchNums(latest) + "</div>"
      + '<div class="panel-b">' + esc(latest.note) + "</div>"
      + '<div class="trendline" style="margin:0 20px 16px"><b>模式动向（基于 10-21 当日样本，非全行业趋势）：</b>① 精工钢构直签非洲业主，工程出海从「跟随」走向「直签」；② 晶科科技对中东电站由建设期投入转入运营期债务置换，行业重心从抢规模转向保现金流；③ 兖矿能源以价补量、以并购调结构，资源型出海进入收获与再平衡期。</div></div>';

    h += batchHTML(prev, true);

    h += '<div class="panel"><div class="panel-h"><h2>近 7 日披露（' + recent.length + ' 条）</h2><a class="more" href="#/archive">披露档案 →</a></div>'
      + '<table class="tbl"><thead>' + tblHead([["序", "width:36px"], ["日期", "width:92px"], ["公司 / 代码"], ["公告标题"], ["类型", "width:88px"], ["国家/地区", "width:120px"], ["出海模式", "width:86px"], ["金额及阶段", "width:190px"], ["原文", "width:52px"]]) + "</thead><tbody>"
      + recent.map(function (r, i) { return eventRow(r, i + 1); }).join("")
      + '</tbody></table></div>';
    return h;
  }

  /* ───────── 批次简报 ───────── */
  function vBatches() {
    return '<div class="panel"><div class="panel-h"><h2>扫描批次总览</h2><span class="note">批次与已发布事件准确关联，未处理文件如实计数</span></div>'
      + '<table class="tbl"><thead>' + tblHead([["批次", "width:150px"], ["时间", "width:130px"], ["扫描窗口"], ["来源", "width:90px"], ["命中", "width:56px"], ["收录", "width:56px"], ["排除", "width:56px"], ["失败", "width:56px"], ["状态", "width:80px"]]) + "</thead><tbody>"
      + DB.batches.map(function (b) {
          return "<tr><td class='mono'>" + esc(b.id) + '</td><td class="mono">' + esc(b.time) + "</td><td>" + esc(b.window) + "</td><td>" + esc(b.source)
            + '</td><td class="mono">' + b.scanned + '</td><td class="mono"><b>' + b.kept + '</b></td><td class="mono">' + b.excluded + '</td><td class="mono">' + b.failed
            + "</td><td>" + (b.failed > 0 ? '<span class="badge-fail">部分失败</span>' : '<span class="badge-ok">完成</span>') + "</td></tr>";
        }).join("") + "</tbody></table></div>"
      + DB.batches.map(function (b) { return batchHTML(b, true); }).join("");
  }

  /* ───────── 实时抓取 ───────── */
  function vLive() {
    return '<div class="panel"><div class="panel-h"><h2>实时抓取状态</h2><span class="note mono">最近同步 ' + esc(DB.synced) + '</span></div><div class="panel-b">'
      + '<p style="font-size:13px;color:var(--ink-2);line-height:1.8">本页为前端展示层，不伪装实时推送。持续采集由后台定时任务执行；<b>当前部署为静态托管，后台调度、数据库与文件对象存储组件未随本版本部署</b>，后台在浏览器关闭后持续工作需要服务端环境（部署办法见下）。</p>'
      + '<div style="margin-top:12px">'
      + '<table class="tbl"><thead>' + tblHead([["组件", "width:160px"], ["状态", "width:110px"], ["说明"]]) + "</thead><tbody>"
      + "<tr><td>定时扫描任务</td><td>" + '<span class="st plan">半自动</span>' + "</td><td>平台 Cron 触发代理会话执行（每交易日 08:00 / 18:00），结果写入数据底稿并生成本站数据文件</td></tr>"
      + "<tr><td>前台展示</td><td>" + '<span class="st ok">已部署</span>' + "</td><td>本网站，静态托管，打开即用</td></tr>"
      + "<tr><td>后台调度 / 队列 / 数据库</td><td>" + '<span class="st plan">未部署</span>' + "</td><td>PRD 要求的 2 小时级增量、失败自动重试、对象存储原文归档需服务端环境（如 Cloudflare Worker + D1 + R2，或任何 VPS + 关系库）</td></tr>"
      + "<tr><td>AI 问答侧栏</td><td>" + '<span class="st plan">未实现</span>' + "</td><td>静态部署无检索后端，不做模板拼接式假问答；待接入检索服务后开放</td></tr>"
      + "</tbody></table></div>"
      + '<p class="note" style="margin-top:12px">部署路径：将扫描脚本（scripts/crawl_cninfo.py）、解析与分析流程迁入带定时器的服务端，通过写入接口更新数据库；本站改为读取服务接口即可升级为全实时。</p>'
      + "</div></div>"
      + batchHTML(DB.batches[0], false);
  }

  /* ───────── 披露档案 ───────── */
  var f = { q: "", mode: "全部", stage: "全部", curve: "全部", sort: "desc", open: null, cmp: [] };
  function vArchive() {
    var modes = ["全部", "产能出海", "产品出口", "并购整合", "资产出海", "品牌出海", "平台型出海", "工程出海", "供应链出海"];
    var h = '<div class="panel"><div class="filterbar">'
      + '<input class="finput" id="fq" placeholder="搜索公司 / 国家 / 公告关键词…" value="' + esc(f.q) + '"/>'
      + '<select class="fsel" id="fmode">' + modes.map(function (m) { return '<option' + (f.mode === m ? " selected" : "") + ">" + esc(m) + "</option>"; }).join("") + "</select>"
      + '<select class="fsel" id="fstage">' + ["全部", "意向", "协议", "实施", "变更", "投产/运营"].map(function (m) { return '<option' + (f.stage === m ? " selected" : "") + ">" + esc(m) + "</option>"; }).join("") + "</select>"
      + '<select class="fsel" id="fcurve">' + ["全部", "仅第二曲线", "仅主业延伸"].map(function (m, i) { return '<option value="' + ["全部", "是", "否"][i] + '"' + (f.curve === ["全部", "是", "否"][i] ? " selected" : "") + ">" + esc(m) + "</option>"; }).join("") + "</select>"
      + '<label class="fchk"><input type="checkbox" id="fsort"' + (f.sort === "asc" ? " checked" : "") + "/> 最早优先</label>"
      + '<span class="note" id="fcount" style="margin-left:auto"></span></div>'
      + '<table class="tbl"><thead>' + tblHead([["", "width:30px"], ["日期", "width:92px"], ["公司 / 代码", "width:180px"], ["公告类型 / 标题"], ["国家/地区", "width:110px"], ["模式", "width:86px"], ["阶段", "width:70px"], ["金额 / 规模", "width:170px"], ["曲线", "width:60px"]]) + '</thead><tbody id="archiveRows"></tbody></table></div>';
    return h;
  }
  function archiveRows() {
    var q = f.q.trim().toLowerCase();
    var rows = D.filter(function (r) {
      if (f.mode !== "全部" && (r["出海模式归类"] || "").indexOf(f.mode) < 0) return false;
      if (f.stage !== "全部" && r["阶段组"] !== f.stage) return false;
      if (f.curve === "是" && (r["是否构成第二增长曲线"] || "").indexOf("是") !== 0) return false;
      if (f.curve === "否" && (r["是否构成第二增长曲线"] || "").indexOf("是") === 0) return false;
      if (q && Object.keys(r).map(function (k) { return r[k]; }).join(" ").toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    rows.sort(function (a, b) { return (a["披露日期与时间"] < b["披露日期与时间"] ? -1 : 1) * (f.sort === "asc" ? 1 : -1); });
    var cnt = document.getElementById("fcount");
    if (cnt) cnt.textContent = "显示 " + rows.length + " / " + D.length + " 条";
    var tb = document.getElementById("archiveRows");
    if (!tb) return;
    if (!rows.length) { tb.innerHTML = '<tr><td colspan="9"><div class="empty">无匹配条目</div></td></tr>'; return; }
    tb.innerHTML = rows.map(function (r) {
      var open = f.open === r["序号"];
      var curve = (r["是否构成第二增长曲线"] || "").indexOf("是") === 0;
      var row = '<tr class="click" data-seq="' + r["序号"] + '">'
        + '<td class="mono">' + (open ? "−" : "+") + '</td><td class="mono" style="white-space:nowrap">' + esc(r["披露日期与时间"])
        + '</td><td><b>' + esc(shortCo(r["公司全称"])) + '</b><br/><span class="code">' + esc(r["股票代码"]) + "</span></td>"
        + "<td>" + esc(r["公告类型"]) + '<br/><span class="dim" style="font-size:12px">' + esc(r["公告标题"]) + "</span></td>"
        + "<td>" + esc(r["涉及国家/地区"]) + "</td><td>" + pill((r["出海模式归类"] || "").split(/[＋（]/)[0].trim()) + "</td>"
        + "<td>" + esc(r["阶段组"]) + '</td><td class="money">' + esc((r["投资金额"] || "").split(/[，；]/)[0].slice(0, 30)) + "</td>"
        + "<td>" + (curve ? pill("第二曲线", "blue") : '<span class="dim" style="font-size:11px">—</span>') + "</td></tr>";
      if (open) {
        row += '<tr class="exprow"><td colspan="9"><div class="expbox"><div class="expgrid">'
          + dl("动作类型", r["动作类型"]) + dl("动作阶段", r["动作阶段"])
          + dl("出海模式归类", r["出海模式归类"]) + dl("盈利方式", r["盈利方式"])
          + dl("对主营业务的战略价值", r["对主营业务的战略价值"], "long")
          + dl("是否构成第二增长曲线", r["是否构成第二增长曲线"])
          + dl("主要风险与不确定性", r["主要风险与不确定性"], "long")
          + '</div><div class="explink"><a href="#/detail/' + r["序号"] + '">完整分析（含证据摘录与三要素）→</a>　<a href="' + esc(r["来源链接"]) + '" target="_blank" rel="noopener">原文 PDF</a></div></div></td></tr>';
      }
      return row;
    }).join("");
  }
  function dl(k, v, cls) { return '<div class="dl"><div class="k">' + esc(k) + '</div><div class="v ' + (cls || "") + '">' + esc(v || "—") + "</div></div>"; }

  /* ───────── 详情页 ───────── */
  function vDetail(seq) {
    var r = bySeq(seq);
    if (!r) return '<div class="panel"><div class="empty">条目不存在</div></div>';
    var h = '<div class="panel dhead"><div class="crumbs"><a href="#/archive">披露档案</a> / ' + esc(r["披露日期与时间"]) + " / " + esc(r["股票代码"]) + "</div>"
      + "<h1>" + esc(r["公告标题"]) + '</h1><div class="dtags">'
      + pill(r["公告类型"], "solid") + pill(r["涉及国家/地区"]) + pill("阶段：" + r["阶段组"]) + pill(r["出海模式归类"].split(/[＋（]/)[0].trim(), "blue")
      + ((r["是否构成第二增长曲线"] || "").indexOf("是") === 0 ? pill("潜在第二曲线", "blue") : "")
      + "</div></div>";

    h += '<div class="panel"><div class="panel-h"><h2>披露事实与交易结构</h2><a class="more mono" href="' + esc(r["来源链接"]) + '" target="_blank" rel="noopener">原文 PDF ↗</a></div>'
      + '<div class="kv">'
      + dl("公司", r["公司全称"]) + dl("证券代码 / 市场", r["股票代码"]) + dl("披露日期", r["披露日期与时间"])
      + dl("动作类型", r["动作类型"]) + dl("动作阶段", r["动作阶段"]) + dl("涉及国家/地区", r["涉及国家/地区"])
      + dl("投资金额 / 合同规模", r["投资金额"], "long") + dl("合作方 / 交易对手", r["合作方"], "long") + dl("公告类型", r["公告类型"])
      + "</div></div>";

    h += '<div class="panel"><div class="panel-h"><h2>原文证据</h2><span class="note">支持核心事实的原文短摘录与页码定位 · 抓取 ' + esc(DB.synced) + "</span></div>"
      + '<div class="evlist">' + (r["摘录"] || []).map(function (q) {
          return '<div class="ev"><span class="pg">P' + (q.page || "?") + '</span><span class="qt">「' + esc(q.text) + '」</span></div>';
        }).join("") + "</div></div>";

    h += '<div class="panel"><div class="panel-h"><h2>四层内容</h2><span class="note">披露事实 / 计算 / 分析推断 / 未披露事项分层呈现</span></div>'
      + '<div class="layer"><div class="lk"><span class="no">1</span>披露事实（原文明示）</div><div class="lv">' + esc(r["动作类型"]) + "；" + esc(r["动作阶段"]) + "；" + esc(r["涉及国家/地区"]) + "。金额、合作方与交易安排以原文为准（见上表与证据摘录）。</div></div>"
      + '<div class="layer"><div class="lk"><span class="no">2</span>金额与计算（输入、公式、期间与口径）</div><div class="lv">' + esc(r["投资金额"] || "—") + '</div></div>'
      + '<div class="layer"><div class="lk"><span class="no">3</span>分析推断（依据与限制）</div><div class="lv">'
      + "<b>模式归类：</b>" + esc(r["出海模式归类"]) + "<br/><b>盈利方式：</b>" + esc(r["盈利方式"]) + "<br/><b>本地化深度：</b>" + esc(r["本地化深度"])
      + "<br/><b>战略价值：</b>" + esc(r["对主营业务的战略价值"]) + "<br/><b>营收与利润影响：</b>" + esc(r["对营收结构与利润的预期影响"])
      + "<br/><b>第二曲线判断：</b>" + esc(r["是否构成第二增长曲线"]) + "<br/><b>主要风险：</b>" + esc(r["主要风险与不确定性"])
      + '<div class="note" style="margin-top:6px">分析版本 v1 · 生成于 ' + esc(DB.synced) + " · 依据为本公告原文，推断受披露完整度限制</div></div></div>"
      + '<div class="layer"><div class="lk"><span class="no">4</span>未披露 / 待后续验证</div><div class="lv">' + esc(r["未披露事项"]) + "</div></div></div>";

    h += '<div class="panel"><div class="panel-h"><h2>三要素关注</h2><span class="note">同一事件的投资 / 财务 / 法务视角</span></div><div style="padding:4px 20px 16px">'
      + '<div class="aitem"><span class="sk">商务/投资</span><span class="ab">' + esc(r["①商务关注（市场进入/渠道客户/竞争/关税贸易政策）"]) + "</span></div>"
      + '<div class="aitem"><span class="sk">财务</span><span class="ab">' + esc(r["②财务关注（投资规模与资金来源/汇率敞口/海外收入占比/利润率现金流）"]) + "</span></div>"
      + '<div class="aitem"><span class="sk">法务</span><span class="ab">' + esc(r["③法务关注（ODI/FDI审批备案/目标国合规/制裁出口管制/知识产权）"]) + "</span></div>"
      + "</div></div>";
    return h;
  }

  /* ───────── 连续案例 ───────── */
  function vCases() {
    var h = '<div class="panel"><div class="panel-h"><h2>连续案例库</h2><span class="note">同一交易/项目/境外主体的长期跟踪，后续披露更新旧判断而非机械新建</span></div>';
    DB.cases.forEach(function (c) {
      h += '<div class="case"><div class="ct"><h3><a href="#/case/' + c.id + '">' + esc(c.title) + "</a></h3>"
        + '<span class="cs mono">' + esc(c.code) + " · " + esc(c.region) + '</span><span class="cst">' + pill(c.status, "blue") + pill("已归档事件 " + c.events.length) + "</span></div>"
        + '<div class="cs" style="font-size:13px;color:var(--ink-2)">' + esc(c.summary) + "</div></div>";
    });
    return h + "</div>";
  }
  function vCase(id) {
    var c = null; DB.cases.forEach(function (x) { if (x.id === id) c = x; });
    if (!c) return '<div class="panel"><div class="empty">案例不存在</div></div>';
    var h = '<div class="panel dhead"><div class="crumbs"><a href="#/cases">连续案例</a> / ' + esc(c.id) + "</div><h1>" + esc(c.title) + '</h1><div class="dtags">'
      + pill(c.status, "solid") + pill(c.region) + pill(c.code) + "</div></div>";
    h += '<div class="panel"><div class="panel-h"><h2>案例时间线</h2><span class="note">宣布—审批—签约—交割—建设—投产—运营—退出</span></div><div style="padding:16px 20px"><div class="tl">';
    c.events.forEach(function (aid) {
      var r = byAid(aid); if (!r) return;
      h += '<div class="tl-item"><div class="tld">' + esc(r["披露日期与时间"]) + " · " + esc(r["阶段组"]) + '</div><div class="tlt"><b>' + esc(shortCo(r["公司全称"])) + "</b> — " + esc(r["公告标题"]) + '<br/><span class="dim" style="font-size:12px">' + esc((r["投资金额"] || "").split(/[，；]/)[0]) + '</span>　<a href="#/detail/' + r["序号"] + '">分析</a>　<a href="' + esc(r["来源链接"]) + '" target="_blank" rel="noopener">原文</a></div></div>';
    });
    h += '</div><div class="checkbox"><b>判断检验：</b>' + esc(c.check) + "</div></div></div>";
    return h;
  }

  /* ───────── 案例对比 ───────── */
  function vCompare() {
    var opts = D.map(function (r) {
      return '<option value="' + r["序号"] + '"' + (f.cmp.indexOf(r["序号"]) >= 0 ? " selected" : "") + ">" + esc(r["披露日期与时间"] + " " + shortCo(r["公司全称"]) + " " + r["股票代码"]) + "</option>";
    }).join("");
    return '<div class="panel"><div class="panel-h"><h2>案例对比</h2><span class="note">选择 2 个披露事件并排比较（可多选）</span></div>'
      + '<div class="filterbar"><select class="fsel" id="cmpA" style="min-width:340px">' + opts + '</select><select class="fsel" id="cmpB" style="min-width:340px">' + opts + "</select></div>"
      + '<div id="cmpOut" style="overflow-x:auto"></div></div>';
  }
  function cmpOut() {
    var a = bySeq(f.cmp[0]), b = bySeq(f.cmp[1]);
    var out = document.getElementById("cmpOut");
    if (!out) return;
    if (!a || !b) { out.innerHTML = '<div class="empty">选择两个事件进行比较</div>'; return; }
    function row(k, fa, fb) { return "<tr><th class='rowh'>" + esc(k) + "</th><td>" + esc(fa || "—") + "</td><td>" + esc(fb || "—") + "</td></tr>"; }
    out.innerHTML = '<table class="tbl cmp"><thead><tr><th style="width:110px"></th><th><b>' + esc(shortCo(a["公司全称"])) + '</b><br/><span class="code">' + esc(a["股票代码"] + " · " + a["披露日期与时间"]) + '</span></th><th><b>' + esc(shortCo(b["公司全称"])) + '</b><br/><span class="code">' + esc(b["股票代码"] + " · " + b["披露日期与时间"]) + "</span></th></tr></thead><tbody>"
      + row("公告类型", a["公告类型"], b["公告类型"])
      + row("涉及国家/地区", a["涉及国家/地区"], b["涉及国家/地区"])
      + row("动作类型", a["动作类型"], b["动作类型"])
      + row("动作阶段", a["动作阶段"], b["动作阶段"])
      + row("投资金额/规模", a["投资金额"], b["投资金额"])
      + row("合作方", a["合作方"], b["合作方"])
      + row("出海模式", a["出海模式归类"], b["出海模式归类"])
      + row("盈利方式", a["盈利方式"], b["盈利方式"])
      + row("本地化深度", a["本地化深度"], b["本地化深度"])
      + row("战略价值", a["对主营业务的战略价值"], b["对主营业务的战略价值"])
      + row("营收利润影响", a["对营收结构与利润的预期影响"], b["对营收结构与利润的预期影响"])
      + row("第二曲线", a["是否构成第二增长曲线"], b["是否构成第二增长曲线"])
      + row("主要风险", a["主要风险与不确定性"], b["主要风险与不确定性"])
      + row("先发/后发", a["先发/后发位置判断"], b["先发/后发位置判断"])
      + row("商务关注", a["①商务关注（市场进入/渠道客户/竞争/关税贸易政策）"], b["①商务关注（市场进入/渠道客户/竞争/关税贸易政策）"])
      + row("财务关注", a["②财务关注（投资规模与资金来源/汇率敞口/海外收入占比/利润率现金流）"], b["②财务关注（投资规模与资金来源/汇率敞口/海外收入占比/利润率现金流）"])
      + row("法务关注", a["③法务关注（ODI/FDI审批备案/目标国合规/制裁出口管制/知识产权）"], b["③法务关注（ODI/FDI审批备案/目标国合规/制裁出口管制/知识产权）"])
      + "</tbody></table>";
  }

  /* ───────── 专业分析 ───────── */
  var LENS = {
    "analysis-invest": {
      name: "投资视角", groups: [
        ["对主营业务的战略价值", "战略价值"], ["对营收结构与利润的预期影响", "营收与利润影响"],
        ["是否构成第二增长曲线", "第二曲线判断"], ["同行业可比出海案例（公司+时间+做法+成效）", "行业对标"],
        ["与本公司动作的异同", "与对标异同"], ["先发/后发位置判断", "先发/后发"]]
    },
    "analysis-finance": {
      name: "财务视角", groups: [
        ["投资金额", "金额、币种与口径"], ["对营收结构与利润的预期影响", "报表影响"],
        ["②财务关注（投资规模与资金来源/汇率敞口/海外收入占比/利润率现金流）", "财务关注"]]
    },
    "analysis-legal": {
      name: "法务视角", groups: [
        ["③法务关注（ODI/FDI审批备案/目标国合规/制裁出口管制/知识产权）", "法务关注"],
        ["是否构成第二增长曲线", "业务定性（辅助）"]]
    }
  };
  function vAnalysis(route) {
    var lens = LENS[route] || LENS["analysis-invest"];
    var h = '<div class="panel"><div class="lens">'
      + '<a href="#/analysis/invest" class="' + (route === "analysis-invest" ? "on" : "") + '">投资</a>'
      + '<a href="#/analysis/finance" class="' + (route === "analysis-finance" ? "on" : "") + '">财务</a>'
      + '<a href="#/analysis/legal" class="' + (route === "analysis-legal" ? "on" : "") + '">法务</a>'
      + '<span class="note" style="margin-left:auto;padding:10px 18px">同一事件的不同部门视角，数据同源</span></div>';
    D.forEach(function (r) {
      h += '<div class="aitem" style="padding:12px 20px"><div class="ah"><span class="co">' + esc(shortCo(r["公司全称"])) + '</span><span class="code">' + esc(r["股票代码"] + " · " + r["披露日期与时间"]) + '</span><a href="#/detail/' + r["序号"] + '" style="font-size:12px">详情</a></div>';
      lens.groups.forEach(function (g) {
        h += '<div class="sec"><span class="sk">' + esc(g[1]) + '</span>' + esc(r[g[0]] || "—") + "</div>";
      });
      h += "</div>";
    });
    return h + "</div>";
  }

  /* ───────── 系统与来源 ───────── */
  function vSources() {
    return '<div class="panel"><div class="panel-h"><h2>数据源与接入状态</h2><span class="note">免费公开来源优先；不绕过访问限制</span></div>'
      + '<table class="tbl sys-table"><thead>' + tblHead([["来源", "width:170px"], ["接入状态", "width:96px"], ["更新安排"], ["说明"], ["入口", "width:56px"]]) + "</thead><tbody>"
      + DB.sources.map(function (s) {
          var st = s.status.indexOf("已接入") === 0 ? '<span class="st ok">' + esc(s.status) + '</span>' : s.status.indexOf("手动") === 0 ? '<span class="st manual">' + esc(s.status) + '</span>' : '<span class="st plan">' + esc(s.status) + '</span>';
          return "<tr><td><b>" + esc(s.name) + "</b></td><td>" + st + "</td><td>" + esc(s.freq) + "</td><td>" + esc(s.note) + '</td><td>' + (s.url && s.url !== "—" ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">链接</a>' : "—") + "</td></tr>";
        }).join("") + "</tbody></table></div>";
  }
  function vScans() {
    return '<div class="panel"><div class="panel-h"><h2>扫描记录</h2><span class="note">含增量游标与去重状态</span></div>'
      + '<table class="tbl"><thead>' + tblHead([["批次", "width:150px"], ["执行时间", "width:130px"], ["扫描窗口"], ["命中", "width:56px"], ["收录", "width:56px"], ["排除", "width:56px"], ["失败", "width:56px"], ["游标/去重"]]) + "</thead><tbody>"
      + DB.batches.map(function (b) {
          return "<tr><td class='mono'>" + esc(b.id) + '</td><td class="mono">' + esc(b.time) + "</td><td>" + esc(b.window) + '</td><td class="mono">' + b.scanned + '</td><td class="mono"><b>' + b.kept + '</b></td><td class="mono">' + b.excluded + '</td><td class="mono">' + b.failed + "</td><td class='note'>" + esc(b.note.slice(0, 46)) + "…</td></tr>";
        }).join("") + "</tbody></table></div>";
  }
  function vRules() {
    var R = DB.rules;
    return '<div class="panel"><div class="ruleblk"><h3>监测关键词（14 组）</h3><div>' + R.keywords.map(function (k) { return '<span class="kwtag">' + esc(k) + "</span>"; }).join("") + "</div></div>"
      + '<div class="ruleblk"><h3>收录口径（境外主体或业务＋实质动作）</h3><p>' + esc(R.include) + "</p></div>"
      + '<div class="ruleblk"><h3>排除口径</h3><p>' + esc(R.exclude) + "</p></div>"
      + '<div class="ruleblk"><h3>去重与增量机制</h3><p>' + esc(R.dedupe) + "</p></div>"
      + '<div class="ruleblk"><h3>事实口径纪律</h3><p>' + esc(R.caliber) + "</p></div></div>";
  }
  function vExceptions() {
    return '<div class="panel"><div class="panel-h"><h2>读取与分析异常</h2><span class="note">如实展示，不以「读取失败0」掩盖未覆盖来源</span></div>'
      + DB.exceptions.map(function (e) {
          return '<div class="exc"><div class="et">' + esc(e.type) + '<span class="tm">' + esc(e.time) + "</span></div><div>" + esc(e.detail) + '</div><div style="margin-top:4px"><span class="badge-ok">' + esc(e.result) + "</span></div></div>";
        }).join("") + "</div>"
      + '<div class="panel"><div class="panel-h"><h2>实现边界（诚实清单）</h2></div><div style="padding:12px 20px 16px;font-size:12.5px;color:var(--ink-2);line-height:1.9">'
      + "已实现：巨潮全站关键词增量扫描（每交易日 08:00/18:00）、PDF 正文读取、实质筛选与剔除留痕、25 字段结构化分析、原文证据摘录与页码、批次与事件关联、后续披露并入连续案例。<br/>"
      + "未实现：SEC/官网/HKEX 渠道接入、2 小时级扫描、OCR、失败自动重试队列、数据库与对象存储、AI 问答检索。静态托管版本的前台不伪装上述能力。</div></div>";
  }

  /* ───────── 路由 ───────── */
  var TITLES = { home: "披露首页", batches: "批次简报", live: "实时抓取", archive: "披露档案", cases: "连续案例", compare: "案例对比", sources: "数据源", scans: "扫描记录", rules: "扫描规则", exceptions: "异常与边界" };
  function route() {
    var h = location.hash.replace(/^#/, "") || "/";
    var parts = h.split("/").filter(Boolean);
    var name = parts[0] || "home", param = parts[1];
    var html, navKey;
    if (name === "detail") { html = vDetail(param); navKey = "archive"; }
    else if (name === "case") { html = vCase(param); navKey = "cases"; }
    else if (name === "analysis") { var key = "analysis-" + (param || "invest"); html = vAnalysis(key); navKey = key; }
    else { html = ({ home: vHome, batches: vBatches, live: vLive, archive: vArchive, cases: vCases, compare: vCompare, sources: vSources, scans: vScans, rules: vRules, exceptions: vExceptions })[name] || vHome; html = html(); navKey = name; }
    view.innerHTML = html;
    pageTitle.textContent = TITLES[navKey] || (navKey.indexOf("analysis") === 0 ? "专业分析" : "披露首页");
    var links = document.querySelectorAll(".side-nav a");
    for (var i = 0; i < links.length; i++) links[i].classList.toggle("on", links[i].getAttribute("data-route") === navKey);
    window.scrollTo(0, 0);
    if (name === "archive") {
      archiveRows();
      var fq = document.getElementById("fq");
      fq.addEventListener("input", function () { f.q = fq.value; archiveRows(); });
      document.getElementById("fmode").addEventListener("change", function (e) { f.mode = e.target.value; archiveRows(); });
      document.getElementById("fstage").addEventListener("change", function (e) { f.stage = e.target.value; archiveRows(); });
      document.getElementById("fcurve").addEventListener("change", function (e) { f.curve = e.target.value; archiveRows(); });
      document.getElementById("fsort").addEventListener("change", function (e) { f.sort = e.target.checked ? "asc" : "desc"; archiveRows(); });
      document.getElementById("archiveRows").addEventListener("click", function (e) {
        if (e.target.closest("a")) return;
        var tr = e.target.closest("tr.click"); if (!tr) return;
        var seq = tr.getAttribute("data-seq");
        f.open = f.open === seq ? null : seq;
        archiveRows();
      });
    }
    if (name === "compare") {
      if (!f.cmp.length) f.cmp = [D[0] && D[0]["序号"], D[1] && D[1]["序号"]];
      var selA = document.getElementById("cmpA"), selB = document.getElementById("cmpB");
      if (selA && bySeq(f.cmp[0])) selA.value = f.cmp[0];
      if (selB && bySeq(f.cmp[1])) selB.value = f.cmp[1];
      function upd() { f.cmp = [selA.value, selB.value]; cmpOut(); }
      selA.addEventListener("change", upd); selB.addEventListener("change", upd);
      cmpOut();
    }
    document.getElementById("side").classList.remove("open");
    document.getElementById("sideMask").classList.remove("show");
  }
  window.addEventListener("hashchange", route);
  document.getElementById("burger").addEventListener("click", function () {
    document.getElementById("side").classList.add("open");
    document.getElementById("sideMask").classList.add("show");
  });
  document.getElementById("sideMask").addEventListener("click", function () {
    document.getElementById("side").classList.remove("open");
    document.getElementById("sideMask").classList.remove("show");
  });
  route();
})();
