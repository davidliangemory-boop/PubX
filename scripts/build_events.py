"""Offline, conservative research-event derivation; source state is never mutated."""
import datetime as dt
import hashlib
import json
import re
from difflib import SequenceMatcher
from pathlib import Path
from research_schema import FIELDS, field, make_event
ROOT = Path(__file__).resolve().parents[1]

def load(name):
    return json.loads((ROOT / 'state' / (name + '.json')).read_text())

def clean(x):
    if isinstance(x, dict):
        return x.get('text', x.get('value', '')) or ''
    return str(x or '')

def known(x):
    return bool(x) and not re.search(r'未披露|不适用|^—$|^未知$', clean(x))

def norm(s):
    return re.sub(r'[^\w\u4e00-\u9fff]', '', s.lower())

def days(a, b):
    try:
        return abs((dt.date.fromisoformat(a[:10]) - dt.date.fromisoformat(b[:10])).days)
    except ValueError:
        return 9999

def category(t):
    for pat, label in [(r'持續關連|持续关连|continuing connected', '持续关连交易（CCT）'), (r'關連|关连|connected transaction', '关连交易'), (r'董事|行政總裁|director|chief executive', '治理变更'), (r'收購守則|私有化|takeover|privati', '收购守则/私有化'), (r'配售|供股|placing|rights issue', '配售供股'), (r'非常重大|very substantial', '非常重大交易'), (r'主要交易|major transaction', '主要交易'), (r'須予披露|须予披露|discloseable', '须予披露交易'), (r'收購|收购|acquisition|merger', '并购'), (r'貸款|贷款|融資|融资|debt|loan|credit|note', '融资'), (r'訴訟|執法|enforcement', '监管执法')]:
        if re.search(pat, t, re.I):
            return label
    return '其他重大事项'

def role(t):
    for pat, label in [(r'終止|终止|termination', '终止'), (r'延遲寄發|延迟寄发|delay.*despatch', '延迟寄发'), (r'投票結果|投票结果|poll results', '投票结果'), (r'完成|completion|closing', '完成'), (r'獨立財務|独立财务|\bIFA\b', 'IFA'), (r'通函|circular', '通函'), (r'補充|补充|supplement|更新|進展|进展', '补充公告')]:
        if re.search(pat, t, re.I):
            return label
    return '其他'

SEMANTICS = [('Par', r'par value'), ('Regulatory Threshold', r'minimum bid|registration fee|regulatory threshold'), ('Share Price', r'per.note|per share|share price'), ('Conversion', r'conversion price|convert.*price'), ('Termination Fee', r'termination fee|break.up fee'), ('Earnout', r'earn.?out|contingent consideration'), ('EV', r'enterprise value'), ('Equity', r'equity value'), ('Purchase Price', r'purchase price|cash consideration'), ('Debt Principal', r'principal|coupon'), ('Financing Commitment', r'commitment|credit facility'), ('Offering Size', r'offering|aggregate offering'), ('Transaction Value', r'transaction value|aggregate consideration')]

def amounts(d):
    text = ' '.join([clean(d.get('summary')), (' '.join(clean(v) for v in (d.get('item_quotes') or {}).values()) if isinstance(d.get('item_quotes'), dict) else clean(d.get('item_quotes'))), clean(d.get('amount'))])
    result = []
    for m in re.finditer(r'(?:US\$|\$|USD\s*)\s*[\d,]+(?:\.\d+)?(?:\s*(?:million|billion|thousand))?', text, re.I):
        context = text[max(0, m.start()-75):m.end()+75]
        typ = next((label for label, pat in SEMANTICS if re.search(pat, context, re.I)), 'Unknown')
        excluded = typ in ('Par', 'Share Price', 'Conversion', 'Regulatory Threshold') or bool(re.search(r'coupon|registration fee|per.note', context, re.I))
        row = dict(amount=m.group(), semantic_type=typ, confidence='medium' if typ != 'Unknown' else 'low', excluded_from_deal=excluded, context=context[:180])
        if not any(x['amount'] == row['amount'] and x['semantic_type'] == typ for x in result):
            result.append(row)
    return result[:12]

