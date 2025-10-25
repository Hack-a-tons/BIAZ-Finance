#!/usr/bin/env bash
# Health check monitoring cron job
# Runs every 5 minutes to ensure API is healthy

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

API_PORT=${API_PORT:-23000}
HEALTH_URL="http://localhost:$API_PORT/health"

response=$(curl -sf "$HEALTH_URL" 2>&1) || {
  echo "$(date) [health-check-cron.sh] FAILED - $HEALTH_URL not responding"
  exit 1
}

status=$(echo "$response" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

if [ "$status" != "healthy" ]; then
  echo "$(date) [health-check-cron.sh] WARNING - $HEALTH_URL status=$status"
  exit 1
fi

echo "$(date) [health-check-cron.sh] OK - $HEALTH_URL status=healthy"
