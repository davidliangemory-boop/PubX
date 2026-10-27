#!/usr/bin/env bash
# 共用：run_job <name> <promptfile> [--dry-run]
# 默认只生成可审阅结果，发布由调度方执行（提示词中禁止 git commit/push/stash/reset）；
# 设置 PUBX_PUBLISH=1 时恢复旧式自动发布（额度检测 + sync_guard 白名单 + commit/push main）。
set -euo pipefail
OPS_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO="${PUBX_REPO:-$(cd "$OPS_DIR/.." && pwd)}"
LOGD="${PUBX_LOG_DIR:-/tmp/pubx-ops-logs}"
run_job() {
  local name="$1" promptfile="$2" prompt engine rc=0 dry="${PUBX_DRY_RUN:-0}" publish="${PUBX_PUBLISH:-0}"
  shift 2
  while (( $# )); do
    case "$1" in
      --dry-run) dry=1 ;;
      --publish) publish=1 ;;
      --help|-h) echo '用法：run_daily.sh 或 run_weekly_exportcontrol.sh [--dry-run] [--publish]；PUBX_ENGINE 指定运行器，认证由仓库外管理。'; return 0 ;;
      *) echo "不支持的参数：$1（单日采集请调用 scripts/*_pull.py --date YYYY-MM-DD）" >&2; return 2 ;;
    esac
    shift
  done
  mkdir -p "$LOGD"
  cd "$REPO"
  exec 9>"${PUBX_LOCK_FILE:-/tmp/pubx-ops.lock}"
  flock -n 9 || { echo '已有 PubX 更新任务运行，稍后重试'; return 1; }
  export TZ=Asia/Shanghai
  local ts log t0
  ts=$(date +%Y%m%d_%H%M%S); log="$LOGD/${name}_$ts.log"; t0=$(date +%s)
  prompt="$(cat "$OPS_DIR/prompts/_rules.md" "$OPS_DIR/prompts/$promptfile")
运行参数：今天(北京时间)=$(date +%F)；scan_date=$(date -d yesterday +%F)；week_since=$(date -d '6 days ago' +%F)；日批次=D-$(date -d yesterday +%Y%m%d)；周批次=W-$(date +%G%V)。仓库=$REPO。禁止 git commit/push/stash/reset。"
  if [[ "$dry" == 1 ]]; then
    printf '%s\n' "$prompt"
    return 0
  fi
  engine="${PUBX_ENGINE:-kimi}"
  if [[ "$engine" == kimi ]] && ! command -v kimi >/dev/null && [[ -x "$HOME/.kimi-code/bin/kimi" ]]; then
    engine="$HOME/.kimi-code/bin/kimi"
  fi
  command -v "$engine" >/dev/null || { echo "找不到运行器 $engine；请将 Kimi Code 加入 PATH 或设置 PUBX_ENGINE"; return 127; }
  if [[ "$engine" == *codex ]]; then
    timeout 5400 "$engine" exec -C "$REPO" "$prompt" 2>&1 | tee "$log" || rc=$?
  else
    timeout 5400 "$engine" -p "$prompt" 2>&1 | tee "$log" || rc=$?
  fi
  if grep -qiE "usage limit|rate limit|quota|额度" "$log" && [[ "$rc" != 0 ]]; then
    echo "ERROR Kimi Code 额度受限，未发布"
    return 2
  fi
  [[ "$rc" == 0 ]] || return "$rc"
  python3 scripts/validate.py
  python3 scripts/build_site.py   # 本地构建 4 个 *data.js 仅供 validate；产物已 gitignore，线上由 ingest.yml 构建
  python3 scripts/raw_manifest.py # raw/ 只留本地，指针写入 state/raw_manifest.json
  python3 scripts/validate.py
  local err
  err=$(python3 -c "import json;print(json.load(open('state/validate_report.json')).get('summary',{}).get('ERROR',1))" 2>/dev/null || echo 1)
  if [[ "$err" != "0" ]]; then echo "ERROR validate 未通过 ERROR=$err，不发布"; return 3; fi
  if [[ "$publish" == 1 ]]; then
    local ch
    ch=$(git status --porcelain | awk '{print $2}')
    [[ -z "$ch" ]] && { echo "无变化"; return 0; }
    python3 scripts/sync_guard.py $ch || { echo "ERROR 有白名单外文件，不推送"; return 4; }
    git add -A state && git commit -qm "$name $(date +%F) [ops]" && \
      (git push -q origin HEAD:main || (git pull --rebase -q origin main && git push -q origin HEAD:main)) && \
      echo "PUSHED $(git rev-parse --short HEAD)"
  command -v gh >/dev/null && gh -R davidliangemory-boop/PubX workflow run ingest.yml >/dev/null 2>&1 && echo "PAGES_DISPATCHED" || echo "WARN Pages 未自动触发，请手动 gh workflow run ingest.yml"
    echo "ELAPSED $(( $(date +%s)-t0 ))s"
  else
    echo '完成验证与构建；结果留在工作区，提交/发布由调度方负责（或加 --publish / PUBX_PUBLISH=1）。'
  fi
}
