#!/usr/bin/env bash

cd "$(dirname "$0")/.."
source .env

VERBOSE=false
PROVIDER=""
CUSTOM_PROMPT=""

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      echo "Usage: ./ai-test.sh [OPTIONS] [PROVIDER] [PROMPT]"
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
      echo "Prompt:"
      echo "  Any text after provider will be sent as custom prompt"
      echo ""
      echo "Examples:"
      echo "  ./ai-test.sh"
      echo "  ./ai-test.sh azure"
      echo "  ./ai-test.sh -v gemini"
      echo "  ./ai-test.sh azure 'What is 2+2?'"
      echo "  ./ai-test.sh -v both 'Explain quantum computing in one sentence'"
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
      CUSTOM_PROMPT="$1"
      shift
      ;;
  esac
done

[ -z "$PROVIDER" ] && PROVIDER="azure"
[ -z "$CUSTOM_PROMPT" ] && CUSTOM_PROMPT="Say 'OK' if you can read this."

GRAY='\033[0;90m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

test_provider() {
  local provider=$1
  echo "Testing $provider..."
  
  if [ "$VERBOSE" = true ]; then
    echo -e "${GRAY}Provider: $provider${NC}"
    echo -e "${GRAY}Prompt: $CUSTOM_PROMPT${NC}"
    echo ""
  fi
  
  local temp_file="./test-ai-temp.ts"
  
  cat > "$temp_file" << EOF
import dotenv from 'dotenv';
dotenv.config();

const provider = process.argv[2];
const prompt = process.argv[3];

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
      
      console.log('Request to Azure OpenAI:');
      console.log('  Endpoint:', process.env.AZURE_OPENAI_ENDPOINT);
      console.log('  Model:', process.env.AZURE_DEPLOYMENT_NAME);
      console.log('  Message:', prompt);
      console.log('');
      
      const response = await client.chat.completions.create({
        model: process.env.AZURE_DEPLOYMENT_NAME!,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100,
      });
      console.log('Response:', response.choices[0]?.message?.content);
    } else {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
      const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL! });
      
      console.log('Request to Google Gemini:');
      console.log('  Model:', process.env.GEMINI_MODEL);
      console.log('  Message:', prompt);
      console.log('');
      
      const result = await model.generateContent(prompt);
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
    if npx ts-node "$temp_file" "$provider" "$CUSTOM_PROMPT" 2>&1; then
      echo ""
      echo -e "${GREEN}✓ $provider working${NC}"
    else
      echo ""
      echo -e "${RED}✗ $provider failed${NC}"
      rm -f "$temp_file"
      return 1
    fi
  else
    if npx ts-node "$temp_file" "$provider" "$CUSTOM_PROMPT" 2>&1 | grep -q "Response:"; then
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
  echo ""
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
