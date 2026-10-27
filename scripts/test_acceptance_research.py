"""Acceptance content and the exact SEC transaction boundary."""
import copy
import unittest
from acceptance_research import PACKS, EQT_DOCS, merge_eqt_events, enrich_acceptance
from research_schema import make_event, prepare_research, BANNED

class AcceptanceResearchTest(unittest.TestCase):
    def test_curated_publish_contract(self):
        for pack in PACKS:
            with self.subTest(event=pack['event_id']):
                self.assertEqual(pack['depth'], 'deep')
                self.assertTrue(2 <= len(pack['summary']) <= 3)
                self.assertLessEqual(len(pack['key_metrics']), 6)
                for lines in pack['meaning'].values():
                    self.assertTrue(2 <= len(lines) <= 4)
                refs = {s['id'] for s in pack['research_sources']}
                def check(value):
                    if isinstance(value, str):
                        self.assertIsNone(BANNED.search(value), value)
                    elif isinstance(value, list):
                        for item in value: check(item)
                    elif isinstance(value, dict):
                        for key, item in value.items():
                            if key == 'sources': self.assertTrue(set(item) <= refs)
                            check(item)
                check(pack)
                for item in pack['industry_context']:
                    self.assertTrue(all(item.get(k) for k in ('sample','date','basis')))
                for source in pack['research_sources']:
                    self.assertTrue(source['date'])
                    self.assertTrue(source['url'].startswith('https://'))

    def test_eqt_join_and_old_routes(self):
        from research_schema import field
        canonical = make_event(event_id=PACKS[1]['event_id'], sources=[dict(doc_id='usm_000121390026112242')])
        other = make_event(event_id='US-old', sources=[dict(doc_id='usm_000119312526431025')])
        unrelated = make_event(event_id='US-private-equity', sources=[dict(doc_id='unrelated')])
        saved = copy.deepcopy(unrelated)
        result = merge_eqt_events([other, unrelated, canonical])
        self.assertEqual(len(result), 2)
        self.assertIn('US-old', canonical['aliases'])
        self.assertEqual(unrelated, saved)
        self.assertEqual(len(canonical['sources']['value']), 2)
        self.assertEqual(merge_eqt_events([other, unrelated]), [other, unrelated])

    def test_e028_not_overlaid(self):
        event = make_event(event_id='E-028', sources=[])
        prepare_research(event)
        saved = copy.deepcopy(event)
        enrich_acceptance(event)
        self.assertEqual(event, saved)

if __name__ == '__main__': unittest.main()
