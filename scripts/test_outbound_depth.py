import json,re,unittest
from pathlib import Path
from research_schema import finalize_research
ROOT=Path(__file__).resolve().parents[1]
BANNED=re.compile(r'\bnull\b|undisclosed|资料不足|未抽取')
class OutboundDepth(unittest.TestCase):
    def packs(self):
        return {json.loads(p.read_text())['event_id']:json.loads(p.read_text()) for p in sorted((ROOT/'research').glob('outbound_*.json'))}
    def test_built_depth_matches_overlay_intent(self):
        js=(ROOT/'assets/events_outbound.js').read_text()
        rows=json.loads(js[js.index(']=')+2:].rstrip().rstrip(';'))
        built={r['event_id']['value']:r['research'].get('depth') for r in rows}
        for eid,p in self.packs().items():
            if eid in built:
                self.assertEqual(built[eid],p.get('depth'),eid)
    def test_overlay_deep_passes_gate_and_clean(self):
        for eid,p in self.packs().items():
            self.assertFalse(BANNED.search(json.dumps(p,ensure_ascii=False)),eid)
            if p.get('depth')=='deep':
                self.assertEqual(finalize_research(dict(p,curated='outbound'))['depth'],'deep',eid)
            self.assertGreaterEqual(sum(len(x) for x in p.get('summary',[])),150,eid)
if __name__=='__main__':unittest.main()
