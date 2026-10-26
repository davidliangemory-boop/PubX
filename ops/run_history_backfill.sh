#!/bin/bash
# 历史滚动 30 天回溯（与日更并行）
source "$(dirname "$0")/_common.sh" 2>/dev/null || source /tmp/PubX/ops/_common.sh
# Prefer prompt from persistent ops if repo not yet synced
if [ ! -f "$REPO/ops/prompts/history_backfill.md" ]; then
  mkdir -p "$REPO/ops/prompts" "$REPO/ops/state"
  cp -n /workspace/kc/ops/prompts/history_backfill.md "$REPO/ops/prompts/" 2>/dev/null || true
  cp -n /workspace/kc/ops/state/history_backfill_cursor.json "$REPO/ops/state/" 2>/dev/null || true
fi
# Also keep cursor under /workspace/kc for PROGRESS tracking even before P5 merge
mkdir -p /workspace/kc/ops/state
[ -f /workspace/kc/ops/state/history_backfill_cursor.json ] || cp /workspace/kc/ops/state/history_backfill_cursor.json /workspace/kc/ops/state/ 2>/dev/null || true
run_job history_backfill history_backfill.md
# Sync cursor out of repo if written
if [ -f "$REPO/state/history_backfill_cursor.json" ]; then
  cp "$REPO/state/history_backfill_cursor.json" /workspace/kc/ops/state/history_backfill_cursor.json
elif [ -f "$REPO/ops/state/history_backfill_cursor.json" ]; then
  cp "$REPO/ops/state/history_backfill_cursor.json" /workspace/kc/ops/state/history_backfill_cursor.json
fi
