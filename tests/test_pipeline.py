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
        event_merge.merge(store, first, 'D-test')
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

if __name__ == '__main__': unittest.main()
