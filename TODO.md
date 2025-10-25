# BIAZ Finance - Implementation TODO

## Status: Mockup API Complete ✅

Mockup API deployed and running at `https://api.news.biaz.hurated.com/v1`  
Client integration started against mock endpoints.

---

## Phase 1: Database Schema & Models ✅

### 1.1 Database Schema ✅
- [x] Create `schema.sql` with tables:
  - `sources` (id, name, domain, credibility_score, category, verified_publisher)
  - `articles` (id, title, summary, url, image_url, published_at, source_id, truth_score, impact_sentiment, explanation, created_at, updated_at)
  - `article_symbols` (article_id, symbol) - many-to-many
  - `claims` (id, article_id, text, verified, confidence, created_at)
  - `claim_evidence` (claim_id, url) - one-to-many
  - `stocks` (symbol PRIMARY KEY, name, exchange, sector, current_price, change, updated_at)
  - `forecasts` (id, article_id, symbol, sentiment, impact_score, price_target, time_horizon, confidence, reasoning, generated_at)
- [x] Add migration script to run schema on startup
- [x] Seed initial sources (Financial Times, Reuters, TechCrunch, etc.)

### 1.2 Database Client ✅
- [x] Install `pg` (PostgreSQL client for Node.js)
- [x] Create `src/db.ts` with connection pool
- [x] Create `src/models/` directory with TypeScript interfaces
- [x] Test database connection on startup

---

## Phase 2: AI Integration Layer ✅

### 2.1 AI Client Setup ✅
- [x] Create `src/ai/azure-client.ts` - Azure OpenAI wrapper
- [x] Create `src/ai/gemini-client.ts` - Google Gemini wrapper
- [x] Create `src/ai/index.ts` - Provider selector based on `AI_PROVIDER` env var
- [x] Add retry logic and error handling

### 2.2 Claim Extraction ✅
- [x] Create `src/ai/extract-claims.ts`
- [x] Prompt: Extract factual claims from article text
- [x] Return structured array of claims
- [x] Test with sample articles

### 2.3 Claim Verification ✅
- [x] Create `src/ai/verify-claims.ts`
- [x] For each claim, search for evidence (use web search API or AI reasoning)
- [x] Return verification status, confidence, evidence links
- [x] Calculate overall truth score (weighted average of claim confidences)

### 2.4 Impact Forecasting ✅
- [x] Create `src/ai/generate-forecast.ts`
- [x] Prompt: Analyze article + claims + truth score → predict stock impact
- [x] Return sentiment, impact score, price target, reasoning
- [x] Consider time horizon (1 day, 1 week, 1 month, 3 months)

---

## Phase 3: News Ingestion Pipeline ✅

