"""仅从库内已收录主键重建缺失 seen 文件，不伪造未收录扫描历史。"""
import json
import re
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]

def recover():
    db = json.loads((ROOT/'state/db.json').read_text())
    events = json.loads((ROOT/'state/events.json').read_text())
    rows = db['disclosures']
    ids = {str(r['_aid']) for r in rows} | set(events.get('docs', {}))
    acc = set()
    for r in rows:
        for token in re.findall(r'\d{18}|\d{10}-\d{2}-\d{6}', r.get('来源链接', '')):
            n = token.replace('-', '')
            acc.add(n[:10]+'-'+n[10:12]+'-'+n[12:])
    news = {i.removeprefix('hkex_').removesuffix('_b') for i in ids if i.startswith('hkex_')}
    payloads = {
        'seen.json': {'scanned': db.get('collected', {}).get('scanned', []), 'kept': db.get('collected', {}).get('kept', []), 'provenance': 'state/db.json collected，仅恢复已记录扫描'},
        'sec_seen.json': {'acc': sorted(acc), 'cursor': {}, 'provenance': 'state/db.json 来源链接 accession；不推定完整历史游标'},
        'hkex_seen.json': {'news': sorted(news), 'cursor': {}, 'provenance': 'state/db.json + events.docs 的 hkex 主键'},
    }
    result = {}
    for name, obj in payloads.items():
        path = ROOT/'state'/name
        if not path.exists(): path.write_text(json.dumps(obj, ensure_ascii=False, indent=2)+'\n')
        result[name] = '已存在' if path.exists() else '缺失'
    report = ['# 沙箱状态恢复审计', '', '依据：state/db.json、state/events.json、assets/data.js、当前 Git 可达历史。未删除任何用户原始数据。', '']
    for name, obj in payloads.items():
        key = next(iter(obj))
        actual = json.loads((ROOT/'state'/name).read_text())
        report.append(f'- {name}：现存 {len(actual.get(key, []))} 个 {key}；可重建 {len(obj[key])} 个。保留现有文件；seen 的 scanned 包含历史排除项，不等于收录数。')
    missing = [i for i in ids if not (ROOT/'raw'/f'{i}.txt').exists()]
    report += ['', f'原文：{len(ids)-len(missing)}/{len(ids)} 个来源主键有 raw/<doc_id>.txt。', '',
               '## 不能无损恢复的状态', '',
               '- 沙箱中从未提交的全量扫描/排除/失败历史、逐公司最新扫描游标、HKEX stockId 缓存：无法从收录结果反推；继续用重叠窗口查询。',
               '- 原文缓存只能保留真实原文，不能从分析或摘录拼造。现有 raw/index.json 仅记录既有抓取结果，不补造下载时间。',
               '- 完整 SEC/HKEX 采集覆盖与公司 IR 自动接入未能由存量收录证明；接口失败必须记录，不宣称全量成功。',
               '- SEC 新采集已跨相邻美东索引并按 acceptance 转换北京时间；旧存量的申报日与未记录的 acceptance 无法无损重建，保持原值，不猜测转换。', '', '缺失原文主键：'+(', '.join(missing) if missing else '无（库内来源主键均有缓存）')]
    (ROOT/'docs/missing_state.md').write_text('\n'.join(report)+'\n')
    print(json.dumps({k:len(v[next(iter(v))]) for k,v in payloads.items()}, ensure_ascii=False))

if __name__ == '__main__': recover()
