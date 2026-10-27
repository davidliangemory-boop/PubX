import unittest
from research_schema import field, prepare_research
from research_structure import is_substantive, project_structure

class RoundTwoTest(unittest.TestCase):
    def test_shared_substantive_rule(self):
        excluded = ['Rule 22 dealing disclosure','月报表','翌日披露报表','寄发通函','董事会会议通知','股東大會通告','Notice of board meeting','Date of meeting','Supplemental exhibit','Monthly update']
        for market in ('hk','us','outbound'):
            for title in excluded:
                self.assertFalse(is_substantive(dict(title=title,document_type='补充或条件进展')), (market,title))
            self.assertFalse(is_substantive(dict(title='merger update',form='425')))
            for title in ('正式协议','审批进展','投票结果','交易完成','通函'):
                self.assertTrue(is_substantive(dict(title=title)),title)

    def event(self,market='hk',kind='私有化'):
        return dict(market=field(market,"disclosed"),event_type=field(kind,"disclosed"),sources=field([
            dict(title='首次公告',url='https://example.org/initial',date='2026-01-01'),
            dict(title='审批进展',url='https://example.org/approval',date='2026-02-01'),
            dict(title='Rule 22',url='https://example.org/aux',date='2026-03-01')]),
            research=dict(key_metrics=[dict(label='注销价',value='3港元',sources=['initial'])],research_sources=[dict(id='initial',title='首次公告',url='https://example.org/initial',date='2026-01-01'),dict(title='年报',url='https://example.org/annual'),dict(title='新闻',url='https://example.org/news',label='新闻观点')]))

    def test_slots_dates_layers(self):
        e=self.event();e['financing']=field('银行贷款','disclosed');e['premium']=field(None)
        project_structure(e);r=e['research']
        self.assertEqual([x['label'] for x in r['metric_slots']],['要约价','融资'])
        self.assertEqual(r['metric_slots'][0]['source_urls'],['https://example.org/initial'])
        self.assertEqual(r['first_disclosure']['date'],'2026-01-01')
        self.assertEqual(r['latest_document']['date'],'2026-03-01')
        self.assertEqual(r['latest_substantive']['date'],'2026-02-01')
        self.assertEqual([x['label'] for x in r['source_layers']],['核心文件','进展文件','企业资料','外部资料'])
        self.assertEqual(len(r['attachments']),1)

    def test_templates_and_forward_looking(self):
        for market,kind,key,label in [('outbound','资源收购','buyer','买方'),('hk','主要交易','percent_ratio','百分比率'),('hk','持续关连交易','annual_cap','年度上限'),('hk','配售供股','dilution','摊薄'),('hk','监管执法','penalty','处罚结果'),('us','并购','synergy','协同')]:
            e=self.event(market,kind);e[key]=field('明确字段内容','disclosed');project_structure(e)
            row=next(x for x in e['research']['metric_slots'] if x['label']==label)
            self.assertEqual(row['value'],'明确字段内容')
            if label=='协同':self.assertEqual(row['note'],'前瞻')
        e=self.event('outbound');e['research']['project_maturity']=[dict(text='采矿许可待批准',sources=['initial'])];project_structure(e)
        self.assertIn('项目成熟度',[x['label'] for x in e['research']['metric_slots']])
