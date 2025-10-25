#!/usr/bin/env bash

API_URL="${API_URL:-https://api.news.biaz.hurated.com/v1}"

echo "Testing rate limits..."
echo ""

# Test general rate limit
echo "1. Testing general rate limit (100 req/min):"
echo "   Making 5 requests to /articles..."
for i in {1..5}; do
  response=$(curl -s -w "\n%{http_code}" "$API_URL/articles?limit=1")
  status=$(echo "$response" | tail -1)
  remaining=$(curl -s -I "$API_URL/articles?limit=1" | grep -i "ratelimit-remaining" | cut -d: -f2 | tr -d ' \r')
  echo "   Request $i: HTTP $status, Remaining: $remaining"
done
echo ""

# Test expensive rate limit
echo "2. Testing expensive rate limit (20 req/5min):"
echo "   Making 3 requests to /forecasts (should fail without body)..."
for i in {1..3}; do
  response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/forecasts" -H "Content-Type: application/json" -d '{}')
  status=$(echo "$response" | tail -1)
  remaining=$(curl -s -I -X POST "$API_URL/forecasts" -H "Content-Type: application/json" | grep -i "ratelimit-remaining" | cut -d: -f2 | tr -d ' \r')
  echo "   Request $i: HTTP $status, Remaining: $remaining"
done
echo ""

echo "✅ Rate limit test complete"
echo ""
echo "Rate limits configured:"
echo "  - General: 100 requests/minute"
echo "  - Expensive (AI): 20 requests/5 minutes"
echo ""
echo "Check response headers for:"
echo "  - RateLimit-Limit"
echo "  - RateLimit-Remaining"
echo "  - RateLimit-Reset"