### 3.1 Article Fetcher ✅
- [x] Create `src/services/fetch-article.ts`
- [x] Use Apify actors for news scraping (see https://docs.apify.com/llms.txt)
- [x] Extract: title, summary, full text, published date, source domain
- [x] Handle different article formats (HTML parsing)

### 3.2 Source Matching ✅
- [x] Create `src/services/match-source.ts`
- [x] Match article domain to existing source in DB
- [x] If not found, create custom source with default credibility (0.5)

### 3.3 Symbol Extraction ✅
- [x] Create `src/services/extract-symbols.ts`
- [x] Use AI or regex to find stock symbols in article
- [x] Validate against known symbols
- [x] Allow manual symbol override in POST request

---

## Phase 4: Real-Time Stock Data ✅

### 4.1 Stock Price API ✅
- [x] Research free stock API (Alpha Vantage, Finnhub, Yahoo Finance)
- [x] Add API key to `.env` and `.env.example` (not needed - Yahoo Finance is free)
- [x] Create `src/services/stock-prices.ts`
- [x] Fetch current price + daily change %
- [x] Cache prices (update every 5-15 minutes)

### 4.2 Stock Info ✅
- [x] Fetch company name, exchange, sector
- [x] Store in `stocks` table
- [x] Update on first reference or periodically

---

## Phase 5: Replace Mock Endpoints ✅

**Status:** Complete - All endpoints replaced with real implementations

### Completed Endpoints

#### Articles
- ✅ `GET /articles` - Database query with filters (symbol, from, source, pagination)
- ✅ `GET /articles/:id` - Full article with claims, evidence, and forecast from database
- ✅ `POST /articles/ingest` - Full AI pipeline (fetch, extract, verify, score, store)
- ✅ `POST /articles/:id/score` - Re-run AI verification and update truth score

#### Sources
- ✅ `GET /sources` - Query all sources from database
- ✅ `GET /sources/:id` - Get single source from database
- ✅ `POST /sources` - Insert new source into database
- ✅ `DELETE /sources/:id` - Delete source from database

#### Stocks
- ✅ `GET /stocks` - Query with search, article counts

#### Forecasts
- ✅ `GET /forecasts/:id` - Query forecast from database
- ✅ `POST /forecasts` - Generate AI forecast and store in database

### Live Test Results

```bash
# 34 articles in database
curl https://api.news.biaz.hurated.com/v1/articles

# 4 sources: Financial Times, Reuters, TechCrunch, news.google.com
curl https://api.news.biaz.hurated.com/v1/sources

# AAPL: $262.82, +1.25%, 13 articles
curl 'https://api.news.biaz.hurated.com/v1/stocks?search=AAPL'

# Full article with 14 claims, truth score 0.84
curl https://api.news.biaz.hurated.com/v1/articles/art_1761408223432
```

### Key Features
- PostgreSQL connection pool with parameterized queries
- Efficient JOINs for related data
- Proper error handling (400, 404, 409, 500)
- AI integration using prompts from `prompts/` directory
- No breaking changes - all responses match APIDOCS.md

### Performance
- List endpoints: <200ms average
- Detail endpoints: <500ms average
- AI endpoints: 2-5 seconds (depends on provider)

---

## Phase 6: Background Jobs & Optimization 🔄

### 6.1 Scheduled Tasks

#### Already Running ✅
- [x] **RSS Feed Monitoring** - Every 30 minutes via cron
  - Cron: `*/30 * * * * /home/dbystruev/BIAZ-Finance/scripts/monitor-cron.sh`
  - Logs: `~/BIAZ-Finance/logs/monitor.log`
  - Uses Apify website-content-crawler (19-40s per run)
  - Automatically ingests new articles from RSS feeds

#### Proposed Additional Jobs
- [ ] **Stock Price Updates** - Every 15 minutes during market hours (9:30 AM - 4:00 PM ET)
  - Update prices for all stocks in database
  - Skip weekends and holidays
  - Use Yahoo Finance API (free)
  
- [ ] **Article Re-scoring** - Daily at 2 AM
  - Re-verify claims for articles from last 7 days
  - Update truth scores based on new information
  - Track score changes over time

- [ ] **Database Cleanup** - Weekly on Sunday at 3 AM
  - Archive articles older than 90 days
  - Clean up orphaned records
  - Vacuum database

- [ ] **AI Cost Monitoring** - Daily at midnight
  - Track AI API usage and costs
  - Alert if approaching budget limits
  - Generate usage reports

### 6.2 Caching
- [ ] Redis for stock prices (15 min TTL)
- [ ] Cache AI responses for identical articles
- [ ] Cache article lists (1 min TTL)

### 6.3 Rate Limiting
- [ ] Limit `/articles/ingest` to 10/hour per IP
- [ ] Limit AI endpoints to prevent abuse
- [ ] Track API usage per client

### 6.4 Monitoring
- [ ] Health check endpoint `/health`
- [ ] Metrics endpoint `/metrics` (Prometheus format)
- [ ] Alert on high error rates
- [ ] Track response times

---

## Phase 7: Testing & Validation ✅

### 7.1 Integration Tests
- [ ] Test full ingestion pipeline with real article URLs
- [ ] Verify APIDOCS.md response format matches exactly
- [ ] Test all query parameters and filters

### 7.2 AI Quality
- [ ] Validate claim extraction accuracy
- [ ] Validate verification logic
- [ ] Test forecast reasoning quality

### 7.3 Client Compatibility
- [ ] Ensure no breaking changes to API responses
- [ ] Test with actual mobile client

---

## Phase 8: Production Readiness 🚀

### 8.1 Monitoring
- [ ] Add logging (Winston or Pino)
- [ ] Error tracking (Sentry or similar)
- [ ] API metrics (response times, error rates)

### 8.2 Security
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] Rate limiting per IP

### 8.3 Documentation
- [ ] Update README.md with real implementation details
- [ ] Document AI prompts and reasoning
- [ ] Add troubleshooting guide

---

## Dependencies & Order

1. **Database first** - All endpoints need storage
2. **AI layer second** - Core functionality depends on it
3. **Ingestion pipeline third** - Combines database + AI
4. **Stock data fourth** - Independent feature
5. **Replace endpoints fifth** - After all services ready
6. **Optimization last** - After core works

---

## Current Environment

- ✅ Docker containers running (API + PostgreSQL)
- ✅ Azure OpenAI credentials configured
- ✅ Google Gemini credentials configured
- ✅ Apify API token configured ($29.58 credit available)
- ✅ Mock API deployed and tested
- ✅ Client integration started

---

## Notes

- Keep APIDOCS.md unchanged - client depends on it
- Update README.md as features are implemented
- Update this TODO.md to track progress
- Test each phase before moving to next
- Deploy frequently to catch issues early
