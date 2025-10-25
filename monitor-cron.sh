#!/usr/bin/env bash

# Cron job to monitor news feeds every 30 minutes
# Add to crontab: */30 * * * * /path/to/monitor-cron.sh

cd "$(dirname "$0")"
source .env

echo "[$(date)] Starting feed monitoring..."

curl -X POST "${API_URL}/v1/admin/monitor-feeds" \
  -H "Content-Type: application/json" \
  -s -o /dev/null -w "HTTP %{http_code}\n"

echo "[$(date)] Feed monitoring triggered"