def source(d, market):
    return dict(doc_id=d.get('doc_id', d.get('id')), date=d.get('pub_date', d.get('filing_date', d.get('date', '')))[:10], title=clean(d.get('title', d.get('summary', d.get('form'))))[:220], url=d.get('url', ''), role=role(clean(d.get('title', d.get('summary')))), excerpt=clean(d.get('excerpt', d.get('summary')))[:280], form=d.get('form'), items=d.get('items', []), accession=d.get('accession'), exhibits={k:v for k,v in d.items() if 'exhibit' in k.lower()})

def derive_market(market, docs):
    groups = []
    buckets = {}
    seen_docs = set()
    for d in sorted(docs, key=lambda x: clean(x.get('pub_date', x.get('filing_date', x.get('date'))))):
        s = source(d, market)
        doc_key = s['doc_id'] or s['url']
        if doc_key and doc_key in seen_docs:
            continue
        if doc_key:
            seen_docs.add(doc_key)
        t = s['title'] + ' ' + clean(d.get('headline_raw')) + ' ' + clean(d.get('excerpt', d.get('summary')))[:500]
        issuer = clean(d.get('stock_code') or d.get('stock_name')) if market == 'hk' else clean(d.get('cik'))
        external = market == 'hk' and ('sfc' in clean(s['doc_id']).lower() or d.get('layer') == 'external')
        typ = category(t)
        stream = 'external' if external else 'capital_markets' if market == 'us' and (re.match(r'424B|FWP', d.get('form', '')) or re.search(r'structured note|autocall|linked note', t, re.I)) else 'material'
        family = re.sub(r'/A$', '', d.get('form', ''))
        counter = clean(d.get('counterparty')) if known(d.get('counterparty')) else ''
        match = None
        bucket_key = (issuer, stream, typ)
        for g in reversed(buckets.get(bucket_key, [])):
            if g['issuer'] != issuer or not issuer or g['stream'] != stream or g['type'] != typ:
                continue
            limit = 90 if market == 'hk' else 120 if counter else 30
            if days(g['sources'][-1]['date'], s['date']) > limit:
                continue
            similarity = SequenceMatcher(None, norm(s['title']), norm(g['sources'][0]['title'])).ratio()
            refs = any(re.sub(r'\D', '', x['date']) in re.sub(r'\D', '', t) or (x['date'][:4]+'年'+str(int(x['date'][5:7]))+'月'+str(int(x['date'][8:10]))+'日') in t for x in g['sources'] if len(x['date']) == 10)
            accession_ref = any(x.get('accession') and x['accession'] in t for x in g['sources'])
            shared = counter and counter == g['counter']
            if market == 'hk' and (refs or similarity >= .72) or market == 'us' and family == g['family'] and (shared or accession_ref or similarity >= .95 and len(norm(s['title'])) > 60 and typ != '其他重大事项'):
                match = g
                break
        if match is None:
            match = dict(issuer=issuer, type=typ, stream=stream, family=family, counter=counter, sources=[], docs=[])
            groups.append(match)
            buckets.setdefault(bucket_key, []).append(match)
        # Overseas reprints with identical normalized titles/date collapse within a chain.
        if not any(norm(x['title']) == norm(s['title']) and x['date'] == s['date'] for x in match['sources']):
            match['sources'].append(s)
            match['docs'].append(d)
    out = []
    for g in groups:
        ss, dd = g['sources'], g['docs']
        if ss[0]['role'] == '其他':
            ss[0]['role'] = '首次公告'
        last = ss[-1]
        eid = market.upper() + '-' + hashlib.sha1((g['issuer'] + clean(ss[0]['doc_id'])).encode()).hexdigest()[:14]
        e = make_event(event_id=eid, market=market, issuer_id=g['issuer'], entity_id=g['issuer'], event_type=g['type'], stage='完成公告（范围待核）' if last['role'] == '完成' else last['role'], status='终止' if last['role'] == '终止' else '跟踪中', disclosure_date=field(ss[0]['date'], 'disclosed'), parties=field([dd[0].get('stock_name', dd[0].get('company', ''))], 'external' if g['stream']=='external' else 'disclosed'), sources=field(ss, 'external' if g['stream']=='external' else 'disclosed'), target=field(g['counter'], 'disclosed') if g['counter'] else field(), disclosure_changes=field([dict(date=x['date'], change=x['role']) for x in ss], 'analysis'))
        e.update(title=ss[0]['title'], stream=g['stream'], importance=min(100, len(ss)*5 + (30 if g['type'] in ['并购','收购守则/私有化','非常重大交易'] else 0)))
        if market == 'hk':
            a = next((x.get('amount') for x in reversed(dd) if known(x.get('amount'))), None)
            e['consideration'] = field(a, 'disclosed') if a else field('PDF首页未抽取', 'undisclosed')
            txt = ' '.join(x['title'] + ' ' + x['excerpt'] for x in ss)
            e['specialty'] = {k: field(v, 'analysis') if v else field() for k,v in {'Ch14': g['type'] if g['type'] in ['须予披露交易','主要交易','非常重大交易'] else None, '14A': '涉及关连交易' if re.search(r'關連|关连|connected', txt, re.I) else None, 'IFA': '存在IFA文件' if any(x['role']=='IFA' for x in ss) else None, 'takeovers': '涉及收购守则/私有化' if g['type']=='收购守则/私有化' else None, 'shareholder_approval': '存在投票结果，需核对决议' if any(x['role']=='投票结果' for x in ss) else None}.items()}
        else:
            aa = [a for d in dd for a in amounts(d)]
            e['amounts'] = aa
            e['consideration'] = field([a for a in aa if not a['excluded_from_deal']], 'analysis') if aa else field()
            e['specialty'] = {'form_items': field([{'form':x['form'], 'items':x['items']} for x in ss], 'disclosed')}
        enrich(e)
        out.append(e)
    return out

