#!/usr/bin/env bash
# Add forecast_summary column to articles table

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "Running migration: add forecast_summary column..."

docker compose exec -T postgres psql -U biaz -d biaz_finance < migrations/add_forecast_summary.sql

echo "Migration complete!"
