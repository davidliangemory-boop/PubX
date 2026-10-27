"""Filter display placeholders at publication; never change source state or metadata."""
import json
from pathlib import Path
from research_schema import BANNED

# Machine provenance and identifiers are not display strings.
METADATA = {'prov', 'layer', 'url', 'source_url', '来源链接', 'id', 'doc_id', '_aid'}

def display_strings(value, path=()):
    if isinstance(value, dict):
        for key, child in value.items():
            if key not in METADATA:
                yield from display_strings(child, path + (str(key),))
    elif isinstance(value, list):
        for i, child in enumerate(value):
            yield from display_strings(child, path + (str(i),))
    elif isinstance(value, str):
        yield path, value

def sanitize(value):
    if isinstance(value, dict):
        return {k: v if k in METADATA else sanitize(v) for k, v in value.items()}
    if isinstance(value, list):
        return [sanitize(v) for v in value]
    if isinstance(value, str):
        value = value.replace('出海信批', '出海信披')
    if value is None or isinstance(value, str) and BANNED.search(value):
        return ''
    return value

def sanitize_legacy_assets(root):
    for name in ('data.js', 'hk_data.js', 'us_data.js', 'export_data.js'):
        path = Path(root) / 'assets' / name
        prefix, raw = path.read_text().split('=', 1)
        data = json.loads(raw.strip().rstrip(';'))
        path.write_text(prefix + '=' + json.dumps(sanitize(data), ensure_ascii=False, separators=(',', ':')) + ';\n')
