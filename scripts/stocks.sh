#!/usr/bin/env bash

cd "$(dirname "$0")/.."

ACTION=""
SYMBOL=""

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      echo "Usage: ./stocks.sh [OPTIONS] ACTION [SYMBOL]"
      echo ""
      echo "Monitor and manage stock data"
      echo ""
      echo "Actions:"
      echo "  cache            Show cached stock prices (last 15 min)"
      echo "  list             List all stocks in database"
      echo "  show <symbol>    Show details for specific stock"
      echo "  update           Trigger price update for all stocks"
      echo "  update <symbol>  Update specific stock price"
      echo ""
      echo "Examples:"
      echo "  ./stocks.sh cache"
      echo "  ./stocks.sh list"
      echo "  ./stocks.sh show AAPL"
      echo "  ./stocks.sh update"
      echo "  ./stocks.sh update TSLA"
      exit 0
      ;;
    cache|list|show|update)
      ACTION="$1"
      shift
      ;;
    *)
      SYMBOL="$1"
      shift
      ;;
  esac
done

[ -z "$ACTION" ] && ACTION="list"

echo "Stock data snapshot: $(date)"
echo ""

run_psql() {
  ssh biaz.hurated.com "docker exec biaz-finance-postgres-1 psql -U biaz -d biaz_finance -c \"$1\""
}

case $ACTION in
  cache)
    echo "Cached stocks (updated in last 15 minutes):"
    echo ""
    run_psql "SELECT symbol, name, current_price, change, updated_at FROM stocks WHERE updated_at > NOW() - INTERVAL '15 minutes' ORDER BY updated_at DESC"
    ;;
    
  list)
    echo "All stocks in database:"
    echo ""
    run_psql "SELECT s.symbol, s.name, s.current_price, s.change, s.updated_at, COUNT(a.article_id) as articles FROM stocks s LEFT JOIN article_symbols a ON s.symbol = a.symbol GROUP BY s.symbol, s.name, s.current_price, s.change, s.updated_at ORDER BY articles DESC"
    ;;
    
  show)
    if [ -z "$SYMBOL" ]; then
      echo "Error: SYMBOL required"
      echo "Usage: ./stocks.sh show <symbol>"
      exit 1
    fi
    
    echo "Details for $SYMBOL:"
    echo ""
    ssh biaz.hurated.com "docker exec biaz-finance-postgres-1 psql -U biaz -d biaz_finance -x -c \"SELECT * FROM stocks WHERE symbol = '$SYMBOL'\""
    
    echo ""
    echo "Recent articles mentioning $SYMBOL:"
    echo ""
    run_psql "SELECT a.id, a.title, a.truth_score, a.published_at FROM articles a JOIN article_symbols s ON a.id = s.article_id WHERE s.symbol = '$SYMBOL' ORDER BY a.published_at DESC LIMIT 5"
    ;;
    
  update)
    if [ -n "$SYMBOL" ]; then
      echo "Updating price for $SYMBOL..."
      curl -X POST "https://api.news.biaz.hurated.com/v1/admin/update-prices" -s | jq '.'
    else
      echo "Updating all stock prices..."
      curl -X POST "https://api.news.biaz.hurated.com/v1/admin/update-prices" -s | jq '.'
    fi
    
    echo ""
    echo "Waiting for update to complete..."
    sleep 3
    
    echo ""
    echo "Updated prices:"
    run_psql "SELECT symbol, current_price, change, updated_at FROM stocks WHERE updated_at > NOW() - INTERVAL '1 minute' ORDER BY updated_at DESC"
    ;;
    
  *)
    echo "Unknown action: $ACTION"
    echo "Try './stocks.sh --help' for usage"
    exit 1
    ;;
esac
