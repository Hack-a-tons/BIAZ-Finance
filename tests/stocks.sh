#!/usr/bin/env bash

cd "$(dirname "$0")"
source ../.env

VERBOSE=false
ACTION=""

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      echo "Usage: ./stocks.sh [OPTIONS] ACTION [PARAMS]"
      echo ""
      echo "Test stocks endpoints"
      echo ""
      echo "Actions:"
      echo "  get [search]     - List stocks, optionally search by symbol or name"
      echo ""
      echo "Options:"
      echo "  -h, --help       Show this help message"
      echo "  -v, --verbose    Show curl commands and JSON output"
      echo ""
      echo "Examples:"
      echo "  ./stocks.sh get"
      echo "  ./stocks.sh get AAPL"
      echo "  ./stocks.sh get Apple"
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
    URL="${API_URL}/v1/stocks"
    [ -n "$1" ] && URL="${URL}?search=$1"
    exec_curl "$URL"
    ;;
  *)
    echo "Error: Invalid action '$ACTION'"
    echo "Try './stocks.sh --help' for more information"
    exit 1
    ;;
esac
