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

class ChainAndExtractionTest(unittest.TestCase):
    def test_dates_exclude_auxiliary_and_company_reports(self):
        for market in ('hk','outbound','us'):
            e=make_event(market=market,sources=[
                dict(date='2025-01-01',title='Annual report'),
                dict(date='2026-01-03',title='签署合并协议'),
                dict(date='2026-02-01',title='审批进展'),
                dict(date='2026-03-01',title='Rule 22 dealing disclosure',url='https://example.org/aux')])
            r=prepare_research(e)
            self.assertEqual(e['disclosure_date']['value'],'2026-01-03')
            self.assertEqual(r['latest_change'],'审批进展')
            self.assertEqual(len(r['attachments']),1)
            self.assertFalse(any('Rule 22' in x['title'] for x in r['research_sources']))

    def test_no_invented_first_announcement(self):
        from build_events import derive_market
        e=derive_market('us',[dict(id='a',cik='1',form='8-K',filing_date='2026-01-01',title='Merger agreement')])[0]
        self.assertNotEqual(e['sources']['value'][0]['role'],'首次公告')

    def test_sec_cross_form_chain_and_routine_communications(self):
        from build_events import derive_market
        docs=[dict(id='a',cik='1',form='8-K',filing_date='2026-01-01',title='Entered into merger agreement with Target',counterparty='Target'),
              dict(id='b',cik='1',form='S-4',filing_date='2026-01-10',title='Merger agreement with Target registration',counterparty='Target'),
              dict(id='c',cik='1',form='425',filing_date='2026-01-20',title='Merger agreement with Target presentation',counterparty='Target')]
        es=derive_market('us',docs)
        self.assertEqual(len(es),1)
        r=prepare_research(es[0])
        self.assertEqual(es[0]['disclosure_date']['value'],'2026-01-01')
        self.assertEqual(r['updated_at'],'2026-01-10')
        self.assertEqual(len(es[0]['aliases']),2)

    def test_deep_gate_and_projection(self):
        from research_schema import finalize_research
        self.assertEqual(finalize_research(dict(depth='deep',title='标题'))['depth'],'brief')
        r=finalize_research(dict(depth='brief',summary=['null'],key_metrics=[dict(label='金额',value='undisclosed')]))
        self.assertNotIn('summary',r)
        self.assertFalse(any(x.get('value') for x in r['key_metrics']))

    def test_pdf_complete_text_precedes_cache(self):
        import tempfile
        from pathlib import Path
        from unittest.mock import patch
        from subprocess import CompletedProcess
        from extract_research_terms import read_full_text, hk_extract
        with tempfile.TemporaryDirectory() as tmp:
            p=Path(tmp)/'filing.txt'
            p.write_text('首页没有条款')
            p.with_suffix('.pdf').write_bytes(b'local PDF')
            with patch('extract_research_terms.subprocess.run',return_value=CompletedProcess([],0,'首页\f最高適用百分比率為25%。'.encode(),b'')) as run:
                self.assertIn('percent_ratio',hk_extract(read_full_text(p)))
                args=run.call_args.args[0]
                self.assertEqual(args,['pdftotext','-layout',str(p.with_suffix('.pdf')),'-'])

if __name__=='__main__': unittest.main()
