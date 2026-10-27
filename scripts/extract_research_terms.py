"""P0.6: conservative full-text extracts from local raw/ (not in git) -> state/research_extracts.json (in git, small).
Only fills a field when a matching source sentence exists; each value carries quote + source + confidence."""
import json, re, os, subprocess
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
CJK = r'[\u3000-\u303f\u4e00-\u9fff\uff00-\uffef「」（）]'

def norm_zh(t):
    t = re.sub(r'(?<=%s)[ \t]+(?=%s)' % (CJK, CJK), '', t)
    t = re.sub(r'\n\s*', '', t)  # pdftotext layout wraps mid-sentence
    return re.sub(r'[ \t]{2,}', ' ', t)

def q(m, t, w=60):
    return t[max(0, m.start()-w):m.end()+w].strip()

def hk_extract(t):
    t = norm_zh(t); out = {}
    m = re.search(r'「獨立財務顧問」(?:或「[^」]{1,12}」)?\s*指\s*([^，,。\s]{3,40}?(?:有限公司|Limited|Ltd\.?))', t) or \
        re.search(r'獨立財務顧問([^，,。「」\s]{3,30}?(?:有限公司|Limited))的?函件', t)
    if m and not re.search(r'將予委任|將由', m.group(0)):
        out['ifa_name'] = dict(value=m.group(1), quote=q(m, t), confidence='high')
    for pat, concl in [(r'(?:吾等|我們)(?:認為|認同|之意見為)[^。]{0,160}?(?:屬|乃|均屬|為)?[^。]{0,20}?公平(?:及|且)?合理[^。]{0,120}', 'fair_and_reasonable'),
                       (r'(?:吾等|我們)[^。]{0,40}(?:認為|之意見)[^。]{0,120}(?:並非|不屬|不)公平(?:及|且)?合理', 'not_fair_and_reasonable')]:
        m = re.search(pat, t)
        if m and re.search(r'是否(?:屬)?公平|是否公平', m.group(0)): m = None
        if m and 'ifa_name' in out:
            rec = re.search(r'建議獨立股東[^。]{0,20}投票(贊成|反對)', t[m.start():m.end()+600])
            out['ifa_conclusion'] = dict(value=concl + ('（独立董事委员会采纳IFA意见）' if re.search(r'獨立財務顧問|IFA', m.group(0)) else '') + ('；建议投票' + rec.group(1) if rec else ''), quote=q(m, t, 10)[:320], confidence='high' if rec else 'medium')
            break
    m = re.search(r'(?:最高)?(?:適用)?百分比率[^。]{0,40}?(?:超過|高於|低於|少於|達|為)\s*\d+(?:\.\d+)?\s*%[^。]{0,60}', t)
    if m: out['percent_ratio'] = dict(value=re.findall(r'(?:超過|高於|低於|少於|達|為)\s*\d+(?:\.\d+)?\s*%', m.group(0)), quote=m.group(0)[:200], confidence='high')
    m = re.search(r'年度上限[^。]{0,40}?(?:分別)?(?:約|為)\s*(?:人民幣|港幣|港元|美元|HK\$|US\$|RMB)?\s*[\d,]+(?:\.\d+)?\s*(?:百萬|億|萬|千)?[^。]{0,80}', t)
    if m: out['annual_cap'] = dict(value=m.group(0)[:160], quote=q(m, t, 30)[:260], confidence='medium')
    m = re.search(r'清洗豁免[^。]{0,120}', t)
    if m: out['whitewash'] = dict(value='提及清洗豁免', quote=m.group(0)[:200], confidence='medium')
    return out

