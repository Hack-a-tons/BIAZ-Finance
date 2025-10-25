# BIAZ Finance API Documentation

**Base URL:** `https://api.news.biaz.hurated.com/v1`

All endpoints return JSON. No authorization required.

---

## Articles

### GET /articles - List articles

Get paginated list of articles with optional filters.

**curl command:**
```bash
curl https://api.news.biaz.hurated.com/v1/articles
```

**Query Parameters:**
- `symbol` - Filter by stock symbol (e.g., AAPL, TSLA)
- `from` - ISO 8601 date, articles published after this date
- `source` - Filter by source ID
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Example with filters:**
```bash
curl "https://api.news.biaz.hurated.com/v1/articles?symbol=AAPL&limit=5"
```

**Response:**
```json
{
  "data": [
    {
      "id": "art_001",
      "title": "Apple Announces Record Q4 Revenue Driven by iPhone Sales",
      "summary": "Apple Inc. reported quarterly revenue of $89.5 billion...",
      "url": "https://example.com/apple-q4-revenue",
      "imageUrl": "https://picsum.photos/seed/apple1/800/600",
      "publishedAt": "2025-10-24T14:30:00Z",
      "source": "src_001",
      "symbols": ["AAPL"],
      "truthScore": 0.92,
      "impactSentiment": "positive",
      "forecastId": "fct_001"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3
  }
}
```

### GET /articles/:id - Get article details

Get full article with claims, truth score, and verification details.

**curl command:**
```bash
curl https://api.news.biaz.hurated.com/v1/articles/art_001
```

**Response:**
```json
{
  "id": "art_001",
  "title": "Apple Announces Record Q4 Revenue Driven by iPhone Sales",
  "summary": "Apple Inc. reported quarterly revenue of $89.5 billion...",
  "url": "https://example.com/apple-q4-revenue",
  "imageUrl": "https://picsum.photos/seed/apple1/800/600",
  "publishedAt": "2025-10-24T14:30:00Z",
  "source": "src_001",
  "symbols": ["AAPL"],
  "truthScore": 0.92,
  "impactSentiment": "positive",
  "claims": [
    {
      "id": "clm_001",
      "text": "Apple reported quarterly revenue of $89.5 billion",
      "verified": true,
      "confidence": 0.95,
      "evidenceLinks": ["https://investor.apple.com/q4-2025"]
    }
  ],
  "explanation": "Article claims verified against official Apple investor relations data...",
  "forecastId": "fct_001"
}
```

### POST /articles/ingest - Ingest new article

Fetch, extract claims, verify, and score a new article from URL.

**curl command:**
```bash
curl -X POST https://api.news.biaz.hurated.com/v1/articles/ingest \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/article","symbol":"AAPL"}'
```

**Request Body:**
```json
{
  "url": "https://example.com/article",
  "symbol": "AAPL"
}
```

**Response:** 201 Created - Returns full article object with truth score

### POST /articles/:id/score - Recompute truth score

Manually trigger truth score recalculation for an article.

**curl command:**
```bash
curl -X POST https://api.news.biaz.hurated.com/v1/articles/art_001/score
```

**Response:** Article object with updated `truthScore` and `scoredAt` timestamp

---

## Sources

### GET /sources - List sources

Get all news sources with credibility scores.

**curl command:**
```bash
curl https://api.news.biaz.hurated.com/v1/sources
```

**Response:**
```json
{
  "data": [
    {
      "id": "src_001",
      "name": "Financial Times",
      "domain": "ft.com",
      "credibilityScore": 0.95,
      "category": "mainstream_media",
      "verifiedPublisher": true
    }
  ]
}
```

### GET /sources/:id - Get source details

**curl command:**
```bash
curl https://api.news.biaz.hurated.com/v1/sources/src_001
```

**Response:** Single source object

### POST /sources - Add custom source

**curl command:**
```bash
curl -X POST https://api.news.biaz.hurated.com/v1/sources \
  -H "Content-Type: application/json" \
  -d '{"name":"My Source","domain":"example.com","credibilityScore":0.8}'
```

**Request Body:**
```json
{
  "name": "My Source",
  "domain": "example.com",
  "credibilityScore": 0.8
}
```

**Response:** 201 Created - Returns created source object

### DELETE /sources/:id - Delete source

**curl command:**
```bash
curl -X DELETE https://api.news.biaz.hurated.com/v1/sources/src_123
```

**Response:** 204 No Content

---

## Stocks

### GET /stocks - List stocks

Get stocks referenced in articles with current prices.

**curl command:**
```bash
curl https://api.news.biaz.hurated.com/v1/stocks
```

**Search by symbol or name:**
```bash
curl "https://api.news.biaz.hurated.com/v1/stocks?search=AAPL"
curl "https://api.news.biaz.hurated.com/v1/stocks?search=Apple"
```

**Query Parameters:**
- `search` - Search by symbol or company name

**Response:**
```json
{
  "data": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "exchange": "NASDAQ",
      "sector": "Technology",
      "currentPrice": 178.45,
      "change": "+2.34%",
      "articleCount": 2
    }
  ]
}
```

---

## Forecasts

### GET /forecasts/:id - Get forecast

Get AI-generated price forecast and impact analysis.

**curl command:**
```bash
curl https://api.news.biaz.hurated.com/v1/forecasts/fct_001
```

**Response:**
```json
{
  "id": "fct_001",
  "articleId": "art_001",
  "symbol": "AAPL",
  "sentiment": "positive",
  "impactScore": 0.75,
  "priceTarget": 185.50,
  "timeHorizon": "1_week",
  "confidence": 0.82,
  "reasoning": "Strong revenue beat indicates continued demand. Emerging market growth suggests sustainable momentum. Expect 3-5% upside in near term.",
  "generatedAt": "2025-10-24T14:35:00Z"
}
```

### POST /forecasts - Generate forecast

Create new AI forecast for article and symbol.

**curl command:**
```bash
curl -X POST https://api.news.biaz.hurated.com/v1/forecasts \
  -H "Content-Type: application/json" \
  -d '{"articleId":"art_001","symbol":"AAPL"}'
```

**Request Body:**
```json
{
  "articleId": "art_001",
  "symbol": "AAPL"
}
```

**Response:** 201 Created - Returns forecast object

---

## Data Types Reference

**truthScore** - Float 0.0 to 1.0 (higher = more verified claims)

**impactSentiment** - One of: `"positive"`, `"neutral"`, `"negative"`

**timeHorizon** - One of: `"1_day"`, `"1_week"`, `"1_month"`, `"3_months"`

**category** - One of: `"mainstream_media"`, `"tech_media"`, `"news_agency"`, `"custom"`

---

## Implementation Notes for Client Developers

1. **No authentication required** - All endpoints are public
2. **All responses are JSON** - Set `Accept: application/json` header
3. **POST requests need Content-Type** - Use `Content-Type: application/json`
4. **Pagination** - Use `page` and `limit` query params for `/articles`
5. **Error responses** - Return appropriate HTTP status codes (400, 404, etc.) with `{"error": "message"}`
6. **Images** - All `imageUrl` fields point to valid image URLs (800x600)
7. **Timestamps** - All dates in ISO 8601 format (e.g., `"2025-10-24T14:30:00Z"`)
8. **IDs** - All IDs are strings with prefixes: `art_`, `src_`, `clm_`, `fct_`
