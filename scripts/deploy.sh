#!/usr/bin/env bash

cd "$(dirname "$0")/.."
set -e

COMMIT_MSG=""

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      echo "Usage: ./deploy.sh [OPTIONS] [SERVER]"
      echo ""
      echo "Deploy BIAZ Finance API to remote server"
      echo ""
      echo "Options:"
      echo "  -h, --help       Show this help message"
      echo "  -m MESSAGE       Commit and push changes before deploying"
      echo ""
      echo "Example:"
      echo "  ./deploy.sh biaz.hurated.com"
      echo "  ./deploy.sh -m 'Update API endpoints' biaz.hurated.com"
      exit 0
      ;;
    -m)
      COMMIT_MSG="$2"
      shift 2
      ;;
    *)
      SERVER="$1"
      shift
      ;;
  esac
done

if [ -z "$SERVER" ]; then
  echo "Error: SERVER parameter required"
  echo "Usage: ./deploy.sh [OPTIONS] SERVER"
  echo "Try './deploy.sh --help' for more information"
  exit 1
fi

if [ ! -f .env ]; then
  echo "Error: .env file not found"
  exit 1
fi

if [ -n "$COMMIT_MSG" ]; then
  echo "Committing and pushing changes..."
  git add .
  git commit -m "$COMMIT_MSG"
  git push
fi

echo "Deploying to $SERVER..."
scp .env "$SERVER:~/BIAZ-Finance/"
ssh "$SERVER" 'cd BIAZ-Finance && git pull && docker compose build && docker compose up -d'

echo "Deployment complete!"
