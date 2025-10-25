#!/usr/bin/env bash
# Test DALL-E image generation

set -e

cd "$(dirname "$0")/.."

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

PROMPT="${1:-Professional financial news illustration for AAPL stock. Modern, clean, business-focused style.}"

echo "Testing DALL-E image generation..."
echo "Prompt: $PROMPT"
echo ""

curl -s -X POST \
  "${DALLE_ENDPOINT}/openai/deployments/${DALLE_DEPLOYMENT_NAME}/images/generations?api-version=${DALLE_API_VERSION}" \
  -H "Content-Type: application/json" \
  -H "api-key: ${DALLE_API_KEY}" \
  -d "{
    \"prompt\": \"$PROMPT\",
    \"n\": 1,
    \"size\": \"1024x1024\"
  }" | jq '.'
