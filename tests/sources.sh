#!/usr/bin/env bash

cd "$(dirname "$0")"
source ../.env

VERBOSE=false
ACTION=""

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      echo "Usage: ./sources.sh [OPTIONS] ACTION [PARAMS]"
      echo ""
      echo "Test sources endpoints"
      echo ""
      echo "Actions:"
      echo "  get              - List all sources"
      echo "  show <id>        - Get source by ID"
      echo "  create <name> <domain> [credibilityScore]  - Add custom source"
      echo "  delete <id>      - Delete source"
      echo ""
      echo "Options:"
      echo "  -h, --help       Show this help message"
      echo "  -v, --verbose    Show curl commands and JSON output"
      echo ""
      echo "Examples:"
      echo "  ./sources.sh get"
      echo "  ./sources.sh show src_001"
      echo "  ./sources.sh create 'My Source' example.com 0.8"
      echo "  ./sources.sh delete src_123"
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
    exec_curl "${API_URL}/v1/sources"
    ;;
  show)
    if [ -z "$1" ]; then
      echo "Error: Source ID required"
      exit 1
    fi
    exec_curl "${API_URL}/v1/sources/$1"
    ;;
  create)
    if [ -z "$1" ] || [ -z "$2" ]; then
      echo "Error: Name and domain required"
      exit 1
    fi
    DATA="{\"name\":\"$1\",\"domain\":\"$2\""
    [ -n "$3" ] && DATA="${DATA},\"credibilityScore\":$3"
    DATA="${DATA}}"
    exec_curl -X POST "${API_URL}/v1/sources" \
      -H "Content-Type: application/json" \
      -d "$DATA"
    ;;
  delete)
    if [ -z "$1" ]; then
      echo "Error: Source ID required"
      exit 1
    fi
    exec_curl -X DELETE "${API_URL}/v1/sources/$1"
    ;;
  *)
    echo "Error: Invalid action '$ACTION'"
    echo "Try './sources.sh --help' for more information"
    exit 1
    ;;
esac
