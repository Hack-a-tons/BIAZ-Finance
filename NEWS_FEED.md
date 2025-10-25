# BIAZ Finance - Automated News Feed

## Implementation Complete ✅

### Features

**1. URL Deduplication** ✅
- Before ingesting, check if article URL already exists in database
- If exists → return cached article instantly (no Apify/AI cost)
- If new → fetch, analyze, store
- **Benefit:** Saves money, faster response, no duplicate analysis

**2. On-Demand Ingestion** ✅
- User submits article URL via `POST /v1/articles/ingest`
- System checks cache → fetches if new → analyzes → stores
- Returns complete article with truth score, claims, forecast

**3. Automated Feed Monitoring** ✅
- Background job scrapes news sources
- Filters for financial/stock-related articles
- Auto-ingests and pre-analyzes
- Users see pre-analyzed feed when scrolling

---

## How It Works

### User Flow:
```
User opens app →
  GET /v1/articles (paginated) →
  Returns pre-analyzed articles from database →
  User scrolls → sees truth scores, forecasts instantly
```

### Background Job Flow:
```
Cron job (every 30 min) →
  POST /v1/admin/monitor-feeds →
  Apify scrapes RSS feeds + Google News →
  Filter: only stock-related articles →
  For each new URL:
    Check if exists in DB → skip if yes →
    Apify fetch content →
    AI extract claims →
    AI verify claims →
    AI generate forecast →
    Store in database →
  Next user request → sees new articles
```

---

## News Sources

### RSS Feeds:
- Financial Times Technology
- TechCrunch
- Reuters Technology
- Bloomberg Technology

### Google News:
- Keywords: "Apple stock", "Tesla stock", "NVIDIA earnings", "tech stocks", "stock market news"

### Filtering:
Only articles with keywords: stock, earnings, revenue, shares, market, AAPL, TSLA, NVDA

---

## Setup

### 1. Manual Trigger (Testing):
```bash
curl -X POST https://api.news.biaz.hurated.com/v1/admin/monitor-feeds
```

### 2. Automated (Cron Job):
```bash
# Find absolute path first:
pwd  # e.g., /root/BIAZ-Finance

# Add to crontab on server:
crontab -e

# Add one of these lines (use absolute path, NOT $HOME):
# Every 30 minutes:
*/30 * * * * /root/BIAZ-Finance/monitor-cron.sh >> /root/BIAZ-Finance/monitor.log 2>&1

# Every hour:
0 * * * * /root/BIAZ-Finance/monitor-cron.sh >> /root/BIAZ-Finance/monitor.log 2>&1

# Check logs:
tail -f /root/BIAZ-Finance/monitor.log
```

### 3. Monitor Activity:
```bash
./apify.sh recent      # See recent Apify runs
./apify.sh running     # See active jobs
./apify.sh usage       # Check spending
```

---

## Cost Estimates

### With $500 Budget:

**Automated Feed (every 30 min):**
- 48 runs/day × 30 days = 1,440 runs/month
- ~10 new articles per run = 14,400 articles/month
- Cost: 14,400 × $0.05 = **$720/month**

**Optimized (every 30 min, 5 articles/run):**
- 48 runs/day × 30 days = 1,440 runs/month
- ~5 new articles per run = 7,200 articles/month
- Cost: 7,200 × $0.05 = **$360/month**

**Conservative (every hour, 5 articles/run):**
- 24 runs/day × 30 days = 720 runs/month
- ~5 new articles per run = 3,600 articles/month
- Cost: 3,600 × $0.05 = **$180/month**

**Recommendation:** Start with hourly runs, monitor quality, adjust frequency

---

## Database Schema

Articles stored with:
- URL (unique) - for deduplication
- Title, summary, full text
- Source, published date
- Truth score, impact sentiment
- Claims with evidence links
- Symbols (AAPL, TSLA, etc.)
- Forecast (sentiment, price target, reasoning)

**Query for feed:**
```sql
SELECT * FROM articles 
ORDER BY published_at DESC 
LIMIT 10 OFFSET 0;
```

---

## API Endpoints

### Get Feed (Client):
```bash
GET /v1/articles?page=1&limit=10
GET /v1/articles?symbol=AAPL
GET /v1/articles/:id
```

### Ingest Article (Client):
```bash
POST /v1/articles/ingest
Body: {"url": "https://...", "symbol": "AAPL"}
```

### Trigger Monitoring (Admin):
```bash
POST /v1/admin/monitor-feeds
```

---

## Monitoring & Optimization

### Track Metrics:
1. **Articles per day** - How many new articles ingested
2. **Cache hit rate** - % of requests served from cache
3. **Cost per article** - Actual Apify + AI cost
4. **Source quality** - Average truth score by source
5. **User engagement** - Which articles users read

### Optimize:
- Adjust cron frequency based on new article rate
- Filter low-quality sources
- Prioritize high-engagement topics
- Add more sources if needed

---

## Next Steps

1. **Test feed monitoring:**
   ```bash
   curl -X POST https://api.news.biaz.hurated.com/v1/admin/monitor-feeds
   ```

2. **Check results:**
   ```bash
   curl https://api.news.biaz.hurated.com/v1/articles
   ```

3. **Set up cron job:**
   ```bash
   # On server:
   crontab -e
   # Add: */30 * * * * /root/BIAZ-Finance/monitor-cron.sh
   ```

4. **Monitor costs:**
   ```bash
   ./apify.sh usage
   ./apify.sh recent
   ```

5. **Adjust frequency** based on results and budget

---

## Benefits

✅ **Pre-analyzed feed** - Users see truth scores instantly  
✅ **No duplicate analysis** - URL deduplication saves money  
✅ **Automatic discovery** - No manual URL submission needed  
✅ **Real-time updates** - New articles every 30 minutes  
✅ **Scalable** - Adjust frequency and sources as needed  
✅ **Cost-effective** - ~$180-360/month for comprehensive coverage
