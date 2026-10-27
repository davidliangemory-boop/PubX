"""Reviewed overlays for the two non-HK acceptance events only.

The SEC allowlist joins documents of the October 25 EQT/Range agreement;
no issuer-wide or text-similarity merging is applied to other transactions.
"""
import copy
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACKS = [json.loads((ROOT / 'research' / name).read_text()) for name in
         ('outbound_e013.json', 'us_eqt_range.json')]
EQT_DOCS = {
    'usm_000119312526431025', 'usm_000121390026112245',
    'usm_000121390026112242', 'usm_000121390026112513',
    'usm_000119312526432197', 'usm_000119312526432191',
}


def merge_eqt_events(events):
    matches = [e for e in events if any(s.get('doc_id') in EQT_DOCS
               for s in e['sources']['value'])]
    if not matches:
        return events
    canonical = next((e for e in matches if e['event_id']['value'] == PACKS[1]['event_id'] or PACKS[1]['event_id'] in e.get('aliases', [])), None)
    if canonical is None:
        return events
    canonical_id = PACKS[1]['event_id']
    canonical['aliases'] = sorted(({e['event_id']['value'] for e in matches} |
                                   {alias for e in matches for alias in e.get('aliases', [])}) - {canonical_id})
    canonical['event_id']['value'] = canonical_id
    seen = set()
    sources = []
    for e in matches:
        for s in e['sources']['value']:
            key = s.get('doc_id') or s.get('url')
            if key not in seen:
                sources.append(s)
                seen.add(key)
    canonical['sources']['value'] = sources
    return [e for e in events if e not in matches or e is canonical]


def enrich_acceptance(event):
    pack = next((p for p in PACKS if p['event_id'] == event['event_id']['value']), None)
    if pack is None:
        return
    event['research'] = copy.deepcopy({k: v for k, v in pack.items() if k != 'event_id'})
    event['title'] = pack['title']
    # All merged filings and reviewed exhibits remain accessible from one page.
    if pack['event_id'].startswith('US-'):
        refs = event['research']['research_sources']
        urls = {s['url'] for s in refs}
        for s in event['sources']['value']:
            if s.get('url') and s['url'] not in urls:
                refs.append(dict(id=s['doc_id'], title=s.get('form', 'SEC') + '：同一合并交易文件',
                                 url=s['url'], date=s['date'], label='公告事实'))
                urls.add(s['url'])
