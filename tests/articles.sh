#!/usr/bin/env bash

cd "$(dirname "$0")"
source ../.env

VERBOSE=false
ACTION=""

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      echo "Usage: ./articles.sh [OPTIONS] ACTION [PARAMS]"
      echo ""
      echo "Test articles endpoints"
      echo ""
      echo "Actions:"
      echo "  get [symbol] [from] [source] [page] [limit]  - List articles"
      echo "  show <id>                                      - Get article by ID"
      echo "  ingest <url> [symbol]                          - Ingest new article"
      echo "  score <id>                                     - Recompute truth score"
      echo ""
      echo "Options:"
      echo "  -h, --help       Show this help message"
      echo "  -v, --verbose    Show curl commands and JSON output"
      echo ""
      echo "Examples:"
      echo "  ./articles.sh get"
      echo "  ./articles.sh get AAPL"
      echo "  ./articles.sh show art_001"
      echo "  ./articles.sh ingest https://example.com/article AAPL"
      echo "  ./articles.sh score art_001"
      exit 0
      ;;
    -v|--verbose)
      VERBOSE=true
      shift
      ;;
    *)
      if [ -z "$ACTION" ]; then
        ACTION="$1"
      else
        break
      fi
      shift
      ;;
  esac
done

GRAY='\033[0;90m'
NC='\033[0m'

if [ "$VERBOSE" = true ]; then
  exec_curl() {
    echo -e "${GRAY}$ curl $@${NC}" >&2
    response=$(curl -s "$@")
    echo -e "${GRAY}${response}${NC}" | jq '.' 2>/dev/null || echo -e "${GRAY}${response}${NC}"
    echo "$response"
  }
else
  exec_curl() {
    curl -s "$@" | jq '.'
  }
fi

case $ACTION in
  get)
    URL="${API_URL}/v1/articles?"
    [ -n "$1" ] && URL="${URL}symbol=$1&"
    [ -n "$2" ] && URL="${URL}from=$2&"
    [ -n "$3" ] && URL="${URL}source=$3&"
    [ -n "$4" ] && URL="${URL}page=$4&"
    [ -n "$5" ] && URL="${URL}limit=$5&"
    exec_curl "$URL"
    ;;
  show)
    if [ -z "$1" ]; then
      echo "Error: Article ID required"
      exit 1
    fi
    exec_curl "${API_URL}/v1/articles/$1"
    ;;
  ingest)
    if [ -z "$1" ]; then
      echo "Error: URL required"
      exit 1
    fi
    DATA="{\"url\":\"$1\""
    [ -n "$2" ] && DATA="${DATA},\"symbol\":\"$2\""
    DATA="${DATA}}"
    exec_curl -X POST "${API_URL}/v1/articles/ingest" \
      -H "Content-Type: application/json" \
      -d "$DATA"
    ;;
  score)
    if [ -z "$1" ]; then
      echo "Error: Article ID required"
      exit 1
    fi
    exec_curl -X POST "${API_URL}/v1/articles/$1/score"
    ;;
  *)
    echo "Error: Invalid action '$ACTION'"
    echo "Try './articles.sh --help' for more information"
    exit 1
    ;;
esac
