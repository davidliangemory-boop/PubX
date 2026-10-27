const fs=require('fs'),vm=require('vm'),assert=require('assert');
global.window={};global.document={title:''};
vm.runInThisContext(fs.readFileSync('assets/events_index.js','utf8'));
for(const market of Object.values(window.PUBX_EVENTS_INDEX.markets)) for(const file of market.files) vm.runInThisContext(fs.readFileSync('assets/'+file.name,'utf8'));
vm.runInThisContext(fs.readFileSync('assets/page_events.js','utf8'));
const bad=/undisclosed|\bnull\b|\[\s*\]|\banalysis\b|\bdisclosed\b|资料不足|未抽取|未披露|暂无/i;
let count=0;
for(const [key,rows] of Object.entries(window.PUBX_EVENT_PARTS)){
  for(const row of rows){
    assert.strictEqual(row.research.depth,['E-013','US-c8cbe727cfeec8','HK-2ac54bcc499023'].some(id=>row.event_id.value===id||(row.aliases||[]).includes(id))?'deep':'brief');
    function checkValues(x) { if(typeof x==='string') assert(!bad.test(x),row.event_id.value+': '+x); else if(x && typeof x==='object') Object.values(x).forEach(checkValues); }
    checkValues(row.research);
    const html=window.PubXResearch.render('event',row.event_id.value,new URLSearchParams()).html;
    assert(!bad.test(html.replace(/<[^>]+>/g,'')),row.event_id.value);
    assert(!/A ·|B ·|C ·|<h[23][^>]*>交易条款|判断与条件方案/.test(html));
    for(const alias of row.aliases||[]) assert.strictEqual(window.PubXResearch.render('event',alias,new URLSearchParams()).html,html,alias);
    count++;
  }
  for(const mode of ['events','method','comps','issuers','regions','ongoing','external','capital_markets']){
    const route=key.startsWith('hk_')?'hk-market':key.startsWith('us_')?'us':'research';
    const html=window.PubXResearch.render(route,'',new URLSearchParams('v='+mode)).html;
    assert(!bad.test(html.replace(/<[^>]+>/g,'')),key+mode);
  }
}
// Empty, contaminated and legacy fields must never create publish modules.
const original=window.PUBX_EVENT_PARTS.hk_all;
const dirty={event_id:{value:'HK-test'},market:{value:'hk'},title:'LEGACY SHOULD NOT RENDER',research:{title:'测试',depth:'brief',summary:['undisclosed'],kicker:'analysis',key_metrics:[{label:'金额',value:'null'}],meaning:{financial:['未披露'],strategy:[],investment:[]},watch_items:['暂无'],timeline:[],research_sources:[]}};
window.PUBX_EVENT_PARTS.hk_all=[dirty];
let html=window.PubXResearch.render('event','HK-test',new URLSearchParams()).html;
assert(!bad.test(html));assert(!html.includes('data-module='));assert(!html.includes('LEGACY'));
html=window.PubXResearch.render('hk-market','',new URLSearchParams()).html;
assert(html.includes('公告速览'));assert(!html.includes('公开资料深读'));assert(!html.includes('LEGACY'));
window.PUBX_EVENT_PARTS.hk_all=original;
console.log('rendered article and library checks:',count);

const rich=JSON.parse(JSON.stringify(dirty));
rich.research={title:'示例',kicker:'签约',summary:['摘要'],key_metrics:[1,2,3,4,5].map(n=>({label:'数字'+n,value:String(n)})),meaning:{financial:['财务影响']},comparables:[{title:'类案',why:'结构相同',lesson:'关注审批'}],industry_context:[{text:'行业数据',url:'https://example.org/report',date:'2026-01-01'}],watch_items:['审批结果'],timeline:[{date:'2026-01-01',text:'签约'}],research_sources:[{title:'公告',url:'https://example.org/source',date:'2026-01-01'}],depth:'brief'};
window.PUBX_EVENT_PARTS.hk_all=[rich];
html=window.PubXResearch.render('event','HK-test',new URLSearchParams()).html;
let position=-1;
for(const key of ['status','summary','metrics','comparables','industry','meaning','watch','timeline','sources']){const next=html.indexOf('data-module="'+key+'"');assert(next>position,key);position=next;}
html=window.PubXResearch.render('hk-market','',new URLSearchParams()).html;
assert.strictEqual((html.match(/class="research-metric"/g)||[]).length,3);
window.PUBX_EVENT_PARTS.hk_all=original;

