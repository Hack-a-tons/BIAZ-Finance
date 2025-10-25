#!/usr/bin/env bash
# Stock price update cron job
# Runs every 15 minutes during market hours (9:30 AM - 4:00 PM ET, Mon-Fri)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

API_PORT=${API_PORT:-23000}
HOUR=$(TZ=America/New_York date +%H)
MINUTE=$(TZ=America/New_York date +%M)
DAY=$(TZ=America/New_York date +%u)

# Skip weekends
[ "$DAY" -gt 5 ] && { echo "$(date) [PRICES] SKIP - weekend"; exit 0; }

# Skip outside market hours (9:30 AM - 4:00 PM)
[ "$HOUR" -lt 9 ] || [ "$HOUR" -gt 16 ] && { echo "$(date) [PRICES] SKIP - outside market hours"; exit 0; }
[ "$HOUR" -eq 9 ] && [ "$MINUTE" -lt 30 ] && { echo "$(date) [PRICES] SKIP - before market open"; exit 0; }

http_code=$(curl -sf -X POST http://localhost:$API_PORT/v1/admin/update-prices -w "%{http_code}" -o /dev/null) || {
  echo "$(date) [PRICES] FAILED - HTTP $http_code POST localhost:$API_PORT/v1/admin/update-prices"
  exit 1
}

echo "$(date) [PRICES] OK - HTTP $http_code POST localhost:$API_PORT/v1/admin/update-prices"
