/* 港股 / SEC 二级信息架构：企业档案 · 交易进度 · 运作类型 · 监管议题 · 总览。
   只从已收录事件字段（event_type / stage / sources.form / sources.items / 标题）聚合，空模块隐藏。
   分类口径见 docs/HK_SEC_IA.md（后续可细拆）。港美按公司资本运作组织，不做国别/管辖页。 */
(function () {
  'use strict';
  var esc = function (x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
  var bad = /^(undisclosed|null|analysis|disclosed)$/i;
  function val(e, k) { var v = e[k] && e[k].value; return v == null || bad.test(String(v)) ? '' : v; }
  function srcs(e) { return (e.sources && e.sources.value) || []; }
  function titleOf(e) { return (e.research && e.research.title) || val(e, 'title') || val(e, 'event_id'); }
  function nameOf(e) { var p = val(e, 'parties'); return (Array.isArray(p) ? p[0] : p) || val(e, 'issuer_id'); }
  function lastFiling(e) { return srcs(e).map(function (s) { return s.date || ''; }).filter(function (d) { return /^\d{4}-\d{2}-\d{2}$/.test(d); }).sort().pop() || val(e, 'disclosure_date'); }
  function titles(e) { return srcs(e).map(function (s) { return s.title || ''; }).join(' ') + ' ' + (val(e, 'title') || ''); }
  function forms(e) { return srcs(e).map(function (s) { return String(s.form || '').toUpperCase(); }); }
  function items(e) { var o = {}; srcs(e).forEach(function (s) { (s.items || []).forEach(function (i) { o[i] = 1; }); }); return o; }
  function base(m) { return m === 'hk' ? 'hk-market' : 'us'; }
  function href(m, v, extra) { return '#/' + base(m) + '?v=' + v + (extra || ''); }
  function a(url, label) { return '<a href="' + esc(url) + '">' + esc(label) + '</a>'; }

  /* ── 运作类型（family → 细类）。顺序即优先级，命中第一个 ── */
  var HK_TYPES = [
    ['收购与私有化', function (e) { return /收购守则|私有化/.test(val(e, 'event_type')) || /收購守則|要約|私有化|協議安排/.test(titles(e)); }],
    ['并购与重大资产交易', function (e) { return /主要交易|非常重大交易|须予披露交易|并购/.test(val(e, 'event_type')); }],
    ['关连交易', function (e) { return /关连交易/.test(val(e, 'event_type')) && !/CCT/.test(val(e, 'event_type')); }],
    ['持续关连交易（CCT）', function (e) { return /CCT/.test(val(e, 'event_type')); }],
    ['配售 / 供股 / 股权融资', function (e) { return /配售供股|融资/.test(val(e, 'event_type')); }],
    ['控制权与治理', function (e) { return val(e, 'event_type') === '治理变更'; }],
    ['监管执法', function (e) { return val(e, 'event_type') === '监管执法'; }],
    ['停复牌 / 清盘 / 其他公司行动', function () { return true; }]
  ];
  var US_TYPES = [
    ['并购与业务合并', function (e, f, it) { return val(e, 'event_type') === '并购' || f.some(function (x) { return /^(425|S-4|F-4|DEFM14A|PREM14A|SC TO|SC 14D9|SC 13E3)/.test(x); }) || it['2.01'] || it['5.01']; }],
    ['重大协议签订 / 终止', function (e, f, it) { return it['1.01'] || it['1.02']; }],
    ['结构化票据 / 债券定价（424B）', function (e, f) { return e.stream === 'capital_markets' && f.some(function (x) { return /^424B2/.test(x) || /^FWP/.test(x); }); }],
    ['股权与注册发行', function (e, f, it) { return val(e, 'event_type') === '融资' || it['2.03'] || it['3.02'] || f.some(function (x) { return /^(S-1|F-1|S-3|F-3|424B)/.test(x); }); }],
    ['股东表决与证券权利', function (e, f, it) { return it['5.07'] || it['3.03']; }],
    ['上市地位与审计', function (e, f, it) { return it['3.01'] || it['4.01']; }],
    ['董事高管与章程', function (e, f, it) { return val(e, 'event_type') === '治理变更' || it['5.02'] || it['5.03']; }],
    ['业绩 / Reg FD', function (e, f, it) { return it['2.02'] || it['7.01']; }],
    ['外国私人发行人 6-K 其他', function (e, f) { return f.some(function (x) { return /^6-K/.test(x); }); }],
    ['其他重大事项', function () { return true; }]
  ];
  function actionType(m, e) {
    if (e._ia_t) return e._ia_t;
    var f = forms(e), it = items(e), T = m === 'hk' ? HK_TYPES : US_TYPES;
    for (var i = 0; i < T.length; i++) if (T[i][1](e, f, it)) return (e._ia_t = T[i][0]);
  }
  /* ── 监管议题（多标签，一个事件可落多个桶） ── */
  var US_ITEMS = {'1.01':'签订重大协议','1.02':'终止重大协议','2.01':'完成收购或处置','2.02':'经营业绩','2.03':'新增债务义务','2.05':'退出或重组成本','3.01':'退市或上市规则通知','3.02':'未登记股权发行','3.03':'证券持有人权利变更','4.01':'更换审计师','5.01':'控制权变更','5.02':'董事高管变动','5.03':'章程或财年变更','5.07':'股东表决结果','7.01':'Reg FD 披露','8.01':'其他事项'};
  function regBuckets(m, e) {
    var out = [], t = val(e, 'event_type'), ti = titles(e);
    if (m === 'hk') {
      if (/收购守则|私有化/.test(t) || /收購守則|要約/.test(ti)) out.push('《收购守则》');
      if (/主要交易|非常重大交易|须予披露交易|并购/.test(t)) out.push('上市规则第14章 · 须予公布的交易');
      if (/关连/.test(t) || /關連/.test(ti)) out.push('上市规则第14A章 · 关连交易');
      if (/配售供股|融资/.test(t)) out.push('股本发行 · 一般/特别授权');
      if (/通函|股東特別大會|股東大會/.test(ti)) out.push('通函与股东批准');
      if (/停牌|復牌|短暫停止買賣/.test(ti)) out.push('停复牌');
      if (t === '监管执法' || /紀律|譴責|清盤/.test(ti)) out.push('执法 / 纪律 / 清盘');
      if (t === '治理变更') out.push('第13章 · 董事/核数师等持续责任');
    } else {
      var it = items(e), f = forms(e);
      Object.keys(it).sort().forEach(function (i) { if (US_ITEMS[i]) out.push('8-K Item ' + i + ' ' + US_ITEMS[i]); });
      if (f.some(function (x) { return /^(SC TO|SC 14D9|SC 13E3)/.test(x); })) out.push('要约收购（Reg 14D/14E · 13E-3）');
      if (f.some(function (x) { return /^(DEFM14A|PREM14A|DEF 14A|DEFA14A)/.test(x); })) out.push('委托书（Reg 14A）');
      if (f.some(function (x) { return /^(425|S-4|F-4)/.test(x); })) out.push('并购注册与沟通（S-4/F-4/425）');
      if (f.some(function (x) { return /^(S-1|F-1|S-3|F-3)/.test(x); })) out.push('发行注册（S-1/F-1/S-3/F-3）');
      if (f.some(function (x) { return /^424B/.test(x); })) out.push('招股书补充（Rule 424(b)）');
      if (f.some(function (x) { return /^6-K/.test(x); })) out.push('外国私人发行人 6-K');
    }
    return out;
  }
  var DONE = /完成|终止/;
  function isDeal(m, e) { var t = actionType(m, e); return !/治理|董事高管|业绩|其他|执法|6-K|424B|上市地位/.test(t); }
  function row(e, extra) {
    return '<tr><td>' + esc(lastFiling(e)) + '</td><td>' + a('#/event/' + val(e, 'event_id'), titleOf(e)) + '</td><td>' + esc(extra || '') + '</td></tr>';
  }
  function table(head, rows) { return rows.length ? '<table class="ia-table"><thead><tr>' + head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.join('') + '</tbody></table>' : ''; }
  function count(list, fn) { var o = {}; list.forEach(function (e) { [].concat(fn(e)).forEach(function (k) { if (k) o[k] = (o[k] || 0) + 1; }); }); return o; }
  function chips(m, v, obj, key, order) {
    var ks = order ? order.filter(function (k) { return obj[k]; }) : Object.keys(obj).sort(function (x, y) { return obj[y] - obj[x]; });
    return '<p class="ia-chips">' + ks.map(function (k) { return '<span class="tag" style="margin:2px 6px 2px 0;display:inline-block">' + a(href(m, v, '&' + key + '=' + encodeURIComponent(k)), k + ' · ' + obj[k]) + '</span>'; }).join('') + '</p>';
  }
  function byDate(x, y) { return String(lastFiling(y)).localeCompare(String(lastFiling(x))); }
  function pager(m, v, qs, n, size) {
    var page = Math.max(1, parseInt(qs.get('page'), 10) || 1), keep = '';
    qs.forEach(function (val, k) { if (k !== 'v' && k !== 'page') keep += '&' + k + '=' + encodeURIComponent(val); });
    var b = href(m, v, keep + '&page='), pages = Math.max(1, Math.ceil(n / size));
    return pages > 1 ? '<p>' + (page > 1 ? a(b + (page - 1), '上一页') : '') + ' · ' + page + ' / ' + pages + ' · ' + (page < pages ? a(b + (page + 1), '下一页') : '') + '</p>' : '';
  }
  function slice(list, qs, size) { var page = Math.max(1, parseInt(qs.get('page'), 10) || 1); return list.slice((page - 1) * size, page * size); }
  var MK = { hk: '港股·HKEX', us: '美股·SEC' };

  function companies(m, qs, rows) {
    var iid = qs.get('issuer'), h = '';
    if (iid) {
      var chain = rows.filter(function (e) { return val(e, 'issuer_id') === iid; }).sort(byDate);
      if (!chain.length) return '<h1>企业档案</h1><p>未找到该发行人。</p>';
      var tc = count(chain, function (e) { return actionType(m, e); });
      h += '<h1>' + esc(nameOf(chain[0])) + '</h1><p class="muted">' + esc(MK[m]) + ' · ' + (m === 'hk' ? '股份代号 ' : 'CIK ') + esc(iid) + ' · 本站收录 ' + chain.length + ' 个资本运作/公司事件 · ' + a(href(m, 'companies'), '← 全部企业') + '</p>';
      h += '<section class="research-section"><h2>运作类型分布</h2><p>' + Object.keys(tc).map(function (k) { return '<span class="tag" style="margin:2px 6px 2px 0;display:inline-block">' + a(href(m, 'types', '&type=' + encodeURIComponent(k)), k + ' · ' + tc[k]) + '</span>'; }).join('') + '</p></section>';
      var act = chain.filter(function (e) { return isDeal(m, e) && !DONE.test(val(e, 'stage')); });
      if (act.length) h += '<section class="research-section"><h2>在途交易</h2>' + table(['最近文件', '事件', '阶段'], act.map(function (e) { return row(e, val(e, 'stage') + (val(e, 'long_stop_date') ? ' · 截止 ' + val(e, 'long_stop_date') : '')); })) + '</section>';
      h += '<section class="research-section"><h2>事件链（按最近文件倒序）</h2>' + table(['最近文件', '事件', '运作类型 · 阶段'], chain.map(function (e) { return row(e, actionType(m, e) + ' · ' + (val(e, 'stage') || '')); })) + '</section>';
      return h;
    }
    var g = {}; rows.forEach(function (e) { var k = val(e, 'issuer_id'); if (!k) return; (g[k] = g[k] || []).push(e); });
    var q = (qs.get('q') || '').toLowerCase();
    var list = Object.keys(g).map(function (k) { var c = g[k].sort(byDate); return { id: k, name: nameOf(c[0]), n: c.length, last: lastFiling(c[0]), deals: c.filter(function (e) { return isDeal(m, e); }).length, types: count(c, function (e) { return actionType(m, e); }) }; })
      .filter(function (x) { return !q || (x.name + ' ' + x.id).toLowerCase().indexOf(q) >= 0; })
      .sort(function (x, y) { return y.deals - x.deals || y.n - x.n || String(y.last).localeCompare(String(x.last)); });
    h += '<h1>' + esc(MK[m]) + ' · 企业档案</h1><p class="muted">按发行人归档本市场资本运作事件链；排序：交易类事件数 → 事件总数 → 最近文件。共 ' + list.length + ' 家。</p>';
    h += '<form onsubmit="location.hash=\'' + href(m, 'companies', '&q=') + '\'+encodeURIComponent(this.q.value);return false"><input name="q" value="' + esc(qs.get('q') || '') + '" placeholder="公司名 / ' + (m === 'hk' ? '股份代号' : 'CIK') + '"/></form>';
    h += table(['发行人', '事件', '交易类', '最近文件', '主要运作类型'], slice(list, qs, 60).map(function (x) {
      var top = Object.keys(x.types).sort(function (p, r) { return x.types[r] - x.types[p]; }).slice(0, 3).join('、');
      return '<tr><td>' + a(href(m, 'companies', '&issuer=' + encodeURIComponent(x.id)), x.name) + ' <span class="dim">' + esc(x.id) + '</span></td><td>' + x.n + '</td><td>' + x.deals + '</td><td>' + esc(x.last) + '</td><td>' + esc(top) + '</td></tr>';
    }));
    return h + pager(m, 'companies', qs, list.length, 60);
  }
  function progress(m, qs, rows) {
    var act = rows.filter(function (e) { return isDeal(m, e) && !DONE.test(val(e, 'stage')); });
    var done = rows.filter(function (e) { return isDeal(m, e) && DONE.test(val(e, 'stage')); });
    var st = qs.get('stage'), sc = count(act, function (e) { return val(e, 'stage') || '未标阶段'; });
    var list = (st ? act.filter(function (e) { return (val(e, 'stage') || '未标阶段') === st; }) : act).sort(function (x, y) {
      var lx = val(x, 'long_stop_date'), ly = val(y, 'long_stop_date'); if (lx && !ly) return -1; if (ly && !lx) return 1; if (lx && ly && lx !== ly) return lx.localeCompare(ly); return byDate(x, y); });
    var h = '<h1>' + esc(MK[m]) + ' · 交易进度</h1><p class="muted">在途交易 ' + act.length + ' 笔（不含治理/业绩/其他类公告' + (m === 'us' ? '与 424B 定价流水' : '') + '）；已完成或终止 ' + done.length + ' 笔。有最后截止日的排前，其余按最近文件倒序。</p>';
    h += chips(m, 'progress', sc, 'stage') + (st ? '<p>' + a(href(m, 'progress'), '× 清除阶段：' + st) + '</p>' : '');
    var lsd = act.filter(function (e) { return val(e, 'long_stop_date'); });
    if (lsd.length && !st) h += '<section class="research-section"><h2>有最后截止日</h2>' + table(['最近文件', '事件', '截止日 · 阶段'], lsd.map(function (e) { return row(e, val(e, 'long_stop_date') + ' · ' + val(e, 'stage')); })) + '</section>';
    h += '<section class="research-section"><h2>' + (st ? esc(st) : '全部在途') + '（' + list.length + '）</h2>' + table(['最近文件', '事件', '运作类型 · 阶段 · 文件数'], slice(list, qs, 60).map(function (e) { return row(e, actionType(m, e) + ' · ' + (val(e, 'stage') || '') + ' · ' + srcs(e).length + ' 份'); })) + '</section>';
    return h + pager(m, 'progress', qs, list.length, 60);
  }
  function types(m, qs, rows) {
    var T = (m === 'hk' ? HK_TYPES : US_TYPES).map(function (x) { return x[0]; });
    var tc = count(rows, function (e) { return actionType(m, e); }), t = qs.get('type');
    var h = '<h1>' + esc(MK[m]) + ' · 运作类型</h1><p class="muted">按资本运作类型聚合（口径见 docs/HK_SEC_IA.md，可继续细拆）。</p>' + chips(m, 'types', tc, 'type', T);
    if (!t) {
      return h + T.filter(function (k) { return tc[k]; }).map(function (k) {
        var ev = rows.filter(function (e) { return actionType(m, e) === k; }).sort(function (x, y) { return (y.importance || 0) - (x.importance || 0) || byDate(x, y); });
        var sub = count(ev, function (e) { return val(e, 'event_type'); });
        return '<section class="research-section"><h2>' + a(href(m, 'types', '&type=' + encodeURIComponent(k)), k) + ' · ' + ev.length + '</h2><p class="dim">细类：' + Object.keys(sub).map(function (s) { return esc(s) + ' ' + sub[s]; }).join('、') + ' · 在途 ' + ev.filter(function (e) { return !DONE.test(val(e, 'stage')); }).length + '</p>' + table(['最近文件', '事件', '阶段'], ev.slice(0, 5).map(function (e) { return row(e, val(e, 'stage')); })) + '</section>';
      }).join('');
    }
    var list = rows.filter(function (e) { return actionType(m, e) === t || val(e, 'event_type') === t; }).sort(byDate);
    return h + '<p>' + a(href(m, 'types'), '× 清除：' + t) + '</p>' + table(['最近文件', '事件', '发行人 · 阶段'], slice(list, qs, 60).map(function (e) { return row(e, nameOf(e) + ' · ' + val(e, 'stage')); })) + pager(m, 'types', qs, list.length, 60);
  }
  function regulatory(m, qs, rows) {
    var bc = count(rows, function (e) { return regBuckets(m, e); }), b = qs.get('reg');
    var h = '<h1>' + esc(MK[m]) + ' · 监管议题</h1><p class="muted">' + (m === 'hk' ? '按《收购守则》、上市规则第14章/14A章、股本发行授权、通函与股东批准等监管路径归桶；依据事件类型与文件标题，非法律意见。' : '按 8-K Item 与表格类型（要约、委托书、注册、424B、6-K）归桶；一个事件可落多桶。') + '</p>' + chips(m, 'regulatory', bc, 'reg');
    if (!b) return h;
    var list = rows.filter(function (e) { return regBuckets(m, e).indexOf(b) >= 0; }).sort(byDate);
    return h + '<p>' + a(href(m, 'regulatory'), '× 清除：' + b) + '</p>' + table(['最近文件', '事件', '运作类型 · 阶段'], slice(list, qs, 60).map(function (e) { return row(e, actionType(m, e) + ' · ' + val(e, 'stage')); })) + pager(m, 'regulatory', qs, list.length, 60);
  }
  function overview(m, qs, rows) {
    var T = (m === 'hk' ? HK_TYPES : US_TYPES).map(function (x) { return x[0]; });
    var tc = count(rows, function (e) { return actionType(m, e); });
    var act = rows.filter(function (e) { return isDeal(m, e) && !DONE.test(val(e, 'stage')); });
    var issuers = {}; rows.forEach(function (e) { if (val(e, 'issuer_id')) issuers[val(e, 'issuer_id')] = 1; });
    var deep = rows.filter(function (e) { return e.research && e.research.depth === 'deep'; });
    var h = '<h1>' + esc(MK[m]) + ' · 总览</h1><p class="muted">上市公司资本运作与公司行动：按公司 + 交易/项目组织。</p>';
    h += '<div class="research-metrics">' + [['事件', rows.length, href(m, 'events')], ['发行人', Object.keys(issuers).length, href(m, 'companies')], ['在途交易', act.length, href(m, 'progress')], ['公开资料深读', deep.length, href(m, 'events')]].map(function (x) { return '<div class="research-metric"><span>' + a(x[2], x[0]) + '</span><strong>' + x[1] + '</strong></div>'; }).join('') + '</div>';
    h += '<section class="research-section"><h2>运作类型</h2>' + chips(m, 'types', tc, 'type', T) + '</section>';
    var recent = act.slice().sort(byDate).slice(0, 10);
    if (recent.length) h += '<section class="research-section"><h2>最近有文件的在途交易</h2>' + table(['最近文件', '事件', '运作类型 · 阶段'], recent.map(function (e) { return row(e, actionType(m, e) + ' · ' + val(e, 'stage')); })) + '<p>' + a(href(m, 'progress'), '全部交易进度 →') + '</p></section>';
    if (deep.length) h += '<section class="research-section"><h2>公开资料深读</h2>' + table(['最近文件', '事件', '运作类型'], deep.map(function (e) { return row(e, actionType(m, e)); })) + '</section>';
    return h;
  }
  window.PubXIA = {
    actionType: actionType, regBuckets: regBuckets,
    render: function (m, qs, rows) {
      var v = qs.get('v');
      return v === 'companies' ? companies(m, qs, rows) : v === 'progress' ? progress(m, qs, rows) : v === 'types' ? types(m, qs, rows) : v === 'regulatory' ? regulatory(m, qs, rows) : overview(m, qs, rows);
    }
  };
})();
