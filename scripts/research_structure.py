"""Shared Round 2 publication structure; never generates research prose."""
import re
from research_schema import publish_text, document_role

AUX = re.compile(r'規則\s*22|规则\s*22|rule\s*22|dealings? (?:disclosure|in securities)|證券交易披露|证券交易披露|交易披露', re.I)
PROCEDURAL = re.compile(r'monthly return|monthly update|monthly progress|月報|月报|月度更新|每月更新|月度進展|月度进展|next.day disclosure|翌日披露|dispatch.*(?:circular|scheme)|(?:寄發|寄发).*通函|notice of.*(?:meeting|board)|(?:股東|股东|董事會|董事会|法院).*(?:會議通告|会议通告|會議日期|会议日期)|董事會會議通告|董事会会议通知|股東大會通告|股东大会通告|董事會召開日期|董事会召开日期|date of.*meeting|attachment.only|supplemental exhibit|補充附件|补充附件|展示文件|公司資料報表|公司资料报表|登記股東|登记股东|暫停辦理股份過戶|暂停办理股份过户', re.I)

def is_substantive(source):
    """One rule for all markets, regardless of assigned document role."""
    title = str(source.get('title') or source.get('file') or '')
    form = str(source.get('form') or '').upper()
    if AUX.search(title) or PROCEDURAL.search(title) or form == '425':
        return False
    if source.get('label') in ('新闻观点','外部信息'):
        return False
    if source.get('attachment_only') or source.get('supplemental_exhibit') or re.match(r'^EX-?', form):
        return False
    return document_role(source) not in ('企业资料', '外部资料', '辅助附件', 'Rule22等辅助材料', '交易通讯', '辅助材料', '辅助材料/Rule 22', '交易披露') and source.get('material_layer') not in ('企业资料', '外部资料')

# (display label, explicit structured keys, existing metric labels)
OUTBOUND = [('买方','buyer','买方'),('卖方','seller','卖方'),('标的','target','标的'),('国家地区','geography','国家|地区'),('交易形式','event_subtype,event_type','交易形式'),('权益比例','ownership_after','权益|持股'),('对价及支付','consideration,payment_structure','总出资|现金|设备|对价|或有支付'),('阶段','stage','阶段')]
PRIVATE = [('要约价','offer_price','每股价格|注销价|要约价'),('溢价','premium','溢价'),('隐含估值','valuation','估值'),('要约人持股','ownership_before','要约人持股'),('最高现金需求','cash_requirement,consideration','现金需求'),('融资','financing','资金来源|融资'),('未完成条件','conditions_precedent','未完成条件'),('时间表','timetable,long_stop_date','时间表|截止日')]
CH14 = [('百分比率','percent_ratio','百分比率'),('交易分类','ch14_class','交易分类'),('股东批准','shareholder_approval','股东批准'),('对价','consideration','对价'),('标的盈利','target_profit','标的盈利'),('估值','valuation','估值')]
CONNECTED = [(x,k,x) for x,k in [('关联关系','connected_relationship'),('年度上限','annual_cap'),('定价机制','pricing_mechanism'),('独立股东批准','independent_shareholder_approval'),('IFA结论','ifa_conclusion')]]
ISSUE = [(x,k,x) for x,k in [('发行规模','issue_size'),('折让','discount'),('摊薄','dilution'),('资金用途','use_of_proceeds'),('主要股东变化','ownership_after')]]
ENFORCEMENT = [(x,k,x) for x,k in [('监管机构','regulator'),('具体行为','conduct'),('处罚结果','penalty'),('业务限制','business_restrictions'),('治理影响','governance_impact')]]
SEC = [('企业价值','enterprise_value','企业价值'),('股权价值','equity_value','股权价值'),('对价形式','payment_structure','对价形式'),('溢价','premium','溢价'),('每股对价或换股比','per_share_consideration,exchange_ratio','每股对价|换股比'),('协同','synergy','协同'),('预计完成','expected_completion','预计交割|预计完成'),('批准条件','approvals,conditions_precedent','批准条件'),('EPS','eps_accretion','EPS'),('FCF','fcf','FCF')]

