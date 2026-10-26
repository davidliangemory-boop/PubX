"""内存回放最近三个非空批次及源主键；验证幂等，不联网、不写生产事件。"""
import copy
import json
from pathlib import Path
from event_merge import merge
ROOT = Path(__file__).resolve().parents[1]

def main():
    db = json.loads((ROOT/'state/db.json').read_text())
    original = json.loads((ROOT/'state/events.json').read_text())
    store = copy.deepcopy(original)
    lookup = {e['event_id']:e for e in store['events']}
    logs = []
    for batch in [b for b in db['batches'] if b.get('items')][:3]:
        outcomes = []
        for aid in batch['items']:
            if aid not in store['docs']: continue
            target = store['docs'][aid]['event_id']
            outcomes.append(merge(store, copy.deepcopy(lookup[target]), batch['id'], 'duplicate', target))
        assert store == original, '重复回放不应改变事件事实、来源或元数据'
        logs.append({'batch_id':batch['id'], 'replayed_docs':len(outcomes), 'duplicates':outcomes.count('duplicate'), 'event_count':len(store['events'])})
    # 用正文标的检查，不将两个渠道的未验证映射硬编码成事实。
    mach = [e['event_id'] for e in store['events'] if '马赫' in json.dumps(e, ensure_ascii=False)]
    assert len(mach) == 1, mach
    report = {'mode':'offline_existing_sources_replay', 'batches':logs, 'mach_events':mach, 'unchanged':store==original}
    out = ROOT/'reports/P5-replay.json'
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
    print(json.dumps(report, ensure_ascii=False))

if __name__ == '__main__': main()
