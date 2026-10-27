"""Offline, conservative research-event derivation; source state is never mutated."""
import datetime as dt
import hashlib
import json
import re
from difflib import SequenceMatcher
from pathlib import Path
from research_schema import FIELDS, field, make_event, prepare_research, finalize_research, document_role
from hk_research import classify_document, curated_docs, enrich_research, template_fields, AUX, CORE
from acceptance_research import merge_eqt_events, enrich_acceptance
from research_brief import brief, write_candidates
ROOT = Path(__file__).resolve().parents[1]
_X = ROOT / 'state' / 'research_extracts.json'
EXTRACTS = json.loads(_X.read_text()) if _X.exists() else {'hk': {}, 'us': {}}

def full_text_overlay(spec, docs, store, keymap):
    """P0.6: overlay conservative full-text extracts (quote + source + confidence); never overwrite with blanks."""
    for d in docs:
        x = store.get(str(d.get('doc_id', d.get('id'))))
        if not x: continue
        for k, v in x.items():
            if k.startswith('_') or k not in keymap: continue
            v = dict(v, source_doc=d.get('doc_id', d.get('id')), source_url=d.get('url', ''))
            spec[keymap[k]] = field(v, 'disclosed')
    return spec

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

def extract_terms(text):
    patterns = {
        'termination_fee': r'(?:termination|break.up) fee[^.;]{0,100}',
        'outside_date': r'(?:outside date|long.stop date)[^.;]{0,100}',
        'per_share_consideration': r'(?:\$[\d,.]+\s*(?:in cash\s*)?per share|per.share consideration[^.;]{0,80})',
        'principal': r'(?:\$[\d,.]+(?:\s*(?:million|billion))?\s*(?:aggregate )?principal|principal amount[^.;]{0,80})',
        'interest_rate': r'(?:interest rate[^.;]{0,70}|\d+(?:\.\d+)?%\s*(?:per annum|interest))',
        'maturity': r'(?:maturity date|matures? on)[^.;]{0,90}',
    }
    return {k: field(m.group(0), 'disclosed') for k, pat in patterns.items() if (m := re.search(pat, text, re.I))}


def exhibit_rows(docs):
    rows = []
    def walk(obj):
        if isinstance(obj, dict):
            if any(k in obj for k in ('number','exhibit_no','type','url','href','description','text')):
                yield obj
            for k,v in obj.items():
                if re.fullmatch(r'(?:EX-)?\d{1,2}\.\d+',k,re.I):
                    yield dict(v, number=k) if isinstance(v,dict) else {'number':k, 'url':v} if isinstance(v,str) and v.startswith('http') else {'number':k,'text':clean(v)}
                elif isinstance(v,(dict,list)):
                    yield from walk(v)
        elif isinstance(obj, list):
            for v in obj:
                yield from walk(v)
    for d in docs:
        candidates = []
        for k, v in d.items():
            if 'exhibit' in k.lower():
                candidates.extend(walk(v))
        text = ' '.join(clean(d.get(k)) for k in ('summary', 'text', '正文首段'))
        text += ' ' + ' '.join(clean(v) for v in (d.get('item_quotes') or {}).values())
        for m in re.finditer(r'\bExhibit\s+(\d{1,2}\.\d+)\b', text, re.I):
            candidates.append({'number': m.group(1), 'text': text[max(0,m.start()-40):m.end()+220]})
        for x in candidates:
            number = clean(x.get('number') or x.get('exhibit_no') or x.get('type'))
            number = re.sub(r'^EX-', '', number, flags=re.I)
            desc = ' '.join(clean(x.get(k)) for k in ('title','description','text','summary'))
            nature = next((label for pat,label in [
                (r'voting|support agreement','Voting/Support Agreement'),
                (r'legal opinion|legality|opinion of counsel','Legal Opinion'),
                (r'merger|purchase agreement','Merger/Purchase Agreement'),
                (r'credit agreement','Credit Agreement'),
                (r'press release','Press Release')]
                if re.search(pat,desc,re.I)), {'2.1':'Merger/Purchase Agreement','10.1':'Material Contract','99.1':'Press Release'}.get(number,'未抽取'))
            url = x.get('url') or x.get('href') or d.get('index_url') or d.get('url','')
            row = dict(number=number or '未抽取', nature=field(nature,'analysis'), core=number.startswith(('2.','10.')) or 'Agreement' in nature,
                       terms=extract_terms(desc), url=url, link_scope='exhibit' if x.get('url') or x.get('href') else 'filing index / filing', doc_id=d.get('id',d.get('doc_id')))
            if row not in rows:
                rows.append(row)
    return rows


