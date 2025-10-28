#!/bin/bash

echo "Testing Async API..."
echo "==================="

# Test async ingest
echo "1. Starting async analysis..."
RESPONSE=$(curl -s -X POST "https://api.news.biaz.hurated.com/v1/articles/ingest-async" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://demo.example.com/test","content":"Apple announces record earnings"}')

echo "Response: $RESPONSE"

# Extract task ID
TASK_ID=$(echo "$RESPONSE" | jq -r '.taskId // empty')

if [ -z "$TASK_ID" ]; then
    echo "❌ Failed to get task ID"
    exit 1
fi

echo "✅ Task created: $TASK_ID"

# Check task status
echo ""
echo "2. Checking task status..."
for i in {1..10}; do
    echo "Check $i:"
    STATUS_RESPONSE=$(curl -s "https://api.news.biaz.hurated.com/v1/tasks/$TASK_ID")
    echo "$STATUS_RESPONSE" | jq '.'
    
    STATUS=$(echo "$STATUS_RESPONSE" | jq -r '.status')
    if [ "$STATUS" = "completed" ] || [ "$STATUS" = "failed" ]; then
        break
    fi
    
    sleep 2
done

echo ""
echo "Test completed!"
