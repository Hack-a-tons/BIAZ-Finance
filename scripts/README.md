# BIAZ Finance - Scripts

Management and monitoring scripts for BIAZ Finance API.

---

## Deployment

### deploy.sh

Deploy to remote server with optional commit.

```bash
./scripts/deploy.sh biaz.hurated.com
./scripts/deploy.sh -m "Update feature" biaz.hurated.com
./scripts/deploy.sh --help
```

**Options:**
- `-m MESSAGE` - Commit and push changes before deploying
- `-h, --help` - Show help

**What it does:**
1. Checks `.env` exists
2. (Optional) Commits and pushes changes
3. Copies `.env` to server
4. SSH to server, pulls code, rebuilds Docker, restarts containers

---

## Database Management

### cleanup-db.sh

Clean up old data and optimize database.

```bash
./scripts/cleanup-db.sh
```

**What it does:**
1. Archives articles older than 90 days (deletes with related data)
2. Cleans orphaned records (claims, forecasts without articles)
3. Vacuums database for performance
4. Shows statistics

**Automatic:** Runs weekly on Sunday at 3 AM (installed by `setup-cron.sh`)

**Manual trigger:**
```bash
./scripts/cleanup-db.sh
```

**Note:** This is a destructive operation. Old articles are permanently deleted.

---

### init-db.sh

Initialize database schema and seed data.

**Automatic:** Runs automatically when PostgreSQL container starts for the first time (mounted in `compose.yml`).

**Manual:** Can be executed directly in the container:
```bash
docker exec biaz-finance-postgres-1 psql -U biaz -d biaz_finance -f /docker-entrypoint-initdb.d/init-db.sh
```

**What it does:**
1. Creates all database tables (sources, articles, stocks, article_symbols, claims, claim_evidence, forecasts)
2. Seeds initial sources with credibility scores
3. Sets up indexes and constraints

**Note:** This script is mounted into the PostgreSQL container via `compose.yml` and runs automatically on first startup.

---

### db.sh

Inspect and query database on server.

```bash
./scripts/db.sh tables                    # List all tables
./scripts/db.sh count                     # Count rows in all tables
./scripts/db.sh count articles            # Count rows in specific table
./scripts/db.sh list articles             # List last 10 articles
./scripts/db.sh show articles art_001     # Show specific article
./scripts/db.sh schema articles           # Show table schema
./scripts/db.sh query "SELECT * FROM articles WHERE truth_score > 0.9"
```

**Actions:**
- `tables` - List all database tables
- `count [table]` - Show row counts
- `list <table>` - List items (last 10)
- `show <table> <id>` - Show specific item with related data
- `schema <table>` - Show table structure
- `query <sql>` - Run custom SQL query

**Features:**
- Shows timestamp at start
- Formatted output for common tables
- Shows related data (articles → symbols + claims)

---

## Stock Monitoring

### stocks.sh

Monitor and manage stock price data.

```bash
./scripts/stocks.sh cache           # Show cached prices (last 15 min)
./scripts/stocks.sh list             # List all stocks with article counts
./scripts/stocks.sh show AAPL        # Show details for specific stock
./scripts/stocks.sh update           # Update all stock prices
./scripts/stocks.sh update TSLA      # Update specific stock
```

**Actions:**
- `cache` - Show recently updated stocks (15-minute cache)
- `list` - All stocks with prices and article counts
- `show <symbol>` - Stock details + recent articles
- `update [symbol]` - Trigger price update

**Features:**
- Shows timestamp
- Real-time prices from Yahoo Finance
- Article counts per stock
- Recent articles mentioning stock

---

## Apify Management

### apify.sh

Monitor Apify actors and usage.

```bash
./scripts/apify.sh running          # Show currently running actors
./scripts/apify.sh recent            # Show recent runs (last 10)
./scripts/apify.sh scheduled         # Show scheduled runs
./scripts/apify.sh usage             # Show account usage and credits
./scripts/apify.sh actors            # List available actors
./scripts/apify.sh datasets          # List recent datasets
./scripts/apify.sh test <url>        # Test Website Content Crawler
```

**Options:**
- `-v, --verbose` - Show detailed output

**Features:**
- Monitor Apify spending
- Check actor execution status
- Test article extraction
- View account information

---

## Automated Monitoring

### setup-cron.sh

Install all cron jobs for automated monitoring.

```bash
./scripts/setup-cron.sh
```

**What it does:**
1. Creates logs directory
2. Installs RSS feed monitoring (every 30 minutes)
3. Installs stock price updates (every 15 minutes during market hours)
4. Shows installed jobs and log locations

**Cron jobs installed:**
- RSS monitoring: `*/30 * * * *` → `logs/monitor.log`
- Price updates: `*/15 * * * *` → `logs/prices.log`
- Article rescoring: `0 2 * * *` → `logs/rescore.log`
- Health checks: `*/5 * * * *` → `logs/health.log`
- Database cleanup: `0 3 * * 0` → `logs/cleanup.log`

**View logs:**
```bash
tail -f logs/monitor.log
tail -f logs/prices.log
```

---

### monitor-cron.sh

Cron job script for automated news feed monitoring.

**Runs:** Every 30 minutes (installed by `setup-cron.sh`)

**What it does:**
1. Triggers `POST /v1/admin/monitor-feeds`
2. Scrapes RSS feeds and Google News
3. Ingests new articles
4. Logs results to `logs/monitor.log`

**Manual trigger:**
```bash
./scripts/monitor-cron.sh
```

---

### update-prices-cron.sh

Cron job script for stock price updates.

**Runs:** Every 15 minutes during market hours (9:30 AM - 4:00 PM ET, Mon-Fri)

**What it does:**
1. Checks if market is open
2. Skips weekends and outside market hours
3. Triggers `POST /v1/admin/update-prices`
4. Updates all stock prices from Yahoo Finance
5. Logs results to `logs/prices.log`

**Manual trigger:**
```bash
./scripts/update-prices-cron.sh
```

**Market hours logic:**
- Monday-Friday only
- 9:30 AM - 4:00 PM Eastern Time
- Automatically skips holidays (no trading = no price changes)

---

## Testing

See [../tests/README.md](../tests/README.md) for API endpoint testing scripts.

See [../test.sh](../test.sh) for running all tests at once.

---

## Quick Reference

```bash
# Deploy
./scripts/deploy.sh -m "Update" biaz.hurated.com

# Check database
./scripts/db.sh count
./scripts/db.sh list articles

# Check stocks
./scripts/stocks.sh list
./scripts/stocks.sh update

# Monitor Apify
./scripts/apify.sh recent
./scripts/apify.sh usage

# Run all tests
./test.sh
./test.sh -v
```
