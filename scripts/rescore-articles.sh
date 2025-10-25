#!/usr/bin/env bash
# Re-score articles from the last 7 days
# Updates truth scores based on new information

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

API_PORT=${API_PORT:-23000}
DAYS=${1:-7}

echo "[$(date)] Starting article re-scoring (last $DAYS days)..."

# Get article IDs from last N days
ARTICLE_IDS=$(docker exec biaz-finance-postgres-1 psql -U biaz -d biaz_finance -t -c \
  "SELECT id FROM articles WHERE created_at > NOW() - INTERVAL '$DAYS days' ORDER BY created_at DESC" \
  | tr -d ' ')

if [ -z "$ARTICLE_IDS" ]; then
  echo "[$(date)] No articles found in last $DAYS days"
  exit 0
fi

COUNT=$(echo "$ARTICLE_IDS" | wc -l | tr -d ' ')
echo "[$(date)] Found $COUNT articles to re-score"

SUCCESS=0
FAILED=0

for article_id in $ARTICLE_IDS; do
  if [ -z "$article_id" ]; then
    continue
  fi
  
  echo "[$(date)] Re-scoring $article_id..."
  
  if curl -sf -X POST "http://localhost:$API_PORT/v1/articles/$article_id/score" > /dev/null; then
    SUCCESS=$((SUCCESS + 1))
    echo "[$(date)] ✅ $article_id re-scored successfully"
  else
    FAILED=$((FAILED + 1))
    echo "[$(date)] ❌ $article_id failed to re-score"
  fi
  
  # Rate limit: wait 2 seconds between requests to avoid overwhelming AI API
  sleep 2
done

echo "[$(date)] Re-scoring complete: $SUCCESS succeeded, $FAILED failed"
