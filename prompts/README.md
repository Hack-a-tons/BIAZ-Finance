# BIAZ Finance - AI Prompts

All AI prompts are stored as markdown files in this directory. This allows easy editing without rebuilding Docker images.

## What Changed

All AI prompts have been extracted from TypeScript files into separate markdown files in the `prompts/` directory.

## Benefits

1. **No Docker Rebuild** - Edit prompts and restart container: `docker compose restart api`
2. **Version Control** - Track prompt changes separately from code
3. **Easy Editing** - Markdown files are easier to edit than embedded strings
4. **Collaboration** - Non-developers can improve prompts
5. **A/B Testing** - Easy to swap prompts for testing

## Prompt Files

| File | Used In | Purpose | Temperature |
|------|---------|---------|-------------|
| `extract-claims-system.md` | `src/ai/extract-claims.ts` | System prompt for claim extraction | 0.3 |
| `extract-claims-user.md` | `src/ai/extract-claims.ts` | User prompt template for claim extraction | 0.3 |
| `verify-claims-system.md` | `src/ai/verify-claims.ts` | System prompt for claim verification | 0.3 |
| `verify-claims-user.md` | `src/ai/verify-claims.ts` | User prompt template for claim verification | 0.3 |
| `generate-forecast-system.md` | `src/ai/generate-forecast.ts` | System prompt for price forecasting | 0.5 |
| `generate-forecast-user.md` | `src/ai/generate-forecast.ts` | User prompt template for price forecasting | 0.5 |
| `extract-symbols-system.md` | `src/services/extract-symbols.ts` | System prompt for symbol extraction | 0.3 |
| `extract-symbols-user.md` | `src/services/extract-symbols.ts` | User prompt template for symbol extraction | 0.3 |

## File Structure

```
prompts/
├── README.md                      # This file
├── extract-claims-system.md       # System prompt for claim extraction
├── extract-claims-user.md         # User prompt template for claim extraction
├── verify-claims-system.md        # System prompt for claim verification
├── verify-claims-user.md          # User prompt template for claim verification
├── generate-forecast-system.md    # System prompt for price forecasting
├── generate-forecast-user.md      # User prompt template for price forecasting
├── extract-symbols-system.md      # System prompt for symbol extraction
└── extract-symbols-user.md        # User prompt template for symbol extraction
```

## Template Variables

User prompts support template variables using `${variable}` syntax:

### extract-claims-user.md
- `${title}` - Article title
- `${articleText}` - Full article text

### verify-claims-user.md
- `${context}` - Article context
- `${claimsList}` - Numbered list of claims to verify

### generate-forecast-user.md
- `${symbol}` - Stock ticker symbol
- `${currentPrice}` - Current stock price
- `${truthScore}` - Article truth score (0.00-1.00)
- `${title}` - Article title
- `${summary}` - Article summary

### extract-symbols-user.md
- `${title}` - Article title
- `${text}` - Article text (first 500 chars)

## How to Edit Prompts

### 1. Edit Prompt File
```bash
vim prompts/extract-claims-user.md
```

### 2. Restart Container
```bash
docker compose restart api
```

No rebuild needed! The container reads prompts from the mounted directory.

## Modified Files

1. **`src/ai/prompts.ts`** - Prompt loader utility with template variable substitution
2. **`src/ai/extract-claims.ts`** - Uses `getPrompt()` instead of hardcoded strings
3. **`src/ai/verify-claims.ts`** - Uses `getPrompt()` instead of hardcoded strings
4. **`src/ai/generate-forecast.ts`** - Uses `getPrompt()` instead of hardcoded strings
5. **`src/services/extract-symbols.ts`** - Uses `getPrompt()` instead of hardcoded strings
6. **`compose.yml`** - Added volume mount: `./prompts:/app/prompts:ro`

## Testing

After editing prompts, test with:

```bash
# Test claim extraction
./tests/ai-test.sh extract-claims

# Test full ingestion pipeline
./tests/articles.sh ingest https://example.com/article AAPL
```

## Rollback

If prompts cause issues, revert the markdown files:

```bash
git checkout prompts/
docker compose restart api
```

## Best Practices

- Keep system prompts focused on role definition
- Use clear, specific instructions in user prompts
- Specify exact JSON output format
- Include examples when helpful
- Test prompt changes with `./tests/ai-test.sh`
- Document prompt design decisions in comments
- Version working prompts with git tags
- Monitor AI response quality after changes
