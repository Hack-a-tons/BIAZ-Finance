#!/usr/bin/env bash
# Article re-scoring cron job
# Runs daily at 2 AM to re-verify claims and update truth scores

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

./scripts/rescore-articles.sh 7 > /tmp/rescore-output.txt 2>&1 || {
  echo "$(date) [rescore-cron.sh] FAILED - rescore-articles.sh exited with error"
  exit 1
}

count=$(grep -c "Re-scored article" /tmp/rescore-output.txt 2>/dev/null || echo "0")
echo "$(date) [rescore-cron.sh] OK - re-scored $count articles from last 7 days"
