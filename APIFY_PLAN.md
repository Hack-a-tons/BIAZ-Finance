# Apify Usage Plan for BIAZ Finance

## Budget: $500+ ✅

Won at previous hackathon - plenty for automated news monitoring!

---

## Implementation Strategy

### 1. On-Demand Analysis ✅ (Currently Implemented)
- User provides article URL
- Check if URL already in database → return cached result
- If new → Apify fetch → AI analyze → Store → Return
- Cost: ~$0.05 per new article

### 2. Automated News Feed 🚀 (To Implement)
- Background job runs every 15-30 minutes
- Scrapes top financial news sources (RSS feeds, Google News)
- Auto-ingests new articles
- Pre-analyzes with AI (claims, truth score, forecast)
- User sees pre-analyzed feed when scrolling

**Sources to monitor:**
- Google News (keywords: AAPL, TSLA, tech stocks, earnings)
- RSS Feeds: Reuters, Financial Times, TechCrunch, Bloomberg
- Company-specific: Apple Newsroom, Tesla Blog

**Workflow:**
```
Scheduled Job (every 15min) →
  Apify scrapes news sources →
  Filter: only financial/stock news →
  Check: skip if URL already in DB →
  For each new article:
    Apify fetch content →
    AI extract claims →
    AI verify claims →
    AI generate forecast →
    Store in DB →
  User scrolls feed → sees pre-analyzed articles
```

---

## Cost Estimates (Monthly)

### Automated Feed:
- 4 runs/hour × 24 hours × 30 days = 2,880 runs/month
- ~20 new articles per run = 57,600 articles/month
- Realistic (after deduplication): ~5,000 new articles/month
- Cost: 5,000 × $0.05 = **$250/month**

### On-Demand:
- User-submitted URLs: ~100/month
- Cost: 100 × $0.05 = **$5/month**

### Total: ~$255/month
**Budget lasts: ~2 months** (then need to optimize or add revenue)

---

## Database Deduplication Strategy

### Check Before Ingesting:
```sql
SELECT id FROM articles WHERE url = $1
```

If exists → return cached article
If not → ingest new article

### Benefits:
- No duplicate analysis
- Instant response for cached articles
- Saves Apify + AI costs
- Better user experience

---

## Actors to Use

### 1. Google News Scraper
```javascript
await client.actor('apify/google-news-scraper').call({
  searchQueries: ['Apple stock', 'Tesla earnings', 'tech stocks'],
  maxArticles: 50,
  language: 'en',
});
```

### 2. RSS Feed Scraper
```javascript
await client.actor('apify/rss-feed-scraper').call({
  feedUrls: [
    'https://www.ft.com/rss/companies',
    'https://techcrunch.com/feed/',
    'https://www.reuters.com/finance/rss',
  ],
  maxItems: 100,
});
```

### 3. Website Content Crawler (current)
```javascript
await client.actor('apify/website-content-crawler').call({
  startUrls: [{ url: articleUrl }],
  maxCrawlDepth: 0,
  maxCrawlPages: 1,
});
```

---

## Implementation Priority

### Phase 1: Database Deduplication ✅
- Add URL uniqueness check
- Return cached articles instantly
- **Implement now**

### Phase 2: RSS Feed Monitoring 🚀
- Monitor 5-10 top financial RSS feeds
- Run every 30 minutes
- Auto-ingest new articles
- **Implement next**

### Phase 3: Google News Integration
- Search for stock-specific keywords
- Run every 15 minutes
- Filter relevant articles
- **Implement after RSS working**

### Phase 4: Optimization
- Smart scheduling (more frequent during market hours)
- Source quality scoring
- Duplicate detection improvements
- **Implement after user feedback**

---

## Monitoring

```bash
./apify.sh recent      # Check recent runs
./apify.sh usage       # Monitor spending
./apify.sh running     # See active jobs
```

Track in database:
- Articles ingested per day
- Average cost per article
- Cache hit rate (% of cached vs new)
- Source quality (truth scores by source)