SEC_PATS = {
 'termination_fee': r'Termination Fee["“”]? (?:means|shall mean|of|equal to|in an amount equal to|shall be)[^$]{0,60}\$\s?[\d,.]+(?: (?:million|billion))?',
 'reverse_termination_fee': r'reverse termination fee[^.]{0,40}\$\s?[\d,.]+(?: (?:million|billion))?',
 'outside_date': r'(?:[\"“”]?Outside Date[\"“”]?|[\"“”]?End Date[\"“”]?|[\"“”]?Termination Date[\"“”]?) (?:means|shall mean)[^.;]{5,160}',
 'exchange_ratio': r'[\"“”]?Exchange Ratio[\"“”]? (?:means|shall mean|of)[^.;]{3,160}',
 'per_share_consideration': r'\$\s?(?!0\.0+1\b)[\d,.]+ (?:in cash )?per share(?! of the Company)(?!,? par)[^.;]{0,80}',
 'mae_definition': r'[\"“”]?(?:Company )?Material Adverse (?:Effect|Change)[\"“”]? (?:means|shall mean)[^.;]{5,200}',
 'go_shop': r'(?:go-shop|Go-Shop Period)[^.;]{0,160}',
 'no_shop': r'(?:No Solicitation|no-shop)(?! ?\d)[^.;]{10,120}',
 'governing_law': r'governed by,? and construed in accordance with,? the (?:internal )?laws of the State of \w+(?: \w+)?',
}
CREDIT_PATS = {
 'principal': r'(?:aggregate principal amount of|principal amount of|in an aggregate amount (?:not to exceed|of|up to)|Commitments? (?:of|in an aggregate amount of)) \$\s?[\d,.]+(?: (?:million|billion))?',
 'interest_rate': r'(?:bear interest at (?:a rate|the rate)[^.;]{0,120}|interest at a (?:fixed )?rate of [\d.]+%[^.;]{0,60}|(?:SOFR|Term SOFR|Base Rate) plus [^.;]{0,80})',
 'maturity': r'[\"“”]?Maturity Date[\"“”]? (?:means|shall mean)[^.;]{5,160}',
 'financial_covenant': r'(?:Consolidated (?:Total |Net )?Leverage Ratio|Fixed Charge Coverage Ratio|Interest Coverage Ratio|Minimum Liquidity)[^.;]{0,140}',
 'security': r'(?:secured by (?:a )?(?:first[- ]priority )?(?:security interest|lien)[^.;]{0,120})',
 'conversion_price': r'(?:conversion price|Conversion Price) (?:of|equal to|shall be) [^.;]{3,100}',
}
def sec_extract(t, pats):
    out = {}
    for k, p in pats.items():
        m = re.search(p, t, re.I)
        if m and k == 'per_share_consideration' and re.search(r'par value|\$0\.0+1', q(m, t, 40), re.I): m = None
        if m and k == 'per_share_consideration' and not re.search(r'Merger Consideration|Offer Price|in cash|Per Share (?:Price|Consideration)', q(m, t, 120), re.I): m = None
        if m: out[k] = dict(value=m.group(0)[:220], quote=q(m, t, 80)[:420], confidence='high' if '$' in m.group(0) or 'means' in m.group(0) else 'medium')
    return out

def read_full_text(path):
    """Prefer complete local PDFs over potentially page-limited text caches."""
    path = Path(path)
    pdf = path if path.suffix.lower() == '.pdf' else path.with_suffix('.pdf')
    if not pdf.exists() and pdf.with_suffix('.PDF').exists():
        pdf = pdf.with_suffix('.PDF')
    if pdf.exists():
        # No -f/-l page bounds: contractual terms frequently occur after page one.
        result = subprocess.run(['pdftotext', '-layout', str(pdf), '-'],
                                capture_output=True, check=True, timeout=180)
        return result.stdout.decode('utf-8', errors='replace')
    return path.read_text(errors='ignore')


def main():
    res = {'hk': {}, 'us': {}, 'inventory': {}}
    hkdir = ROOT/'raw'/'hkex_market'
    files = sorted({p.stem: p for pattern in ('*.txt','*.pdf','*.PDF') for p in hkdir.glob(pattern)}.values()) if hkdir.exists() else []
    for f in files:
        x = hk_extract(read_full_text(f))
        if x: x['_source'] = {'raw': 'raw/hkex_market/'+f.name}; res['hk'][f.stem] = x
    sdir = ROOT/'raw'/'sec_exhibits'
    metas = sorted(sdir.glob('*.json')) if sdir.exists() else []
    ex_n = 0
    for mf in metas:
        meta = json.loads(mf.read_text()); rec = {}
        for ex in meta['exhibits']:
            p = ROOT/ex['path']
            if not p.exists() and not p.with_suffix('.pdf').exists() and not p.with_suffix('.PDF').exists(): continue
            ex_n += 1
            t = read_full_text(p)
            is_merger = re.search(r'Agreement and Plan of Merger|Merger Agreement|Stock Purchase Agreement|Asset Purchase Agreement|Equity Purchase Agreement|Membership Interest Purchase|Share Purchase Agreement', t[:3000], re.I)
            is_credit = re.search(r'Credit Agreement|Loan Agreement|Indenture|Note Purchase|Securities Purchase Agreement|Convertible', t[:3000], re.I)
            for key, pats, cond in [('merger_agreement_terms', SEC_PATS, is_merger), ('credit_agreement_terms', CREDIT_PATS, is_credit and not is_merger)]:
                if not cond: continue
                terms = sec_extract(t, pats)
                if terms:
                    for v in terms.values(): v.update(exhibit=ex['number'], url=ex['url'])
                    rec.setdefault(key, {}).update({k: v for k, v in terms.items() if k not in rec.get(key, {})})
        if rec:
            res['us'][meta['id']] = rec
            rec['_substantive'] = sum(1 for g in rec.values() if isinstance(g, dict) for k in g if k not in ('governing_law', 'no_shop'))
    res['inventory'] = dict(hk_raw_texts=len(files), hk_docs_with_extract=len(res['hk']), sec_filings_indexed=len(metas), sec_exhibit_texts=ex_n, sec_filings_with_terms=len(res['us']), sec_filings_substantive=sum(1 for x in res['us'].values() if x['_substantive']), hk_ifa_conclusions=sum('ifa_conclusion' in x for x in res['hk'].values()), hk_percent_ratio=sum('percent_ratio' in x for x in res['hk'].values()))
    (ROOT/'state'/'research_extracts.json').write_text(json.dumps(res, ensure_ascii=False, indent=0))
    print(res['inventory'])
    from collections import Counter
    print(Counter(k for x in res['hk'].values() for k in x), Counter(k for x in res['us'].values() for k in x))
if __name__ == '__main__': main()
