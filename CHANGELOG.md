# Changelog

## 2025-10-25 - AI-Generated Forecast Summary ✅

### Implementation
- ✅ Added `forecast_summary` column to articles table
- ✅ Generate AI-powered forecast summary during article ingestion
- ✅ Separate from article summary - focuses on market impact and investor implications
- ✅ Cached for 6 hours to reduce AI costs
- ✅ Added to all article API responses (`forecastSummary` field)

### Example
**Article Summary** (from source):
```
Nvidia's upcoming earnings report should contain valuable information related to the company's new Blackwell and Blackwell Ultra GPUs...
```

**Forecast Summary** (AI-generated):
```
Nvidia's strong Blackwell GPU demand and continued AI infrastructure spending by big tech could drive significant upside, with analysts expecting earnings to beat estimates and potentially push the stock to new highs post-earnings.
```

### Usage
```bash
# Get article with forecast summary
curl https://api.news.biaz.hurated.com/v1/articles/:id | jq '.forecastSummary'
```

---

## 2025-10-25 - Quality Improvements

### Article Deduplication
- ✅ Reject articles with duplicate images (same image URL already used)
- ✅ Reject articles with duplicate titles (exact match)
- ✅ Ensure title ≠ summary (auto-generate summary from article text if they match)

### Source Name Field
- ✅ Added `sourceName` field to article responses
- ✅ Client can now use `sourceName` instead of parsing `source` ID
- ✅ Example: `"sourceName": "news.google.com"` alongside `"source": "src_1761402246226"`

### Feed Monitoring Logs
- ✅ Added duplicate tracking to rejection statistics
- ✅ Log format: `rejected: X no-stocks + Y no-image + Z ads + W duplicates`

### Clarification: "Cached" vs "Added"
- **Added** = New articles successfully ingested and stored in database
- **Cached** = Articles already exist in database (URL match), skipped to avoid duplicates

Example log:
```
[2025-10-25T19:42:09.406Z] Google News monitoring complete: 20 found, 5 added, 15 cached, rejected: 0 no-stocks + 0 no-image + 0 ads + 0 duplicates
```

Means:
- 20 articles found in feed
- 5 new articles added to database
- 15 articles already existed (by URL)
- 0 rejected for various reasons
