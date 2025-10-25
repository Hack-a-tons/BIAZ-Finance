#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SCRIPT_DIR"

./scripts/cleanup-db.sh > /tmp/cleanup-output.txt 2>&1 || {
  echo "$(date) [cleanup-cron.sh] FAILED - cleanup-db.sh exited with error"
  exit 1
}

archived=$(grep "Archived" /tmp/cleanup-output.txt | grep -o "[0-9]* articles" | cut -d' ' -f1 || echo "0")
echo "$(date) [cleanup-cron.sh] OK - archived $archived old articles, vacuumed database"