const gjai=original.find(e=>e.research.depth==='deep');
assert(gjai);assert.strictEqual(gjai.disclosure_date.value,'2026-08-07');
window.PUBX_EVENT_PARTS.hk_all=original;
const gold=window.PubXResearch.render('event',gjai.event_id.value,new URLSearchParams()).html;
for(const text of ['3港元','44.2%','1.8倍PB','126.15','海通国际','恒生银行','0.51','12.42','本站分析','财务数据','新闻观点','公告事实','<details','维度']) assert(gold.includes(text),text);
assert(!bad.test(gold.replace(/<[^>]+>/g,'')));
const goldMetrics=gold.split('data-module="metrics"')[1].split('</section>')[0];
assert.strictEqual((goldMetrics.match(/<tr><td>/g)||[]).length,6);
assert(!/规则22|規則22/.test(gjai.research.latest_change));
console.log('GJAI deep page and folded attachments passed:',gjai.event_id.value);

// Three deep acceptance pages and all merged SEC document routes.
const acceptance=['HK-2ac54bcc499023','E-013','US-c8cbe727cfeec8'];
for(const id of acceptance){
  const rows=Object.values(window.PUBX_EVENT_PARTS).flat();
  const e=rows.find(e=>e.event_id.value===id||(e.aliases||[]).includes(id));
  assert(e,id);
  const html=window.PubXResearch.render('event',id,new URLSearchParams()).html;
  for(const key of ['status','summary','metrics','background','comparables','industry','meaning','watch','timeline','sources'])assert(html.includes('data-module="'+key+'"'),id+': '+key);
  assert(html.includes('样本：')&&html.includes('日期：')&&html.includes('口径：'),id);
  assert((html.match(/class="research-metric"/g)||[]).length<=6);
  assert(!bad.test(html.replace(/<[^>]+>/g,'')),id);
  let position=-1;
  for(const key of ['background','comparables','industry','meaning','watch','timeline','sources']){const next=html.indexOf('data-module="'+key+'"');assert(next>position,id+': '+key);position=next;}
  for(const alias of e.aliases||[])assert.strictEqual(window.PubXResearch.render('event',alias,new URLSearchParams()).html,html,alias);
}
const outbound=window.PUBX_EVENT_PARTS.outbound_all;
assert(outbound.find(e=>e.event_id.value==='E-028').title.includes('兖矿'));
assert(window.PubXResearch.render('event','E-013',new URLSearchParams()).html.includes('项目成熟度'));
assert(window.PUBX_EVENT_PARTS.us_material.filter(e=>e.event_id.value==='US-c8cbe727cfeec8').length===1);
console.log('three acceptance routes, SEC aliases and E-028 identity passed');

// Both depths obey the same six-number cap and hide invalid nested rows.
for (const depth of ['brief','deep']) {
  rich.research.depth=depth;
  rich.research.key_metrics=Array.from({length:10},(_,i)=>({label:'数字'+i,value:String(i)}));
  rich.research.industry_context=[{}, {title:'空标题'}, {text:'有效行业信息'}];
  rich.research.timeline=[{}, {date:'2026-01-01'}];
  rich.research.meaning={financial:[{}]};
  window.PUBX_EVENT_PARTS.hk_all=[rich];
  const article=window.PubXResearch.render('event','HK-test',new URLSearchParams()).html;
  assert.strictEqual((article.match(/class="research-metric"/g)||[]).length,6);
  assert(!article.includes('data-module="timeline"'));
  assert(!article.includes('data-module="meaning"'));
  assert(!article.includes('空标题'));
  assert(!/<p><\/p>|<h3><\/h3>/.test(article));
}
window.PUBX_EVENT_PARTS.hk_all=original;
