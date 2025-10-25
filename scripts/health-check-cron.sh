#!/usr/bin/env bash
# Health check monitoring cron job
# Runs every 5 minutes to ensure API is healthy

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

API_PORT=${API_PORT:-23000}
HEALTH_URL="http://localhost:$API_PORT/health"

# Check health endpoint
if ! response=$(curl -sf "$HEALTH_URL" 2>&1); then
  echo "[$(date)] ❌ Health check FAILED - API not responding"
  echo "[$(date)] Error: $response"
  exit 1
fi

# Parse status
status=$(echo "$response" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

if [ "$status" != "healthy" ]; then
  echo "[$(date)] ⚠️  Health check WARNING - Status: $status"
  echo "[$(date)] Response: $response"
  exit 1
fi

echo "[$(date)] ✅ Health check OK"
