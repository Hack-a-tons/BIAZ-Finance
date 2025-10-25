#!/usr/bin/env bash
set -e

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
echo "[$TIMESTAMP] Starting database cleanup..."

# Archive articles older than 90 days
echo "Archiving old articles..."
docker exec biaz-finance-postgres-1 psql -U biaz -d biaz_finance -c "
  DELETE FROM article_symbols WHERE article_id IN (
    SELECT id FROM articles WHERE published_at < NOW() - INTERVAL '90 days'
  );
  DELETE FROM claim_evidence WHERE claim_id IN (
    SELECT id FROM claims WHERE article_id IN (
      SELECT id FROM articles WHERE published_at < NOW() - INTERVAL '90 days'
    )
  );
  DELETE FROM claims WHERE article_id IN (
    SELECT id FROM articles WHERE published_at < NOW() - INTERVAL '90 days'
  );
  DELETE FROM forecasts WHERE article_id IN (
    SELECT id FROM articles WHERE published_at < NOW() - INTERVAL '90 days'
  );
  DELETE FROM articles WHERE published_at < NOW() - INTERVAL '90 days';
" | grep DELETE || echo "No old articles to delete"

# Clean orphaned records
echo "Cleaning orphaned records..."
docker exec biaz-finance-postgres-1 psql -U biaz -d biaz_finance -c "
  DELETE FROM article_symbols WHERE article_id NOT IN (SELECT id FROM articles);
  DELETE FROM claims WHERE article_id NOT IN (SELECT id FROM articles);
  DELETE FROM claim_evidence WHERE claim_id NOT IN (SELECT id FROM claims);
  DELETE FROM forecasts WHERE article_id NOT IN (SELECT id FROM articles);
" | grep DELETE || echo "No orphaned records"

# Vacuum database
echo "Vacuuming database..."
docker exec biaz-finance-postgres-1 psql -U biaz -d biaz_finance -c "VACUUM ANALYZE;"

# Show stats
echo "Database statistics:"
docker exec biaz-finance-postgres-1 psql -U biaz -d biaz_finance -c "
  SELECT 
    'articles' as table_name, COUNT(*) as count FROM articles
  UNION ALL
  SELECT 'claims', COUNT(*) FROM claims
  UNION ALL
  SELECT 'forecasts', COUNT(*) FROM forecasts
  UNION ALL
  SELECT 'stocks', COUNT(*) FROM stocks
  ORDER BY table_name;
"

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
echo "[$TIMESTAMP] Database cleanup complete"
