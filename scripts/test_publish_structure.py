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
