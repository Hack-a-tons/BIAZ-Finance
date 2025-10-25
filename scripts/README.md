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

### init-db.sh

Initialize database schema and seed data.

```bash
./scripts/init-db.sh
```

**What it does:**
1. Creates all database tables
2. Seeds initial sources with credibility scores
3. Sets up indexes and constraints

**Note:** Run this once during initial setup or after database reset.

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

### monitor-cron.sh

Cron job script for automated news feed monitoring.

**Setup:**
```bash
# On server, add to crontab:
crontab -e

# Add this line (adjust path):
*/30 * * * * /root/BIAZ-Finance/scripts/monitor-cron.sh >> /root/BIAZ-Finance/monitor.log 2>&1

# Check logs:
tail -f /root/BIAZ-Finance/monitor.log
```

**What it does:**
1. Runs every 30 minutes (or as configured)
2. Triggers `POST /v1/admin/monitor-feeds`
3. Scrapes RSS feeds and Google News
4. Ingests new articles
5. Logs results

**Manual trigger:**
```bash
./scripts/monitor-cron.sh
```

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
