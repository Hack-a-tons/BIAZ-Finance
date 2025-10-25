#!/usr/bin/env bash

cd "$(dirname "$0")"

ACTION=""
TABLE=""
ID=""

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      echo "Usage: ./db.sh [OPTIONS] ACTION [TABLE] [ID]"
      echo ""
      echo "Inspect database on server"
      echo ""
      echo "Actions:"
      echo "  tables           List all tables"
      echo "  count [table]    Show row counts (all tables or specific)"
      echo "  list <table>     List items in table (last 10)"
      echo "  show <table> <id> Show specific item"
      echo "  schema <table>   Show table schema"
      echo "  query <sql>      Run custom SQL query"
      echo ""
      echo "Examples:"
      echo "  ./db.sh tables"
      echo "  ./db.sh count"
      echo "  ./db.sh count articles"
      echo "  ./db.sh list articles"
      echo "  ./db.sh show articles art_001"
      echo "  ./db.sh schema articles"
      echo "  ./db.sh query 'SELECT * FROM articles LIMIT 5'"
      exit 0
      ;;
    tables|count|list|show|schema|query)
      ACTION="$1"
      shift
      ;;
    *)
      if [ -z "$TABLE" ]; then
        TABLE="$1"
      elif [ -z "$ID" ]; then
        ID="$1"
      fi
      shift
      ;;
  esac
done

[ -z "$ACTION" ] && ACTION="tables"

# Show current date/time
echo "Database snapshot: $(date)"
echo ""

run_psql() {
  ssh biaz.hurated.com "docker exec biaz-finance-postgres-1 psql -U biaz -d biaz_finance -c \"$1\""
}

run_psql_expanded() {
  ssh biaz.hurated.com "docker exec biaz-finance-postgres-1 psql -U biaz -d biaz_finance -x -c \"$1\""
}

case $ACTION in
  tables)
    echo "Tables in database:"
    echo ""
    ssh biaz.hurated.com 'docker exec biaz-finance-postgres-1 psql -U biaz -d biaz_finance -c "\dt"'
    ;;
    
  count)
    if [ -n "$TABLE" ]; then
      echo "Row count for $TABLE:"
      run_psql "SELECT COUNT(*) FROM $TABLE"
    else
      echo "Row counts for all tables:"
      echo ""
      for table in sources articles stocks article_symbols claims claim_evidence forecasts; do
        count=$(ssh biaz.hurated.com "docker exec biaz-finance-postgres-1 psql -U biaz -d biaz_finance -t -c 'SELECT COUNT(*) FROM $table'" | tr -d ' ')
        printf "%-20s %s\n" "$table:" "$count"
      done
    fi
    ;;
    
  list)
    if [ -z "$TABLE" ]; then
      echo "Error: TABLE required"
      echo "Usage: ./db.sh list <table>"
      exit 1
    fi
    
    echo "Last 10 items in $TABLE:"
    echo ""
    
    case $TABLE in
      articles)
        run_psql "SELECT id, title, truth_score, impact_sentiment, published_at FROM articles ORDER BY created_at DESC LIMIT 10"
        ;;
      sources)
        run_psql "SELECT id, name, domain, credibility_score FROM sources"
        ;;
      stocks)
        run_psql "SELECT symbol, name, current_price, change FROM stocks"
        ;;
      claims)
        run_psql "SELECT id, article_id, text, verified, confidence FROM claims ORDER BY created_at DESC LIMIT 10"
        ;;
      forecasts)
        run_psql "SELECT id, article_id, symbol, sentiment, price_target, confidence FROM forecasts ORDER BY generated_at DESC LIMIT 10"
        ;;
      *)
        run_psql "SELECT * FROM $TABLE LIMIT 10"
        ;;
    esac
    ;;
    
  show)
    if [ -z "$TABLE" ] || [ -z "$ID" ]; then
      echo "Error: TABLE and ID required"
      echo "Usage: ./db.sh show <table> <id>"
      exit 1
    fi
    
    echo "Details for $TABLE.$ID:"
    echo ""
    run_psql_expanded "SELECT * FROM $TABLE WHERE id = '$ID'"
    
    # Show related data
    case $TABLE in
      articles)
        echo ""
        echo "Symbols:"
        run_psql "SELECT symbol FROM article_symbols WHERE article_id = '$ID'"
        echo ""
        echo "Claims:"
        run_psql "SELECT id, text, verified, confidence FROM claims WHERE article_id = '$ID'"
        ;;
      claims)
        echo ""
        echo "Evidence:"
        run_psql "SELECT url FROM claim_evidence WHERE claim_id = '$ID'"
        ;;
    esac
    ;;
    
  schema)
    if [ -z "$TABLE" ]; then
      echo "Error: TABLE required"
      echo "Usage: ./db.sh schema <table>"
      exit 1
    fi
    
    echo "Schema for $TABLE:"
    echo ""
    ssh biaz.hurated.com "docker exec biaz-finance-postgres-1 psql -U biaz -d biaz_finance -c '\d $TABLE'"
    ;;
    
  query)
    if [ -z "$TABLE" ]; then
      echo "Error: SQL query required"
      echo "Usage: ./db.sh query 'SELECT ...'"
      exit 1
    fi
    
    echo "Running query: $TABLE"
    echo ""
    run_psql "$TABLE"
    ;;
    
  *)
    echo "Unknown action: $ACTION"
    echo "Try './db.sh --help' for usage"
    exit 1
    ;;
esac
