#!/usr/bin/env bash
# Test DALL-E image generation using Azure OpenAI SDK format

set -e

cd "$(dirname "$0")/.."

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

PROMPT="${1:-Professional financial news illustration for AAPL stock. Modern, clean, business-focused style.}"

echo "Testing DALL-E image generation..."
echo "Endpoint: $DALLE_ENDPOINT"
echo "Deployment: $DALLE_DEPLOYMENT_NAME"
echo "Prompt: $PROMPT"
echo ""

# Use the correct Azure OpenAI Images API format
curl -s -X POST \
  "${DALLE_ENDPOINT}/openai/images/generations:submit?api-version=${DALLE_API_VERSION}" \
  -H "Content-Type: application/json" \
  -H "api-key: ${DALLE_API_KEY}" \
  -d "{
    \"prompt\": \"$PROMPT\",
    \"size\": \"1024x1024\",
    \"n\": 1,
    \"model\": \"${DALLE_DEPLOYMENT_NAME}\"
  }" | jq '.'
