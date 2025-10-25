#!/usr/bin/env bash
# Stock price update cron job
# Runs every 15 minutes during market hours (9:30 AM - 4:00 PM ET, Mon-Fri)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# Check if market is open (9:30 AM - 4:00 PM ET, Mon-Fri)
# Convert current time to ET
HOUR=$(TZ=America/New_York date +%H)
MINUTE=$(TZ=America/New_York date +%M)
DAY=$(TZ=America/New_York date +%u) # 1=Mon, 7=Sun

# Skip weekends
if [ "$DAY" -gt 5 ]; then
  echo "[$(date)] Weekend - skipping price update"
  exit 0
fi

# Skip outside market hours (9:30 AM - 4:00 PM)
if [ "$HOUR" -lt 9 ] || [ "$HOUR" -gt 16 ]; then
  echo "[$(date)] Outside market hours - skipping price update"
  exit 0
fi

if [ "$HOUR" -eq 9 ] && [ "$MINUTE" -lt 30 ]; then
  echo "[$(date)] Before market open - skipping price update"
  exit 0
fi

# Trigger price update via API
echo "[$(date)] Triggering stock price update..."
curl -f -X POST http://localhost:${API_PORT:-23000}/v1/admin/update-prices || {
  echo "[$(date)] Failed to update prices"
  exit 1
}

echo "[$(date)] Stock prices updated successfully"
