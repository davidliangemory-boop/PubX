/* Shared progressive research views. Original routes remain available with legacy=1. */
(function () {
  'use strict';
  var esc = function (x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
  var val = function (e,k) { return e[k] && e[k].value; };
  function text(x) { return typeof x === 'object' ? JSON.stringify(x) : String(x == null || x === '' ? '待核实 / 信息缺口' : x); }
  function badge(f) { f=f || {prov:'undisclosed'}; return '<span class="pill">'+esc(f.prov)+'</span> '+esc(text(f.value)); }
  function link(url, label) { return /^(https?:\/\/|#\/)/.test(url || '') ? '<a href="'+esc(url)+'">'+esc(label)+'</a>' : esc(label); }
  function nav(m) {
    var hk=['市场总览','事件库','发行人','在途交易','收购与私有化','融资与资本运作','监管执法','类案','方法'];
    var cn=['市场总览','事件库','企业档案','国家与产业','类案研究','项目跟踪','法律议题','方法与来源'];
    var keys=m==='hk'?['overview','events','issuers','ongoing','takeovers','financing','external','comps','method']:['overview','events','issuers','regions','comps','tracking','legal','method'];
    var base=m==='hk'?'hk-market':m==='us'?'us':'research';
    var labels=m==='us'?['重大事件','资本市场流水 (424B)','旧文件视图']:m==='hk'?hk:cn;
    if(m==='outbound') return '<nav class="subnav">'+cn.map(function(s,i){return link(['#/','#/research?v=events','#/cos','#/topics?view=regions','#/research?v=comps','#/board','#/issues','#/about'][i],s);}).join(' ｜ ')+'</nav>';
    return '<nav class="subnav">'+labels.map(function (s,i) { return link('#/'+base+'?'+(m==='us'?(i===2?'legacy=1':'v='+ (i===1?'capital_markets':'events')):'v='+keys[i]),s); }).join(' ｜ ')+'</nav>';
  }
  function all() { var d=window.PUBX_EVENTS; return d ? d.hk.concat(d.us,d.outbound) : []; }
  function detail(e) {
    var m=val(e,'market'), sources=val(e,'sources') || [];
    var h=nav(m)+'<h1>'+esc(e.title)+'</h1><p>事件详情 → 事实与条款 → 四维透视 → 类案比较 → 判断与方案 → 持续跟踪</p>';
    h+='<section class="sec"><h2>A · 决策摘要</h2><p>'+badge(e.event_type)+' · '+badge(e.stage)+'</p><p>首次披露：'+badge(e.disclosure_date)+'</p><p>主体：'+badge(e.parties)+'</p><p>对价：'+badge(e.consideration)+'</p><p>规则推导结果需结合原文复核；完成公告不等于全交割。</p></section>';
    h+='<section class="sec"><h2>B · 事实与文件链</h2>'+sources.map(function(s){return '<p>'+esc(s.date)+' · '+esc(s.role || '披露文件')+' · '+link(s.url,s.title || s.file || s.doc_id)+'</p>';}).join('')+'</section>';
    var terms=['target','geography','consideration','payment_structure','ownership_before','ownership_after','control_result','financing','conditions_precedent','approvals','long_stop_date','termination','governance','event_date','disclosure_date','event_subtype','stage','status'];
    var labels=['标的','地域','对价','支付结构','交易前持股','交易后持股','控制权结果','融资','先决条件','审批','长停止日','终止','治理','事件日期','首次披露','子类型','阶段','状态'];
    h+='<section class="sec"><h2>C · 交易条款</h2>'+terms.map(function(k,i){return '<p><b>'+labels[i]+'</b> '+badge(e[k])+'</p>';}).join('')+'<h3>市场专属字段</h3>'+Object.keys(e.specialty || {}).map(function(k){return '<p>'+esc(k)+' '+badge(e.specialty[k])+'</p>';}).join('')+'</section>';
    if(m==='us') h+='<section class="sec"><h3>Exhibits · 协议优先 2.1 / 10.1 / 99.1</h3><table><thead><tr><th>申报</th><th>已收录附件</th></tr></thead><tbody>'+sources.map(function(s){return '<tr><td>'+esc(s.accession)+'</td><td>'+esc(Object.keys(s.exhibits || {}).length?text(s.exhibits):'记录未收录附件清单；待核对 filing index')+'</td></tr>';}).join('')+'</tbody></table></section>';
    h+='<section class="sec"><h2>D · 四维透视</h2>'+['financial_analysis','investment_analysis','strategy_analysis','legal_analysis'].map(function(k,i){return '<h3>'+['财务','投资','战略','法律（仅事实触发）'][i]+'</h3><p>'+badge(e[k])+'</p>';}).join('')+'<details><summary>未触发法律议题</summary>未触发不代表不存在；待原文证据后再纳入。</details><p>'+badge(e.information_gaps)+'</p></section>';
    h+='<section class="sec"><h2>E · 类案比较</h2>'+((val(e,'comparables') || []).map(function(c){return '<p>'+link('#/event/'+c.event_id,c.event_id)+' · '+esc(c.why)+'</p>';}).join('') || '<p>同库可比证据不足，待人工补充。</p>')+'</section>';
    h+='<section class="sec"><h2>F · 判断与条件方案</h2><table><thead><tr><th>触发条件</th><th>行动</th><th>依据</th></tr></thead><tbody>'+(val(e,'action_plan') || []).map(function(r){return '<tr><td>'+esc(r.condition)+'</td><td>'+esc(r.action)+'</td><td>'+esc(r.basis)+' [analysis]</td></tr>';}).join('')+'</tbody></table></section><section class="sec"><h2>G · 持续跟踪</h2><p>'+badge(e.disclosure_changes)+'</p><p>'+badge(e.next_milestones)+'</p></section>';
    if(e.legacy_id) h+='<p>'+link('#/event/'+e.legacy_id+'?legacy=1','旧版完整详情')+'</p>';
    return h;
  }
  function library(m,qs) {
    var mode=qs.get('v') || 'events', data=window.PUBX_EVENTS[m].slice();
    if(m==='us') data=data.filter(function(e){return e.stream===(mode==='capital_markets'?'capital_markets':'material');});
    if(m==='hk') data=data.filter(function(e){return mode==='external'?e.stream==='external':e.stream!=='external';});
    if(mode==='takeovers') data=data.filter(function(e){return /收购守则|私有化/.test(val(e,'event_type'));});
    if(mode==='financing') data=data.filter(function(e){return /融资|配售|供股/.test(val(e,'event_type'));});
    if(mode==='ongoing'||mode==='tracking') data=data.filter(function(e){return !/完成|终止/.test(val(e,'stage'));});
    var h=nav(m)+'<h1>'+esc(m==='hk'?'港股':m==='us'?'SEC':'出海信披')+' · '+esc(mode==='overview'?'市场总览':'事件库')+'</h1><p>共 '+data.length+' 个派生事件 · 字段带来源标签 · '+link('#/'+(m==='hk'?'hk-market':m==='us'?'us':'events')+'?legacy=1','原有页面')+'</p>';
    if(mode==='method') return h+'<section class="sec"><h2>方法与来源</h2><p>市场采集独立；构建时保守聚类。HK 90日内按交易类型、标题及引用日期；SEC 30–120日按CIK、表单族及交易对手。缺少证据保留独立事件。disclosed 原文，external 外部，analysis 推导，undisclosed 待核，na 不适用。</p></section>';
    if(mode==='issuers'||mode==='regions') { var groups={}; data.forEach(function(e){var k=text(val(e,mode==='regions'?'geography':'issuer_id')); (groups[k] || (groups[k]=[])).push(e);}); return h+Object.keys(groups).map(function(k){return '<section class="sec"><h2>'+esc(k)+'</h2>'+groups[k].map(function(e){return '<p>'+link('#/event/'+val(e,'event_id'),e.title)+'</p>';}).join('')+'</section>';}).join(''); }
    if(mode==='legal') data=data.filter(function(e){return (val(e,'legal_analysis') || []).length;});
    if(mode==='comps') data=data.filter(function(e){return (val(e,'comparables') || []).length;});
    data.sort(function(a,b){return (b.importance||0)-(a.importance||0)||String(val(b,'disclosure_date')).localeCompare(String(val(a,'disclosure_date')));});
    var page=Math.max(1,parseInt(qs.get('page'),10)||1), size=40, start=(page-1)*size;
    h+=data.slice(start,start+size).map(function(e){var ss=val(e,'sources') || []; return '<section class="sec"><h2>'+link('#/event/'+val(e,'event_id'),e.title)+'</h2><p>'+badge(e.parties)+' · '+badge(e.issuer_id)+'</p><p>'+badge(e.event_type)+' · '+badge(e.target)+' · '+badge(e.consideration)+'</p><p>阶段 '+badge(e.stage)+' · 控制权 '+badge(e.control_result)+'</p>'+Object.keys(e.specialty || {}).map(function(k){return '<p>'+esc(k)+' '+badge(e.specialty[k])+'</p>';}).join('')+'<p>最新变化 '+badge(e.disclosure_changes)+' · 文件 '+ss.length+' · 通函 '+(ss.some(function(s){return s.role==='通函';})?'有':'未收录')+' · IFA '+(ss.some(function(s){return s.role==='IFA';})?'有':'未收录')+'</p>'+(e.amounts?'<p>金额语义与置信度 [analysis]：'+esc(text(e.amounts))+'</p>':'')+'</section>';}).join('');
    var base='#/'+(m==='hk'?'hk-market':m==='us'?'us':'research')+'?v='+encodeURIComponent(mode)+'&page=';
    return h+'<p>'+(page>1?link(base+(page-1),'上一页'):'')+' · '+page+' / '+Math.max(1,Math.ceil(data.length/size))+' · '+(start+size<data.length?link(base+(page+1),'下一页'):'')+'</p>';
  }
  window.PubXResearch={nav:nav, render:function(name,id,qs){if(!window.PUBX_EVENTS || qs.get('legacy')==='1') return null; if(name==='event'){var e=all().find(function(e){return val(e,'event_id')===id;}); return e?{html:'<div style="overflow-wrap:anywhere;min-width:0">'+detail(e)+'</div>',market:val(e,'market')}:null;} var m=name==='hk-market'?'hk':name==='us'?'us':name==='research'?'outbound':null; return m?{html:'<div style="overflow-wrap:anywhere;min-width:0">'+library(m,qs)+'</div>',market:m}:null;}};
})();
