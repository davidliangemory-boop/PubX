# -*- coding: utf-8 -*-
"""CI 构建：仅由 state/ 重建全部前端数据产物（assets/*data.js），不发网络请求。
ingest.yml 在部署 Pages 前运行；assets/*data.js 不再进 main 历史（见 docs/DATA_GROWTH.md）。
  data.js        ← build_data.py（state/db.json + config.json）
  hk_data.js     ← hkex_market_pull.build_hk_data_js（state/hk_market.json）
  us_data.js     ← sec_market_pull.py --build-only（state/us_market.json）
  export_data.js ← export_pull.emit_js（state/export.json）
"""
import os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
os.chdir(ROOT)

def run(*a):
    subprocess.run([sys.executable, *a], check=True)

run("scripts/build_data.py")
run("scripts/sec_market_pull.py", "--build-only")
import hkex_market_pull as hk
hk.build_hk_data_js(hk.load_json(hk.DB_P, {"meta": {}, "batches": [], "docs": {}}))
print("hk_data.js 已生成")
import export_pull as ex
ex.emit_js(ex.load_state())
print("export_data.js 已生成")
for f in ("data.js", "hk_data.js", "us_data.js", "export_data.js"):
    p = os.path.join(ROOT, "assets", f)
    if not os.path.exists(p) or os.path.getsize(p) < 100:
        sys.exit(f"缺少或为空：assets/{f}")
print("build_site：4 个数据产物齐全")
