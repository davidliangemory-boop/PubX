import unittest
from build_events import derive_market
from hk_research import classify_document, curated_docs, enrich_research, AUX, CORE, PROGRESS
from research_schema import prepare_research

class HKResearchTest(unittest.TestCase):
    def test_classification(self):
        for title, expected in [
            ('規則22交易披露',AUX),('Rule 22 dealing disclosure',AUX),
            ('私有化首次联合公告',CORE),('寄发计划文件时间表更新',PROGRESS),
            ('延遲寄發通函',PROGRESS),('私有化通函','通函'),
            ('独立财务顾问意见','IFA意见'),('法院會議及股東大會結果','股东大会或法院会议结果'),
            ('终止私有化','完成或终止'),('完成收購','完成或终止')]:
            with self.subTest(title=title): self.assertEqual(classify_document(title),expected)

    def test_auxiliary_never_standalone_or_latest(self):
        docs=[dict(doc_id='a',stock_code='1',pub_date='2026-01-01',title='私有化首次公告'),
              dict(doc_id='b',stock_code='1',pub_date='2026-01-30',title='規則22交易披露',url='https://example.org/b')]
        es=derive_market('hk',docs)
        self.assertEqual(len(es),1)
        r=prepare_research(es[0]);enrich_research(es[0])
        self.assertEqual(r['updated_at'],'2026-01-01')
        self.assertEqual(r['latest_change'],'私有化首次公告')
        self.assertEqual(len(r['attachments']),1)
        self.assertEqual(derive_market('hk',docs[1:]),[])

    def test_cross_category_referenced_circular(self):
        docs=[dict(doc_id='a',stock_code='1',pub_date='2026-01-01',title='私有化首次公告'),
              dict(doc_id='b',stock_code='1',pub_date='2026-01-20',title='通函 有關2026年1月1日公告')]
        es=derive_market('hk',docs)
        self.assertEqual(len(es),1)
        self.assertEqual(es[0]['sources']['value'][-1]['document_type'],'通函')

    def test_gold_chain(self):
        e=derive_market('hk',curated_docs([]))[0]
        r=prepare_research(e);enrich_research(e)
        self.assertEqual(e['disclosure_date']['value'],'2026-08-07')
        self.assertEqual(r['depth'],'deep')
        self.assertEqual(r['updated_at'],'2026-10-16')
        self.assertEqual([t['date'] for t in r['timeline']],['2026-07-22','2026-08-07','2026-08-28','2026-09-10','2026-09-28','2026-10-16'])
        self.assertEqual(len(r['key_metrics']),6)
        self.assertTrue(all(2 <= len(v) <= 4 for v in r['meaning'].values()))

    def test_templates_hide_missing(self):
        from research_schema import make_event, field
        for kind, key, name in [('配售供股','dilution','配售/供股'),('关连交易','annual_cap','关连交易/CCT'),('主要交易','percent_ratio','Chapter 14交易'),('监管执法','penalty','监管执法')]:
            e=make_event(event_type=kind,sources=[])
            e['specialty']={key:field('12%','disclosed')}
            prepare_research(e);enrich_research(e)
            self.assertEqual(e['research']['template'],name)
            self.assertEqual(len(e['research']['key_metrics']),1)

if __name__=='__main__': unittest.main()
