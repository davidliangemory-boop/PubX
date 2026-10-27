const fs=require('fs'),vm=require('vm'),assert=require('assert');
global.window={};global.document={title:''};
vm.runInThisContext(fs.readFileSync('assets/events_index.js','utf8'));
for(const market of Object.values(window.PUBX_EVENTS_INDEX.markets)) for(const file of market.files) vm.runInThisContext(fs.readFileSync('assets/'+file.name,'utf8'));
vm.runInThisContext(fs.readFileSync('assets/page_events.js','utf8'));
const bad=/undisclosed|\bnull\b|\[\s*\]|\banalysis\b|\bdisclosed\b|资料不足|未抽取|未披露|暂无/i;
let count=0;
for(const [key,rows] of Object.entries(window.PUBX_EVENT_PARTS)){
  for(const row of rows){
    if(!key.startsWith('outbound')) assert.strictEqual(row.research.depth,['E-013','US-c8cbe727cfeec8','HK-2ac54bcc499023'].some(id=>row.event_id.value===id||(row.aliases||[]).includes(id))?'deep':'brief');
    function checkValues(x) { if(typeof x==='string') assert(!bad.test(x),row.event_id.value+': '+x); else if(x && typeof x==='object') Object.values(x).forEach(checkValues); }
    checkValues(row.research);
    const html=window.PubXResearch.render('event',row.event_id.value,new URLSearchParams()).html;
    assert(!bad.test(html.replace(/<[^>]+>/g,'')),row.event_id.value);
    assert(!/A ·|B ·|C ·|<h[23][^>]*>交易条款|判断与条件方案/.test(html));
    for(const section of html.matchAll(/<section[^>]*data-module="([^"]+)"[^>]*><h2>[^<]*<\/h2>([\s\S]*?)<\/section>/g)) {
      assert(section[2].replace(/<[^>]+>/g,'').trim(),row.event_id.value+': empty '+section[1]);
    }
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
rich.research={title:'示例',kicker:'签约',summary:['摘要'],key_metrics:[1,2,3,4,5].map(n=>({label:'数字'+n,value:String(n)})),meaning:{financial:['财务影响']},comparables:[{title:'类案',why:'结构相同',lesson:'关注审批'}],industry_context:[{text:'行业数据',sample:'行业样本',basis:'统计口径',url:'https://example.org/report',date:'2026-01-01'}],watch_items:['审批结果'],timeline:[{date:'2026-01-01',text:'签约'}],research_sources:[{title:'公告',url:'https://example.org/source',date:'2026-01-01'}],depth:'brief'};
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
assert(gjai.research.metric_slots.length>0);
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
  assert((html.match(/class="research-metric"/g)||[]).length>0);
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

// Round 1: legacy parameters cannot select a field matrix for event details.
for (const id of acceptance) {
  const article=window.PubXResearch.render('event',id,new URLSearchParams('legacy=1'));
  assert(article && article.html.includes('research-article'),id);
}
for (const market of ['outbound','hk','us']) {
  const nav=window.PubXResearch.nav(market);
  assert.strictEqual((nav.split('<details')[0].match(/<a /g)||[]).length,4,market);
  assert(nav.includes('<summary>更多</summary>'),market);
}
console.log('Round 1 market navigation and article routing passed');

// Initial styles/scripts share the same fingerprint used by lazy resource helpers.
const writes=[];
const bootstrap={window:{},document:{write:html=>writes.push(html)}};
for(const match of fs.readFileSync('index.html','utf8').matchAll(/<script>([\s\S]*?)<\/script>/g)) vm.runInNewContext(match[1],bootstrap);
assert(/^\d{8}d\d+$/.test(bootstrap.window.PUBX_BUILD));
assert.strictEqual(writes.length,12);
for(const html of writes) assert(html.includes('?v='+bootstrap.window.PUBX_BUILD),html);
assert.strictEqual(bootstrap.window.pubxAsset('events_hk.js'),'./assets/events_hk.js?v='+bootstrap.window.PUBX_BUILD);
console.log('Shared initial/lazy cache fingerprint passed');

// Round 2: all populated template slots survive; empty slots/layers disappear.
rich.research={title:'结构测试',metric_slots:[{label:'要约价',value:'3港元',source_urls:['https://example.org/price']},{label:'协同',value:'3亿美元',note:'前瞻'},{label:'空槽位',value:''}],source_layers:[{label:'核心文件',sources:[{title:'协议',url:'https://example.org/agreement'}]},{label:'外部资料',sources:[]}],first_disclosure:{date:'2026-01-01',title:'首次公告',url:'https://example.org/first'},latest_document:{date:'2026-03-01',title:'Rule 22',url:'https://example.org/aux'},latest_substantive:{date:'2026-02-01',title:'审批',url:'https://example.org/approval'},attachments:[{title:'Rule 22',url:'https://example.org/aux'}]};
window.PUBX_EVENT_PARTS.hk_all=[rich];
html=window.PubXResearch.render('event','HK-test',new URLSearchParams()).html;
for(const text of ['要约价','3港元','https://example.org/price','前瞻','事件资料包','核心文件','首次披露','最新文件','最新实质变化']) assert(html.includes(text),text);
assert(!html.includes('空槽位'));assert(!html.includes('<h3>外部资料</h3>'));
assert(/<details class="research-attachments">/.test(html));assert(!/<details[^>]*open/.test(html));
window.PUBX_EVENT_PARTS.hk_all=original;
console.log('Round 2 slots, disclosure distinctions and source layers passed');

// Round 3: scoped industry rows, actual implications, and existing amount explanations.
rich.research={title:'第三轮',key_metrics:[{label:'对价',value:'75亿港元'}],
  comparables:[{title:'有效案例',why:'相同结构',lesson:'融资影响成本'},{title:'缺少启示',why:'行业相同'}],
  comparison_notes:['比较说明'],
  industry_context:[{text:'完整行业数字',sample:'券商样本',date:'2026-01-01',basis:'PB中位数'},
    ...['sample','date','basis'].map(key=>{const row={text:'不完整行业数字',sample:'样本',date:'2026-01-01',basis:'口径'};delete row[key];return row;})],
  watch_items:[{text:'媒体估算75亿港元与公告现金需求存在口径差异，未计入借出股份。',sources:['notice']}],
  research_sources:[{id:'notice',title:'原始公告',url:'https://example.org/notice'}],
  meaning:{financial:['融资增加利息支出'],investment:['审批决定完成时间']}};
window.PUBX_EVENT_PARTS.hk_all=[rich];
html=window.PubXResearch.render('event','HK-test',new URLSearchParams()).html;
for(const text of ['对本案意味着什么','融资影响成本','完整行业数字','花多少钱、钱从哪来、报表影响','价格是否合理、完成概率与催化'])assert(html.includes(text),text);
for(const text of ['缺少启示','不完整行业数字','解决什么问题、业务/组织怎么变'])assert(!html.includes(text),text);
assert(html.indexOf('data-module="cash"')>html.indexOf('data-module="metrics"'));
assert(html.indexOf('data-module="cash"')<html.indexOf('data-module="comparables"'));
assert(html.match(/data-module="cash"[\s\S]*?https:\/\/example.org\/notice/));
rich.research.watch_items=['关注媒体报道与审批进展'];
rich.research.comparables=[{title:'缺少启示',why:'行业相同'}];
rich.research.industry_context=[{text:'无口径数字'}];
html=window.PubXResearch.render('event','HK-test',new URLSearchParams()).html;
for(const key of ['cash','comparables','industry'])assert(!html.includes('data-module="'+key+'"'),key);
rich.research.cash_explanation=[{text:'公告既有现金解释',sources:['notice']}];
assert(window.PubXResearch.render('event','HK-test',new URLSearchParams()).html.includes('公告既有现金解释'));
window.PUBX_EVENT_PARTS.hk_all=original;
assert.strictEqual(bootstrap.window.PUBX_BUILD,'20261027d3');
console.log('Round 3 implications, industry scope, amount hook and analysis prompts passed');