def hk_specialty(docs):
    txt = ' '.join(' '.join(clean(d.get(k)) for k in ('title','summary','excerpt','headline_raw','cat_codes','cat6_sub')) for d in docs)
    def hit(pat):
        m = re.search(pat,txt,re.I)
        return field(m.group(0),'disclosed') if m else field('未披露/未抽取','undisclosed')
    return {
        'ch14_class': hit(r'反收購|反收购|reverse takeover|非常重大(?:收購|出售|收购)|very substantial (?:acquisition|disposal)|主要交易|major transaction|須予披露|须予披露|discloseable transaction'),
        'ch14a_connected': hit(r'關連交易|关连交易|connected transactions?'),
        'continuing_connected': hit(r'持續關連交易|持续关连交易|continuing connected transactions?'),
        'annual_cap': hit(r'(?:年度上限|全年上限|annual caps?)[^。;；]{0,65}'),
        'percent_ratio': hit(r'(?:百分比率|百分比比率|percentage ratios?)[^。;；]{0,45}?\d+(?:\.\d+)?\s*%'),
        'ifa_name': hit(r'(?:獨立財務顧問|独立财务顾问|independent financial advis[eo]r)\s*[:：]\s*[^，,。;；]{2,60}'),
        'ifa_conclusion': hit(r'公平合理|公平及合理|fair and reasonable'),
        'independent_shareholder_approval': hit(r'(?:獨立股東|独立股东|independent shareholders)[^。;；]{0,55}(?:批准|approval)'),
        'takeovers_rule': hit(r'(?:收購守則|收购守则|Takeovers Code)[^。;；]{0,45}(?:第\s*\d+(?:\.\d+)?\s*條|Rule\s*\d+(?:\.\d+)?)'),
        'whitewash': hit(r'清洗豁免|whitewash waiver'),
    }


def source(d, market):
    record = dict(doc_id=d.get('doc_id', d.get('id')), date=d.get('pub_date', d.get('filing_date', d.get('date', '')))[:10], title=clean(d.get('title', d.get('summary', d.get('form'))))[:220], url=d.get('url', ''), role=role(clean(d.get('title', d.get('summary')))), excerpt=clean(d.get('excerpt', d.get('summary')))[:280], form=d.get('form'), items=d.get('items', []), accession=d.get('accession'), exhibits={k:v for k,v in d.items() if 'exhibit' in k.lower()})
    if market == 'us':
        record['role'] = document_role({**record, 'role': ''})
    return record


