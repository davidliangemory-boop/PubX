"""Build-time research schema. Unknown values are explicit, never inferred facts."""
FIELDS = '''event_id market issuer_id entity_id event_type event_subtype stage status event_date disclosure_date parties target geography consideration payment_structure ownership_before ownership_after control_result financing conditions_precedent approvals long_stop_date termination governance sources disclosure_changes financial_analysis investment_analysis strategy_analysis legal_analysis comparables action_plan information_gaps next_milestones'''.split()
PROVENANCE = {'disclosed', 'external', 'analysis', 'undisclosed', 'na'}

def field(value=None, prov='undisclosed'):
    if prov not in PROVENANCE:
        raise ValueError(prov)
    return {'value': value, 'prov': prov}

def make_event(**values):
    return {key: values[key] if isinstance(values.get(key), dict) and 'prov' in values[key]
            else field(values[key], 'analysis') if key in values else field() for key in FIELDS}

# Publish projection: source records remain intact; only readable content crosses here.
import re
BANNED = re.compile(r'\b(?:null|undisclosed|analysis|disclosed)\b|\[\s*\]|未披露|未抽取|资料不足|暂无', re.I)

def publish_text(value):
    if isinstance(value, dict) and 'prov' in value:
        return publish_text(value.get('value')) if value['prov'] != 'undisclosed' else ''
    if not isinstance(value, (str, int, float)) or isinstance(value, bool):
        return ''
    text = str(value).strip()
    return '' if BANNED.search(text) else text

def publish_lines(value):
    if isinstance(value, dict) and 'prov' in value:
        value = value.get('value') if value['prov'] != 'undisclosed' else None
    return [t for x in (value if isinstance(value, list) else [value]) if (t := publish_text(x))]

def prepare_research(e):
    def text(key): return publish_text(e.get(key))
    sources = e.get('sources', {}).get('value') or []
    # Explicit substantive roles only; file counts and routine notices are not progress.
    substantive = sorted([s for s in sources if s.get('role') in
        ('首次公告', '正式协议', '通函', '投票结果', '完成', '终止', '审批')], key=lambda s:s.get('date',''))
    timeline = [dict(date=publish_text(s.get('date')), text=publish_text(s.get('title') or s.get('file')))
                for s in substantive if publish_text(s.get('title') or s.get('file'))]
    stage = publish_text(substantive[-1].get('role')) if substantive else ''
    metrics = [dict(label=label, value=value) for key,label in
        [('consideration','交易规模'),('ownership_before','交易前持股'),('ownership_after','交易后持股')]
        if (value := text(key))]
    semantic_labels = {'EV':'企业价值','Equity':'股权价值','Purchase Price':'收购对价',
                       'Transaction Value':'交易价值','Offering Size':'发行规模',
                       'Financing Commitment':'融资承诺','Debt Principal':'债务本金'}
    for amount in e.get('amounts', []):
        label = semantic_labels.get(amount.get('semantic_type'))
        value = publish_text(amount.get('amount'))
        if label and value and not amount.get('excluded_from_deal'):
            row = dict(label=label, value=value)
            if row not in metrics:
                metrics.append(row)
    metrics = metrics[:5]
    summary = []
    parties = '、'.join(publish_lines(e.get('parties')))
    kind = text('event_type')
    target = text('target')
    if parties and kind:
        summary = [parties + '涉及' + kind + ('，标的为' + target if target else '') + '。']
    refs = []
    for s in sources:
        title = publish_text(s.get('title') or s.get('file'))
        url = publish_text(s.get('url'))
        if title and url and re.match(r'^https?://', url):
            refs.append(dict(title=title,url=url,date=publish_text(s.get('date')),
                             label='外部信息' if s.get('material_layer') in ('外部资料','企业资料') else '公告事实'))
    research = dict(title=publish_text(e.get('title')), kicker=stage, stage=stage,
        latest_change=timeline[-1]['text'] if timeline else '', summary=summary,
        key_metrics=metrics, meaning={k:publish_lines(e.get(k+'_analysis')) for k in ('financial','strategy','investment')},
        comparables=[], industry_context=[], watch_items=[], timeline=timeline,
        research_sources=refs, depth='brief',
        updated_at=max((s.get('date','') for s in substantive), default=''))
    e['research'] = research
    return research
