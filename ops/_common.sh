#!/usr/bin/env bash
# 可从任意目录调用；只生成可审阅结果，发布由调度方执行。
set -euo pipefail
OPS_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO="${PUBX_REPO:-$(cd "$OPS_DIR/.." && pwd)}"
LOGD="${PUBX_LOG_DIR:-/tmp/pubx-ops-logs}"
run_job() {
  local name="$1" promptfile="$2" prompt engine rc=0
  mkdir -p "$LOGD"
  cd "$REPO"
  exec 9>"${PUBX_LOCK_FILE:-/tmp/pubx-ops.lock}"
  flock -n 9 || { echo '已有 PubX 更新任务运行，稍后重试'; return 1; }
  export TZ=Asia/Shanghai
  prompt="$(cat "$OPS_DIR/prompts/_rules.md" "$OPS_DIR/prompts/$promptfile")
运行参数：今天(北京时间)=$(date +%F)；scan_date=$(date -d yesterday +%F)；week_since=$(date -d '6 days ago' +%F)；日批次=D-$(date -d yesterday +%Y%m%d)；周批次=W-$(date +%G%V)。仓库=$REPO。禁止 git commit/push/stash/reset。"
  if [[ "${PUBX_DRY_RUN:-0}" == 1 ]]; then
    printf '%s\n' "$prompt"
    return 0
  fi
  engine="${PUBX_ENGINE:-kimi}"
  if [[ "$engine" == kimi ]] && ! command -v kimi >/dev/null && [[ -x "$HOME/.kimi-code/bin/kimi" ]]; then
    engine="$HOME/.kimi-code/bin/kimi"
  fi
  command -v "$engine" >/dev/null || { echo "找不到运行器 $engine；请将 Kimi Code 加入 PATH 或设置 PUBX_ENGINE"; return 127; }
  if [[ "$engine" == *codex ]]; then
    timeout 5400 "$engine" exec -C "$REPO" "$prompt" 2>&1 | tee "$LOGD/${name}_$(date +%Y%m%d_%H%M%S).log" || rc=$?
  else
    timeout 5400 "$engine" -p "$prompt" 2>&1 | tee "$LOGD/${name}_$(date +%Y%m%d_%H%M%S).log" || rc=$?
  fi
  [[ "$rc" == 0 ]] || return "$rc"
  python3 scripts/validate.py
  python3 scripts/build_data.py
  python3 scripts/validate.py
  echo '完成验证与构建；结果留在工作区，提交/发布由调度方负责。'
}