def project_structure(event):
    r = event['research']
    raw_sources = event.get('sources', {}).get('value') or []
    refs = [dict(s) for s in r.get('research_sources', [])]
    by_url = {s.get('url'):s for s in raw_sources}
    seen = {s.get('url') for s in refs}
    for s in raw_sources + r.get('attachments', []):
        if s.get('url') and s['url'] not in seen:
            refs.append(dict(s, title=s.get('title') or s.get('file') or s.get('form',''), id=s.get('doc_id')))
            seen.add(s['url'])
    layers = {k:[] for k in ('核心文件','进展文件','企业资料','外部资料')}
    attachments = []
    for s in refs:
        metadata = dict(by_url.get(s.get('url'), {}), **s)
        if AUX.search(str(s.get('title',''))):
            attachments.append(s)
            continue
        role = document_role(metadata)
        layer = metadata.get('material_layer')
        if layer not in layers:
            layer = '企业资料' if role == '企业资料' or re.search(r'presentation|演示|演示材料',s.get('title',''),re.I) else '外部资料' if s.get('label') in ('新闻观点','外部信息') or re.search(r'新闻|研报|行业报告|Reuters|research report',s.get('title',''),re.I) else '进展文件' if role in ('补充公告','审批','补充或条件进展','投票结果','股东大会或法院会议结果','IFA意见','IFA') else '核心文件'
        layers[layer].append(s)
    r['source_layers'] = [dict(label=k,sources=v) for k,v in layers.items() if v]
    r['attachments'] = attachments
    r['research_sources'] = [s for v in layers.values() for s in v]
    # Existing source metadata, never timeline text or date-of-signing, establishes disclosure dates.
    candidates = [dict(s) for s in raw_sources]
    dated = sorted([s for s in candidates if re.fullmatch(r'\d{4}-\d{2}-\d{2}',s.get('date',''))],key=lambda s:s['date'])
    substantive = [s for s in dated if is_substantive(s)]
    for key, source in [('first_disclosure',substantive[0] if substantive else None),('latest_document',dated[-1] if dated else None),('latest_substantive',substantive[-1] if substantive else None)]:
        if source:
            r[key] = dict(date=source['date'],title=source.get('title') or source.get('file') or source.get('form',''),url=source.get('url',''))
        else:
            r.pop(key,None)
    r['latest_change'] = r.get('latest_substantive',{}).get('title','')
    market = publish_text(event.get('market'))
    typ = publish_text(event.get('event_type'))
    template = OUTBOUND if market == 'outbound' else SEC if market == 'us' else CONNECTED if re.search('关连|CCT',typ) else ISSUE if re.search('配售|供股',typ) else ENFORCEMENT if '执法' in typ else PRIVATE if re.search('私有化|收购守则|并购',typ) else CH14
    metrics = r.get('key_metrics', [])
    for m in metrics:
        if re.search(r'协同|EPS|FCF',m.get('label',''),re.I): m['note'] = '前瞻'
    slots = []
    for label,keys,pattern in template:
        values, ids, urls = [], [], []
        for m in metrics:
            if re.search(pattern,m.get('label',''),re.I) and publish_text(m.get('value')):
                values.append(m['label']+'：'+str(m['value']))
                ids.extend(m.get('sources',[]))
                if m.get('url'): urls.append(m['url'])
        for key in keys.split(','):
            raw = event.get('specialty',{}).get(key) or event.get(key) or r.get(key)
            if isinstance(raw,dict) and 'value' in raw:
                raw = raw.get('value') if raw.get('prov') != 'undisclosed' else None
                if isinstance(raw,dict): raw = raw.get('value')
            if raw in (None,'',[]): raw = r.get(key)
            if isinstance(raw,list): raw = '；'.join(publish_text(x) for x in raw if publish_text(x))
            value = publish_text(raw)
            if value and not values: values.append(value)
        if values:
            row = dict(label=label,value='；'.join(dict.fromkeys(values)),sources=list(dict.fromkeys(ids)))
            links = [s['url'] for s in refs if s.get('id') in ids and s.get('url')]
            # Explicit state fields refer back to their collected filing pack.
            row['source_urls'] = list(dict.fromkeys(urls+links)) or [s['url'] for s in raw_sources if s.get('url') and is_substantive(s)][:1]
            if label in ('协同','EPS','FCF'): row['note'] = '前瞻'
            slots.append(row)
    if market == 'outbound':
        maturity = []
        for key,label in [('permits','许可'),('pfs_bfs','PFS·BFS'),('fid','FID'),('production_status','投产'),('resources','资源'),('capacity','产能')]:
            value = publish_text(event.get(key) or r.get(key))
            if value: maturity.append(label+'：'+value)
        if maturity and not r.get('project_maturity'):
            slots.append(dict(label='项目成熟度',value='；'.join(maturity)))
    if market == 'outbound' and r.get('project_maturity'):
        entries = r['project_maturity']
        value = '；'.join(x if isinstance(x,str) else x.get('text','') for x in entries)
        if publish_text(value): slots.append(dict(label='项目成熟度',value=value,sources=[sid for x in entries if isinstance(x,dict) for sid in x.get('sources',[])]))
    r['metric_slots'] = slots
