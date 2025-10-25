# Changelog

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

### TODO: Impact Forecast Summary
- [ ] Generate custom forecast summary instead of using article summary
- [ ] Add forecast generation to article ingestion pipeline
- [ ] Store forecast in database and link to article
