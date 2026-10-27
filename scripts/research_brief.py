"""Deterministic, offline publication briefs and evidence-gated review queue."""
import json
import re
from research_schema import publish_text, publish_lines

CORE = {'首次方案公告', '通函', '完成或终止', '首次公告', '正式协议'}
AUX = {'辅助材料', '辅助材料/Rule 22', 'Rule22等辅助材料', '企业资料'}


def prune(value):
    if isinstance(value, dict):
        return {k: v for k, x in value.items() if (v := prune(x)) not in ('', None, [], {})}
    if isinstance(value, list):
        return [v for x in value if (v := prune(x)) not in ('', None, [], {})]
    return value


def brief(event):
    r = event['research']
    if r.get('depth') == 'deep':
        return r
    sources = event.get('sources', {}).get('value') or []
    sources = sorted(sources, key=lambda s: (s.get('date', ''), s.get('doc_id', '')))
    substantive = [s for s in sources if s.get('document_type') not in AUX]
    refs = []
    for s in sources:
        title = next((t for key in ('title', 'file', 'form', 'doc_id') if (t := publish_text(s.get(key)))), '')
        url = publish_text(s.get('url'))
        if title and re.match(r'^https?://', url):
            refs.append(prune(dict(id=s.get('doc_id'), title=title, url=url,
                                   date=publish_text(s.get('date')), label='公告事实')))
    timeline = []
    for s in substantive:
        title = next((t for key in ('title', 'file', 'form', 'doc_id') if (t := publish_text(s.get(key)))), '')
        if title:
            timeline.append(prune(dict(date=publish_text(s.get('date')), text=title)))
    metrics = [m for m in r.get('key_metrics', [])
               if publish_text(m.get('value')) and re.search(r'\d', str(m['value']))][:6]
    parties = '、'.join(publish_lines(event.get('parties')))
    title = publish_text(event.get('title'))
    kind = publish_text(event.get('event_type'))
    market = {'hk': '香港市场', 'us': '美国市场', 'outbound': '出海信披'}[event['market']['value']]
    sentences = [f'{parties[:60] or market}的已收录文件归入{market}，事件分类为{kind or "重大事项"}。']
    # Dates are explicitly collection boundaries, never asserted as historical first disclosure.
    dates = [publish_text(s.get('date')) for s in substantive if publish_text(s.get('date'))]
    if dates:
        sentences.append(f'本事件已收录材料的日期范围为{min(dates)}至{max(dates)}。')
    for m in metrics:
        sentences.append(f'{m["label"]}：{m["value"]}。')
    for key, label in [('target', '交易标的'), ('geography', '涉及地区'), ('payment_structure', '支付结构'), ('ownership_after', '交易后权益')]:
        raw = event.get(key, {})
        if isinstance(raw, dict) and raw.get('prov') == 'disclosed' and (v := publish_text(raw)):
            sentences.append(f'{label}为{v}。')
    if timeline:
        source_title = timeline[-1]['text']
        if len(source_title) > 80:
            source_title = source_title[:80] + '…'
        sentences.append('最新收录文件题为《' + source_title + '》。')
    if substantive:
        excerpt = publish_text(substantive[-1].get('new_info') or substantive[-1].get('excerpt'))
        clauses = re.findall(r'[^。！？\n]{15,120}[。！？]', excerpt)
        if clauses:
            sentences.append('公告摘录载明：' + clauses[0])
    # Describe the evidence boundary, without inventing business terms to meet length.
    sentences.append('这里的日期对应文件披露或收录时间，文件标题保留原文表述；文件出现不等于交易已经获得批准或完成交割。')
    sentences.append('本摘要按已收录文件与明确字段整理，事件范围以所列来源为依据；后续进展应对照同一交易的条件、表决及完成文件逐项确认。')
    sentences.append('涉及的金额、权益与审批结论仅采用可回溯字段，不由文件数量或公告间隔推算。')
    summary = ''
    for sentence in sentences:
        if len(summary + sentence) <= 300:
            summary += sentence
        elif len(summary) < 150:
            summary += sentence[:299-len(summary)].rstrip('，；。') + '。'
        if len(summary) >= 150:
            break
    r.update(summary=[summary], card_summary=summary[:100], key_metrics=metrics,
             research_sources=refs, timeline=timeline, depth='brief')
    event['research'] = prune(r)
    return event['research']


def eligibility(event):
    r = event['research']
    sources = event.get('sources', {}).get('value') or []
    refs = r.get('research_sources', [])
    comparable = any(c.get('why') and c.get('lesson') and c.get('sources') for c in r.get('comparables', []) if isinstance(c, dict))
    financials = any(s.get('label') == '财务数据' and s.get('url') and s.get('date') for s in refs)
    dimensions = sum(any(isinstance(x, dict) and len(x.get('text', '')) >= 35 and x.get('sources') for x in r.get('meaning', {}).get(k, [])) for k in ('financial', 'strategy', 'investment'))
    checks = dict(core_filings=any(s.get('url') and (s.get('document_type') in CORE or s.get('role') in CORE or (s.get('quotes') and re.search(r'协议|協議|agreement', s.get('file', ''), re.I))) for s in sources),
                  stage_chain=len({x.get('date') for x in r.get('timeline', []) if x.get('date')}) >= 2,
                  comparable=comparable, financials=financials, substantive_meaning=dimensions >= 2)
    return dict(eligible=all(checks.values()), checks=checks,
                reason='；'.join(('具备' if ok else '待补') + key for key, ok in checks.items()))


def materiality(event):
    """Transaction action, rather than filing volume, sets the review priority."""
    kind = publish_text(event.get('event_type'))
    base = {'收购守则/私有化': 90, '非常重大交易': 85, '主要交易': 75,
            '并购': 80, '监管执法': 70, '配售供股': 65, '融资': 60}.get(kind, 40)
    if event.get('stream') == 'capital_markets':
        return 10
    return base + min(5, len(event['research'].get('key_metrics', [])))


def write_candidates(events, path):
    rows = []
    for e in events:
        result = eligibility(e)
        dates = [s.get('date', '') for s in e.get('sources', {}).get('value') or []
                 if s.get('document_type') not in AUX and re.fullmatch(r'\d{4}-\d{2}-\d{2}', s.get('date', ''))]
        rows.append(dict(event_id=e['event_id']['value'], market=e['market']['value'],
                         title=e['research'].get('title', e['title']), materiality=materiality(e),
                         latest_date=max(dates, default=''), **result))
    rows.sort(key=lambda x: (x['materiality'], x['latest_date'], x['event_id']), reverse=True)
    payload = dict(eligible_count=sum(x['eligible'] for x in rows),
                   ranking='materiality descending, latest source date descending, event_id descending',
                   candidates=sorted([x for x in rows if x['eligible']], key=lambda x: (x['materiality'], x['latest_date'], x['event_id']), reverse=True)[:20],
                   review_queue=rows[:20],
                   hk_review_queue=[x for x in rows if x['market'] == 'hk'][:20])
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n')
    return payload