def derive_market(market, docs):
    groups = []
    auxiliary = []
    buckets = {}
    seen_docs = set()
    reprints = set()
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
        if market == 'hk':
            # Remove only the explicit reprint wrapper, preserving transaction text.
            canonical = norm(re.sub(r'^(?:海外監管公告|海外监管公告|overseas regulatory announcement)\s*[-—:：–]*\s*', '', s['title'], flags=re.I))
            key = (issuer, s['date'], canonical)
            if issuer and canonical and key in reprints:
                continue
            reprints.add(key)
        if market == 'hk':
            s['document_type'] = d.get('document_type') or classify_document(s['title'])
            s['material_layer'] = d.get('material_layer', '核心文件' if s['document_type'] == CORE else '进展文件')
            if s['document_type'] == AUX:
                auxiliary.append((issuer, s, d))
                continue
        typ = '收购守则/私有化' if d.get('research_chain') else category(t)
        stream = 'external' if external else 'capital_markets' if market == 'us' and (re.match(r'424B|FWP', d.get('form', '')) or re.search(r'structured note|autocall|linked note', t, re.I)) else 'material'
        family = re.sub(r'/A$', '', d.get('form', ''))
        counter = clean(d.get('counterparty')) if known(d.get('counterparty')) else ''
        match = None
        bucket_key = (issuer, stream, typ)
        candidates = list(buckets.get(bucket_key, []))
        if market == 'hk' and s['document_type'] not in (CORE, '企业资料'):
            candidates += [g for g in groups if g not in candidates and g['issuer'] == issuer and g['stream'] == stream]
        for g in reversed(candidates):
            if d.get('research_chain') and g.get('chain') == d['research_chain']:
                match = g
                break
            if (g.get('chain') or d.get('research_chain')) and g.get('chain') != d.get('research_chain'):
                continue
            if g['issuer'] != issuer or not issuer or g['stream'] != stream or (g['type'] != typ and not (market == 'hk' and s['document_type'] not in (CORE, '企业资料'))):
                continue
            limit = 90 if market == 'hk' else 120 if counter else 30
            if days(g['sources'][-1]['date'], s['date']) > limit:
                continue
            similarity = SequenceMatcher(None, norm(s['title']), norm(g['sources'][0]['title'])).ratio()
            refs = any(re.sub(r'\D', '', x['date']) in re.sub(r'\D', '', t) or (x['date'][:4]+'年'+str(int(x['date'][5:7]))+'月'+str(int(x['date'][8:10]))+'日') in t for x in g['sources'] if len(x['date']) == 10)
            accession_ref = any(x.get('accession') and x['accession'] in t for x in g['sources'])
            shared = counter and counter == g['counter']
            if market == 'hk' and (refs or g['type'] == typ and similarity >= .72) or market == 'us' and (family == g['family'] or shared or accession_ref) and (shared or accession_ref or similarity >= .95 and len(norm(s['title'])) > 60 and typ != '其他重大事项'):
                match = g
                break
        if match is None:
            match = dict(issuer=issuer, type=typ, stream=stream, family=family, counter=counter, sources=[], docs=[], chain=d.get('research_chain'))
            groups.append(match)
            buckets.setdefault(bucket_key, []).append(match)
        # Overseas reprints with identical normalized titles/date collapse within a chain.
        if not any(norm(x['title']) == norm(s['title']) and x['date'] == s['date'] for x in match['sources']):
            match['sources'].append(s)
            match['docs'].append(d)
    for issuer, s, d in auxiliary:
        candidates = [g for g in groups if g['issuer'] == issuer and g['type'] == '收购守则/私有化' and days(g['sources'][-1]['date'],s['date']) <= 180]
        if len(candidates) == 1:
            candidates[0]['sources'].append(s)
            candidates[0]['docs'].append(d)
    out = []
    for g in groups:
        ss, dd = g['sources'], g['docs']
        if market == 'hk':
            dd = [d for d in dd if (d.get('document_type') or classify_document(clean(d.get('title')))) != AUX]
        ss.sort(key=lambda x:x['date'])
        core = [s for s in ss if s.get('document_type') not in (AUX, '企业资料')] if market == 'hk' else ss
        if not core:
            continue
        last = core[-1]
        first = next((s for s in core if s.get('document_type') == CORE), core[0])
        eid = market.upper() + '-' + hashlib.sha1((g['issuer'] + clean(first['doc_id'])).encode()).hexdigest()[:14]
        e = make_event(event_id=eid, market=market, issuer_id=g['issuer'], entity_id=g['issuer'], event_type=g['type'], stage='完成公告（范围待核）' if last['role'] == '完成' else last['role'], status='终止' if last['role'] == '终止' else '跟踪中', disclosure_date=field(first['date'], 'disclosed'), parties=field([dd[0].get('stock_name', dd[0].get('company', ''))], 'external' if g['stream']=='external' else 'disclosed'), sources=field(ss, 'external' if g['stream']=='external' else 'disclosed'), target=field(g['counter'], 'disclosed') if g['counter'] else field(), disclosure_changes=field([dict(date=x['date'], change=x['role']) for x in ss], 'analysis'))
        e['aliases'] = [market.upper() + '-' + hashlib.sha1((g['issuer'] + clean(s['doc_id'])).encode()).hexdigest()[:14] for s in core if s is not first]
        e.update(title=first['title'], stream=g['stream'], importance=min(100, len(core)*5 + (30 if g['type'] in ['并购','收购守则/私有化','非常重大交易'] else 0)))
        if market == 'hk':
            a = next((x.get('amount') for x in reversed(dd) if known(x.get('amount'))), None)
            e['consideration'] = field(a, 'disclosed') if a else field('PDF首页未抽取', 'undisclosed')
            txt = ' '.join(x['title'] + ' ' + x['excerpt'] for x in ss)
            e['specialty'] = full_text_overlay({**hk_specialty(dd), **template_fields(dd)}, dd, EXTRACTS['hk'], {k: k for k in ('ifa_name','ifa_conclusion','percent_ratio','annual_cap','whitewash')})
        else:
            aa = [a for d in dd for a in amounts(d)]
            e['exhibits'] = exhibit_rows(dd)
            e['amounts'] = aa
            e['consideration'] = field([a for a in aa if not a['excluded_from_deal']], 'analysis') if aa else field()
            e['specialty'] = {'merger_agreement_terms': field('未抽取', 'undisclosed'), 'credit_agreement_terms': field('未抽取', 'undisclosed'), 'extracted_filing_terms': field([extract_terms(' '.join(clean(v) for v in d.values() if isinstance(v,str))) for d in dd], 'disclosed'), 'form_items': field([{'form':x['form'], 'items':x['items']} for x in ss], 'disclosed')}
            for d in dd:
                for k, v in (EXTRACTS['us'].get(d.get('id')) or {}).items():
                    if not k.startswith('_') and v:
                        e['specialty'][k] = field(v, 'disclosed')
                        e['importance'] = min(100, e['importance'] + 10)
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
        e['title'] = ' '.join(x for x in [d.get('公司简称') or d.get('公司全称',''), mt, clean(old.get('geo'))] if x) or clean(old.get('title_fact'))
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

