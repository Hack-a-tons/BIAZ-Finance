#!/usr/bin/env bash
# Article re-scoring cron job
# Runs daily at 2 AM to re-verify claims and update truth scores

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "[$(date)] Starting daily article re-scoring..."

# Re-score articles from last 7 days
./scripts/rescore-articles.sh 7

echo "[$(date)] Daily re-scoring complete"
