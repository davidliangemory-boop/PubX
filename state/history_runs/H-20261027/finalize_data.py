"""构建后补齐H批次展示元数据；不改前端或仓库scripts。"""
import json,pathlib,datetime,hashlib,sys
P=pathlib.Path
sys.path.insert(0,'scripts')
import pipeline_state,hkex_market_pull
root=P('state/history_runs/H-20261027')
report=json.loads((root/'report.json').read_text())
vr=json.loads(P('state/validate_report.json').read_text());assert vr['summary']['ERROR']==0
report['validation']=vr['summary'];report['script_commit']=__import__('subprocess').check_output(['git','rev-parse','HEAD'],text=True).strip();report['status']='pending';report['publish_ready']=False
(root/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
manifest=pipeline_state.write_manifest('H-20261027','GPT-6')
manifest.update(analysis_mode='GPT-6直接读取原文完成已入库9份公告的extract_facts→legal_map→judge；其余候选尚待审核，无API调用',prompt_version='R08-task-D-20261027',history_window=report['window'],publish_ready=False,history_backfill_status='pending',module_statistics=report['statistics'], source_audit=str(root/'source_review_audit.json'), validation=vr['summary'])
P('state/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
p=P('assets/data.js');s=p.read_text();prefix='window.DB = ';assert s.startswith(prefix);d=json.loads(s[len(prefix):].strip().removesuffix(';'))
# 由原批次重聚合，去掉默认构建器误归入日批的H记录，追加独立历史组。
import build_data
db=json.loads(P('state/db.json').read_text());regular=[b for b in db['batches'] if b.get('id')!='H-20261027']
d['batches_daily']=build_data.build_batches_daily(regular)
b=next(b for b in db['batches'] if b['id']=='H-20261027')
h={'id':b['id'],'kind':'backfill','day':'20261027','time':b['time'],'source':b['source'],'scanned':541,'kept':9,'excluded':6,'failed':472,'runs':1,'items':b['items'],'runs_ids':['H-20261027'],'notes':[{'run':'H-20261027','text':b['note']}],'window':report['window'],'update_counts':b['update_counts'],'pending_review':472,'collection_complete':False,'publish_ready':False}
d['batches_daily'].insert(0,h);d['history_backfill']=report;d['manifest']=manifest;d['validate']=vr
# 首页当前日批仍按既有日更，不将历史补入计入日批五类。
daily=next((b for b in d['batches_daily'] if b['kind']=='daily'),None)
if daily:d['build']['batch']=daily['id']
p.write_text(prefix+json.dumps(d,ensure_ascii=False,indent=1)+';\n')
hk=json.loads(P('state/hk_market.json').read_text());hk.setdefault('meta',{})['history_backfill']={'batch_id':'H-20261027','window':report['window'],'status':'pending','pending_candidates':293,'verified_new':0,'report':'state/history_runs/H-20261027/hk_pending_review.json'};hkex_market_pull.build_hk_data_js(hk);hkex_market_pull.save_json(hkex_market_pull.DB_P,hk)
files=[]
for r in P('raw').glob('*'):
 if r.is_file() and r.name!='index.json':files.append({'path':str(r),'sha256':hashlib.sha256(r.read_bytes()).hexdigest(),'bytes':r.stat().st_size})
(root/'raw_manifest.json').write_text(json.dumps({'scope':'实际留存原文文件；不代表全部已审核','files':files},ensure_ascii=False,indent=2))
print('H批次已单列历史更新带，manifest=H-20261027，publish_ready=false')
