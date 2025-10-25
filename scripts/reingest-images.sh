#!/usr/bin/env bash
set -e

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
echo "[$TIMESTAMP] Starting article re-ingestion with real images..."

# Get all article URLs from database
echo "Fetching article URLs from database..."
ARTICLES=$(docker exec biaz-finance-postgres-1 psql -U biaz -d biaz_finance -t -c "
  SELECT id, url FROM articles ORDER BY published_at DESC;
")

TOTAL=0
SUCCESS=0
FAILED=0

while IFS='|' read -r id url; do
  # Trim whitespace
  id=$(echo "$id" | xargs)
  url=$(echo "$url" | xargs)
  
  if [ -z "$id" ] || [ -z "$url" ]; then
    continue
  fi
  
  TOTAL=$((TOTAL + 1))
  echo ""
  echo "[$TOTAL] Processing: $id"
  echo "    URL: $url"
  
  # Try to fetch image
  RESPONSE=$(curl -s -X POST "http://localhost:23000/v1/articles/ingest" \
    -H "Content-Type: application/json" \
    -d "{\"url\": \"$url\"}" 2>&1 || echo '{"error":"request failed"}')
  
  if echo "$RESPONSE" | grep -q '"imageUrl"'; then
    # Success - article has real image
    IMAGE_URL=$(echo "$RESPONSE" | jq -r '.imageUrl' 2>/dev/null || echo "")
    if [ -n "$IMAGE_URL" ] && [ "$IMAGE_URL" != "null" ]; then
      echo "    ✅ Found image: $IMAGE_URL"
      SUCCESS=$((SUCCESS + 1))
    else
      echo "    ❌ No image found - deleting article"
      docker exec biaz-finance-postgres-1 psql -U biaz -d biaz_finance -c "
        DELETE FROM article_symbols WHERE article_id = '$id';
        DELETE FROM claim_evidence WHERE claim_id IN (SELECT id FROM claims WHERE article_id = '$id');
        DELETE FROM claims WHERE article_id = '$id';
        DELETE FROM forecasts WHERE article_id = '$id';
        DELETE FROM articles WHERE id = '$id';
      " > /dev/null
      FAILED=$((FAILED + 1))
    fi
  else
    # Failed to get image - delete article
    echo "    ❌ Failed to extract image - deleting article"
    docker exec biaz-finance-postgres-1 psql -U biaz -d biaz_finance -c "
      DELETE FROM article_symbols WHERE article_id = '$id';
      DELETE FROM claim_evidence WHERE claim_id IN (SELECT id FROM claims WHERE article_id = '$id');
      DELETE FROM claims WHERE article_id = '$id';
      DELETE FROM forecasts WHERE article_id = '$id';
      DELETE FROM articles WHERE id = '$id';
    " > /dev/null
    FAILED=$((FAILED + 1))
  fi
  
  # Rate limit to avoid overwhelming the system
  sleep 2
done <<< "$ARTICLES"

echo ""
echo "========================================="
echo "Re-ingestion complete!"
echo "Total processed: $TOTAL"
echo "Success (with images): $SUCCESS"
echo "Failed (deleted): $FAILED"
echo "========================================="

# Show final stats
echo ""
echo "Final database statistics:"
docker exec biaz-finance-postgres-1 psql -U biaz -d biaz_finance -c "
  SELECT 
    'articles' as table_name, COUNT(*) as count FROM articles
  UNION ALL
  SELECT 'claims', COUNT(*) FROM claims
  UNION ALL
  SELECT 'stocks', COUNT(*) FROM stocks
  ORDER BY table_name;
"

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
echo "[$TIMESTAMP] Done!"