def enrich(e):
    gaps = ['待核全文、交割范围及条款']
    for k in ['financial_analysis', 'investment_analysis', 'strategy_analysis', 'legal_analysis']:
        if e[k]['value'] is None:
            e[k] = field([], 'undisclosed')
            gaps.append(k + '：资料不足')
    e['information_gaps'] = field(gaps + (e['information_gaps']['value'] or []), 'analysis')
    e['next_milestones'] = field(['核对后续公告、审批及交割范围；无公告不推定已完成'], 'analysis')
    e['action_plan'] = field([{'condition':'若取得协议/通函全文', 'action':'核对对价、先决条件及长停止日', 'basis':'信息缺口'}, {'condition':'若出现完成公告', 'action':'逐项核对资产与股权交割范围', 'basis':'完成不等于全部交割'}], 'analysis')

def outbound():
    rows = {d['_aid']:d for d in load('db')['disclosures']}
    out = []
    for old in load('events')['events']:
        docs = [rows[s['doc_id']] for s in old['sources'] if s['doc_id'] in rows]
        d = docs[-1] if docs else {}
        mt = clean(old.get('matter_type'))
        mt = {'listing_abroad':'境外上市', 'financing':'融资'}.get(mt, mt)
        fact = ' '.join(clean(d.get(k)) for k in ['公告标题','动作类型','公告类型'])
        if mt == '融资' or re.search(r'融资|发债|债券|首次公开|境外上市|香港上市|H股上市|发行.{0,12}H股|listing_abroad', fact, re.I):
            mt = '融资>' + ('发债' if re.search(r'发债|债券', fact) else '境外融资' if re.search(r'境外|海外|港股|H股', fact) else '境内融资')
        e = make_event(event_id=old['event_id'], market='outbound', issuer_id=d.get('股票代码') or clean(old.get('parties')), entity_id=d.get('公司全称'), event_type=mt or '其他事项', stage=old.get('stage_current'), status=old.get('status'), parties=field(old.get('parties'), 'disclosed'), geography=field(clean(old.get('geo')), 'disclosed'), consideration=field(clean(old.get('scale')), 'disclosed'), sources=field(old['sources'], 'disclosed'), disclosure_date=field(min((s.get('date','') for s in old['sources']), default=''), 'disclosed'), information_gaps=field([clean(x) for x in old.get('gaps',[])], 'analysis'))
        e['title'] = ' · '.join(x[:85] for x in [d.get('公司全称',''), clean(old.get('scale')), clean(old.get('geo')), mt] if x) or clean(old.get('title_fact'))
        e['legacy_id'] = old['event_id']
        for k, key in [('financial_analysis','对营收结构与利润的预期影响'), ('investment_analysis','主要风险与不确定性'), ('strategy_analysis','对主营业务的战略价值')]:
            if known(d.get(key)):
                e[k] = field(d[key], 'analysis')
        # Only source quotations and factual titles trigger legal issues, never prior analysis.
        evidence = ' '.join([fact] + [q.get('text','') for s in old['sources'] for q in s.get('quotes',[])])
        triggers = []
        for pat, issue in [(r'FIRB|外资审查','外资审查'), (r'ODI|境外投资.*备案','境外投资备案'), (r'反垄断|ACCC','竞争审查'), (r'诉讼|仲裁','争议解决'), (r'制裁|出口管制','制裁与出口管制'), (r'关联交易|關連交易','关联交易')]:
            hit = re.search(pat, evidence, re.I)
            if hit and not re.search(r'不构成|不涉及|风险低', evidence[max(0,hit.start()-10):hit.end()+8]):
                triggers.append({'issue':issue, 'trigger_fact':evidence[max(0,hit.start()-35):hit.end()+60], 'source_ids':[s['doc_id'] for s in old['sources']]})
        e['legal_analysis'] = field(triggers, 'analysis' if triggers else 'undisclosed')
        terms = (old.get('terms') or {})
        tf = terms.get('fields',{}) if isinstance(terms,dict) else {}
        for key in ['payment_structure','ownership_before','ownership_after','control_result','financing','conditions_precedent','approvals','long_stop_date','termination','governance','target']:
            source_key = {'payment_structure':'payment','termination':'breach'}.get(key,key)
            if source_key in tf:
                v=tf[source_key]; e[key]=field(v.get('value', v.get('text')), v.get('layer') if v.get('layer') in ['disclosed','analysis','external'] else 'undisclosed')
        enrich(e)
        out.append(e)
    for e in out:
        scored=[]
        for other in out:
            if other is e: continue
            why=[]
            if e['geography']['value'] and e['geography']['value']==other['geography']['value']: why.append('国家/地区相同')
            if e['event_type']['value']==other['event_type']['value']: why.append('交易结构/动作类型相同')
            # Industry signals derived only from issuer and source titles.
            a=' '.join(s.get('file','') for s in e['sources']['value']); b=' '.join(s.get('file','') for s in other['sources']['value'])
            if any(w in a and w in b for w in ['煤','光伏','银行','电力','医药','钢','矿','汽车']): why.append('产业关键词相同')
            if why: scored.append({'event_id':other['event_id']['value'], 'score':len(why), 'why':'；'.join(why)})
        e['comparables']=field(sorted(scored,key=lambda x:(-x['score'],x['event_id']))[:8], 'analysis')
        if len(scored)<3: e['information_gaps']['value'].append('同库有效类案不足3条，不以无关事件补齐')
    return out

def build():
    data = dict(hk=derive_market('hk',list(load('hk_market')['docs'].values())), us=derive_market('us',load('us_market')['entries']), outbound=outbound(), meta={'schema_version':1,'method':'规则聚类；字段 provenance；不替代原文审阅','source':'state/*.json','network':False})
    (ROOT/'assets/events_data.js').write_text('window.PUBX_EVENTS = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')
    print('research events:', {k:len(data[k]) for k in ['hk','us','outbound']})
    return data

if __name__ == '__main__': build()
