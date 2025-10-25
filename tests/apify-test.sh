#!/usr/bin/env bash

cd "$(dirname "$0")/.."
source .env

VERBOSE=false
TEST_URL="https://techcrunch.com/2024/01/15/apple-vision-pro-launch/"

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      echo "Usage: ./apify-test.sh [OPTIONS] [URL]"
      echo ""
      echo "Test Apify Website Content Crawler"
      echo ""
      echo "Options:"
      echo "  -h, --help       Show this help message"
      echo "  -v, --verbose    Show detailed output"
      echo ""
      echo "URL:"
      echo "  Any article URL to test (default: TechCrunch article)"
      echo ""
      echo "Examples:"
      echo "  ./apify-test.sh"
      echo "  ./apify-test.sh -v"
      echo "  ./apify-test.sh https://example.com/article"
      exit 0
      ;;
    -v|--verbose)
      VERBOSE=true
      shift
      ;;
    http*)
      TEST_URL="$1"
      shift
      ;;
    *)
      shift
      ;;
  esac
done

GRAY='\033[0;90m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Testing Apify Website Content Crawler..."
if [ "$VERBOSE" = true ]; then
  echo -e "${GRAY}API Token: ${APIFY_API_TOKEN:0:20}...${NC}"
  echo -e "${GRAY}Test URL: $TEST_URL${NC}"
  echo ""
fi

temp_file="./test-apify-temp.ts"

cat > "$temp_file" << EOF
import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';
dotenv.config();

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

async function test() {
  try {
    const url = process.argv[2];
    console.log('Starting Apify actor...');
    console.log('URL:', url);
    console.log('');
    
    const run = await client.actor('apify/website-content-crawler').call({
      startUrls: [{ url }],
      maxCrawlDepth: 0,
      maxCrawlPages: 1,
    });
    
    console.log('Run ID:', run.id);
    console.log('Status:', run.status);
    console.log('');
    
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    
    if (!items || items.length === 0) {
      console.error('No items extracted');
      process.exit(1);
    }
    
    const item: any = items[0];
    console.log('Extracted data:');
    console.log('  Title:', item.metadata?.title || 'N/A');
    console.log('  Text length:', (item.text || '').length, 'chars');
    console.log('  Markdown length:', (item.markdown || '').length, 'chars');
    console.log('  URL:', item.url);
    console.log('');
    console.log('First 200 chars of text:');
    console.log((item.text || item.markdown || '').substring(0, 200));
    
    process.exit(0);
  } catch (error: any) {
    console.error('Error:', error.message);
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
    process.exit(1);
  }
}

test();
EOF

if [ "$VERBOSE" = true ]; then
  if npx ts-node "$temp_file" "$TEST_URL" 2>&1; then
    echo ""
    echo -e "${GREEN}✓ Apify working${NC}"
    rm -f "$temp_file"
    exit 0
  else
    echo ""
    echo -e "${RED}✗ Apify failed${NC}"
    rm -f "$temp_file"
    exit 1
  fi
else
  if npx ts-node "$temp_file" "$TEST_URL" 2>&1 | grep -q "Extracted data:"; then
    echo -e "${GREEN}✓ PASS${NC}"
    rm -f "$temp_file"
    exit 0
  else
    echo -e "${RED}✗ FAIL${NC}"
    rm -f "$temp_file"
    exit 1
  fi
fi
