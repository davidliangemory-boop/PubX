/* Research-first event views shared by outbound, HK and SEC. */
(function () {
  'use strict';
  var esc = function (x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
  var val = function (e, k) { return e[k] && e[k].value; };
  var list = function (x) { return Array.isArray(x) ? x.filter(Boolean) : x ? [x] : []; };
  var marketName = function (m) { return m === 'hk' ? '港股' : m === 'us' ? '美国 SEC' : '出海信披'; };
  function link(url, label, cls) {
    if (!/^(https?:\/\/|#\/)/.test(url || '')) return esc(label);
    return '<a'+(cls ? ' class="'+esc(cls)+'"' : '')+' href="'+esc(url)+'"'+(/^https?:/.test(url) ? ' target="_blank" rel="noopener"' : '')+'>'+esc(label)+'</a>';
  }
  function cut(x, n) {
    x=String(x || '').replace(/\s+/g, ' ').trim();
    return x.length > n ? x.slice(0, n - 1) + '…' : x;
  }
  function nav(m) {
    var hk=['市场总览','事件库','发行人','在途交易','收购与私有化','融资与资本运作','监管执法','类案','方法'];
    var cn=['市场总览','事件库','企业档案','国家与产业','类案研究','项目跟踪','法律议题','方法与来源'];
    var keys=m==='hk'?['overview','events','issuers','ongoing','takeovers','financing','external','comps','method']:['overview','events','issuers','regions','comps','tracking','legal','method'];
    var base=m==='hk'?'hk-market':m==='us'?'us':'research';
    var labels=m==='us'?['重大事件','资本市场流水','旧文件视图']:m==='hk'?hk:cn;
    if(m==='outbound') return '<nav class="subnav">'+cn.map(function(s,i){return link(['#/','#/research?v=events','#/cos','#/topics?view=regions','#/research?v=comps','#/board','#/issues','#/about'][i],s);}).join(' ｜ ')+'</nav>';
    return '<nav class="subnav">'+labels.map(function (s,i) { return link('#/'+base+'?'+(m==='us'?(i===2?'legacy=1':'v='+(i===1?'capital_markets':'events')):'v='+keys[i]),s); }).join(' ｜ ')+'</nav>';
  }
  function all() {
    var d=window.PUBX_EVENTS;
    return d ? (d.hk||[]).concat(d.us||[],d.outbound||[]) : [];
  }
  var pending = {};
  function selection(name,id,qs) {
    var m=name==='hk-market'?'hk':name==='us'?'us':name==='research'?'outbound':name==='event'?(/^HK-/.test(id)?'hk':/^US-/.test(id)?'us':'outbound'):null;
    if(!m || qs.get('legacy')==='1') return null;
    var index=window.PUBX_EVENTS_INDEX;
    var capital=name==='event'?(index.us_capital_ids||[]).indexOf(id)>=0:qs.get('v')==='capital_markets';
    return {market:m,part:m==='us'?(capital?'capital':'material'):'all'};
  }
  function ensure(name,id,qs) {
    var pick=selection(name,id,qs); if(!pick) return Promise.resolve();
    var key=pick.market+'_'+pick.part;
    if(window.PUBX_EVENT_PARTS && window.PUBX_EVENT_PARTS[key]) return Promise.resolve();
    if(pending[key]) return pending[key];
    var file=window.PUBX_EVENTS_INDEX.markets[pick.market].files.find(function(f){return f.part===pick.part;});
    pending[key]=new Promise(function(resolve,reject){
      var script=document.createElement('script'); script.src='./assets/'+file.name+'?v=20261027p07';
      script.onload=function(){resolve();};
      script.onerror=function(){delete pending[key];script.remove();reject(new Error('事件数据加载失败'));};
      document.head.appendChild(script);
    });
    return pending[key];
  }
  function metrics(rows) {
    rows=list(rows);
    if(!rows.length) return '';
    return '<div class="research-metrics">'+rows.map(function(x){
      return '<div class="research-metric"><span>'+esc(x.label)+'</span><strong>'+esc(x.value)+'</strong>'+(x.note?'<small>'+esc(x.note)+'</small>':'')+'</div>';
    }).join('')+'</div>';
  }
  function bullets(rows) {
    rows=list(rows);
    return rows.length?'<ul class="research-bullets">'+rows.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>':'';
  }
  function meaning(r) {
    var m=r.meaning || {};
    var blocks=[['财务',m.financial],['战略',m.strategy],['投资',m.investment]].filter(function(x){return list(x[1]).length;});
    if(!blocks.length) return '';
    return '<section class="research-section"><div class="research-section-head"><div><span class="research-label analysis">本站分析</span><h2>这件事意味着什么</h2></div><p>把公告事实转成可验证的商业判断</p></div><div class="meaning-grid">'+blocks.map(function(x){return '<article class="meaning-card"><h3>'+esc(x[0])+'</h3>'+bullets(x[1])+'</article>';}).join('')+'</div></section>';
  }
  function comparables(r) {
    var rows=list(r.comparables);
    if(!rows.length) return '';
    return '<section class="research-section"><div class="research-section-head"><div><span class="research-label">类案对比</span><h2>相似交易给出的参照</h2></div><p>只保留结构、行业或监管上真正可比的案例</p></div><div class="compare-grid">'+rows.map(function(x){
      var href=x.url || (x.event_id?'#/event/'+x.event_id:'');
      return '<article class="compare-card"><h3>'+link(href,x.name || x.event_id || '类案')+'</h3><p>'+esc(x.comparison || x.why || '')+'</p>'+(x.signal?'<div class="compare-signal"><b>对本案的启示</b>'+esc(x.signal)+'</div>':'')+'</article>';
    }).join('')+'</div></section>';
  }
  function industry(r) {
    var rows=list(r.industry_context);
    if(!rows.length) return '';
    return '<section class="research-section"><div class="research-section-head"><div><span class="research-label external">行业对比</span><h2>把事件放回行业周期</h2></div><p>公开报告与经营数据提供的背景</p></div><div class="industry-grid">'+rows.map(function(x){
      return '<article class="industry-card"><h3>'+link(x.url,x.title)+'</h3><p>'+esc(x.text)+'</p></article>';
    }).join('')+'</div></section>';
  }
  function timeline(e) {
    var rows=list(val(e,'sources'));
    if(!rows.length) return '';
    var shown=rows.slice(-6).reverse();
    return '<section class="research-section"><div class="research-section-head"><div><span class="research-label">事件进程</span><h2>重要披露时间线</h2></div>'+(rows.length>6?'<p>显示最近6项，共'+rows.length+'项</p>':'')+'</div><ol class="research-timeline">'+shown.map(function(x){
      return '<li><time>'+esc(x.date || '')+'</time><div><b>'+esc(x.role || x.form || '披露')+'</b><p>'+link(x.url,cut(x.title || x.file || x.doc_id,150))+'</p></div></li>';
    }).join('')+'</ol></section>';
  }
  function sources(r,e) {
    var rows=list(r.research_sources);
    if(!rows.length) {
      rows=list(val(e,'sources')).filter(function(x){return x.url;}).map(function(x){return {label:x.title||x.file||x.doc_id,type:'原始文件',date:x.date,url:x.url};});
    }
    if(!rows.length) return '';
    return '<details class="research-sources"><summary>来源与研究边界 <span>'+rows.length+'项</span></summary><div>'+rows.map(function(x){
      return '<p><span class="source-kind">'+esc(x.type || '公开资料')+'</span>'+link(x.url,x.label || '查看来源')+(x.date?'<time>'+esc(x.date)+'</time>':'')+'</p>';
    }).join('')+'<p class="source-note">公告和监管文件用于确认事实；新闻与行业报告用于补充背景；“商业意义”为本站基于上述材料的分析，不是发行人预测。</p></div></details>';
  }
  function detail(e) {
    var m=val(e,'market'), r=e.research || {}, summary=list(r.summary);
    var sourceCount=list(r.research_sources).length || list(val(e,'sources')).length;
    var h=nav(m)+'<article class="research-page">';
    h+='<header class="research-hero"><div class="research-eyebrow"><span>'+esc(marketName(m))+'</span><span>'+esc(val(e,'event_type') || '重大事件')+'</span><span class="'+(r.depth==='deep'?'deep':'')+'">'+(r.depth==='deep'?'公开资料深读':'公告速览')+'</span></div><h1>'+esc(r.title || e.title)+'</h1>'+(r.kicker?'<p class="research-kicker">'+esc(r.kicker)+'</p>':'')+'<div class="research-meta">更新至 '+esc(r.updated_at || val(e,'disclosure_date') || '')+' · '+sourceCount+' 项来源 · '+link('#/'+(m==='hk'?'hk-market':m==='us'?'us':'research')+'?v=events','返回事件库')+'</div></header>';
    if(summary.length) h+='<section class="research-lead">'+summary.map(function(x){return '<p>'+esc(x)+'</p>';}).join('')+'</section>';
    h+=metrics(r.key_metrics);
    h+=meaning(r)+comparables(r)+industry(r);
    var watch=list(r.watch_items);
    if(watch.length) h+='<section class="research-section watch-section"><div class="research-section-head"><div><span class="research-label watch">持续观察</span><h2>哪些变化会改变判断</h2></div></div>'+bullets(watch)+'</section>';
    h+=timeline(e)+sources(r,e);
    if(e.legacy_id) h+='<p class="legacy-link">'+link('#/event/'+e.legacy_id+'?legacy=1','查看旧版结构化详情')+'</p>';
    return h+'</article>';
  }
  function card(e) {
    var r=e.research || {}, summary=list(r.summary), ms=list(r.key_metrics).slice(0,3);
    return '<article class="event-research-card"><div class="event-card-top"><span>'+esc(val(e,'event_type') || '重大事件')+'</span><span>'+esc(val(e,'stage') || '跟踪中')+'</span><span class="depth '+(r.depth==='deep'?'deep':'')+'">'+(r.depth==='deep'?'深读':'速览')+'</span></div><h2>'+link('#/event/'+val(e,'event_id'),r.title || e.title)+'</h2>'+(r.kicker?'<p class="event-kicker">'+esc(r.kicker)+'</p>':'')+(summary.length?'<p class="event-abstract">'+esc(cut(summary[0],190))+'</p>':'')+(ms.length?'<div class="event-mini-metrics">'+ms.map(function(x){return '<span><b>'+esc(x.value)+'</b>'+esc(x.label)+'</span>';}).join('')+'</div>':'')+'<div class="event-card-foot"><span>'+esc(val(e,'disclosure_date') || '')+'</span><span>'+list(r.research_sources).length+'项研究来源</span><span>'+link('#/event/'+val(e,'event_id'),'阅读分析 →')+'</span></div></article>';
  }
  function library(m,qs) {
    var mode=qs.get('v') || 'events', data=window.PUBX_EVENTS[m].slice();
    if(m==='us') data=data.filter(function(e){return e.stream===(mode==='capital_markets'?'capital_markets':'material');});
    if(m==='hk') data=data.filter(function(e){return mode==='external'?e.stream==='external':e.stream!=='external';});
    if(mode==='takeovers') data=data.filter(function(e){return /收购守则|私有化/.test(val(e,'event_type'));});
    if(mode==='financing') data=data.filter(function(e){return /融资|配售|供股/.test(val(e,'event_type'));});
    if(mode==='ongoing'||mode==='tracking') data=data.filter(function(e){return !/完成|终止/.test(val(e,'stage'));});
    var h=nav(m)+'<header class="library-hero"><span>'+esc(marketName(m))+'</span><h1>'+(mode==='overview'?'市场总览':'事件研究库')+'</h1><p>先读事件，再看商业意义。默认隐藏空字段，只在证据足够时展示数字、类案与行业判断。</p><div>'+data.length+' 个事件 · '+data.filter(function(e){return e.research&&e.research.depth==='deep';}).length+' 个公开资料深读 · '+link('#/'+(m==='hk'?'hk-market':m==='us'?'us':'events')+'?legacy=1','旧版页面')+'</div></header>';
    if(mode==='method') return h+'<section class="research-method"><h2>研究方法</h2><p>第一层用公告、监管文件和公司报告确认事实；第二层检索新闻、行业报告与可比交易，解释估值、周期和执行风险；第三层才给出财务、战略与投资判断。缺少证据的字段不展示，只有足以改变结论的未知事项会进入“持续观察”。</p><p>“公开资料深读”已经过个案检索与编辑；“公告速览”由已收录材料生成，适合快速定位，但仍应回到原文核对。</p></section>';
    if(mode==='issuers'||mode==='regions') {
      var groups={};
      data.forEach(function(e){var k=String(val(e,mode==='regions'?'geography':'issuer_id') || '其他'); (groups[k] || (groups[k]=[])).push(e);});
      return h+'<div class="research-group-list">'+Object.keys(groups).map(function(k){return '<section><h2>'+esc(k)+'</h2>'+groups[k].slice(0,20).map(function(e){return '<p>'+link('#/event/'+val(e,'event_id'),(e.research&&e.research.title)||e.title)+'</p>';}).join('')+'</section>';}).join('')+'</div>';
    }
    if(mode==='legal') data=data.filter(function(e){return list(val(e,'legal_analysis')).length;});
    if(mode==='comps') data=data.filter(function(e){return e.research&&list(e.research.comparables).length;});
    data.sort(function(a,b){return (b.importance||0)-(a.importance||0)||String(val(b,'disclosure_date')).localeCompare(String(val(a,'disclosure_date')));});
    var page=Math.max(1,parseInt(qs.get('page'),10)||1), size=30, start=(page-1)*size;
    h+='<div class="event-research-list">'+data.slice(start,start+size).map(card).join('')+'</div>';
    var base='#/'+(m==='hk'?'hk-market':m==='us'?'us':'research')+'?v='+encodeURIComponent(mode)+'&page=';
    return h+'<nav class="research-pagination">'+(page>1?link(base+(page-1),'← 上一页'):'<span></span>')+'<span>'+page+' / '+Math.max(1,Math.ceil(data.length/size))+'</span>'+(start+size<data.length?link(base+(page+1),'下一页 →'):'<span></span>')+'</nav>';
  }
  window.PubXResearch={
    nav:nav,
    ensure:ensure,
    render:function(name,id,qs){
      var pick=selection(name,id,qs); if(!pick) return null;
      var rows=(window.PUBX_EVENT_PARTS||{})[pick.market+'_'+pick.part]; if(!rows) return null;
      window.PUBX_EVENTS=window.PUBX_EVENTS||{}; window.PUBX_EVENTS[pick.market]=rows;
      if(name==='event'){
        var e=all().find(function(event){return val(event,'event_id')===id;});
        return e?{html:'<div class="research-shell">'+detail(e)+'</div>',market:val(e,'market')}:null;
      }
      var m=name==='hk-market'?'hk':name==='us'?'us':name==='research'?'outbound':null;
      return m?{html:'<div class="research-shell">'+library(m,qs)+'</div>',market:m}:null;
    }
  };
})();
