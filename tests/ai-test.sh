#!/usr/bin/env bash

cd "$(dirname "$0")/.."
source .env

VERBOSE=false
PROVIDER=""

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      echo "Usage: ./ai-test.sh [OPTIONS] [PROVIDER]"
      echo ""
      echo "Test AI providers (Azure OpenAI or Gemini)"
      echo ""
      echo "Options:"
      echo "  -h, --help       Show this help message"
      echo "  -v, --verbose    Show detailed output"
      echo ""
      echo "Provider:"
      echo "  azure            Test Azure OpenAI (default)"
      echo "  gemini           Test Google Gemini"
      echo "  both             Test both providers"
      echo ""
      echo "Examples:"
      echo "  ./ai-test.sh"
      echo "  ./ai-test.sh azure"
      echo "  ./ai-test.sh gemini"
      echo "  ./ai-test.sh both"
      exit 0
      ;;
    -v|--verbose)
      VERBOSE=true
      shift
      ;;
    azure|gemini|both)
      PROVIDER="$1"
      shift
      ;;
    *)
      shift
      ;;
  esac
done

[ -z "$PROVIDER" ] && PROVIDER="azure"

GRAY='\033[0;90m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

test_provider() {
  local provider=$1
  echo -n "Testing $provider... "
  
  local temp_file="./test-ai-temp.ts"
  
  cat > "$temp_file" << 'EOF'
import dotenv from 'dotenv';
dotenv.config();

const provider = process.argv[2];

async function test() {
  try {
    let client;
    if (provider === 'azure') {
      const { AzureOpenAI } = await import('openai');
      client = new AzureOpenAI({
        apiKey: process.env.AZURE_OPENAI_API_KEY!,
        endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
        apiVersion: process.env.AZURE_API_VERSION!,
      });
      const response = await client.chat.completions.create({
        model: process.env.AZURE_DEPLOYMENT_NAME!,
        messages: [{ role: 'user', content: 'Say "OK" if you can read this.' }],
        max_tokens: 10,
      });
      console.log('Response:', response.choices[0]?.message?.content);
    } else {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
      const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL! });
      const result = await model.generateContent('Say "OK" if you can read this.');
      console.log('Response:', result.response.text());
    }
    process.exit(0);
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

test();
EOF

  if [ "$VERBOSE" = true ]; then
    echo ""
    echo -e "${GRAY}Testing $provider provider...${NC}"
    if npx ts-node "$temp_file" "$provider" 2>&1; then
      echo -e "${GREEN}✓ $provider working${NC}"
    else
      echo -e "${RED}✗ $provider failed${NC}"
      rm -f "$temp_file"
      return 1
    fi
  else
    if npx ts-node "$temp_file" "$provider" > /dev/null 2>&1; then
      echo -e "${GREEN}✓ PASS${NC}"
    else
      echo -e "${RED}✗ FAIL${NC}"
      rm -f "$temp_file"
      return 1
    fi
  fi
  
  rm -f "$temp_file"
  return 0
}

if [ "$PROVIDER" = "both" ]; then
  test_provider "azure"
  AZURE_RESULT=$?
  test_provider "gemini"
  GEMINI_RESULT=$?
  
  echo ""
  if [ $AZURE_RESULT -eq 0 ] && [ $GEMINI_RESULT -eq 0 ]; then
    echo "Both providers working ✓"
    exit 0
  else
    echo "Some providers failed ✗"
    exit 1
  fi
else
  test_provider "$PROVIDER"
  exit $?
fi
