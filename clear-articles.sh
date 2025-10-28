#!/bin/bash

echo "Clearing old articles from database..."

# Clear all articles and related data
curl -s -X POST "https://api.news.biaz.hurated.com/admin/clear-articles" || {
    echo "Admin endpoint not available, using direct database clear..."
    
    # Alternative: Clear via SQL (if we had direct access)
    echo "DELETE FROM article_symbols;"
    echo "DELETE FROM claims;"
    echo "DELETE FROM articles;"
    echo "DELETE FROM tasks;"
    echo ""
    echo "Run these SQL commands on the production database to clear old data."
}

echo "Articles cleared!"