def us_documents():
    # Optional local snapshots and manifest metadata only; never fetch raw pointers.
    docs = {}
    for path in sorted((ROOT/'state').glob('us_market/*.json')) + sorted((ROOT/'state').glob('us_market*.json')):
        payload = json.loads(path.read_text())
        for d in payload.get('entries', []):
            key = d.get('id') or d.get('accession') or d.get('url')
            if key:
                docs[key] = {**docs.get(key, {}), **d}
    manifest = load('raw_manifest')
    records = manifest.values() if isinstance(manifest,dict) else manifest
    by_id = {}
    for record in records:
        if isinstance(record,dict) and any('exhibit' in k.lower() for k in record):
            for key in ('doc_id','id','accession','url'):
                if record.get(key):
                    by_id[record[key]] = record
    for d in docs.values():
        for key in ('doc_id','id','accession','url'):
            record = by_id.get(d.get(key))
            if record:
                for name,value in record.items():
                    if 'exhibit' in name.lower():
                        d.setdefault(name,value)
    return list(docs.values())


def build():
    data = dict(hk=derive_market('hk',curated_docs(list(load('hk_market')['docs'].values()))), us=derive_market('us',us_documents()), outbound=outbound(), meta={'schema_version':1,'method':'规则聚类；字段 provenance；不替代原文审阅','source':'state/*.json','network':False})
    data['us'] = merge_eqt_events(data['us'])
    for market in ('outbound', 'hk', 'us'):
        for event in data[market]:
            prepare_research(event)
            if market == 'hk':
                enrich_research(event)
            enrich_acceptance(event)
            brief(event)
            calibration = ROOT / "research" / (event["event_id"]["value"] + ".json")
            if market == "hk" and calibration.exists():
                event["research"] = json.loads(calibration.read_text())
            event['research'] = finalize_research(event['research'])
    write_candidates([e for market in ("outbound", "hk", "us") for e in data[market]], ROOT / "state/deep_candidates.json")
    manifest = {'built_at': dt.datetime.now(dt.timezone.utc).isoformat(), 'markets': {}}
    for market in ('outbound','hk','us'):
        parts = [('material', [e for e in data[market] if e['stream']=='material']), ('capital', [e for e in data[market] if e['stream']=='capital_markets'])] if market=='us' else [('all',data[market])]
        manifest['markets'][market] = {'count':len(data[market]), 'files':[]}
        for part, rows in parts:
            name = 'events_'+market+('_'+part if market=='us' else '')+'.js'
            manifest['markets'][market]['files'].append({'name':name,'part':part,'count':len(rows)})
            (ROOT/'assets'/name).write_text('window.PUBX_EVENT_PARTS=window.PUBX_EVENT_PARTS||{};window.PUBX_EVENT_PARTS['+json.dumps(market+'_'+part)+']='+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+';\n')
    # Direct event links choose a US shard without downloading the other stream.
    manifest['us_capital_ids'] = [route for e in data['us'] if e['stream']=='capital_markets' for route in [e['event_id']['value']] + e.get('aliases', [])]
    (ROOT/'assets/events_index.js').write_text('window.PUBX_EVENTS_INDEX='+json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+';\n')
    (ROOT/'assets/events_data.js').unlink(missing_ok=True)
    print('research events:', {k:len(data[k]) for k in ['hk','us','outbound']})
    return data

if __name__ == '__main__': build()
