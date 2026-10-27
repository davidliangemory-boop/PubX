# -*- coding: utf-8 -*-
"""推送防覆盖守卫：校验定时任务（sync_github.py，不在本仓库）待推送的文件列表，
只允许白名单路径，拒绝其余并打印原因；存在拒绝时 exit 1。

分工（见 README「推送分工」）：
  · 仓库维护方（人 / Kimi Code）：index.html、assets/app.js、assets/style.css、
    scripts/*.py、docs/ 等前端与管线代码——只在仓库维护，定时任务不得推送。
  · 定时任务（Kimi 网页版 sync_github.py）：只允许写 state/**（raw/ 原文与 assets/*data.js 产物均拒绝，
    见 docs/DATA_GROWTH.md）。

用法：
  python3 scripts/sync_guard.py file1 file2 ...   # 参数列表
  git diff --name-only | python3 scripts/sync_guard.py -    # 从 stdin 读
"""
import fnmatch
import os
import sys

# 白名单：定时任务允许推送的路径模式（相对仓库根目录）
ALLOW = [
    "state/*",            # 数据状态（db/events/config/批次/validate 报告等）
]

# 拒绝清单（优先于白名单）：原文缓存与构建产物不进 git（docs/DATA_GROWTH.md）
DENY = [
    "raw/*",              # PDF/HTML/TXT 原文缓存：本地保留，git 只存 state/raw_manifest.json 指针
    "*.pdf", "*.html", "*.htm",
    "assets/*data.js",    # 由 ingest.yml 在 CI 内从 state/ 构建
    "state/tmp/*",
]

# 拒绝时给出的归属说明
OWNERSHIP = {
    "index.html": "前端入口，归仓库维护方",
    "assets/app.js": "前端逻辑，归仓库维护方",
    "assets/style.css": "前端样式，归仓库维护方",
    "scripts": "管线脚本，归仓库维护方（scripts/*.py 只在仓库维护）",
    "docs": "文档，归仓库维护方",
    ".github": "部署工作流，归仓库维护方",
}


def allowed(path):
    path = path.replace(os.sep, "/").lstrip("./")
    if any(fnmatch.fnmatch(path, pat) for pat in DENY):
        return False
    return any(fnmatch.fnmatch(path, pat) for pat in ALLOW)


def why(path):
    p = path.replace(os.sep, "/").lstrip("./")
    if p.startswith("raw/") or p.endswith((".pdf", ".html", ".htm")):
        return "原文缓存不进 git（只推 state/raw_manifest.json 指针）"
    if fnmatch.fnmatch(p, "assets/*data.js"):
        return "数据产物由 ingest.yml 在 CI 构建，不再提交"
    for prefix, owner in OWNERSHIP.items():
        if path == prefix or path.startswith(prefix.rstrip("/") + "/"):
            return owner
    return "不在定时任务白名单（state/**）内"


def main(argv):
    if argv == ["-"]:
        files = [l.strip() for l in sys.stdin if l.strip()]
    else:
        files = argv
    if not files:
        print("sync_guard：未提供文件列表", file=sys.stderr)
        return 2
    rejected = []
    for f in files:
        if allowed(f):
            print(f"  允许  {f}")
        else:
            rejected.append(f)
            print(f"  拒绝  {f} —— {why(f)}")
    if rejected:
        print(f"sync_guard：拒绝 {len(rejected)} 个文件；定时任务只允许推送 state/**")
        return 1
    print(f"sync_guard：{len(files)} 个文件全部在白名单内")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
