# Logging Configuration

## Timestamp Format

All logs now include ISO 8601 timestamps in the format:
```
[2025-10-25T19:30:45.123Z] Log message here
```

## Application Logs

### Ingestion Warnings (Not Errors)
The following conditions are logged as **warnings** (not errors) since they're expected filtering behavior:

- **No stock symbols found** - Article doesn't mention any tracked stocks
  ```
  [2025-10-25T19:30:45.123Z] Skipping article (no stock symbols): https://example.com/article
  ```

- **No valid image** - Article image URL failed validation (404, wrong content-type, timeout)
  ```
  [2025-10-25T19:30:45.123Z] Skipping article (no valid image): https://example.com/article
  ```

- **Advertisement detected** - Article contains subscription/paywall keywords
  ```
  [2025-10-25T19:30:45.123Z] Skipping article (advertisement): https://example.com/article
  ```

These are normal filtering operations, not system errors.

### Ingestion Process Logs
```
[2025-10-25T19:30:45.123Z] Ingesting article: https://example.com/article
[2025-10-25T19:30:46.456Z] Fetched via rss: Article Title
[2025-10-25T19:30:46.789Z] Source: src_financialtimes
[2025-10-25T19:30:47.012Z] Symbols: AAPL, TSLA
[2025-10-25T19:30:50.345Z] Extracted 5 claims
[2025-10-25T19:30:55.678Z] Verified 4 claims
[2025-10-25T19:30:55.901Z] Truth score: 0.85
[2025-10-25T19:30:56.234Z] Article ingested: art_1729876256234
```

### Feed Monitoring Logs
```
[2025-10-25T19:00:00.123Z] Starting RSS feed monitoring...
[2025-10-25T19:00:00.456Z] Fetching RSS: https://www.ft.com/technology?format=rss
[2025-10-25T19:00:02.789Z] Ingesting: Apple announces new AI features
[2025-10-25T19:00:15.012Z] RSS monitoring complete: 20 found, 3 ingested, 15 cached, 2 skipped
```

## Docker Compose Logging

### Configuration
All containers use JSON file logging with rotation:
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"    # Rotate after 10MB
    max-file: "3"      # Keep 3 rotated files
```

### Viewing Logs
```bash
# All logs with timestamps
docker compose logs

# Follow logs in real-time
docker compose logs -f

# Last 100 lines
docker compose logs --tail=100

# Specific service
docker compose logs api

# Check for errors
docker compose logs | grep -Ei 'err|fatal'
```

## Cron Job Logs

All cron jobs use uppercase tags and single-line format:
```
Sat Oct 25 19:00:02 UTC 2025 [HEALTH] OK - http://localhost:23000/health status=healthy
Sat Oct 25 19:00:02 UTC 2025 [MONITOR] HTTP 200 - POST https://api.news.biaz.hurated.com/v1/admin/monitor-feeds
Sat Oct 25 19:00:02 UTC 2025 [PRICES] SKIP - weekend
Sun Oct 26 02:00:15 UTC 2025 [RESCORE] OK - re-scored 13 articles from last 7 days
Sun Oct 26 03:00:45 UTC 2025 [CLEANUP] OK - archived 5 old articles, vacuumed database
```

Log files:
- `/home/dbystruev/BIAZ-Finance/logs/health.log`
- `/home/dbystruev/BIAZ-Finance/logs/monitor.log`
- `/home/dbystruev/BIAZ-Finance/logs/prices.log`
- `/home/dbystruev/BIAZ-Finance/logs/rescore.log`
- `/home/dbystruev/BIAZ-Finance/logs/cleanup.log`

## Rate Limiting

### Trust Proxy Configuration
Express is configured to trust the nginx proxy:
```typescript
app.set('trust proxy', 1);
```

This fixes the `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` warning and ensures rate limiting works correctly behind nginx.

### Rate Limits
- **General**: 100 requests/minute per IP
- **AI operations**: 20 requests/5 minutes per IP

## Fixed Issues

1. ✅ **Trust proxy warning** - Added `app.set('trust proxy', 1)` for nginx
2. ✅ **Ingestion "errors"** - Changed to warnings with descriptive messages
3. ✅ **Missing timestamps** - Added ISO 8601 timestamps to all logs
4. ✅ **Docker log rotation** - Configured 10MB max size, 3 file rotation
5. ✅ **Cron log format** - Standardized to single-line with uppercase tags
