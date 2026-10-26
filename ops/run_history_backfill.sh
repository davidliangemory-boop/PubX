#!/usr/bin/env bash
# 历史滚动 30 天回溯（与日更并行）
set -euo pipefail
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/_common.sh"
# 仓库内缺少 prompt/cursor 时，从持久目录补一份（初次同步前的兜底）
if [ ! -f "$REPO/ops/prompts/history_backfill.md" ] && [ -f /workspace/kc/ops/prompts/history_backfill.md ]; then
  mkdir -p "$REPO/ops/prompts" "$REPO/ops/state"
  cp -n /workspace/kc/ops/prompts/history_backfill.md "$REPO/ops/prompts/" || true
  cp -n /workspace/kc/ops/state/history_backfill_cursor.json "$REPO/ops/state/" 2>/dev/null || true
fi
run_job history_backfill history_backfill.md
# 同步 cursor 到 /workspace/kc/ops/state，供 PROGRESS 跟踪
EXT=/workspace/kc/ops/state
if mkdir -p "$EXT" 2>/dev/null; then
  if [ -f "$REPO/state/history_backfill_cursor.json" ]; then
    cp "$REPO/state/history_backfill_cursor.json" "$EXT/history_backfill_cursor.json" || true
  elif [ -f "$REPO/ops/state/history_backfill_cursor.json" ]; then
    cp "$REPO/ops/state/history_backfill_cursor.json" "$EXT/history_backfill_cursor.json" || true
  fi
fi
