#!/usr/bin/env bash

API_URL="${API_URL:-https://api.news.biaz.hurated.com/v1}"

echo "Testing cache performance..."
echo ""

# Test 1: First request (cache miss)
echo "1. First request (cache miss):"
time curl -s "$API_URL/articles?limit=5" > /dev/null
echo ""

# Test 2: Second request (cache hit)
echo "2. Second request (cache hit - should be faster):"
time curl -s "$API_URL/articles?limit=5" > /dev/null
echo ""

# Test 3: Different parameters (cache miss)
echo "3. Different parameters (cache miss):"
time curl -s "$API_URL/articles?limit=10" > /dev/null
echo ""

# Test 4: Same as test 3 (cache hit)
echo "4. Same parameters again (cache hit):"
time curl -s "$API_URL/articles?limit=10" > /dev/null
echo ""

echo "✅ Cache test complete"
echo ""
echo "Expected behavior:"
echo "  - First requests should be slower (200-500ms)"
echo "  - Cached requests should be much faster (<50ms)"
