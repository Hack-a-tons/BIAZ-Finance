#!/usr/bin/env bash

cd "$(dirname "$0")"
source .env

VERBOSE=false
ACTION=""

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      echo "Usage: ./apify.sh [OPTIONS] ACTION"
      echo ""
      echo "Manage and monitor Apify actors"
      echo ""
      echo "Actions:"
      echo "  running          Show currently running actors"
      echo "  recent           Show recent runs (last 10)"
      echo "  scheduled        Show scheduled runs"
      echo "  usage            Show account usage and credits"
      echo "  actors           List available actors in store"
      echo "  datasets         List recent datasets"
      echo "  test <url>       Test Website Content Crawler with URL"
      echo ""
      echo "Options:"
      echo "  -h, --help       Show this help message"
      echo "  -v, --verbose    Show detailed output"
      echo ""
      echo "Examples:"
      echo "  ./apify.sh running"
      echo "  ./apify.sh recent"
      echo "  ./apify.sh -v usage"
      echo "  ./apify.sh test https://example.com/article"
      exit 0
      ;;
    -v|--verbose)
      VERBOSE=true
      shift
      ;;
    *)
      if [ -z "$ACTION" ]; then
        ACTION="$1"
      else
        URL="$1"
      fi
      shift
      ;;
  esac
done

[ -z "$ACTION" ] && ACTION="recent"

GRAY='\033[0;90m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

temp_file="./apify-temp.ts"

case $ACTION in
  running)
    cat > "$temp_file" << 'EOF'
import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';
dotenv.config();

const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

async function main() {
  const { items } = await client.runs().list({ status: 'RUNNING' });
  
  if (items.length === 0) {
    console.log('No actors currently running');
    return;
  }
  
  console.log(`Currently running: ${items.length} actor(s)\n`);
  items.forEach((run: any) => {
    console.log(`ID: ${run.id}`);
    console.log(`  Actor: ${run.actId}`);
    console.log(`  Started: ${new Date(run.startedAt).toLocaleString()}`);
    console.log('');
  });
}

main().catch(console.error);
EOF
    ;;
    
  recent)
    cat > "$temp_file" << 'EOF'
import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';
dotenv.config();

const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

async function main() {
  const { items } = await client.runs().list({ limit: 10 });
  
  if (items.length === 0) {
    console.log('No recent runs');
    return;
  }
  
  console.log(`Recent runs (last ${items.length}):\n`);
  items.forEach((run: any) => {
    const duration = run.finishedAt 
      ? Math.round((new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()) / 1000)
      : 'running';
    
    console.log(`${run.status === 'SUCCEEDED' ? '✓' : run.status === 'RUNNING' ? '⏳' : '✗'} ${run.id}`);
    console.log(`  Actor: ${run.actId}`);
    console.log(`  Status: ${run.status}`);
    console.log(`  Started: ${new Date(run.startedAt).toLocaleString()}`);
    console.log(`  Duration: ${duration}s`);
    console.log('');
  });
}

main().catch(console.error);
EOF
    ;;
    
  scheduled)
    cat > "$temp_file" << 'EOF'
import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';
dotenv.config();

const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

async function main() {
  const { items } = await client.schedules().list();
  
  if (items.length === 0) {
    console.log('No scheduled runs');
    return;
  }
  
  console.log(`Scheduled runs: ${items.length}\n`);
  items.forEach((schedule: any) => {
    console.log(`ID: ${schedule.id}`);
    console.log(`  Name: ${schedule.name || 'N/A'}`);
    console.log(`  Actor: ${schedule.actorId}`);
    console.log(`  Cron: ${schedule.cronExpression}`);
    console.log(`  Enabled: ${schedule.isEnabled}`);
    console.log('');
  });
}

main().catch(console.error);
EOF
    ;;
    
  usage)
    cat > "$temp_file" << 'EOF'
import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';
dotenv.config();

const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

