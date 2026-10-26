"""日批次元数据及北京时间窗口；不调用模型，不同步远端。"""
import datetime as dt
import hashlib
import json
import subprocess
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
TZ = dt.timezone(dt.timedelta(hours=8))
PROMPT_VERSION = 'R08-P5-R3-20261027'

def write_manifest(batch_id=None, model=None):
    path = ROOT / 'state/manifest.json'
    prior = json.loads(path.read_text()) if path.exists() else {}
    commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    scripts = {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest()
               for p in sorted((ROOT / 'scripts').glob('*.py'))}
    prior.update(generated_at=dt.datetime.now(TZ).isoformat(), script_commit=commit,
                 script_sha256=scripts, prompt_version=PROMPT_VERSION,
                 model=model or prior.get('model', '未记录（构建不代表已执行模型分析）'),
                 batch_id=batch_id or prior.get('batch_id'),
                 analysis_mode='Kimi Code 直接读取原文；人工审核结果文件入库，无需 API key')
    prior['prompt_sha256'] = {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest()
                              for p in sorted((ROOT / 'ops/prompts').glob('*.md'))}
    pending = []
    for item in sorted((ROOT / 'state/pending').glob('*.json')):
        obj = json.loads(item.read_text())
        if obj.get('status') not in ('ingested', 'excluded'):
            pending.append({'doc_id': obj.get('doc_id'), 'batch_id': obj.get('batch_id'),
                            'status': obj.get('status'), 'raw_path': obj.get('raw_path')})
    prior['pending_review'] = pending
    prior['scope'] = '出海信批；美股、港股、出口管制各自批次与统计见独立数据文件'
    prior['source_audit'] = 'reports/P5-round3-source-audit.json'
    path.write_text(json.dumps(prior, ensure_ascii=False, indent=2)+'\n')
    return prior
