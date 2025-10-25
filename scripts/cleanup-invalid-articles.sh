#!/usr/bin/env bash
# Clean up articles that don't meet current ingestion criteria
# Criteria:
# 1. No duplicate images (keep only first article with each image)
# 2. No duplicate titles (keep only first article with each title)
# 3. No invalid/placeholder images (Unsplash/Pexels fallbacks)
# 4. Must have stock symbols
# 5. Must have valid image URL

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "=== Article Cleanup - Current Criteria Enforcement ==="
echo ""

# Function to execute SQL
exec_sql() {
  docker compose exec -T postgres psql -U biaz -d biaz_finance -c "$1"
}

# Show current stats
echo "Current article count:"
exec_sql "SELECT COUNT(*) FROM articles;"
echo ""

# 1. Find articles with duplicate images (keep oldest)
echo "Step 1: Finding articles with duplicate images..."
exec_sql "
SELECT 
  image_url, 
  COUNT(*) as count,
  STRING_AGG(id, ', ' ORDER BY published_at) as article_ids
FROM articles 
GROUP BY image_url 
HAVING COUNT(*) > 1 
ORDER BY count DESC;
" | tee /tmp/duplicate_images.txt

# Delete duplicate image articles (keep first)
echo ""
echo "Deleting articles with duplicate images (keeping oldest)..."
deleted_images=$(exec_sql "
WITH duplicates AS (
  SELECT id, image_url,
    ROW_NUMBER() OVER (PARTITION BY image_url ORDER BY published_at ASC) as rn
  FROM articles
)
DELETE FROM articles 
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1)
RETURNING id;
" | grep -c "art_" || echo "0")
echo "Deleted $deleted_images articles with duplicate images"
echo ""

# 2. Find articles with duplicate titles (keep oldest)
echo "Step 2: Finding articles with duplicate titles..."
exec_sql "
SELECT 
  title, 
  COUNT(*) as count,
  STRING_AGG(id, ', ' ORDER BY published_at) as article_ids
FROM articles 
GROUP BY title 
HAVING COUNT(*) > 1 
ORDER BY count DESC;
" | tee /tmp/duplicate_titles.txt

# Delete duplicate title articles (keep first)
echo ""
echo "Deleting articles with duplicate titles (keeping oldest)..."
deleted_titles=$(exec_sql "
WITH duplicates AS (
  SELECT id, title,
    ROW_NUMBER() OVER (PARTITION BY title ORDER BY published_at ASC) as rn
  FROM articles
)
DELETE FROM articles 
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1)
RETURNING id;
" | grep -c "art_" || echo "0")
echo "Deleted $deleted_titles articles with duplicate titles"
echo ""

# 3. Delete articles with placeholder/fallback images
echo "Step 3: Deleting articles with placeholder images..."
deleted_placeholders=$(exec_sql "
DELETE FROM articles 
WHERE 
  image_url LIKE '%unsplash.com%' OR
  image_url LIKE '%pexels.com/photos/534216%'
RETURNING id;
" | grep -c "art_" || echo "0")
echo "Deleted $deleted_placeholders articles with placeholder images"
echo ""

# 4. Delete articles without stock symbols
echo "Step 4: Deleting articles without stock symbols..."
deleted_no_stocks=$(exec_sql "
DELETE FROM articles 
WHERE id NOT IN (SELECT DISTINCT article_id FROM article_symbols)
RETURNING id;
" | grep -c "art_" || echo "0")
echo "Deleted $deleted_no_stocks articles without stock symbols"
echo ""

# 5. Delete articles with NULL or empty image URLs
echo "Step 5: Deleting articles with invalid image URLs..."
deleted_no_images=$(exec_sql "
DELETE FROM articles 
WHERE image_url IS NULL OR image_url = ''
RETURNING id;
" | grep -c "art_" || echo "0")
echo "Deleted $deleted_no_images articles with invalid image URLs"
echo ""

# Clean up orphaned records
echo "Step 6: Cleaning up orphaned records..."
exec_sql "DELETE FROM article_symbols WHERE article_id NOT IN (SELECT id FROM articles);"
exec_sql "DELETE FROM claims WHERE article_id NOT IN (SELECT id FROM articles);"
exec_sql "DELETE FROM forecasts WHERE article_id NOT IN (SELECT id FROM articles);"
echo "Orphaned records cleaned"
echo ""

# Vacuum database
echo "Step 7: Vacuuming database..."
exec_sql "VACUUM ANALYZE articles;"
echo "Database vacuumed"
echo ""

# Show final stats
echo "=== Cleanup Complete ==="
echo ""
echo "Final article count:"
exec_sql "SELECT COUNT(*) FROM articles;"
echo ""

echo "Summary:"
echo "- Duplicate images removed: $deleted_images"
echo "- Duplicate titles removed: $deleted_titles"
echo "- Placeholder images removed: $deleted_placeholders"
echo "- No stock symbols removed: $deleted_no_stocks"
echo "- Invalid images removed: $deleted_no_images"
total_deleted=$((deleted_images + deleted_titles + deleted_placeholders + deleted_no_stocks + deleted_no_images))
echo "- Total deleted: $total_deleted"
echo ""

echo "Remaining articles meet all current criteria:"
echo "✓ Unique images"
echo "✓ Unique titles"
echo "✓ Real images (not placeholders)"
echo "✓ Have stock symbols"
echo "✓ Valid image URLs"
