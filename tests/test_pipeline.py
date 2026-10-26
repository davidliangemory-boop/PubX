"""仅内存/临时目录验证采集重试、事件幂等和 SEC 日界线。"""
import copy
import datetime
import importlib
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
sys.path.insert(0, str(Path(__file__).resolve().parents[1]/'scripts'))
import event_merge
import run_once
import sec_market_pull as sec
import build_data

class PipelineTests(unittest.TestCase):
    def test_merge_progress_correction_and_duplicate(self):
        store = {'events': [], 'docs': {}}
        first = {'event_id':'TEST', 'stage_current':'signed', 'stage_chain':[], 'sources':[{'doc_id':'a'}], 'scale':{'amount':1}}
        event_merge.merge(store, first, 'D-20261022')
        self.assertEqual(store['events'][0]['changelog'][-1]['date'], '2026-10-22')
        self.assertEqual(store['events'][0]['changelog'][-1]['type'], '新增')
        snap = copy.deepcopy(store)
        self.assertEqual(event_merge.merge(store, first, 'D-test', 'duplicate'), 'duplicate')
        self.assertEqual(store, snap)
        progress = dict(first, sources=[{'doc_id':'b'}], stage_current='closing', stage_chain=[{'stage':'closing','doc_id':'b'}])
        event_merge.merge(store, progress, 'D-next', 'progress', 'TEST', '原文明示完成')
        self.assertEqual(store['events'][0]['scale'], first['scale'])
        corrected = dict(progress, scale={'amount':2})
        event_merge.merge(store, corrected, 'D-fix', 'correction', 'TEST', '更正公告')
        self.assertEqual(store['events'][0]['changelog'][-1]['diff']['scale']['old'], {'amount':1})
        event_merge.merge(store, dict(progress, sources=[{'doc_id':'c'}]), 'D-end', 'withdrawn', 'TEST', '撤回')
        self.assertEqual(store['events'][0]['status'], 'terminated')

    def test_merge_rejects_invalid_input_without_mutation(self):
        for incoming, kind in [({'event_id':'T','sources':[]}, 'new'),
                               ({'event_id':'T','sources':[{'doc_id':'a'}]}, 'invalid')]:
            store = {}
            with self.assertRaises(ValueError):
                event_merge.merge(store, incoming, 'D-test', kind)
            self.assertEqual(store, {})

    def test_progress_retains_new_fact_evidence_without_overwriting(self):
        store = {'events': [], 'docs': {}}
        first = {'event_id':'T', 'sources':[{'doc_id':'a'}], 'scale':{'amount':1}}
        event_merge.merge(store, first, 'D-test')
        later = dict(first, sources=[{'doc_id':'b'}], scale={'amount':2})
        event_merge.merge(store, later, 'D-next', 'progress', 'T', '新披露')
        event = store['events'][0]
        self.assertEqual(event['scale'], {'amount':1})
        self.assertEqual(event['update_type_latest'], '进展')
        self.assertEqual(event['changelog'][-1]['type'], '进展')
        self.assertEqual(event['changelog'][-1]['batch_id'], 'D-next')
        self.assertEqual(event['changelog'][-1]['diff']['scale']['new'], {'amount':2})
        self.assertEqual(event['changelog'][-1]['source_doc_ids'], ['b'])
        before = copy.deepcopy(store)
        self.assertEqual(event_merge.merge(store, later, 'D-next', 'progress', 'T'), 'duplicate')
        self.assertEqual(store, before)

    def test_daily_empty_records_batch_and_pending_retries(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root/'state').mkdir(); (root/'raw').mkdir()
            dbpath = root/'state/db.json'; cfgpath=root/'state/config.json'
            db = {'collected':{'scanned':[],'kept':[],'excluded':[]}, 'cursor':{'last_id':'0'}, 'disclosures':[], 'batches':[], 'tracked':[], 'exceptions':[]}
            dbpath.write_text(json.dumps(db));cfgpath.write_text(json.dumps({'keywords':['境外']}))
            patches = {'ROOT':str(root), 'DB_PATH':str(dbpath), 'CFG_PATH':str(cfgpath), 'WORK':str(root/'state/tmp')}
            with patch.multiple(run_once, **patches), patch.object(run_once, 'rebuild', return_value=0), patch('pipeline_state.write_manifest'), patch.object(sys,'argv',['run_once.py','--date','2026-10-22']), patch.object(run_once.cninfo,'search',return_value=[]) as search:
                self.assertEqual(run_once.main(), 0)
                self.assertEqual(search.call_args.args[:2], ('2026-10-22','2026-10-22'))
                self.assertEqual(json.loads(dbpath.read_text())['batches'][0]['id'],'D-20261022')
            candidate={'announcementId':'retry','secName':'测试','title':'测试候选','time':0}
            (root/'raw/retry.txt').write_text('仅测试重试流程')
            with patch.multiple(run_once, **patches), patch.object(run_once,'rebuild',return_value=0), patch('pipeline_state.write_manifest'), patch.object(sys,'argv',['run_once.py','--date','2026-10-22']), patch.object(run_once.cninfo,'search',return_value=[candidate]):
                self.assertEqual(run_once.main(), 1)
                self.assertNotIn('retry',json.loads(dbpath.read_text())['collected']['scanned'])
                self.assertTrue((root/'state/pending/retry.json').exists())

    def test_backfill_batch_not_in_daily(self):
        self.assertEqual(build_data.batch_day({'id':'B-20261027'}),('backfill','20261027'))
        self.assertEqual(build_data.batch_day({'id':'B-20261022-0800'}),('daily','20261022'))

    def test_saved_pending_survives_empty_source_and_exclusion_closes_it(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root/'state/pending').mkdir(parents=True)
            (root/'state/analysis').mkdir()
            (root/'raw').mkdir()
            candidate = {'announcementId':'saved', 'secName':'测试', 'title':'候选',
                         'time':int(datetime.datetime(2026,10,22,tzinfo=run_once.TZ).timestamp()*1000)}
            pending = root/'state/pending/saved.json'
            pending.write_text(json.dumps({'candidate':candidate,'status':'awaiting_analysis'}))
            (root/'raw/saved.txt').write_text('真实流程测试文本')
            dbpath=root/'state/db.json';cfgpath=root/'state/config.json'
            dbpath.write_text(json.dumps({'collected':{'scanned':[],'kept':[],'excluded':[]},'cursor':{'last_id':'0'},'disclosures':[],'batches':[],'tracked':[],'exceptions':[]}))
            cfgpath.write_text('{"keywords":[]}')
            (root/'state/analysis/saved.json').write_text(json.dumps({'gate':{'include':False,'category':'其他无关','reason':'原文不涉出海'}}))
            with patch.multiple(run_once,ROOT=str(root),DB_PATH=str(dbpath),CFG_PATH=str(cfgpath)), patch.object(run_once.cninfo,'search',return_value=[]), patch.object(run_once,'rebuild',return_value=0), patch('pipeline_state.write_manifest'), patch.object(sys,'argv',['run_once.py','--date','2026-10-22']):
                self.assertEqual(run_once.main(),0)
            self.assertEqual(json.loads(pending.read_text())['status'],'excluded')
            self.assertEqual(json.loads(dbpath.read_text())['collected']['excluded'],['saved'])
            run_once.analyze.REVIEW = None

    def test_source_outage_still_closes_cached_exclusion_but_fails_window(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root/'state/pending').mkdir(parents=True)
            (root/'state/analysis').mkdir()
            (root/'raw').mkdir()
            candidate = {'announcementId':'saved', 'secName':'测试', 'title':'候选',
                         'time':int(datetime.datetime(2026,10,22,tzinfo=run_once.TZ).timestamp()*1000)}
            (root/'state/pending/saved.json').write_text(json.dumps({'candidate':candidate,'status':'awaiting_analysis'}))
            (root/'state/analysis/saved.json').write_text(json.dumps({'gate':{'include':False,'category':'其他无关','reason':'原文不涉出海'}}))
            (root/'raw/saved.txt').write_text('流程测试文本')
            dbpath=root/'state/db.json'; cfgpath=root/'state/config.json'
            dbpath.write_text(json.dumps({'collected':{'scanned':[],'kept':[],'excluded':[]},'cursor':{'last_id':'0'},'disclosures':[],'batches':[],'tracked':[],'exceptions':[]}))
            cfgpath.write_text('{"keywords":[]}')
            with patch.multiple(run_once,ROOT=str(root),DB_PATH=str(dbpath),CFG_PATH=str(cfgpath)), patch.object(run_once.cninfo,'search',side_effect=RuntimeError('source unavailable')), patch.object(run_once,'rebuild',return_value=0), patch('pipeline_state.write_manifest'), patch.object(sys,'argv',['run_once.py','--date','2026-10-22']):
                self.assertEqual(run_once.main(),1)
            db=json.loads(dbpath.read_text())
            self.assertEqual(db['collected']['excluded'], ['saved'])
            self.assertFalse(db['batches'][0]['collection_complete'])
            self.assertEqual(db['batches'][0]['collection_error'], 'source unavailable')
            self.assertIn('不代表零新增',db['batches'][0]['note'])
            run_once.analyze.REVIEW = None

    def test_sec_acceptance_beijing_boundary_does_not_consume(self):
        row={'path':'edgar/data/1/0000000001-26-000001.txt','cik':'1','form':'6-K','date':'2026-10-21','company':'Test'}
        # 美东 12:00（夏令时）= 北京时间次日 00:00，应排除于 21 日，纳入 22 日。
        raw='<ACCEPTANCE-DATETIME>20261021120000\n<DOCUMENT>test</DOCUMENT>'
        with patch.object(sec,'fetch',return_value=raw), patch.object(sec,'parse_primary',return_value=('test','')):
            self.assertEqual(sec.process_filing(row,{},set(),{},'D-20261021',{'2026-10-21'})[0], 'OUTSIDE')
            entry, err = sec.process_filing(row,{},set(),{},'D-20261022',{'2026-10-22'})
            self.assertIsNone(err)
            self.assertEqual(entry['date'],'2026-10-22')
            self.assertEqual(entry['filing_date'],'2026-10-21')

    def test_validation_failure_blocks_build(self):
        from types import SimpleNamespace
        with patch.object(run_once.subprocess, 'run', return_value=SimpleNamespace(returncode=1)) as command:
            self.assertEqual(run_once.rebuild(), 1)
            self.assertEqual(command.call_count, 1)
            self.assertTrue(command.call_args.args[0][-1].endswith('validate.py'))

    def test_review_rejects_wrong_page_and_empty_steps(self):
        import analyze
        review = {'gate': {'include': True}, 'steps': {
            'extract_facts': [{'value': '金额100', 'layer':'disclosed', 'evidence': {'page':2, 'quote':'金额100'}}],
            'legal_map': [{'issue_code':'I10.2','layer':'analysis','basis':'原文金额'}],
            'judge': [{'text':'核查付款','layer':'analysis','basis':'原文金额'}]},
            'result': {'fields': {'投资金额':0}, 'quotes':['金额100']}}
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp)/'review.json';p.write_text(json.dumps(review))
            with self.assertRaisesRegex(ValueError, '指定原文页'):
                analyze.use_review(p, ['金额100', '其他内容'])
            review['steps']['extract_facts'][0]['evidence']['page'] = 1
            p.write_text(json.dumps(review));analyze.use_review(p, ['金额100','其他内容'])
            self.assertEqual(analyze.REVIEW['result']['fields']['投资金额'], '0')
            review['steps']['judge'] = [];p.write_text(json.dumps(review))
            with self.assertRaisesRegex(ValueError, '缺少三步'):
                analyze.use_review(p, ['金额100'])
        analyze.REVIEW = None

    def test_watch_retry_retains_unreviewed_candidates(self):
        for module_name, watchfile, key in [('hkex_pull','watchlist_hk.json','news_id'), ('sec_pull','watchlist_us.json','accession')]:
            module = importlib.import_module(module_name)
            with self.subTest(module=module_name), tempfile.TemporaryDirectory() as tmp:
                root = Path(tmp);(root/watchfile).write_text('[]')
                output = root/'candidates.json';output.write_text(json.dumps({'items':[{key:'keep-me','raw_path':'raw/original.txt'}]}))
                with patch.object(module,'STATE',tmp), patch.object(sys,'argv',[module_name,'--date','2026-10-22','--out',str(output)]):
                    module.main()
                self.assertEqual(json.loads(output.read_text())['items'][0][key], 'keep-me')
                self.assertEqual(json.loads(output.read_text())['new_count'], 0)
                self.assertEqual(json.loads(output.read_text())['retained_count'], 1)

if __name__ == '__main__': unittest.main()
