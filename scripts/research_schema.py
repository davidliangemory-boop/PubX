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

def document_role(source):
    """Classify document function without treating first ingestion as first disclosure."""
    title = str(source.get('title') or source.get('file') or '')
    if re.search(r'規則\s*22|规则\s*22|rule\s*22|dealing disclosure|證券交易披露|证券交易披露', title, re.I):
        return '辅助附件'
    if source.get('document_type'):
        return source['document_type']
    explicit = source.get('role')
    if explicit and explicit not in ('其他', 'other'):
        return explicit
    if source.get('form') == '425':
        return '交易通讯'
    for pattern, label in [
        (r'年報|年报|中期報告|中期报告|annual report|interim report', '企业资料'),
        (r'終止|终止|termination of|terminated|lapse', '终止'),
        (r'完成|completion|completed|closing of', '完成'),
        (r'投票結果|投票结果|poll results|voting results', '投票结果'),
        (r'延遲|延迟|delay|更新|補充|补充|進展|进展|update|supplement|approval|审批', '补充公告'),
        (r'通函|circular|scheme document|DEFM14A|S-4', '通函'),
        (r'獨立財務顧問|独立财务顾问|independent financial advis', 'IFA'),
        (r'EX-?2[.]1|merger agreement|合并协议|正式协议|簽訂|签订|簽署|签署|entered into', '正式协议'),
    ]:
        if re.search(pattern, title + ' ' + str(source.get('form') or ''), re.I):
            return label
    # 425 and offering documents alone do not establish a new milestone.
    return '交易通讯' if source.get('form') == '425' else '公告'


SUBSTANTIVE = {'首次公告','首次方案公告','正式协议','通函','IFA','IFA意见',
               '投票结果','股东大会或法院会议结果','完成','终止','完成或终止',
               '审批','补充公告','补充或条件进展','延迟寄发','公告'}


def publish_object(value):
    """Final projection after market overlays, preserving zero and dropping empty records."""
    if isinstance(value, dict):
        return {k: cleaned for k,v in value.items()
                if (cleaned := publish_object(v)) not in (None, '', [], {})}
    if isinstance(value, list):
        return [cleaned for v in value if (cleaned := publish_object(v)) not in (None, '', [], {})]
    return publish_text(value)


def finalize_research(research):
    r = publish_object(research)
    if r.get('depth') == 'deep':
        refs = r.get('research_sources', [])
        has_core = any(s.get('label') == '公告事实' and s.get('url') for s in refs)
        chain = len(r.get('timeline', [])) >= 2
        comparable = any(c.get('lesson') and (c.get('why') or c.get('dimension')) for c in r.get('comparables', []))
        financials = bool(r.get('operating_background')) or any(s.get('label') == '财务数据' for s in refs)
        meaning = sum(any(len(x if isinstance(x,str) else x.get('text','')) >= 20 for x in r.get('meaning',{}).get(k,[])) for k in ('financial','strategy','investment'))
        if not (has_core and chain and comparable and financials and meaning >= 2):
            r['depth'] = 'brief'
    r['key_metrics'] = r.get('key_metrics', [])[:6]
    return r


def prepare_research(e):
    def text(key): return publish_text(e.get(key))
    sources = e.get('sources', {}).get('value') or []
    for source in sources:
        source['research_role'] = document_role(source)
    substantive = sorted([s for s in sources if s['research_role'] in SUBSTANTIVE], key=lambda s:s.get('date',''))
    # Earliest collected substantive disclosure, never a contract-signing date or annual report.
    dates = [s.get('date') for s in substantive if re.fullmatch(r'\d{4}-\d{2}-\d{2}', s.get('date') or '')]
    if dates:
        e['disclosure_date'] = field(min(dates), 'disclosed')
    timeline = [dict(date=publish_text(s.get('date')), text=publish_text(s.get('title') or s.get('file')))
                for s in substantive if publish_text(s.get('title') or s.get('file'))]
    stage = publish_text(substantive[-1]['research_role']) if substantive else ''
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
        if s['research_role'] in ('辅助附件','Rule22等辅助材料'): continue
        title = publish_text(s.get('title') or s.get('file'))
        url = publish_text(s.get('url'))
        if title and url and re.match(r'^https?://', url):
            refs.append(dict(title=title,url=url,date=publish_text(s.get('date')),
                             label='外部信息' if s.get('material_layer') in ('外部资料','企业资料') else '公告事实'))
    title = publish_text(e.get('title'))
    if len(title) > 60:
        # Reuse known actors/action rather than showing a filing paragraph as a title.
        title = ' '.join(x for x in [parties[:32], kind, target[:24]] if x) or title[:60]
    if stage == '公告':
        stage = text('stage') if text('stage') not in ('其他','other') else ''
    research = dict(title=title, kicker=stage, stage=stage,
        latest_change=timeline[-1]['text'] if timeline else '', summary=summary,
        key_metrics=metrics, meaning={k:publish_lines(e.get(k+'_analysis')) for k in ('financial','strategy','investment')},
        comparables=[], industry_context=[], watch_items=[], timeline=timeline,
        research_sources=refs, attachments=[dict(title=s.get('title'),url=s.get('url'),date=s.get('date')) for s in sources if s['research_role'] in ('辅助附件','Rule22等辅助材料')], card_summary=summary[0] if summary else '', depth='brief',
        updated_at=max((s.get('date','') for s in substantive), default=''))
    e['research'] = research
    return research
