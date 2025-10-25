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
  echo "$(date) [MONITOR] ERROR - .env not found in $SCRIPT_DIR"
  exit 1
fi

http_code=$(curl -X POST "${API_URL}/v1/admin/monitor-feeds" \
  -H "Content-Type: application/json" \
  -s -o /dev/null -w "%{http_code}")

echo "$(date) [MONITOR] HTTP $http_code - POST ${API_URL}/v1/admin/monitor-feeds"
