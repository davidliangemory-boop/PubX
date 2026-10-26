"""有证据的事件归并；主键重复幂等。相似候选仅供审核，不自动改写事实。"""
import copy
import difflib
import json
import re
import datetime
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]

def candidates(events, company, subject, country):
    """同主体，再比较标的与国家；只返回候选，避免把同公司不同事项合并。"""
    out = []
    for e in events:
        names = [p.get('name', p.get('name_zh', '')) for p in e.get('parties', [])]
        if company not in names:
            continue
        title = e.get('title_fact', '')
        if isinstance(title, dict): title = title.get('text', '')
        geo = e.get('geo', {})
        if isinstance(geo, dict): geo = geo.get('text', geo.get('country', ''))
        score = difflib.SequenceMatcher(None, subject, title).ratio()
        if subject and subject in title: score = 1
        if score >= .5 and country and country in str(geo):
            out.append({'event_id': e['event_id'], 'score': score, 'review_required': True})
    return out

def merge(store, incoming, batch_id, update_type='new', target_id=None, reason=None):
    """incoming 是审核后的完整 event v2；修正必须明示理由并留存旧值。"""
    if update_type not in ('new', 'progress', 'duplicate', 'correction', 'withdrawn'):
        raise ValueError('非法 update_type')
    sources = incoming.get('sources', [])
    if not incoming.get('event_id') or not sources or any(not s.get('doc_id') for s in sources):
        raise ValueError('事件必须有 event_id 及非空来源主键')
    if len({s['doc_id'] for s in sources}) != len(sources):
        raise ValueError('来源主键重复')
    events = store.setdefault('events', [])
    docs = store.setdefault('docs', {})
    ids = {s['doc_id'] for s in sources}
    labels = {'new':'新增', 'progress':'进展', 'duplicate':'重复', 'correction':'修正', 'withdrawn':'失效'}
    day = re.fullmatch(r'[DB]-(\d{4})(\d{2})(\d{2})', batch_id)
    date = '-'.join(day.groups()) if day else datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))).date().isoformat()
    log = {'date': date, 'type': labels[update_type], 'batch_id': batch_id,
           'doc_id': sources[-1]['doc_id'], 'note': reason or '审核后归并原文来源'}
    known = {docs[i]['event_id'] for i in ids if i in docs}
    if len(known) > 1: raise ValueError('来源已跨多个事件，须人工处理')
    if known:
        if target_id and target_id not in known: raise ValueError('目标事件与来源归属冲突')
        target_id = next(iter(known))
    target = next((e for e in events if e['event_id'] == target_id), None)
    if target_id and target is None: raise ValueError('目标事件不存在')
    if target is None:
        if update_type != 'new': raise ValueError('非新增必须提供既有事件ID')
        if any(e['event_id'] == incoming['event_id'] for e in events): raise ValueError('事件ID重复')
        target = copy.deepcopy(incoming)
        events.append(target)
    else:
        existing = {s['doc_id'] for s in target.get('sources', [])}
        new_sources = [s for s in sources if s['doc_id'] not in existing]
        if new_sources:
            log['doc_id'] = new_sources[-1]['doc_id']
        if not new_sources and update_type != 'correction': return 'duplicate'
        if update_type == 'new': raise ValueError('已存在事件不可标新增')
        if update_type == 'correction':
            if not reason: raise ValueError('修正必须写原文明示依据')
            diff = {}
            for key, val in incoming.items():
                if key in ('event_id', 'sources', 'stage_chain', 'changelog'): continue
                if val != target.get(key):
                    diff[key] = {'old': copy.deepcopy(target.get(key)), 'new': val}
            if not diff and not new_sources: return 'duplicate'
            target.setdefault('changelog', []).append(dict(log, diff=diff, reason=reason))
            for key, pair in diff.items(): target[key] = copy.deepcopy(pair['new'])
        elif update_type not in ('progress', 'duplicate', 'withdrawn'):
            raise ValueError('非法 update_type')
        target.setdefault('sources', []).extend(copy.deepcopy(new_sources))
        if update_type in ('progress', 'withdrawn'):
            chain = target.setdefault('stage_chain', [])
            for node in incoming.get('stage_chain', []):
                if node not in chain: chain.append(copy.deepcopy(node))
            if update_type == 'withdrawn': target['status'] = 'terminated'
            elif incoming.get('stage_current'): target['stage_current'] = incoming['stage_current']
            # 进展保留旧事实，同时留存本次新增/变化字段供逐题核查，不能静默丢弃。
            diff = {key: {'old': copy.deepcopy(target.get(key)), 'new': copy.deepcopy(val)}
                    for key, val in incoming.items()
                    if key not in ('event_id', 'sources', 'stage_chain', 'changelog', 'stage_current')
                    and val != target.get(key)}
            target.setdefault('changelog', []).append(dict(log,
                reason=reason, diff=diff, source_doc_ids=[s['doc_id'] for s in new_sources]))
    if update_type in ('new', 'duplicate'):
        target.setdefault('changelog', []).append(log)
    target['update_type_latest'] = labels[update_type]
    for source in sources:
        docs.setdefault(source['doc_id'], {'event_id': target['event_id'], 'date': source.get('pub_date', source.get('date'))})
    store.setdefault('meta', {}).update(event_count=len(events), doc_count=len(docs), last_match_batch=batch_id)
    return update_type

if __name__ == '__main__':
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument('review', help='JSON: event/update_type/target_id/reason/batch_id')
    a = ap.parse_args()
    r = json.loads(Path(a.review).read_text())
    path = ROOT / 'state/events.json'
    store = json.loads(path.read_text())
    outcome = merge(store, r['event'], r['batch_id'], r.get('update_type', 'new'), r.get('target_id'), r.get('reason'))
    path.write_text(json.dumps(store, ensure_ascii=False, indent=1)+'\n')
    print(outcome)
