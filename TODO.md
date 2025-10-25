# BIAZ Finance - Implementation TODO

## Status: Mockup API Complete ✅

Mockup API deployed and running at `https://api.news.biaz.hurated.com/v1`  
Client integration started against mock endpoints.

---

## Phase 1: Database Schema & Models ⏳

### 1.1 Database Schema
- [ ] Create `schema.sql` with tables:
  - `sources` (id, name, domain, credibility_score, category, verified_publisher)
  - `articles` (id, title, summary, url, image_url, published_at, source_id, truth_score, impact_sentiment, explanation, created_at, updated_at)
  - `article_symbols` (article_id, symbol) - many-to-many
  - `claims` (id, article_id, text, verified, confidence, created_at)
  - `claim_evidence` (claim_id, url) - one-to-many
  - `stocks` (symbol PRIMARY KEY, name, exchange, sector, current_price, change, updated_at)
  - `forecasts` (id, article_id, symbol, sentiment, impact_score, price_target, time_horizon, confidence, reasoning, generated_at)
- [ ] Add migration script to run schema on startup
- [ ] Seed initial sources (Financial Times, Reuters, TechCrunch, etc.)

### 1.2 Database Client
- [ ] Install `pg` (PostgreSQL client for Node.js)
- [ ] Create `src/db.ts` with connection pool
- [ ] Create `src/models/` directory with TypeScript interfaces
- [ ] Test database connection on startup

---

## Phase 2: AI Integration Layer 🤖

### 2.1 AI Client Setup
- [ ] Create `src/ai/azure-client.ts` - Azure OpenAI wrapper
- [ ] Create `src/ai/gemini-client.ts` - Google Gemini wrapper
- [ ] Create `src/ai/index.ts` - Provider selector based on `AI_PROVIDER` env var
- [ ] Add retry logic and error handling

### 2.2 Claim Extraction
- [ ] Create `src/ai/extract-claims.ts`
- [ ] Prompt: Extract factual claims from article text
- [ ] Return structured array of claims
- [ ] Test with sample articles

### 2.3 Claim Verification
- [ ] Create `src/ai/verify-claims.ts`
- [ ] For each claim, search for evidence (use web search API or AI reasoning)
- [ ] Return verification status, confidence, evidence links
- [ ] Calculate overall truth score (weighted average of claim confidences)

### 2.4 Impact Forecasting
- [ ] Create `src/ai/generate-forecast.ts`
- [ ] Prompt: Analyze article + claims + truth score → predict stock impact
- [ ] Return sentiment, impact score, price target, reasoning
- [ ] Consider time horizon (1 day, 1 week, 1 month, 3 months)

---

## Phase 3: News Ingestion Pipeline 📰

### 3.1 Article Fetcher
- [ ] Create `src/services/fetch-article.ts`
- [ ] Use existing `TAVILY_API_KEY` or `BROWSERBASE_API_KEY` from .env
- [ ] Extract: title, summary, full text, published date, source domain
- [ ] Handle different article formats (HTML parsing)

### 3.2 Source Matching
- [ ] Create `src/services/match-source.ts`
- [ ] Match article domain to existing source in DB
- [ ] If not found, create custom source with default credibility (0.5)

### 3.3 Symbol Extraction
- [ ] Create `src/services/extract-symbols.ts`
- [ ] Use AI or regex to find stock symbols in article
- [ ] Validate against known symbols
- [ ] Allow manual symbol override in POST request

---

## Phase 4: Real-Time Stock Data 📈

### 4.1 Stock Price API
- [ ] Research free stock API (Alpha Vantage, Finnhub, Yahoo Finance)
- [ ] Add API key to `.env` and `.env.example`
- [ ] Create `src/services/stock-prices.ts`
- [ ] Fetch current price + daily change %
- [ ] Cache prices (update every 5-15 minutes)

### 4.2 Stock Info
- [ ] Fetch company name, exchange, sector
- [ ] Store in `stocks` table
- [ ] Update on first reference or periodically

---

## Phase 5: Replace Mock Endpoints 🔄

**IMPORTANT:** Keep API responses identical to APIDOCS.md

### 5.1 Articles Endpoints
- [ ] `GET /articles` - Query from database with filters
- [ ] `GET /articles/:id` - Join with claims, evidence, forecast
- [ ] `POST /articles/ingest` - Full pipeline:
  1. Fetch article content
  2. Match/create source
  3. Extract symbols
  4. Extract claims (AI)
  5. Verify claims (AI)
  6. Calculate truth score
  7. Store in database
  8. Return article object
- [ ] `POST /articles/:id/score` - Re-run verification + scoring

### 5.2 Sources Endpoints
- [ ] `GET /sources` - Query from database
- [ ] `GET /sources/:id` - Single source
- [ ] `POST /sources` - Insert into database
- [ ] `DELETE /sources/:id` - Soft delete or hard delete

### 5.3 Stocks Endpoints
- [ ] `GET /stocks` - Query from database with search
- [ ] Update prices before returning (if stale)
- [ ] Count articles per symbol

### 5.4 Forecasts Endpoints
- [ ] `GET /forecasts/:id` - Query from database
- [ ] `POST /forecasts` - Generate with AI, store, return

---

## Phase 6: Background Jobs & Optimization ⚡

### 6.1 Scheduled Tasks
- [ ] Stock price updates (every 15 minutes during market hours)
- [ ] Article re-scoring (daily for recent articles)
- [ ] Stale data cleanup

### 6.2 Caching
- [ ] Redis for stock prices
- [ ] Cache AI responses (same article = same claims)

### 6.3 Rate Limiting
- [ ] Limit `/articles/ingest` to prevent abuse
- [ ] Limit AI API calls

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
- ✅ Tavily & Browserbase API keys available
- ✅ Mock API deployed and tested
- ✅ Client integration started

---

## Notes

- Keep APIDOCS.md unchanged - client depends on it
- Update README.md as features are implemented
- Update this TODO.md to track progress
- Test each phase before moving to next
- Deploy frequently to catch issues early
