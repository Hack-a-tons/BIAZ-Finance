# BIAZ Finance - API Tests

Test scripts for all API endpoints.

---

## Running All Tests

Use `test.sh` in the root directory to run all tests:

```bash
./test.sh           # Run all tests
./test.sh -v        # Run with verbose output (shows curl commands and JSON)
./test.sh --help    # Show help
```

**Output:**
```
Running BIAZ Finance API Tests
================================

Testing articles.sh get ... ✓ PASS
Testing articles.sh get AAPL... ✓ PASS
...
================================
Results: 13 passed, 0 failed, 13 total
```

---

## Individual Test Scripts

All scripts support `-h/--help` and `-v/--verbose` flags.

### articles.sh

Test article endpoints.

```bash
./tests/articles.sh get                              # List all articles
./tests/articles.sh get AAPL                         # Filter by symbol
./tests/articles.sh show art_001                     # Get specific article
./tests/articles.sh ingest https://example.com AAPL  # Ingest new article
./tests/articles.sh score art_001                    # Recompute truth score
./tests/articles.sh -v get                           # Verbose mode
```

**Actions:**
- `get [symbol] [from] [source] [page] [limit]` - List articles with filters
- `show <id>` - Get article details with claims
- `ingest <url> [symbol]` - Ingest new article
- `score <id>` - Recompute truth score

---

### sources.sh

Test source endpoints.

```bash
./tests/sources.sh get                           # List all sources
./tests/sources.sh show src_001                  # Get specific source
./tests/sources.sh create "My Source" example.com 0.8  # Add custom source
./tests/sources.sh delete src_123                # Delete source
```

**Actions:**
- `get` - List all sources
- `show <id>` - Get source details
- `create <name> <domain> [credibilityScore]` - Add custom source
- `delete <id>` - Delete source

---

### stocks.sh

Test stock endpoints.

```bash
./tests/stocks.sh get           # List all stocks
./tests/stocks.sh get AAPL      # Search by symbol
./tests/stocks.sh get Apple     # Search by name
```

**Actions:**
- `get [search]` - List stocks, optionally search by symbol or name

---

### forecasts.sh

Test forecast endpoints.

```bash
./tests/forecasts.sh show fct_001           # Get forecast by ID
./tests/forecasts.sh create art_001 AAPL    # Generate new forecast
```

**Actions:**
- `show <id>` - Get forecast details
- `create <articleId> <symbol>` - Generate new forecast

---

## AI Testing

### ai-test.sh

Test AI providers (Azure OpenAI and Gemini).

```bash
./tests/ai-test.sh                                    # Test Azure (default)
./tests/ai-test.sh azure                              # Test Azure OpenAI
./tests/ai-test.sh gemini                             # Test Google Gemini
./tests/ai-test.sh both                               # Test both providers
./tests/ai-test.sh -v azure "What is 2+2?"           # Custom prompt
./tests/ai-test.sh -v both "Explain blockchain"      # Test both with prompt
```

**Options:**
- `-v, --verbose` - Show request details and responses

**Providers:**
- `azure` - Azure OpenAI (default)
- `gemini` - Google Gemini
- `both` - Test both providers

---

## Apify Testing

### apify-test.sh

Test Apify Website Content Crawler.

```bash
./tests/apify-test.sh                                    # Test with default URL
./tests/apify-test.sh -v                                 # Verbose mode
./tests/apify-test.sh https://www.bbc.com/news          # Test with custom URL
./tests/apify-test.sh -v https://example.com/article    # Verbose with custom URL
```

**Options:**
- `-v, --verbose` - Show detailed extraction output

**Shows:**
- Run ID and status
- Extracted title
- Text and markdown length
- Content preview

---

## Verbose Mode

All test scripts support `-v/--verbose` flag which shows:

- **Gray curl commands** - Exact curl command being executed
- **Gray JSON responses** - Raw JSON from API
- **Formatted JSON** - Pretty-printed output
- **Request details** - For AI and Apify tests

**Example:**
```bash
./tests/articles.sh -v get

# Output:
$ curl https://api.news.biaz.hurated.com/v1/articles?
{gray JSON response}
{formatted JSON}
```

---

## Environment

All test scripts:
- Change to their directory on startup
- Load values from `.env` (API_URL, etc.)
- Can be called from any directory
- Use absolute paths internally

---

## Adding New Tests

When adding new endpoints:

1. Create `tests/new-endpoint.sh`
2. Follow the same structure (shebang, help, verbose, actions)
3. Add to `test.sh` in root directory
4. Update this README

---

## See Also

- [../scripts/README.md](../scripts/README.md) - Management scripts
- [../APIDOCS.md](../APIDOCS.md) - API documentation
- [../test.sh](../test.sh) - Master test runner
