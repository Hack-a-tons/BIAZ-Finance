# Apify Plan Upgrade (Optional)

## Current Status

**Free Tier Limits:**
- Memory: 8192MB (currently exhausted)
- Actor runs: Limited

**Current Solution:**
- ✅ RSS parsing (Method 1) - No limits, working great
- ✅ HTTP + Cheerio (Method 2) - No limits, fallback
- ⚠️ Apify (Method 3) - Limited by free tier

## Why Upgrade?

**Benefits of Paid Apify:**
- More robust scraping for complex sites
- Better JavaScript rendering
- Higher success rate on paywalled content
- More memory for concurrent scraping

**Current Performance:**
- RSS method handles 90%+ of articles successfully
- HTTP method covers most edge cases
- Apify only needed for very complex sites

## Upgrade Options

### Personal Plan - $49/month
- 100GB memory
- Unlimited actor runs
- Good for production use

### Team Plan - $499/month
- 1TB memory
- Priority support
- Good for high-volume production

## How to Upgrade

1. Go to https://console.apify.com/billing/subscription
2. Select plan
3. Add payment method
4. No code changes needed - system will automatically use Apify when available

## Recommendation

**For Hackathon:**
- ✅ Current free tier + RSS/HTTP methods are sufficient
- ✅ 13+ articles ingested successfully
- ✅ No upgrade needed for demo

**For Production:**
- Consider upgrade if:
  - Need >100 articles/day
  - Scraping complex paywalled sites
  - Want higher reliability
- Otherwise, RSS/HTTP methods work great

## Current Performance

```bash
# Check article count
curl -s "https://api.news.biaz.hurated.com/v1/articles" | jq '.pagination.total'

# Check fetch methods used
ssh biaz.hurated.com "docker logs biaz-finance-api-1 | grep 'Fetched via'"
```

**Result:** RSS method handling all articles successfully, no Apify needed currently.
