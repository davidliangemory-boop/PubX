/* Shared research publish views. Legacy routes remain explicit opt-ins. */
(function () {
  'use strict';
  var esc = function (x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
  var val = function (e,k) { return e[k] && e[k].value; };
  var empty = /undisclosed|\bnull\b|\[\s*\]|\banalysis\b|\bdisclosed\b|资料不足|未抽取|未披露/i;
  function link(url, label) { return /^(https?:\/\/|#\/|#source-)/.test(url || '') ? '<a href="'+esc(url)+'">'+esc(label)+'</a>' : esc(label); }
  function nav(m) {
    var hk=['市场总览','事件库','发行人','在途交易','收购与私有化','融资与资本运作','监管执法','类案','方法'];
    var cn=['市场总览','事件库','企业档案','国家与产业','类案研究','项目跟踪','法律议题','方法与来源'];
    var keys=m==='hk'?['overview','events','issuers','ongoing','takeovers','financing','external','comps','method']:['overview','events','issuers','regions','comps','tracking','legal','method'];
    var base=m==='hk'?'hk-market':m==='us'?'us':'research';
    var labels=m==='us'?['重大事件','资本市场流水 (424B)','旧文件视图']:m==='hk'?hk:cn;
    if(m==='outbound') return '<nav class="subnav">'+cn.map(function(s,i){return link(['#/','#/research?v=events','#/cos','#/topics?view=regions','#/research?v=comps','#/board','#/issues','#/about'][i],s);}).join(' ｜ ')+'</nav>';
    return '<nav class="subnav">'+labels.map(function (s,i) { return link('#/'+base+'?'+(m==='us'?(i===2?'legacy=1':'v='+ (i===1?'capital_markets':'events')):'v='+keys[i]),s); }).join(' ｜ ')+'</nav>';
  }
  function all() { var d=window.PUBX_EVENTS; return d ? (d.hk||[]).concat(d.us||[],d.outbound||[]) : []; }
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
      var script=document.createElement('script'); script.src='./assets/'+file.name+'?v=20261027b3';
      script.onload=function(){resolve();};
      script.onerror=function(){delete pending[key];script.remove();reject(new Error('事件数据加载失败'));};
      document.head.appendChild(script);
    });
    return pending[key];
  }
  var banned = /\b(?:null|undisclosed|analysis|disclosed)\b|\[\s*\]|未披露|未抽取|资料不足|暂无/i;
  function clean(x) {
    if (typeof x === 'string') return banned.test(x) ? '' : x.trim();
    if (Array.isArray(x)) return x.map(clean).filter(function(v){return v && (typeof v !== 'object' || Object.keys(v).length);});
    if (x && typeof x === 'object') { var out={}; Object.keys(x).forEach(function(k){var v=clean(x[k]);if(v && (!Array.isArray(v)||v.length)) out[k]=v;});return out; }
    return typeof x === 'number' ? x : '';
  }
  var sourceMap = {};
  function citations(ids) { return (ids||[]).filter(function(id){return sourceMap[id]&&sourceMap[id].url;}).map(function(id){return ' '+link(sourceMap[id].url,'〔'+(sourceMap[id].citationIndex||sourceMap[id].title)+'〕');}).join(''); }
  function paragraphs(rows) { return (Array.isArray(rows)?rows:[]).filter(function(x){return typeof x==='string'||x.text;}).map(function(x){return '<p>'+esc(typeof x==='string'?x:x.text)+(x.sources?citations(x.sources):'')+'</p>';}).join(''); }
  function moduleHTML(key,title,body) { return body ? '<section class="research-section" data-module="'+key+'"><h2>'+title+'</h2>'+body+'</section>' : ''; }
  function metrics(rows,limit) { return (rows||[]).filter(function(x){return x.label && x.value && typeof x.value!=='object';}).slice(0,limit).map(function(x){return '<div class="research-metric"><span>'+esc(x.label)+'</span><strong>'+esc(x.value)+'</strong>'+(x.note?'<small>'+esc(x.note)+'</small>':'')+'</div>';}).join(''); }
  // Acceptance articles opt in; announcement briefs retain their existing view.
  function deepDetail(e,r) {
    sourceMap={}; (r.research_sources||[]).forEach(function(s,i){if(s.id)sourceMap[s.id]=Object.assign({},s,{citationIndex:i+1});});
    document.title=r.title+' · PubX';
    var h='<article class="research-article"><h1>'+esc(r.title)+'</h1>';
    h+=moduleHTML('status','当前状态',paragraphs([r.kicker]));
    h+=moduleHTML('summary','事件摘要',paragraphs(r.summary));
    var coreRows=(r.key_metrics||[]).filter(function(x){return x.label&&x.value;}).slice(0,9);
    h+=moduleHTML('metrics','核心交易数据',coreRows.length?'<table><thead><tr><th>指标</th><th>数值与口径</th></tr></thead><tbody>'+coreRows.map(function(x){return '<tr><td>'+esc(x.label)+'</td><td>'+esc(x.value)+(x.note?'；'+esc(x.note):'')+citations(x.sources)+'</td></tr>';}).join('')+'</tbody></table>':'');
    h+=moduleHTML('cash','现金需求与报道金额',paragraphs(r.cash_explanation));
    h+=moduleHTML('background','经营背景',paragraphs(r.operating_background));
    h+=moduleHTML('maturity','项目成熟度',paragraphs(r.project_maturity));
    var rows=(r.comparables||[]).filter(function(c){return c.dimension&&c.this_case&&c.peer&&c.lesson;});
    var table=rows.length?'<table><thead><tr><th>维度</th><th>本案</th><th>类案</th><th>对判断的影响</th></tr></thead><tbody>'+rows.map(function(c){return '<tr><td>'+esc(c.dimension)+'</td><td>'+esc(c.this_case)+'</td><td>'+esc(c.title)+'：'+esc(c.peer)+'</td><td>'+esc(c.lesson)+citations(c.sources)+'</td></tr>';}).join('')+'</tbody></table>':'';
    h+=moduleHTML('comparables','类案对比 · 本站分析',table+paragraphs(r.comparison_notes));
    h+=moduleHTML('industry','行业对比',(r.industry_context||[]).map(function(c){if((c.text||'').indexOf('样本：')===0){return '<h3>'+esc(c.title||'')+'</h3>'+paragraphs([c]);} return '<h3>'+esc(c.title||'')+'</h3><p>样本：'+esc(c.sample||'')+'</p><p>日期：'+esc(c.date||'')+'</p><p>口径：'+esc(c.basis||'')+'</p>'+paragraphs([c]);}).join(''));
    var body='',meaning=r.meaning||{};
    ['financial','strategy','investment'].forEach(function(k,i){var p=(meaning[k]||[]).map(function(x){return '<li>'+paragraphs([x])+'</li>';}).join('');if(p)body+='<h3>'+['财务意义','战略意义','投资意义'][i]+'</h3><ul>'+p+'</ul>';});
    h+=moduleHTML('meaning','财务、战略与投资意义 · 本站分析',body);
    h+=moduleHTML('watch','待观察',paragraphs(r.watch_items));
    h+=moduleHTML('timeline','时间线',(r.timeline||[]).map(function(t){return '<p><time>'+esc(t.date)+'</time> '+esc(t.text)+'</p>';}).join(''));
    h+=moduleHTML('sources','来源与分析边界',(r.research_sources||[]).filter(function(s){return s.url&&s.date;}).map(function(s,i){return '<p>〔'+(i+1)+'〕'+esc(s.label)+' · '+link(s.url,s.title)+' · '+esc(s.date)+'</p>';}).join('')+paragraphs(r.boundaries));
    var attachments=(r.attachments||[]).filter(function(s){return s.title&&s.url;});
    if(attachments.length) h+='<details class="research-attachments"><summary>Rule 22等辅助附件（'+attachments.length+'）</summary>'+attachments.map(function(s){return '<p>'+esc(s.date||'')+' '+link(s.url,s.title)+'</p>';}).join('')+'</details>';
    return h+'</article>';
  }
  function detail(e) {
    var r=clean(e.research||{}), h='<article class="research-article">';
    if(r.depth==='deep') return deepDetail(e,r);
    sourceMap={}; (r.research_sources||[]).forEach(function(s){if(s.id)sourceMap[s.id]=s;});
    document.title=(r.title||'事件研究')+' · PubX';
    if(r.title) h+='<h1>'+esc(r.title)+'</h1>';
    h+=moduleHTML('status','当前状态及最新实质变化',paragraphs([r.kicker,r.latest_change].filter(Boolean)));
    h+=moduleHTML('summary','事件摘要',paragraphs(r.summary));
    h+=moduleHTML('metrics','关键数字',metrics(r.key_metrics,6));
    var meaning=r.meaning||{}, body='';
    ['financial','strategy','investment'].forEach(function(k,i){var p=paragraphs(meaning[k]);if(p)body+='<h3>'+['财务','战略','投资'][i]+'</h3>'+p;});
    h+=moduleHTML('meaning','财务、战略与投资意义 · 本站分析',body);
    h+=moduleHTML('comparables','类案对比 · 本站分析',(r.comparables||[]).filter(function(c){return c.why && c.lesson;}).map(function(c){return c.dimension ? '<table><thead><tr><th>维度</th><th>本案</th><th>类案</th><th>对判断的影响</th></tr></thead><tbody><tr><td>'+esc(c.dimension)+'</td><td>'+esc(c.this_case)+'</td><td>'+esc(c.title)+'：'+esc(c.peer)+'</td><td>'+esc(c.lesson)+'</td></tr></tbody></table><p>可比原因：'+esc(c.why)+citations(c.sources)+'</p>' : '<p>'+esc(c.title||'')+'：'+esc(c.why)+'；'+esc(c.lesson)+'</p>';}).join(''));
    h+=moduleHTML('industry','行业对比 · 外部信息',(r.industry_context||[]).filter(function(c){return c.text&&(c.sample||(c.url&&c.date));}).map(function(c){return '<p>'+esc(c.label||'')+' · '+esc(c.sample||'')+(c.date?' · '+esc(c.date):'')+'</p><p>'+link(c.url,c.text)+citations(c.sources)+'</p>';}).join(''));
    h+=moduleHTML('watch','会改变判断的关键变量',paragraphs(r.watch_items));
    h+=moduleHTML('timeline','事件时间线',(r.timeline||[]).filter(function(t){return t.text;}).map(function(t){return '<p><time>'+esc(t.date||'')+'</time> '+esc(t.text)+'</p>';}).join(''));
    h+=moduleHTML('sources','来源与分析边界',(r.research_sources||[]).filter(function(s){return s.title&&s.url;}).map(function(s){return '<p>'+esc(s.label||'')+' · '+link(s.url,s.title)+(s.date?' · '+esc(s.date):'')+'</p>';}).join('')+paragraphs(r.boundaries));
    var attachments=(r.attachments||[]).filter(function(s){return s.title&&s.url;});
    if(attachments.length) h+='<details class="research-attachments"><summary>Rule 22等辅助附件（'+attachments.length+'）</summary>'+attachments.map(function(s){return '<p>'+esc(s.date||'')+' '+link(s.url,s.title)+'</p>';}).join('')+'</details>';
    return h+'</article>';
  }
  function card(e) {
    var r=clean(e.research||{});
    return '<section class="research-card">'+(r.title?'<h2>'+link('#/event/'+val(e,'event_id'),r.title)+'</h2>':'')+(r.stage?'<span class="pill">'+esc(r.stage)+'</span>':'')+'<span class="pill">'+(r.depth==='deep'?'公开资料深读':'公告速览')+'</span>'+paragraphs(r.card_summary?[r.card_summary]:(r.summary||[]).slice(0,1))+'<div class="research-metrics">'+metrics(r.key_metrics,3)+'</div>'+(r.latest_change?'<p class="research-latest">'+esc(r.latest_change)+'</p>':'')+'</section>';
  }
  function library(m,qs) {
    var mode=qs.get('v') || 'events', data=window.PUBX_EVENTS[m].slice();
    if(m==='us') data=data.filter(function(e){return e.stream===(mode==='capital_markets'?'capital_markets':'material');});
    if(m==='hk') data=data.filter(function(e){return mode==='external'?e.stream==='external':e.stream!=='external';});
    if(mode==='takeovers') data=data.filter(function(e){return /收购守则|私有化/.test(val(e,'event_type'));});
    if(mode==='financing') data=data.filter(function(e){return /融资|配售|供股/.test(val(e,'event_type'));});
    if(mode==='ongoing'||mode==='tracking') data=data.filter(function(e){return !/完成|终止/.test(val(e,'stage'));});
    if(mode==='comps') data=data.filter(function(e){return (clean(e.research||{}).comparables||[]).length;});
    var h=nav(m)+'<h1>'+esc(m==='hk'?'港股':m==='us'?'SEC':'出海信披')+' · 事件库</h1><p>共 '+data.length+' 个事件</p>';
    if(mode==='method') return h+'<p>公告速览基于已有结构化资料；事实以链接原文为准。本站分析单独标示，文件数量不代表实质进展。</p>';
    data.sort(function(a,b){return (b.importance||0)-(a.importance||0)||String(val(b,'disclosure_date')).localeCompare(String(val(a,'disclosure_date')));});
    var page=Math.max(1,parseInt(qs.get('page'),10)||1), size=40, start=(page-1)*size;
    h+=data.slice(start,start+size).map(card).join('');
    var base='#/'+(m==='hk'?'hk-market':m==='us'?'us':'research')+'?v='+encodeURIComponent(mode)+'&page=';
    return h+'<p>'+(page>1?link(base+(page-1),'上一页'):'')+' · '+page+' / '+Math.max(1,Math.ceil(data.length/size))+' · '+(start+size<data.length?link(base+(page+1),'下一页'):'')+'</p>';
  }
  window.PubXResearch={nav:nav, ensure:ensure, render:function(name,id,qs){var pick=selection(name,id,qs); if(!pick) return null; var rows=(window.PUBX_EVENT_PARTS||{})[pick.market+'_'+pick.part]; if(!rows) return null; window.PUBX_EVENTS=window.PUBX_EVENTS||{}; window.PUBX_EVENTS[pick.market]=rows; if(name==='event'){var e=all().find(function(e){return val(e,'event_id')===id || (e.aliases || []).indexOf(id)>=0;}); return e?{html:'<div style="overflow-wrap:anywhere;min-width:0">'+detail(e)+'</div>',market:val(e,'market')}:null;} var m=name==='hk-market'?'hk':name==='us'?'us':name==='research'?'outbound':null; return m?{html:'<div style="overflow-wrap:anywhere;min-width:0">'+library(m,qs)+'</div>',market:m}:null;}};
})();
