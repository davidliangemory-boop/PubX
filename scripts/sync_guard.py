# -*- coding: utf-8 -*-
"""推送防覆盖守卫：校验定时任务（sync_github.py，不在本仓库）待推送的文件列表，
只允许白名单路径，拒绝其余并打印原因；存在拒绝时 exit 1。

分工（见 README「推送分工」）：
  · 仓库维护方（人 / Kimi Code）：index.html、assets/app.js、assets/style.css、
    scripts/*.py、docs/ 等前端与管线代码——只在仓库维护，定时任务不得推送。
  · 定时任务（Kimi 网页版 sync_github.py）：只允许写 state/** 与 assets/*data.js
    （数据与数据构建产物）。

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
    "assets/*data.js",    # 数据构建产物（assets/data.js 及未来各模块 *data.js）
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
    return any(fnmatch.fnmatch(path, pat) for pat in ALLOW)


def why(path):
    for prefix, owner in OWNERSHIP.items():
        if path == prefix or path.startswith(prefix.rstrip("/") + "/"):
            return owner
    return "不在定时任务白名单（state/** 与 assets/*data.js）内"


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
        print(f"sync_guard：拒绝 {len(rejected)} 个文件；定时任务只允许推送 state/** 与 assets/*data.js")
        return 1
    print(f"sync_guard：{len(files)} 个文件全部在白名单内")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
