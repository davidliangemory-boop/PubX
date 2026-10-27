"""Brief coverage, publication hygiene and evidence gates."""
import json
import unittest
from pathlib import Path
from research_schema import make_event, prepare_research, BANNED
from research_brief import brief, eligibility, materiality

class BriefTest(unittest.TestCase):
    def event(self, **fields):
        e = make_event(market='hk', parties=['测试企业'], event_type='并购', **fields)
        e.update(title='测试交易', stream='material')
        prepare_research(e)
        return e

    def test_sparse_brief_and_empty_modules(self):
        e = self.event()
        r = brief(e)
        self.assertTrue(150 <= len(''.join(r['summary'])) <= 300)
        for key in ('meaning', 'comparables', 'key_metrics', 'research_sources', 'timeline'):
            self.assertNotIn(key, r)
        self.assertFalse(BANNED.search(''.join(r['summary'])))
        self.assertFalse(eligibility(e)['eligible'])

    def test_sources_metrics_and_determinism(self):
        e = self.event(consideration='约10亿港元', sources=[dict(doc_id='a', title='收购协议', url='https://example.org/a', role='首次公告', date='2026-10-01')])
        r = brief(e)
        self.assertEqual(r['research_sources'][0]['url'], 'https://example.org/a')
        self.assertEqual(r['key_metrics'][0]['value'], '约10亿港元')
        self.assertEqual(r, brief(e))
        self.assertFalse(eligibility(e)['eligible'])
        e['stream'] = 'capital_markets'
        self.assertEqual(materiality(e), 10)

    def test_auxiliary_notice_and_contaminated_title(self):
        e = self.event(sources=[
            dict(doc_id='a', title='As previously disclosed', form='8-K', url='https://example.org/a', role='首次公告', date='2026-01-01'),
            dict(doc_id='b', title='规则22交易披露', url='https://example.org/b', document_type='Rule22等辅助材料', date='2026-02-01')])
        r = brief(e)
        self.assertEqual(r['research_sources'][0]['title'], '8-K')
        self.assertEqual(len(r['timeline']), 1)
        self.assertNotIn('规则22交易披露', ''.join(r['summary']))

    def test_each_deep_requirement_is_required(self):
        import copy
        e = self.event(sources=[dict(role='正式协议', url='https://example.org/agreement')])
        e['research'] = dict(timeline=[dict(date='2026-01-01'), dict(date='2026-02-01')],
            comparables=[dict(why='同业同交易结构', lesson='比较融资与交割风险', sources=['a'])],
            research_sources=[dict(id='a', label='财务数据', url='https://example.org/annual', date='2026-01-01')],
            meaning={k:[dict(text='交易以股票支付对价，需要区分股权稀释与现金支出，审批与交割分别构成不同的条件节点。', sources=['a'])] for k in ('financial', 'investment')})
        self.assertTrue(eligibility(e)['eligible'])
        for key in ('timeline', 'comparables', 'research_sources', 'meaning'):
            candidate = copy.deepcopy(e)
            candidate['research'][key] = {} if key == 'meaning' else []
            self.assertFalse(eligibility(candidate)['eligible'], key)
        e['sources']['value'] = []
        self.assertFalse(eligibility(e)['eligible'])

    def test_all_published_briefs(self):
        root = Path(__file__).resolve().parents[1]
        reviewed = {r.get('event_id'): r.get('summary') for path in (root/'research').glob('outbound_*.json') if (r := json.loads(path.read_text())).get('event_id')}
        count = 0
        for p in (root/'assets').glob('events_*.js'):
            if p.name == 'events_index.js': continue
            text = p.read_text()
            rows = json.loads(text[text.index(']=')+2:].rstrip(';\n'))
            for e in rows:
                r = e['research']
                if r['depth'] != 'brief': continue
                count += 1
                self.assertTrue(r.get('research_sources'), e['event_id'])
                # A reviewed article can be downgraded without truncating its research copy.
                length = len(''.join(r['summary']))
                self.assertGreaterEqual(length, 150, e['event_id'])
                if length > 300:
                    self.assertEqual(r['summary'], reviewed.get(e['event_id']['value']), e['event_id'])
                self.assertLessEqual(len(r.get('key_metrics', [])), 6)
                def check(x):
                    if isinstance(x, dict):
                        for v in x.values(): check(v)
                    elif isinstance(x, list):
                        for v in x: check(v)
                    elif isinstance(x, str): self.assertFalse(BANNED.search(x), (e['event_id'], x))
                check(r)
        self.assertGreater(count, 3800, 'Run build_events.py before coverage tests')

if __name__ == '__main__': unittest.main()
