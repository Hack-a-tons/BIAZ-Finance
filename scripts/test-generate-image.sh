#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  echo "Usage: $0 [SYMBOL] [TITLE]"
  echo "  SYMBOL: Stock symbol (default: AAPL)"
  echo "  TITLE: Article title (default: 'Apple announces new product')"
  echo ""
  echo "Options:"
  echo "  -h, --help     Show this help message"
  echo "  -v, --verbose  Show detailed output"
  exit 0
fi

SYMBOL="${1:-AAPL}"
TITLE="${2:-Apple announces new product}"
VERBOSE=false

if [[ "${1:-}" == "-v" || "${1:-}" == "--verbose" ]]; then
  VERBOSE=true
  SYMBOL="${2:-AAPL}"
  TITLE="${3:-Apple announces new product}"
fi

cd "$(dirname "$0")/.."
source .env

if [ "$VERBOSE" = true ]; then
  echo "Testing image generation..."
  echo "Symbol: $SYMBOL"
  echo "Title: $TITLE"
  echo ""
fi

node -e "
process.env.DALLE_ENDPOINT = '$DALLE_ENDPOINT';
process.env.DALLE_API_KEY = '$DALLE_API_KEY';
process.env.DALLE_DEPLOYMENT_NAME = '$DALLE_DEPLOYMENT_NAME';
process.env.DALLE_API_VERSION = '$DALLE_API_VERSION';
const { generateImage } = require('./dist/ai/generate-image');
(async () => {
  console.log('Generating image for ${SYMBOL}...');
  const result = await generateImage('${TITLE}', '${SYMBOL}');
  if (result) {
    console.log('✓ Success:', result);
  } else {
    console.log('✗ Failed to generate image');
  }
})();
"

