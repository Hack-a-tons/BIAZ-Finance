import { ApifyClient } from 'apify-client';
import { ingestArticle } from './ingest-article';

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

const RSS_FEEDS = [
  'https://www.ft.com/technology?format=rss',
  'https://techcrunch.com/feed/',
  'https://www.reuters.com/technology/rss',
  'https://feeds.bloomberg.com/technology/news.rss',
];

const GOOGLE_NEWS_QUERIES = [
  'Apple stock',
  'Tesla stock',
  'NVIDIA earnings',
  'tech stocks',
  'stock market news',
];

export async function monitorRSSFeeds(): Promise<void> {
  console.log('Starting RSS feed monitoring...');
  
  try {
    const run = await client.actor('apify/rss-feed-scraper').call({
      feedUrls: RSS_FEEDS,
      maxItems: 50,
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    console.log(`Found ${items.length} RSS items`);

    let ingested = 0;
    let skipped = 0;

    for (const item: any of items) {
      try {
        const url = item.link || item.url;
        if (!url) continue;

        // Filter: only articles with stock-related keywords
        const title = (item.title || '').toLowerCase();
        const hasStockKeywords = ['stock', 'earnings', 'revenue', 'shares', 'market', 'aapl', 'tsla', 'nvda'].some(
          keyword => title.includes(keyword)
        );

        if (!hasStockKeywords) {
          skipped++;
          continue;
        }

        console.log(`Ingesting: ${item.title}`);
        await ingestArticle(url);
        ingested++;

        // Rate limit: don't overwhelm the system
        if (ingested >= 10) {
          console.log('Reached ingestion limit for this run');
          break;
        }
      } catch (error) {
        console.error(`Failed to ingest ${item.link}:`, error);
      }
    }

    console.log(`RSS monitoring complete: ${ingested} ingested, ${skipped} skipped`);
  } catch (error) {
    console.error('RSS monitoring error:', error);
  }
}

export async function monitorGoogleNews(): Promise<void> {
  console.log('Starting Google News monitoring...');
  
  try {
    const run = await client.actor('apify/google-news-scraper').call({
      searchQueries: GOOGLE_NEWS_QUERIES,
      maxArticles: 20,
      language: 'en',
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    console.log(`Found ${items.length} Google News items`);

    let ingested = 0;

    for (const item: any of items) {
      try {
        const url = item.link || item.url;
        if (!url) continue;

        console.log(`Ingesting: ${item.title}`);
        await ingestArticle(url);
        ingested++;

        if (ingested >= 10) {
          console.log('Reached ingestion limit for this run');
          break;
        }
      } catch (error) {
        console.error(`Failed to ingest ${item.link}:`, error);
      }
    }

    console.log(`Google News monitoring complete: ${ingested} ingested`);
  } catch (error) {
    console.error('Google News monitoring error:', error);
  }
}

export async function runFeedMonitoring(): Promise<void> {
  console.log('=== Starting Feed Monitoring ===');
  
  await monitorRSSFeeds();
  await monitorGoogleNews();
  
  console.log('=== Feed Monitoring Complete ===');
}
