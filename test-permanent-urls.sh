#!/bin/bash

echo "Testing BIAZ Finance Permanent URLs..."
echo "======================================"

# Test API response includes permanentUrl
echo "1. Testing API response includes permanentUrl field:"
RESPONSE=$(curl -s "https://api.news.biaz.hurated.com/v1/articles?limit=1")
PERMANENT_URL=$(echo "$RESPONSE" | jq -r '.data[0].permanentUrl')
echo "   Permanent URL: $PERMANENT_URL"

# Extract article ID
ARTICLE_ID=$(echo "$RESPONSE" | jq -r '.data[0].id')
echo "   Article ID: $ARTICLE_ID"

# Test article page accessibility
echo ""
echo "2. Testing article page accessibility:"
ARTICLE_RESPONSE=$(curl -s "https://api.news.biaz.hurated.com/article/$ARTICLE_ID")
if echo "$ARTICLE_RESPONSE" | grep -q "<title>"; then
    TITLE=$(echo "$ARTICLE_RESPONSE" | grep -o '<title>.*</title>' | sed 's/<title>\(.*\)<\/title>/\1/')
    echo "   ✅ Article page accessible"
    echo "   Title: $TITLE"
else
    echo "   ❌ Article page not accessible"
fi

# Test demo page
echo ""
echo "3. Testing demo page:"
DEMO_RESPONSE=$(curl -s "https://news.biaz.hurated.com")
if echo "$DEMO_RESPONSE" | grep -q "permanentLinkSection"; then
    echo "   ✅ Demo page includes permanent link section"
else
    echo "   ❌ Demo page missing permanent link section"
fi

echo ""
echo "Test completed!"
