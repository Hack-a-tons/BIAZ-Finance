// @ts-ignore - rss-parser doesn't have types
import Parser from 'rss-parser';
import { ingestArticle } from './ingest-article';
import { query } from '../db';

const parser = new Parser();

// Follow redirects to get actual URL
async function resolveUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      redirect: 'follow'
    });
    return response.url;
  } catch (error) {
    return url; // Return original if resolution fails
  }
}

const RSS_FEEDS = [
  'https://www.ft.com/technology?format=rss',
  'https://techcrunch.com/feed/',
  'https://www.reuters.com/technology/rss',
];

const GOOGLE_NEWS_QUERIES = [
  'Apple stock',
  'Tesla stock', 
  'NVIDIA earnings',
  'tech stocks',
];

export async function monitorRSSFeeds(): Promise<void> {
  console.log('Starting RSS feed monitoring...');
  
  let totalFound = 0;
  let ingested = 0;
  let skipped = 0;
  let cached = 0;

  for (const feedUrl of RSS_FEEDS) {
    try {
      console.log(`Fetching RSS: ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl);
      
      for (const item of feed.items.slice(0, 20)) {
        totalFound++;
        const url = item.link;
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

        // Check if already in database
        const existing = await query('SELECT id FROM articles WHERE url = $1', [url]);
        if (existing.rows.length > 0) {
          cached++;
          continue;
        }

        console.log(`Ingesting: ${item.title}`);
        try {
          await ingestArticle(url);
          ingested++;
        } catch (error) {
          console.error(`Failed to ingest ${url}:`, error);
        }

        // Rate limit: max 5 new articles per feed
        if (ingested >= 5) {
          console.log('Reached ingestion limit for this feed');
          break;
        }
      }
    } catch (error) {
      console.error(`RSS feed error (${feedUrl}):`, error);
    }
  }

  console.log(`RSS monitoring complete: ${totalFound} found, ${ingested} ingested, ${cached} cached, ${skipped} skipped`);
}

export async function monitorGoogleNews(): Promise<void> {
  console.log('Starting Google News monitoring...');
  
  let totalFound = 0;
  let ingested = 0;
  let cached = 0;

  for (const searchQuery of GOOGLE_NEWS_QUERIES) {
    try {
      const googleNewsUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=en-US&gl=US&ceid=US:en`;
      console.log(`Fetching Google News: ${searchQuery}`);
      
      const feed = await parser.parseURL(googleNewsUrl);
      
      for (const item of feed.items.slice(0, 10)) {
        totalFound++;
        const redirectUrl = item.link;
        if (!redirectUrl) continue;

        // Resolve Google News redirect to actual URL
        const url = await resolveUrl(redirectUrl);
        
        // Check if already in database
        const existing = await query('SELECT id FROM articles WHERE url = $1', [url]);
        if (existing.rows.length > 0) {
          cached++;
          continue;
        }

        console.log(`Ingesting: ${item.title}`);
        try {
          await ingestArticle(url);
          ingested++;
        } catch (error) {
          console.error(`Failed to ingest ${url}:`, error);
        }

        // Rate limit: max 3 new articles per query
        if (ingested >= 3) {
          console.log('Reached ingestion limit for this query');
          break;
        }
      }
    } catch (error) {
      console.error(`Google News error (${searchQuery}):`, error);
    }
  }

  console.log(`Google News monitoring complete: ${totalFound} found, ${ingested} ingested, ${cached} cached`);
}

export async function runFeedMonitoring(): Promise<void> {
  console.log('=== Starting Feed Monitoring ===');
  
  await monitorRSSFeeds();
  await monitorGoogleNews();
  
  console.log('=== Feed Monitoring Complete ===');
}
