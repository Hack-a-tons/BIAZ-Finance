#!/usr/bin/env bash

cd "$(dirname "$0")"
source ../.env

VERBOSE=false
ACTION=""

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      echo "Usage: ./forecasts.sh [OPTIONS] ACTION [PARAMS]"
      echo ""
      echo "Test forecasts endpoints"
      echo ""
      echo "Actions:"
      echo "  show <id>                    - Get forecast by ID"
      echo "  create <articleId> <symbol>  - Generate new forecast"
      echo ""
      echo "Options:"
      echo "  -h, --help       Show this help message"
      echo "  -v, --verbose    Show curl commands and JSON output"
      echo ""
      echo "Examples:"
      echo "  ./forecasts.sh show fct_001"
      echo "  ./forecasts.sh create art_001 AAPL"
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
  show)
    if [ -z "$1" ]; then
      echo "Error: Forecast ID required"
      exit 1
    fi
    exec_curl "${API_URL}/v1/forecasts/$1"
    ;;
  create)
    if [ -z "$1" ] || [ -z "$2" ]; then
      echo "Error: articleId and symbol required"
      exit 1
    fi
    DATA="{\"articleId\":\"$1\",\"symbol\":\"$2\"}"
    exec_curl -X POST "${API_URL}/v1/forecasts" \
      -H "Content-Type: application/json" \
      -d "$DATA"
    ;;
  *)
    echo "Error: Invalid action '$ACTION'"
    echo "Try './forecasts.sh --help' for more information"
    exit 1
    ;;
esac
