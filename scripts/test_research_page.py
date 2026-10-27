"""Phase A publish contract; no chain regrouping or reviewed deep pages."""
import unittest
from research_schema import BANNED, prepare_research, make_event, publish_text

class ResearchPublishTest(unittest.TestCase):
    def test_banned_text(self):
        for token in ('null','undisclosed','analysis','disclosed','未披露','未抽取','资料不足','暂无','[]'):
            self.assertEqual(publish_text('前缀 '+token), '')

    def test_empty_and_depth_gate(self):
        e=make_event()
        e.update(title='测试', brief={'depth':'deep'})
        r=prepare_research(e)
        self.assertEqual(r['depth'],'brief')
        for key in ('summary','key_metrics','comparables','industry_context','watch_items','timeline','research_sources'):
            self.assertEqual(r[key],[])
        self.assertEqual(r['meaning'],dict(financial=[],strategy=[],investment=[]))

    def test_routine_notice_not_progress(self):
        e=make_event(stage='例行披露',sources=[dict(role='首次公告',date='2026-01-01',title='签订协议'),dict(role='交易披露',date='2026-02-01',title='例行持股披露')])
        r=prepare_research(e)
        self.assertEqual(r['latest_change'],'签订协议')
        self.assertEqual(r['updated_at'],'2026-01-01')

if __name__=='__main__': unittest.main()