async function main() {
  const user = await client.user(process.env.APIFY_USER_ID!).get();
  
  console.log('Account Information:\n');
  console.log(`User ID: ${user?.id}`);
  console.log(`Email: ${user?.email || 'N/A'}`);
  
  const plan: any = user?.plan;
  console.log(`Plan: ${plan?.name || plan?.id || JSON.stringify(plan) || 'N/A'}`);
  console.log('');
  
  // Get usage stats
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  
  console.log('Current Month Usage:');
  console.log(`  Period: ${firstDay.toLocaleDateString()} - ${now.toLocaleDateString()}`);
  console.log('');
  console.log('For detailed usage and credits:');
  console.log('  https://console.apify.com/billing');
}

main().catch(console.error);
EOF
    ;;
    
  actors)
    cat > "$temp_file" << 'EOF'
import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';
dotenv.config();

const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

async function main() {
  console.log('Popular Apify Actors for News/Content:\n');
  
  const actors = [
    { id: 'apify/website-content-crawler', desc: 'Extract content from websites' },
    { id: 'apify/google-news-scraper', desc: 'Scrape Google News articles' },
    { id: 'apify/rss-feed-scraper', desc: 'Scrape RSS feeds' },
    { id: 'apify/web-scraper', desc: 'General web scraping' },
    { id: 'apify/cheerio-scraper', desc: 'Fast HTML scraping' },
  ];
  
  for (const actor of actors) {
    try {
      const info = await client.actor(actor.id).get();
      console.log(`✓ ${actor.id}`);
      console.log(`  ${actor.desc}`);
      console.log(`  Runs: ${info?.stats?.totalRuns || 0}`);
      console.log('');
    } catch (e) {
      console.log(`? ${actor.id}`);
      console.log(`  ${actor.desc}`);
      console.log('');
    }
  }
  
  console.log('Browse more: https://apify.com/store');
}

main().catch(console.error);
EOF
    ;;
    
  datasets)
    cat > "$temp_file" << 'EOF'
import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';
dotenv.config();

const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

async function main() {
  const { items } = await client.datasets().list({ limit: 10 });
  
  if (items.length === 0) {
    console.log('No recent datasets');
    return;
  }
  
  console.log(`Recent datasets (last ${items.length}):\n`);
  items.forEach((dataset: any) => {
    console.log(`ID: ${dataset.id}`);
    console.log(`  Items: ${dataset.itemCount}`);
    console.log(`  Created: ${new Date(dataset.createdAt).toLocaleString()}`);
    console.log('');
  });
}

main().catch(console.error);
EOF
    ;;
    
  test)
    if [ -z "$URL" ]; then
      echo "Error: URL required for test action"
      echo "Usage: ./apify.sh test <url>"
      exit 1
    fi
    
    cat > "$temp_file" << EOF
import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';
dotenv.config();

const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

async function main() {
  console.log('Testing Website Content Crawler...');
  console.log('URL: $URL\n');
  
  const run = await client.actor('apify/website-content-crawler').call({
    startUrls: [{ url: '$URL' }],
    maxCrawlDepth: 0,
    maxCrawlPages: 1,
  });
  
  console.log('Run ID:', run.id);
  console.log('Status:', run.status);
  console.log('');
  
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  
  if (items.length === 0) {
    console.log('No content extracted');
    return;
  }
  
  const item: any = items[0];
  console.log('Extracted:');
  console.log('  Title:', item.metadata?.title || 'N/A');
  console.log('  Text:', (item.text || '').length, 'chars');
  console.log('  Markdown:', (item.markdown || '').length, 'chars');
  console.log('');
  console.log('Preview:');
  console.log((item.text || item.markdown || '').substring(0, 300));
}

main().catch(console.error);
EOF
    ;;
    
  *)
    echo "Unknown action: $ACTION"
    echo "Try './apify.sh --help' for usage"
    exit 1
    ;;
esac

if [ "$VERBOSE" = true ]; then
  npx ts-node "$temp_file" 2>&1
else
  npx ts-node "$temp_file" 2>&1 | grep -v "DeprecationWarning"
fi

rm -f "$temp_file"
