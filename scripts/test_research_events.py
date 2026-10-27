"""Regression cases for event boundaries and misleading SEC dollar amounts."""
import unittest
from build_events import derive_market, amounts

class ResearchEventsTest(unittest.TestCase):
    def test_hk_same_issuer_distinct_transactions(self):
        docs = [dict(doc_id='a',stock_code='1234',title='主要交易 收購澳洲煤礦甲',pub_date='2026-01-01'), dict(doc_id='b',stock_code='1234',title='主要交易 出售美國軟件業務乙',pub_date='2026-01-02')]
        self.assertEqual(len(derive_market('hk',docs)), 2)
    def test_hk_referenced_chain(self):
        docs = [dict(doc_id='a',stock_code='1234',title='主要交易 收購煤礦',pub_date='2026-01-01'), dict(doc_id='b',stock_code='1234',title='主要交易 延遲寄發通函 有關2026年1月1日公告',pub_date='2026-02-01')]
        es=derive_market('hk',docs)
        self.assertEqual(len(es),1)
        self.assertEqual(es[0]['sources']['value'][-1]['role'],'延迟寄发')
        self.assertEqual(es[0]['disclosure_date']['value'],'2026-01-01')
    def test_sec_price_not_deal_amount(self):
        for text in ['par value $0.001','minimum bid $1.00','conversion price $4.50','registration fee $100','per-note price $1000','coupon $50']:
            with self.subTest(text=text):
                self.assertTrue(amounts({'summary':text})[0]['excluded_from_deal'])
    def test_sec_streams(self):
        docs=[dict(id='a',cik='1',form='424B2',filing_date='2026-01-01'),dict(id='b',cik='1',form='8-K',filing_date='2026-01-02')]
        self.assertEqual({e['stream'] for e in derive_market('us',docs)}, {'material','capital_markets'})

if __name__=='__main__': unittest.main()
