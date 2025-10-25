#!/usr/bin/env bash

# Cron job to monitor news feeds every 30 minutes
# Add to crontab with absolute path:
# */30 * * * * /root/BIAZ-Finance/scripts/monitor-cron.sh >> /root/BIAZ-Finance/monitor.log 2>&1

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SCRIPT_DIR"

# Load environment variables
if [ -f .env ]; then
  source .env
else
  echo "[$(date)] ERROR: .env file not found in $SCRIPT_DIR"
  exit 1
fi

echo "[$(date)] Starting feed monitoring..."

curl -X POST "${API_URL}/v1/admin/monitor-feeds" \
  -H "Content-Type: application/json" \
  -s -o /dev/null -w "HTTP %{http_code}\n"

echo "[$(date)] Feed monitoring triggered"
