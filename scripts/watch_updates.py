"""对在库观察主体补检近180日进展公告；只产候选，不自动形成事实。"""
import argparse
import datetime as dt
import json
from pathlib import Path
import cninfo
from pipeline_state import ROOT, TZ

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--date', type=dt.date.fromisoformat, help='180日观察窗口的截至日（北京时间）')
    ap.add_argument('--backfill-days', type=int, default=20, help='补漏窗口元数据，默认20；观察补检固定180日')
    a = ap.parse_args()
    end = a.date or dt.datetime.now(TZ).date()-dt.timedelta(days=1)
    start = end-dt.timedelta(days=179)
    db = json.loads((ROOT/'state/db.json').read_text())
    companies = {name.strip() for x in db.get('tracked', []) for name in (x.get('company') or '').split('/') if name.strip()}
    out = []
    for company in sorted(companies):
        for row in cninfo.search(start.isoformat(), end.isoformat(), [company]):
            if any(word in row['title'] for word in ('进展','完成','终止','延期','更正')):
                out.append(row)
    path = ROOT/'state/watch_updates.json'
    path.write_text(json.dumps({'window_start':start.isoformat(), 'window_end':end.isoformat(),
        'backfill_days':a.backfill_days, 'companies':sorted(companies), 'candidates':out,
        'status':'awaiting_original_review', 'note':'候选不计入收录；按披露日审核归并后入库'},ensure_ascii=False,indent=2)+'\n')
    print(f'观察主体{len(companies)}家，进展候选{len(out)}条；尚未入库')

if __name__ == '__main__': main()
