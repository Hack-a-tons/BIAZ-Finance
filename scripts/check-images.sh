#!/usr/bin/env bash

cd "$(dirname "$0")/.."

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  echo "Usage: ./check-images.sh [OPTIONS]"
  echo ""
  echo "Check article images in database"
  echo ""
  echo "Options:"
  echo "  -h, --help     Show this help message"
  echo "  --missing      Show articles without images"
  echo "  --ai           Show articles with AI-generated images"
  echo "  --all          Show all articles with image URLs"
  echo "  --stats        Show image statistics"
  echo ""
  echo "Examples:"
  echo "  ./check-images.sh --stats"
  echo "  ./check-images.sh --missing"
  echo "  ./check-images.sh --ai"
  exit 0
fi

run_query() {
  ssh biaz.hurated.com "docker exec biaz-finance-postgres-1 psql -U biaz -d biaz_finance -c \"$1\""
}

case "${1:-stats}" in
  --stats)
    echo "Image Statistics"
    echo "================"
    echo ""
    
    total=$(ssh biaz.hurated.com "docker exec biaz-finance-postgres-1 psql -U biaz -d biaz_finance -t -c 'SELECT COUNT(*) FROM articles'" | tr -d ' ')
    echo "Total articles: $total"
    
    with_images=$(ssh biaz.hurated.com "docker exec biaz-finance-postgres-1 psql -U biaz -d biaz_finance -t -c \"SELECT COUNT(*) FROM articles WHERE image_url IS NOT NULL AND image_url != ''\"" | tr -d ' ')
    echo "With images: $with_images"
    
    without_images=$(ssh biaz.hurated.com "docker exec biaz-finance-postgres-1 psql -U biaz -d biaz_finance -t -c \"SELECT COUNT(*) FROM articles WHERE image_url IS NULL OR image_url = ''\"" | tr -d ' ')
    echo "Without images: $without_images"
    
    ai_images=$(ssh biaz.hurated.com "docker exec biaz-finance-postgres-1 psql -U biaz -d biaz_finance -t -c \"SELECT COUNT(*) FROM articles WHERE image_url LIKE '/images/%'\"" | tr -d ' ')
    echo "AI-generated: $ai_images"
    ;;
    
  --missing)
    echo "Articles Without Images"
    echo "======================="
    echo ""
    run_query "SELECT id, title, published_at FROM articles WHERE image_url IS NULL OR image_url = '' ORDER BY published_at DESC LIMIT 20"
    ;;
    
  --ai)
    echo "Articles With AI-Generated Images"
    echo "=================================="
    echo ""
    run_query "SELECT id, title, image_url FROM articles WHERE image_url LIKE '/images/%' ORDER BY created_at DESC LIMIT 20"
    ;;
    
  --all)
    echo "All Articles With Images"
    echo "========================"
    echo ""
    run_query "SELECT id, title, image_url FROM articles WHERE image_url IS NOT NULL AND image_url != '' ORDER BY created_at DESC LIMIT 20"
    ;;
    
  *)
    echo "Unknown option: $1"
    echo "Try './check-images.sh --help' for usage"
    exit 1
    ;;
esac
