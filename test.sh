#!/usr/bin/env bash

cd "$(dirname "$0")"

VERBOSE=""

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      echo "Usage: ./test.sh [OPTIONS]"
      echo ""
      echo "Run all API tests and report results"
      echo ""
      echo "Options:"
      echo "  -h, --help       Show this help message"
      echo "  -v, --verbose    Show verbose output from test scripts"
      echo ""
      echo "Example:"
      echo "  ./test.sh"
      echo "  ./test.sh -v"
      exit 0
      ;;
    -v|--verbose)
      VERBOSE="-v"
      shift
      ;;
    *)
      shift
      ;;
  esac
done

PASSED=0
FAILED=0
TOTAL=0

run_test() {
  local script=$1
  local action=$2
  shift 2
  local args="$@"
  
  TOTAL=$((TOTAL + 1))
  echo "Testing $script $action $args..."
  
  if [ -n "$VERBOSE" ]; then
    if ./tests/$script $VERBOSE $action $args; then
      echo "✓ PASS"
      PASSED=$((PASSED + 1))
    else
      echo "✗ FAIL"
      FAILED=$((FAILED + 1))
    fi
  else
    if output=$(./tests/$script $action $args 2>&1); then
      echo "✓ PASS"
      PASSED=$((PASSED + 1))
    else
      echo "✗ FAIL"
      FAILED=$((FAILED + 1))
      echo "$output"
    fi
  fi
  echo ""
}

echo "Running BIAZ Finance API Tests"
echo "================================"
echo ""

# Articles tests
run_test articles.sh get
run_test articles.sh get AAPL
run_test articles.sh show art_001
run_test articles.sh show art_002
run_test articles.sh show art_003

# Sources tests
run_test sources.sh get
run_test sources.sh show src_001
run_test sources.sh show src_002

# Stocks tests
run_test stocks.sh get
run_test stocks.sh get AAPL
run_test stocks.sh get Tesla

# Forecasts tests
run_test forecasts.sh show fct_001
run_test forecasts.sh show fct_002

echo ""
echo "================================"
echo "Results: $PASSED passed, $FAILED failed, $TOTAL total"
echo ""

[ $FAILED -eq 0 ] && exit 0 || exit 1
