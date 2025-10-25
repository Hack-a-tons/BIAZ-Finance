#!/usr/bin/env bash
# Setup cron jobs for BIAZ Finance

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Setting up cron jobs for BIAZ Finance..."

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

# Get current crontab
TEMP_CRON=$(mktemp)
crontab -l > "$TEMP_CRON" 2>/dev/null || true

# Remove existing BIAZ Finance jobs
sed -i.bak '/BIAZ-Finance/d' "$TEMP_CRON"

# Add new jobs
cat >> "$TEMP_CRON" << EOF

# BIAZ Finance - RSS Feed Monitoring (every 30 minutes)
*/30 * * * * $PROJECT_DIR/scripts/monitor-cron.sh >> $PROJECT_DIR/logs/monitor.log 2>&1

# BIAZ Finance - Stock Price Updates (every 15 minutes during market hours)
*/15 * * * * $PROJECT_DIR/scripts/update-prices-cron.sh >> $PROJECT_DIR/logs/prices.log 2>&1
EOF

# Install new crontab
crontab "$TEMP_CRON"
rm "$TEMP_CRON" "$TEMP_CRON.bak" 2>/dev/null || true

echo "✅ Cron jobs installed:"
echo "   - RSS monitoring: every 30 minutes"
echo "   - Price updates: every 15 minutes (market hours only)"
echo ""
echo "Logs:"
echo "   - Monitor: $PROJECT_DIR/logs/monitor.log"
echo "   - Prices: $PROJECT_DIR/logs/prices.log"
echo ""
echo "To view cron jobs: crontab -l"
