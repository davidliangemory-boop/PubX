"""Hong Kong document packs and reviewed publication content (Phase B only)."""
import json
import hashlib
import re
from pathlib import Path
from research_schema import field, publish_text

PACK = json.loads((Path(__file__).resolve().parents[1] / 'research/hk_01788.json').read_text())
AUX = 'Rule22等辅助材料'
CORE = '首次方案公告'
PROGRESS = '补充或条件进展'

def classify_document(title):
    patterns = [
        (r'規則\s*22|规则\s*22|rule\s*22|dealing disclosure|dealings? in securities|證券交易披露|证券交易披露|交易披露', AUX),
        (r'中期報告|中期报告|年報|年报|interim report|annual report', '企业资料'),
        (r'終止|终止|termination|失效|lapse|(?:完成|completion|effective date).*(?:私有化|收購|收购|交易|方案)|^(?:完成|completion)', '完成或终止'),
        (r'(?:法院|股東|股东|court|shareholder|poll).*(?:結果|结果|results)', '股东大会或法院会议结果'),
        (r'獨立財務顧問.*意見|独立财务顾问.*意见|independent financial advis[eo]r.*opinion|\bIFA\b', 'IFA意见'),
        (r'延遲|延迟|delay|時間表|时间表|timetable|補充|补充|更新|進展|进展|update|approval', PROGRESS),
        (r'通函|circular|scheme document', '通函'),
    ]
    patterns.append((r'首次|初始|联合公告|聯合公告|joint announcement|proposal.*privati|建議.*私有化|建议.*私有化', CORE))
    return next((label for pat,label in patterns if re.search(pat,title,re.I)), '公告')

def curated_docs(docs):
    """Inject reviewed core documents; an explicit key joins only this transaction."""
    docs = [dict(d) for d in docs]
    for d in docs:
        if str(d.get('doc_id')) in PACK['doc_ids']:
            d['research_chain'] = 'gjai-privatisation-2026'
    for s in PACK['sources']:
        if s['material_layer'] not in ('核心文件','进展文件','企业资料'): continue
        existing = next((d for d in docs if d.get('doc_id') == s['doc_id'] or d.get('url') == s['url']), None)
        patch = dict(doc_id=s['doc_id'],pub_date=s['date'],title=s['title'],url=s['url'],stock_code='01788',stock_name='国泰君安国际',document_type=CORE if s['role']=='首次公告' else '企业资料' if s['material_layer']=='企业资料' else PROGRESS,research_chain='gjai-privatisation-2026',material_layer=s['material_layer'])
        if existing is None: docs.append(patch)
        else: existing.update(patch)
    return docs

TEMPLATES = [
    ('私有化/收购', r'私有化|收购守则|并购', [('offer_price','每股价格'),('premium','溢价'),('valuation','估值'),('ownership_before','要约人持股'),('financing','融资来源'),('voting_threshold','投票门槛')]),
    ('关连交易/CCT',r'关连|CCT',[('connected_relationship','关联关系'),('annual_cap','年度上限'),('pricing_mechanism','定价机制'),('independent_shareholder_approval','独立股东批准'),('ifa_conclusion','IFA结论')]),
    ('配售/供股',r'配售|供股',[('issue_size','发行规模'),('discount','折让'),('dilution','摊薄'),('use_of_proceeds','资金用途'),('ownership_after','主要股东变化')]),
    ('监管执法',r'监管执法',[('regulator','监管机构'),('conduct','具体行为'),('penalty','处罚结果'),('business_restrictions','业务限制'),('governance_impact','治理影响')]),
    ('Chapter 14交易',r'交易',[('percent_ratio','百分比率'),('ch14_class','交易分类'),('shareholder_approval','股东批准'),('consideration','对价'),('target_profit','标的盈利'),('valuation','估值')]),
]

