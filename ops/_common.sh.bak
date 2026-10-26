#!/bin/bash
# 共用：run_job <name> <promptfile>
set -u
REPO=/tmp/PubX; LOGD=/workspace/pubx_ops_logs; mkdir -p $LOGD
KIMI=/home/box/.kimi-code/bin/kimi
run_job(){
  NAME=$1; P=$2; TS=$(date +%Y%m%d_%H%M%S); LOG=$LOGD/${NAME}_$TS.log; T0=$(date +%s)
  exec > >(tee -a $LOG) 2>&1
  cd $REPO || exit 1
  [ -n "$(git status --porcelain)" ] && { git stash push -u -m "ops-autostash-$TS"; echo "WARN 工作区有未提交改动，已 stash"; }
  git pull --rebase -q origin main || { echo "ERROR pull 失败"; exit 1; }
  PROMPT="$(cat $REPO/ops/prompts/_rules.md "$REPO/ops/prompts/$P")
运行参数：今天(北京时间)=$(date +%F)；昨天=$(date -d yesterday +%F)。"
  timeout 5400 $KIMI -m kimi-code/k3 -p "$PROMPT" ; RC=$?
  echo "kimi exit=$RC"
  if grep -qiE "usage limit|rate limit|quota|额度" $LOG && [ $RC -ne 0 ]; then echo "ERROR Kimi Code 额度受限，未推送"; git stash push -u -m "ops-quota-$TS" ; exit 2; fi
  python3 scripts/validate.py; VR=$?
  ERR=$(python3 -c "import json;print(json.load(open('state/validate_report.json')).get('summary',{}).get('ERROR',1))" 2>/dev/null || echo 1)
  if [ $VR -ne 0 ] || [ "$ERR" != "0" ]; then echo "ERROR validate 未通过 ERROR=$ERR，不推送，改动 stash"; git stash push -u -m "ops-failed-$TS"; exit 3; fi
  CH=$(git status --porcelain | awk '{print $2}')
  [ -z "$CH" ] && { echo "无变化"; exit 0; }
  python3 scripts/sync_guard.py $CH || { echo "ERROR 有白名单外文件，不推送"; git stash push -u -m "ops-guard-$TS"; exit 4; }
  git add -A state assets/*data.js && git commit -qm "$NAME $(date +%F) [ops]" && \
  (git push -q origin HEAD:main || (git pull --rebase -q origin main && git push -q origin HEAD:main)) && echo "PUSHED $(git rev-parse --short HEAD)"
  echo "ELAPSED $(( $(date +%s)-T0 ))s"
}
