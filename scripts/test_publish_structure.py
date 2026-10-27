"""Round 1 publication contracts: content density and display projection."""
import unittest
from publish_display import sanitize, display_strings
from research_schema import finalize_research, BANNED

class PublishStructureTest(unittest.TestCase):
    def test_display_projection_preserves_metadata_and_source(self):
        raw = {'value': '融资：未披露', 'prov': 'analysis', 'layer': 'disclosed', 'n': None, 'zero': 0}
        out = sanitize(raw)
        self.assertEqual(out, dict(value='', prov='analysis', layer='disclosed', n='', zero=0))
        self.assertEqual(raw['value'], '融资：未披露')
        self.assertFalse(any(BANNED.search(v) for _, v in display_strings(out)))

    def test_depth_uses_density_not_old_label(self):
        r = dict(depth='brief', summary=['事实背景与商业意义。'*40],
                 research_sources=[dict(label='公告事实', url='https://example.org/core'), dict(label='财务数据', url='https://example.org/annual')],
                 timeline=[dict(text='签约'), dict(text='审批')],
                 comparables=[dict(why='相同交易结构', lesson='比较审批与资金压力')],
                 meaning={k:['现金支付影响融资需求与交割资金安排，需要结合偿债计划判断。'] for k in ('financial','strategy')})
        self.assertEqual(finalize_research(r)['depth'], 'deep')
        r['depth'] = 'deep'
        r['summary'] = ['短摘要']
        self.assertEqual(finalize_research(r)['depth'], 'brief')
        r['summary'] = ['事实背景与商业意义。'*40]
        r['comparables'] = []
        self.assertEqual(finalize_research(r)['depth'], 'brief')

    def test_validator_rejects_published_display_tokens(self):
        import json
        import tempfile
        from pathlib import Path
        from unittest.mock import patch
        import validate
        with tempfile.TemporaryDirectory() as tmp:
            assets = Path(tmp) / 'assets'
            assets.mkdir()
            path = assets / 'data.js'
            for token in ('null', 'undisclosed', '未披露', '资料不足', '未抽取', 'analysis', '[]'):
                path.write_text('window.DB=' + json.dumps({'summary': token, 'prov': 'analysis'}) + ';')
                with patch.object(validate, 'ROOT', tmp), patch.object(validate, 'ISSUES', []):
                    validate.check_publish_display()
                    self.assertTrue(any(level == 'ERROR' for _, level, _ in validate.ISSUES), token)
            path.write_text('window.DB=' + json.dumps({'summary': '交易签约', 'prov': 'analysis'}) + ';')
            with patch.object(validate, 'ROOT', tmp), patch.object(validate, 'ISSUES', []):
                validate.check_publish_display()
                self.assertFalse(any(level == 'ERROR' for _, level, _ in validate.ISSUES))

class RoundThreeTest(unittest.TestCase):
    def test_rows_require_real_implications_and_industry_scope(self):
        import copy
        raw = dict(comparables=[dict(title='无启示', why='相似'), dict(title='有效', why='相同结构', lesson='融资影响成本')],
                   industry_context=[dict(text='行业均值', sample='全样本', date='2026-01-01', basis='PB中位数')])
        before = copy.deepcopy(raw)
        out = finalize_research(raw)
        self.assertEqual([c['title'] for c in out['comparables']], ['有效'])
        self.assertEqual(len(out['industry_context']), 1)
        for key in ('sample', 'date', 'basis'):
            incomplete = copy.deepcopy(raw)
            del incomplete['industry_context'][0][key]
            self.assertEqual(finalize_research(incomplete)['industry_context'], [])
        self.assertEqual(raw, before)

    def test_amount_hook_preserves_existing_text_and_sources(self):
        watch = dict(text='媒体估算75亿港元与公告现金需求存在口径差异，未计入借出股份。', sources=['notice'])
        self.assertEqual(finalize_research(dict(watch_items=[watch]))['cash_explanation'], [watch])
        explicit = dict(text='现金加设备作价', sources=['original'])
        self.assertEqual(finalize_research(dict(cash_explanation=[explicit], watch_items=[watch]))['cash_explanation'], [explicit])
        for text in ('公告金额75亿港元', '关注媒体报道与审批进展', '媒体与公告金额相同'):
            self.assertNotIn('cash_explanation', finalize_research(dict(watch_items=[text])))
