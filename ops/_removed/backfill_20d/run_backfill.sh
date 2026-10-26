#!/usr/bin/env bash
# 已下线的 20 天日更回溯任务 B（保留脚本仅供审阅，勿再调度；见同目录 README.md）
set -euo pipefail
HERE="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$HERE/../../ops/_common.sh"
run_job backfill backfill.md
