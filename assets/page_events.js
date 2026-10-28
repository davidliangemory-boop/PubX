/* Shared research publish views. Legacy routes remain explicit opt-ins. */
(function () {
  'use strict';
  var esc = function (x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
  var val = function (e,k) { return e[k] && e[k].value; };
  var empty = /undisclosed|\bnull\b|\[\s*\]|\banalysis\b|\bdisclosed\b|资料不足|未抽取|未披露/i;
  function link(url, label) { return /^(https?:\/\/|#\/|#source-)/.test(url || '') ? '<a href="'+esc(url)+'">'+esc(label)+'</a>' : esc(label); }
  /* 二级导航：三个市场同密度明面展示（不再藏「更多」）。港美=公司资本运作，不做国别管辖。 */
  var NAV={
    outbound:[['#/research?v=overview','总览'],['#/research?v=events','事件库'],['#/cos','企业档案'],['#/topics?view=regions','国家与产业'],['#/board','项目看板'],['#/issues','法律议题'],['#/research?v=comps','类案'],['#/research?v=method','方法']],
    hk:[['overview','总览'],['events','事件库'],['companies','企业档案'],['progress','交易进度'],['types','运作类型'],['regulatory','监管议题'],['takeovers','收购与私有化'],['method','方法']],
    us:[['overview','总览'],['events','事件库'],['companies','企业档案'],['progress','交易进度'],['types','运作类型'],['regulatory','监管议题'],['capital_markets','资本市场流水'],['method','方法']]
  };
  function nav(m) {
    var base=m==='hk'?'hk-market':m==='us'?'us':'research';
    var h=(typeof location!=='undefined'&&location.hash)||'#/', hp=h.split('?')[0], hq=new URLSearchParams(h.split('?')[1]||'');
    var cur=hp==='#/event'||/^#\/event\//.test(hp)?'events':(hq.get('v')||(hp==='#/'+base?'events':''));
    return (NAV[m]||[]).map(function(x){
      var href=x[0].charAt(0)==='#'?x[0]:'#/'+base+'?v='+x[0];
      var on=x[0].charAt(0)==='#'?(href.split('?')[0]===hp&&(hp!=='#/research'||href.indexOf('v='+cur)>=0)||(hp==='#/company'&&href==='#/cos')||(hp==='#/topics'&&href.indexOf('#/topics')===0)):x[0]===cur;
      return '<a href="'+esc(href)+'"'+(on?' class="on"':'')+'>'+esc(x[1])+'</a>';
    }).join('')+(m!=='outbound'?'<a class="dim" style="margin-left:auto" href="#/'+base+'?legacy=1">旧文件视图</a>':'');
  }
  function all() { var d=window.PUBX_EVENTS; return d ? (d.hk||[]).concat(d.us||[],d.outbound||[]) : []; }
  var pending = {};
  function selection(name,id,qs) {
    var m=name==='hk-market'?'hk':name==='us'?'us':name==='research'?'outbound':name==='event'?(/^HK-/.test(id)?'hk':/^US-/.test(id)?'us':'outbound'):null;
    if(!m || (name!=='event' && qs.get('legacy')==='1')) return null;
    var index=window.PUBX_EVENTS_INDEX;
    var v=qs.get('v')||'events';
    var capital=name==='event'?(index.us_capital_ids||[]).indexOf(id)>=0:v==='capital_markets';
    var both=m==='us'&&name==='us'&&IA_MODES.indexOf(v)>=0;
    var part=m==='us'?(capital?'capital':'material'):'all';
    return {market:m,part:part,parts:both?['material','capital']:[part]};
  }
  var IA_MODES=['overview','companies','progress','types','regulatory'];
  function ensure(name,id,qs) {
    var pick=selection(name,id,qs); if(!pick) return Promise.resolve();
    return Promise.all(pick.parts.map(function(part){return ensurePart(pick.market,part);}));
  }
  function ensurePart(market,part) {
    var pick={market:market,part:part};
    var key=pick.market+'_'+pick.part;
    if(window.PUBX_EVENT_PARTS && window.PUBX_EVENT_PARTS[key]) return Promise.resolve();
    if(pending[key]) return pending[key];
    var file=window.PUBX_EVENTS_INDEX.markets[pick.market].files.find(function(f){return f.part===pick.part;});
    pending[key]=new Promise(function(resolve,reject){
      var script=document.createElement('script'); script.src=window.pubxAsset(file.name);
      script.onload=function(){resolve();};
      script.onerror=function(){delete pending[key];script.remove();reject(new Error('事件数据加载失败'));};
      document.head.appendChild(script);
    });
    return pending[key];
  }
  var banned = /\b(?:null|undisclosed|analysis|disclosed)\b|\[\s*\]|未披露|未抽取|资料不足|暂无/i;
  function clean(x) {
    if (typeof x === 'string') return banned.test(x) ? '' : x.trim();
    if (Array.isArray(x)) return x.map(clean).filter(function(v){return (v || v===0) && (typeof v !== 'object' || Object.keys(v).length);});
    if (x && typeof x === 'object') { var out={}; Object.keys(x).forEach(function(k){var v=clean(x[k]);if((v || v===0) && (!Array.isArray(v)||v.length) && (typeof v!=='object'||Object.keys(v).length)) out[k]=v;});return out; }
    return typeof x === 'number' ? x : '';
  }
  var sourceMap = {};
  function citations(ids) { return (ids||[]).filter(function(id){return sourceMap[id]&&sourceMap[id].url;}).map(function(id){return ' '+link(sourceMap[id].url,'〔'+(sourceMap[id].citationIndex||sourceMap[id].title)+'〕');}).join(''); }
  function paragraphs(rows) { return (Array.isArray(rows)?rows:[]).filter(function(x){return typeof x==='string'||x.text;}).map(function(x){return '<p>'+esc(typeof x==='string'?x:x.text)+(x.sources?citations(x.sources):'')+'</p>';}).join(''); }
  function moduleHTML(key,title,body) { return body ? '<section class="research-section" data-module="'+key+'"><h2>'+title+'</h2>'+body+'</section>' : ''; }
  function metrics(rows,limit) { return (rows||[]).filter(function(x){return x.label && x.value !== undefined && x.value !== '' && typeof x.value!=='object';}).slice(0,limit).map(function(x){return '<div class="research-metric"><span>'+esc(x.label)+'</span><strong>'+esc(x.value)+citations(x.sources)+(x.source_urls||[]).map(function(url){return ' '+link(url,'原文');}).join('')+'</strong>'+(x.note?'<small>'+esc(x.note)+'</small>':'')+'</div>';}).join(''); }
  function amountExplanations(r) {
    var cash=typeof r.cash_explanation==='string'?[r.cash_explanation]:(r.cash_explanation||[]);
    if(cash.length) return cash;
    return (r.watch_items||[]).filter(function(item){var t=typeof item==='string'?item:item.text||'';return /媒体|报道|新聞|新闻/.test(t)&&/公告/.test(t)&&/金额|金額|对价|估值|现金|億|亿|美元|港元/.test(t)&&/差异|差額|差额|不同|不一致|口径|估算|未计入|没有计入|不能/.test(t);});
  }
  function tipsHTML(rows) {
    rows=(rows||[]).filter(function(t){return t.label&&t.value;}); if(!rows.length) return '';
    var groups={}, order=[]; rows.forEach(function(t){if(!groups[t.kind]){groups[t.kind]=[];order.push(t.kind);}groups[t.kind].push(t);});
    var pref=['公司','运作类型','交易进度','监管路径']; order.sort(function(a,b){var x=pref.indexOf(a),y=pref.indexOf(b);return (x<0?99:x)-(y<0?99:y);});
    return '<section class="research-tips" data-module="tips" style="display:flex;flex-direction:column;gap:4px;margin:8px 0 14px">'+order.map(function(k){return '<div><b style="display:inline-block;min-width:4.5em">'+esc(k)+'</b>'+groups[k].map(function(t){var inner=esc(t.label)+'：'+esc(t.value);return '<span class="tag" style="margin:2px 6px 2px 0;display:inline-block">'+(t.href?link(t.href,t.label+'：'+t.value):inner)+'</span>';}).join('')+'</div>';}).join('')+'</section>';
  }
  // All research uses the same article layout; empty regions disappear.
  function deepDetail(e,r) {
    sourceMap={}; (r.research_sources||[]).forEach(function(s,i){if(s.id)sourceMap[s.id]=Object.assign({},s,{citationIndex:i+1});});
    document.title=(r.title||'事件研究')+' · PubX';
    var h='<article class="research-article">'+(r.title?'<h1>'+esc(r.title)+'</h1>':'')+'<p class="research-depth"><span class="pill">'+(r.depth==='deep'?'公开资料深读':'公告速览')+'</span></p>'+tipsHTML(iaTips(e,r.tips));
    h+=moduleHTML('status','当前状态',paragraphs([r.kicker,r.latest_change].filter(function(x,i,a){return x && a.indexOf(x)===i;})));
    ['first_disclosure','latest_document','latest_substantive'].forEach(function(key,i){var d=r[key];if(d&&d.title)h+='<p class="research-disclosure">'+['首次披露','最新文件','最新实质变化'][i]+'：'+esc(d.date||'')+' '+link(d.url,d.title)+'</p>';});
    h+=moduleHTML('summary','事件摘要',paragraphs(r.summary));
    var coreRows=(r.metric_slots||r.key_metrics||[]).filter(function(x){return x.label&&x.value !== undefined&&x.value !== ''&&typeof x.value!=='object';});
    h+=moduleHTML('metrics','核心交易数据',coreRows.length?'<div class="research-metrics">'+metrics(coreRows,r.metric_slots?coreRows.length:6)+'</div>':'');
    h+=moduleHTML('cash','现金需求与报道金额',paragraphs(amountExplanations(r)));
    h+=moduleHTML('background','经营背景',paragraphs(r.operating_background));
    h+=moduleHTML('maturity','项目成熟度',paragraphs(r.project_maturity));
    var rows=(r.comparables||[]).filter(function(c){return c.dimension&&c.this_case&&c.peer&&c.lesson;});
    var table=rows.length?'<table><thead><tr><th>维度</th><th>本案</th><th>类案</th><th>对本案意味着什么</th></tr></thead><tbody>'+rows.map(function(c){return '<tr><td>'+esc(c.dimension)+'</td><td>'+esc(c.this_case)+'</td><td>'+esc(c.title)+'：'+esc(c.peer)+'</td><td>'+esc(c.lesson)+citations(c.sources)+'</td></tr>';}).join('')+'</tbody></table>':'';
    h+=moduleHTML('comparables','类案对比 · 本站分析',table+(r.comparables||[]).filter(function(c){return !c.dimension&&c.why&&c.lesson;}).map(function(c){return '<p>'+esc(c.title||'')+'：'+esc(c.why)+'；对本案意味着什么：'+esc(c.lesson)+citations(c.sources)+'</p>';}).join('')+((table||(r.comparables||[]).some(function(c){return !c.dimension&&c.why&&c.lesson;}))?paragraphs(r.comparison_notes):''));
    h+=moduleHTML('industry','行业对比',(r.industry_context||[]).filter(function(c){return c.text&&c.sample&&c.date&&c.basis;}).map(function(c){
      var meta=['sample','date','basis'].map(function(k,i){return c[k]?'<p>'+['样本：','日期：','口径：'][i]+esc(c[k])+'</p>':'';}).join('');
      return (c.title?'<h3>'+esc(c.title)+'</h3>':'')+meta+paragraphs([c])+(c.url?'<p>'+link(c.url,'查看原文')+'</p>':'');
    }).join(''));
    var body='',meaning=r.meaning||{};
    ['financial','strategy','investment'].forEach(function(k,i){var p=(meaning[k]||[]).map(function(x){var p=paragraphs([x]);return p?'<li>'+p+'</li>':'';}).join('');if(p)body+='<h3>'+['财务意义','战略意义','投资意义'][i]+'</h3><p class="muted research-prompt">'+['花多少钱、钱从哪来、报表影响','解决什么问题、业务/组织怎么变','价格是否合理、完成概率与催化'][i]+'</p><ul>'+p+'</ul>';});
    h+=moduleHTML('meaning','财务、战略与投资意义 · 本站分析',body);
    h+=moduleHTML('frame','怎么读这类事件 · 本站分析框架',(r.analysis_frame||[]).length?'<ul>'+r.analysis_frame.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul><p class="muted">框架按事件类型给出阅读重点，不代表本案结论；结论以原文为准。</p>':'');
    h+=moduleHTML('watch','尚待观察',paragraphs(r.watch_items));
    h+=moduleHTML('timeline','时间线',(r.timeline||[]).filter(function(t){return t.text;}).map(function(t){return '<p><time>'+esc(t.date)+'</time> '+esc(t.text)+'</p>';}).join(''));
    var layers=r.source_layers||[{label:'核心文件',sources:r.research_sources||[]}];
    h+=moduleHTML('sources','事件资料包',layers.map(function(layer){var body=(layer.sources||[]).filter(function(s){return s.title&&s.url;}).map(function(s){return '<p>'+(s.label?esc(s.label)+' · ':'')+link(s.url,s.title)+' · '+esc(s.date||'')+'</p>';}).join('');return body?'<div class="research-source-layer"><h3>'+esc(layer.label)+'</h3>'+body+'</div>':'';}).join('')+paragraphs(r.boundaries));
    var attachments=(r.attachments||[]).filter(function(s){return s.title&&s.url;});
    if(attachments.length) h+='<details class="research-attachments"><summary>Rule 22等辅助附件（'+attachments.length+'）</summary>'+attachments.map(function(s){return '<p>'+esc(s.date||'')+' '+link(s.url,s.title)+'</p>';}).join('')+'</details>';
    return h+'</article>';
  }
  // 港美：按 page_ia.js 细拆规则补一条「运作类型」提示，深链到运作类型 tab（规则见 docs/HK_SEC_IA.md）。
  function iaTips(e,tips){var m=val(e,'market'); if(!window.PubXIA||(m!=='hk'&&m!=='us')) return tips; var b=window.PubXIA.actionType(m,e); if(!b) return tips; var base=m==='hk'?'hk-market':'us'; return [{kind:'运作类型',label:'运作类型',value:b,href:'#/'+base+'?v=types&type='+encodeURIComponent(b)}].concat((tips||[]).map(function(t){return t.kind==='运作类型'&&t.label==='事件类型'?Object.assign({},t,{label:'公告分类'}):t;}));}
  function detail(e) {
    return deepDetail(e,clean(e.research||{}));
  }
  function card(e) {
    var r=clean(e.research||{});
    return '<section class="research-card">'+(r.title?'<h2>'+link('#/event/'+val(e,'event_id'),r.title)+'</h2>':'')+(r.stage?'<span class="pill">'+esc(r.stage)+'</span>':'')+'<span class="pill">'+(r.depth==='deep'?'公开资料深读':'公告速览')+'</span>'+paragraphs(r.card_summary?[r.card_summary]:(r.summary||[]).slice(0,1).map(function(x){return (typeof x==='string'?x:x.text||'').split(/[。！？]/)[0]+'。';}))+tipsHTML((r.tips||[]).filter(function(t){return t.kind==='国别'||t.kind==='运作类型'||t.label==='阶段';}).slice(0,3))+'<div class="research-metrics">'+metrics(r.key_metrics,3)+'</div>'+(r.latest_change?'<p class="research-latest">'+esc(r.latest_change)+'</p>':'')+'</section>';
  }
  function library(m,qs) {
    var mode=qs.get('v') || 'events', data=window.PUBX_EVENTS[m].slice();
    if(m==='us') data=data.filter(function(e){return e.stream===(mode==='capital_markets'?'capital_markets':'material');});
    if(m==='hk') data=data.filter(function(e){return mode==='external'?e.stream==='external':e.stream!=='external';});
    if(mode==='takeovers') data=data.filter(function(e){return /收购守则|私有化/.test(val(e,'event_type'));});
    if(mode==='financing') data=data.filter(function(e){return /融资|配售|供股/.test(val(e,'event_type'));});
    if(mode==='ongoing'||mode==='tracking') data=data.filter(function(e){return !/完成|终止/.test(val(e,'stage'));});
    ['issuer','geo','type'].forEach(function(k){var q=qs.get(k);if(!q)return;data=data.filter(function(e){if(k==='issuer')return val(e,'issuer_id')===q;if(k==='type')return val(e,'event_type')===q;return ((clean(e.research||{}).tips)||[]).some(function(t){return t.kind==='国别'&&String(t.value).indexOf(q)>=0;});});});
    if(mode==='comps') data=data.filter(function(e){return (clean(e.research||{}).comparables||[]).length;});
    var h='<h1>'+esc(m==='hk'?'港股':m==='us'?'SEC':'出海信披')+' · 事件库</h1><p>共 '+data.length+' 个事件</p>';
    if(mode==='overview'){var deep=data.filter(function(e){return e.research&&e.research.depth==='deep';}).length;h+='<p class="muted">公开资料深读 '+deep+' · 公告速览 '+(data.length-deep)+'</p>';}
    if(mode==='method') return h+'<p>公告速览基于已有结构化资料；事实以链接原文为准。本站分析单独标示，文件数量不代表实质进展。</p>';
    data.sort(function(a,b){return (b.importance||0)-(a.importance||0)||String(val(b,'disclosure_date')).localeCompare(String(val(a,'disclosure_date')));});
    var page=Math.max(1,parseInt(qs.get('page'),10)||1), size=40, start=(page-1)*size;
    h+=data.slice(start,start+size).map(card).join('');
    var base='#/'+(m==='hk'?'hk-market':m==='us'?'us':'research')+'?v='+encodeURIComponent(mode)+['issuer','geo','type'].map(function(k){return qs.get(k)?'&'+k+'='+encodeURIComponent(qs.get(k)):'';}).join('')+'&page=';
    return h+'<p>'+(page>1?link(base+(page-1),'上一页'):'')+' · '+page+' / '+Math.max(1,Math.ceil(data.length/size))+' · '+(start+size<data.length?link(base+(page+1),'下一页'):'')+'</p>';
  }
  window.PubXResearch={nav:nav, ensure:ensure, render:function(name,id,qs){var pick=selection(name,id,qs); if(!pick) return null; var P=window.PUBX_EVENT_PARTS||{}; if(pick.parts.some(function(p){return !P[pick.market+'_'+p];})) return null; var rows=[].concat.apply([],pick.parts.map(function(p){return P[pick.market+'_'+p];})); window.PUBX_EVENTS=window.PUBX_EVENTS||{}; window.PUBX_EVENTS[pick.market]=rows; if(name==='event'){var e=all().find(function(e){return val(e,'event_id')===id || (e.aliases || []).indexOf(id)>=0;}); return e?{html:'<div style="overflow-wrap:anywhere;min-width:0">'+detail(e)+'</div>',market:val(e,'market')}:{html:'<h1>事件研究</h1><p>未找到该事件。</p>',market:pick.market};} var m=name==='hk-market'?'hk':name==='us'?'us':name==='research'?'outbound':null; return m?{html:'<div style="overflow-wrap:anywhere;min-width:0">'+(window.PubXIA&&m!=='outbound'&&IA_MODES.indexOf(qs.get('v'))>=0?window.PubXIA.render(m,qs,rows):library(m,qs))+'</div>',market:m}:null;}};
})();