def enrich_research(event):
    r = event['research']
    typ = event['event_type']['value'] or ''
    for name,pat,fields in TEMPLATES:
        if not re.search(pat,typ): continue
        r['template'] = name
        rows = []
        for key,label in fields:
            raw = event.get(key)
            if not publish_text(raw): raw = event.get('specialty',{}).get(key)
            if isinstance(raw,dict) and raw.get('prov') == 'disclosed' and isinstance(raw.get('value'),dict):
                raw = raw['value'].get('value')
            if isinstance(raw,list): raw = '、'.join(publish_text(x) for x in raw if publish_text(x))
            value = publish_text(raw)
            if key == 'ifa_conclusion' and value:
                value = value.replace('fair_and_reasonable','公平合理')
            if value: rows.append(dict(label=label,value=value))
        r['key_metrics'] = (rows + [x for x in r['key_metrics'] if x['value'] not in {v['value'] for v in rows}])[:6]
        break
    sources = event['sources']['value']
    r['attachments'] = [dict(title=s['title'],url=s['url'],date=s['date']) for s in sources if s.get('document_type') == AUX and s.get('url')]
    if not any(s.get('doc_id') == 'gtjai_initial_20260807' for s in sources): return
    b = PACK
    event['aliases'] = ['HK-' + hashlib.sha1(('01788' + doc_id).encode()).hexdigest()[:14] for doc_id in b['doc_ids']]
    refs = {s['doc_id']:s for s in b['sources']}
    r.update(card_summary=b['card_summary'],title=b['title'],kicker=b['latest']['text'],stage=b['stage'],latest_change=b['latest']['text'],summary=b['summary'] if isinstance(b['summary'],list) else [b['summary']],
             key_metrics=[dict(label=n['label'],value=n['text'],sources=n['sources']) for n in b['numbers']],
             meaning={k:[dict(text=x['text'],sources=x['sources']) for x in v] for k,v in b['implications'].items()},
             watch_items=[x['text'] for x in b['observations']+b['milestones']]+['计划文件及IFA意见何时寄发？法院会议、独立股东表决及法院批准时间如何安排？'],
             depth='deep',updated_at='2026-10-16',boundaries=b['boundaries'])
    r['operating_background'] = b['operating_background']
    r['comparison_notes'] = b['comparison_notes']
    r['timeline'] = b['timeline']
    r['comparables'] = b['comparables']
    r['industry_context'] = []
    for i,x in enumerate(b['industry']):
        s = refs[x['sources'][0]]
        r['industry_context'].append(dict(text=x['text'],title=x['title'],date=s.get('date',''),url=s.get('url',''),sources=x['sources'],label='新闻观点' if i==0 else '财务数据',sample=['港股上市券商全样本 / 头部券商H股','香港证券业 / 交易所参与者'][i],basis=['全样本PB中位数、平均值与头部H股平均值分列；原始估值日待核','2025上半年环比及2025全年同比；不是2026盈利预测'][i]))
    r['research_sources'] = [dict(title=s['title'],url=s.get('url',''),date=s.get('date',''),id=s['doc_id'],label='财务数据' if s['material_layer']=='企业资料' or s['doc_id'] in ('haitong_case','sfc_sector','market_turnover') else '新闻观点' if s['doc_id']=='sector_pb' else '公告事实') for s in b['sources']]
    event['title'] = b['title']
    for k,v in b['fields'].items(): event[k] = field(v,'disclosed')


def template_fields(docs):
    """Use explicit published fields or narrowly labelled clauses; never infer ratios."""
    fields = {}
    keys = {key for _,_,rows in TEMPLATES for key,_ in rows}
    for d in docs:
        for key in keys:
            value = publish_text(d.get(key))
            if value: fields[key] = field(value,'disclosed')
    text = '；'.join(str(d.get(k) or '') for d in docs for k in ('title','summary','excerpt'))
    patterns = {
        'offer_price': r'(?:要約價|要约价|註銷價|注销价|offer price|cancellation price)[：:\s]*(?:每股)?[^；;。\n]{0,45}',
        'premium': r'(?:溢價|溢价|premium)[^；;。\n]{0,30}?\d+(?:\.\d+)?%',
        'discount': r'(?:折讓|折让|discount)[^；;。\n]{0,30}?\d+(?:\.\d+)?%',
        'dilution': r'(?:攤薄|摊薄|dilution)[^；;。\n]{0,30}?\d+(?:\.\d+)?%',
        'issue_size': r'(?:配售股份|供股股份|發行股份|发行股份)[^；;。\n]{0,35}?\d[\d,.]*(?:億|亿|百萬|百万)?股',
        'use_of_proceeds': r'(?:所得款項用途|所得款项用途|use of proceeds)[：:\s]+[^；;。\n]{3,85}',
        'pricing_mechanism': r'(?:定價機制|定价机制)[：:\s]+[^；;。\n]{3,85}',
        'connected_relationship': r'(?:關聯關係|关联关系|關連關係|关连关系)[：:\s]+[^；;。\n]{3,85}',
        'shareholder_approval': r'(?:須經|须经|已獲|已获)[^；;。\n]{0,25}(?:股東批准|股东批准)',
        'target_profit': r'(?:標的|目标公司|目標公司)[^；;。\n]{0,25}(?:盈利|淨利潤|净利润)[^；;。\n]{0,35}',
        'regulator': r'(?:監管機構|监管机构)[：:\s]+[^；;。\n]{3,45}',
        'conduct': r'(?:違規行為|违规行为)[：:\s]+[^；;。\n]{3,85}',
        'penalty': r'(?:罰款|罚款)[^；;。\n]{0,35}?\d[\d,.]*(?:億|亿|百萬|百万|萬|万)?(?:港元|元)',
        'business_restrictions': r'(?:業務限制|业务限制)[：:\s]+[^；;。\n]{3,85}',
        'governance_impact': r'(?:管治整改|治理整改)[：:\s]+[^；;。\n]{3,85}',
    }
    for key,pat in patterns.items():
        match = re.search(pat,text,re.I)
        if match and publish_text(match.group()): fields.setdefault(key,field(match.group(),'disclosed'))
    return fields
