# Apify Usage Plan for BIAZ Finance

## Current Implementation ✅

### What We Use Apify For:

**1. Article Content Extraction** (Currently Implemented)
- Actor: `apify/website-content-crawler`
- Purpose: Fetch full article content from any URL
- Triggered: When user calls `POST /v1/articles/ingest` with article URL
- Cost: ~$0.01-0.05 per article (depending on complexity)

**How it works:**
```
User provides URL → Apify fetches content → Extract title, text, metadata → 
AI extracts claims → AI verifies claims → Store in database
```

---

## Future Expansion Options 🚀

### Option 1: Automated News Discovery (Not Yet Implemented)

**Use Case:** Automatically find new financial news articles

**Actors to Consider:**
- `apify/google-news-scraper` - Search Google News for keywords
- `apify/rss-feed-scraper` - Monitor RSS feeds from financial sites
- Custom scheduled runs to check sources every hour

**Implementation:**
```javascript
// Search for AAPL news
await client.actor('apify/google-news-scraper').call({
  searchQueries: ['Apple stock', 'AAPL earnings'],
  maxArticles: 10,
});

// Monitor RSS feeds
await client.actor('apify/rss-feed-scraper').call({
  feedUrls: [
    'https://www.ft.com/rss/companies/apple',
    'https://techcrunch.com/feed/',
  ],
});
```

**Cost:** ~$5-20/month for hourly checks across multiple sources

**Pros:**
- Automatic article discovery
- No manual URL submission needed
- Real-time news monitoring

**Cons:**
- Higher Apify costs
- Need to filter relevant articles
- May ingest duplicate/low-quality content

---

### Option 2: Fact-Checking Enhancement (Potential)

**Use Case:** Verify claims by scraping official sources

**Actors to Consider:**
- `apify/web-scraper` - Scrape SEC filings, company IR pages
- `apify/website-content-crawler` - Extract data from evidence URLs

**Implementation:**
```javascript
// Verify claim: "Apple reported $89.5B revenue"
// 1. AI identifies claim needs verification
// 2. AI suggests evidence URL: https://investor.apple.com/...
// 3. Apify scrapes that page
// 4. AI compares scraped data with claim
```

**Cost:** ~$0.02-0.10 per claim verification

**Pros:**
- More accurate truth scores
- Real evidence from official sources
- Reduces AI hallucination

**Cons:**
- Significantly increases Apify usage
- Slower ingestion (multiple scrapes per article)
- Complex parsing of financial documents

---

## Recommended Approach 💡

### Phase 1 (Current): Manual URL Ingestion ✅
- User provides article URLs
- Apify fetches content on-demand
- Cost: ~$0.05 per article
- **Best for hackathon demo and initial testing**

### Phase 2 (Future): Hybrid Approach
- Keep manual ingestion for important articles
- Add scheduled RSS monitoring for top 5-10 sources
- Use Apify for content extraction only (not fact-checking)
- Let AI handle verification with its knowledge base
- Cost: ~$10-30/month

### Phase 3 (Scale): Full Automation
- Google News scraping for keyword monitoring
- Apify-based fact verification for high-impact claims
- Scheduled runs every 15-30 minutes
- Cost: ~$50-100/month

---

## Current Budget: $29.58

**Recommended allocation:**
- Article ingestion: ~500 articles = $25
- Testing/development: $4.58

**This is enough for:**
- Full hackathon demo (50-100 articles)
- Initial production testing
- Client integration validation

---

## Fact-Checking Strategy 🔍

### Current Approach (AI-Only): ✅
```
Article → Extract claims → AI verifies using knowledge → Truth score
```

**Pros:**
- Fast (no additional scraping)
- Low cost (only AI API calls)
- Works for most claims

**Cons:**
- AI knowledge cutoff date
- Potential hallucination
- No real-time data verification

### Enhanced Approach (AI + Apify):
```
Article → Extract claims → AI suggests evidence URLs → 
Apify scrapes evidence → AI compares → Truth score
```

**When to use:**
- High-impact claims (earnings, acquisitions)
- Recent events (after AI knowledge cutoff)
- Regulatory filings (SEC, EU Commission)

**Cost:** 2-5x more expensive per article

---

## Monitoring & Management

Use `./apify.sh` to monitor usage:

```bash
./apify.sh recent      # See recent runs
./apify.sh usage       # Check account credits
./apify.sh running     # See active actors
./apify.sh actors      # List available actors
./apify.sh test <url>  # Test article extraction
```

---

## Recommendations for BIAZ Finance

1. **Keep current implementation** - Manual URL ingestion with Apify content extraction
2. **Don't add automated discovery yet** - Wait until you have users and understand their needs
3. **Don't use Apify for fact-checking yet** - AI-only verification is sufficient for MVP
4. **Monitor usage** - Track cost per article, optimize if needed
5. **Consider RSS monitoring** - Only after validating product-market fit

**Bottom line:** Current Apify usage is optimal for hackathon and early production. Expand only when you have clear user demand and budget.
