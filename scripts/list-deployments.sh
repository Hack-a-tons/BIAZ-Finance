#!/usr/bin/env bash
# List available Azure OpenAI deployments

set -e

cd "$(dirname "$0")/.."

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

echo "Listing deployments from: ${DALLE_ENDPOINT}"
echo ""

curl -s -X GET \
  "${DALLE_ENDPOINT}/openai/deployments?api-version=${DALLE_API_VERSION}" \
  -H "api-key: ${DALLE_API_KEY}" | jq '.data[] | {id: .id, model: .model, status: .status}'
