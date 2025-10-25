# BIAZ Finance API Documentation

**Base URL:** `https://api.news.biaz.hurated.com/v1`

All endpoints return JSON. No authorization required.

---

## Articles

### GET /articles

List articles with optional filters.

**Query Parameters:**
- `symbol` (optional) - Filter by stock symbol (e.g., AAPL, TSLA)
- `from` (optional) - ISO 8601 date, filter articles published after this date
- `source` (optional) - Filter by source ID
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page

**Response:**
```json
{
  "data": [
    {
      "id": "art_001",
      "title": "Article Title",
      "summary": "Article summary text",
      "url": "https://example.com/article",
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

### GET /articles/:id

Get full article details including claims and verification.

**Response:**
```json
{
  "id": "art_001",
  "title": "Article Title",
  "summary": "Article summary",
  "url": "https://example.com/article",
  "imageUrl": "https://picsum.photos/seed/apple1/800/600",
  "publishedAt": "2025-10-24T14:30:00Z",
  "source": "src_001",
  "symbols": ["AAPL"],
  "truthScore": 0.92,
  "impactSentiment": "positive",
  "claims": [
    {
      "id": "clm_001",
      "text": "Claim text",
      "verified": true,
      "confidence": 0.95,
      "evidenceLinks": ["https://evidence.com"]
    }
  ],
  "explanation": "Detailed explanation of truth score",
  "forecastId": "fct_001"
}
```

### POST /articles/ingest

Ingest a new article from URL.

**Request Body:**
```json
{
  "url": "https://example.com/article",
  "symbol": "AAPL"
}
```

**Response:** 201 Created with article object

### POST /articles/:id/score

Recompute truth score for an article.

**Response:** Article object with updated truthScore and scoredAt timestamp

---

## Sources

### GET /sources

List all news sources.

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

### GET /sources/:id

Get source details.

**Response:** Single source object

### POST /sources

Add a custom source.

**Request Body:**
```json
{
  "name": "Source Name",
  "domain": "example.com",
  "credibilityScore": 0.8
}
```

**Response:** 201 Created with source object

### DELETE /sources/:id

Delete a custom source.

**Response:** 204 No Content

---

## Stocks

### GET /stocks

Search and list stocks referenced in articles.

**Query Parameters:**
- `search` (optional) - Search by symbol or company name

**Response:**
```json
{
  "data": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "exchange": "NASDAQ",
      "sector": "Technology",
      "articleCount": 2
    }
  ]
}
```

---

## Forecasts

### GET /forecasts/:id

Get AI-generated forecast details.

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
  "reasoning": "Detailed AI reasoning",
  "generatedAt": "2025-10-24T14:35:00Z"
}
```

### POST /forecasts

Generate new forecast for article and symbol.

**Request Body:**
```json
{
  "articleId": "art_001",
  "symbol": "AAPL"
}
```

**Response:** 201 Created with forecast object

---

## Data Types

**truthScore:** Float 0.0-1.0, higher = more verified claims

**impactSentiment:** "positive" | "neutral" | "negative"

**timeHorizon:** "1_day" | "1_week" | "1_month" | "3_months"

**category:** "mainstream_media" | "tech_media" | "news_agency" | "custom"
