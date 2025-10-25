// @ts-ignore - rss-parser doesn't have types
import Parser from 'rss-parser';
import { ingestArticle } from './ingest-article';
import { query } from '../db';

const parser = new Parser();
const log = (msg: string) => console.log(`[${new Date().toISOString()}] ${msg}`);

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
  log('Starting RSS feed monitoring...');
  
  let totalFound = 0;
  let ingested = 0;
  let skipped = 0;
  let cached = 0;
  let rejectedNoStocks = 0;
  let rejectedNoImage = 0;
  let rejectedAd = 0;
  let rejectedDuplicate = 0;
  let failed = 0;

  for (const feedUrl of RSS_FEEDS) {
    try {
      log(`Fetching RSS: ${feedUrl}`);
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

        log(`Ingesting: ${item.title}`);
        try {
          // Try all 3 methods in parallel, use first successful result
          const results = await Promise.allSettled([
            ingestArticle(url, undefined, item, 'rss'),
            ingestArticle(url, undefined, item, 'http'),
            ingestArticle(url, undefined, item, 'apify')
          ]);
          
          const success = results.find(r => r.status === 'fulfilled');
          if (success) {
            ingested++;
          } else {
            // Track rejection reasons
            const reasons = results.map(r => r.status === 'rejected' ? r.reason?.message : '').filter(Boolean);
            if (reasons.some(r => r.includes('no stock symbols'))) rejectedNoStocks++;
            else if (reasons.some(r => r.includes('no valid') || r.includes('no unique'))) rejectedNoImage++;
            else if (reasons.some(r => r.includes('duplicate'))) rejectedDuplicate++;
            else if (reasons.some(r => r.includes('advertisement'))) rejectedAd++;
            else {
              failed++;
              if (failed === 1 && reasons.length > 0) console.warn(`[${new Date().toISOString()}] Untracked: ${reasons[0]}`);
            }
          }
        } catch (error) {
          failed++;
        }

        // Rate limit: max 5 new articles per feed
        if (ingested >= 5) {
          log('Reached ingestion limit for this feed');
          break;
        }
      }
    } catch (error: any) {
      console.warn(`[${new Date().toISOString()}] RSS feed failed (${feedUrl}): ${error.message}`);
    }
  }

  log(`RSS monitoring complete: ${totalFound} found, ${ingested} added, ${cached} cached, ${skipped} skipped, rejected: ${rejectedNoStocks} no-stocks + ${rejectedNoImage} no-image + ${rejectedAd} ads + ${rejectedDuplicate} duplicates + ${failed} other`);
}

export async function monitorGoogleNews(): Promise<void> {
  log('Starting Google News monitoring...');
  
  let totalFound = 0;
  let ingested = 0;
  let cached = 0;
  let rejectedNoStocks = 0;
  let rejectedNoImage = 0;
  let rejectedAd = 0;
  let rejectedDuplicate = 0;
  let failed = 0;

  for (const searchQuery of GOOGLE_NEWS_QUERIES) {
    try {
      const googleNewsUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=en-US&gl=US&ceid=US:en`;
      log(`Fetching Google News: ${searchQuery}`);
      
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

        log(`Ingesting: ${item.title}`);
        try {
          // Try all 3 methods in parallel, use first successful result
          const results = await Promise.allSettled([
            ingestArticle(url, undefined, item, 'rss'),
            ingestArticle(url, undefined, item, 'http'),
            ingestArticle(url, undefined, item, 'apify')
          ]);
          
          const success = results.find(r => r.status === 'fulfilled');
          if (success) {
            ingested++;
          } else {
            // Track rejection reasons
            const reasons = results.map(r => r.status === 'rejected' ? r.reason?.message : '').filter(Boolean);
            if (reasons.some(r => r.includes('no stock symbols'))) rejectedNoStocks++;
            else if (reasons.some(r => r.includes('no valid') || r.includes('no unique'))) rejectedNoImage++;
            else if (reasons.some(r => r.includes('duplicate'))) rejectedDuplicate++;
            else if (reasons.some(r => r.includes('advertisement'))) rejectedAd++;
            else {
              failed++;
              if (failed === 1 && reasons.length > 0) console.warn(`[${new Date().toISOString()}] Untracked: ${reasons[0]}`);
            }
          }
        } catch (error) {
          failed++;
        }

        // Rate limit: max 3 new articles per query
        if (ingested >= 3) {
          log('Reached ingestion limit for this query');
          break;
        }
      }
    } catch (error: any) {
      console.warn(`[${new Date().toISOString()}] Google News failed (${searchQuery}): ${error.message}`);
    }
  }

  log(`Google News monitoring complete: ${totalFound} found, ${ingested} added, ${cached} cached, rejected: ${rejectedNoStocks} no-stocks + ${rejectedNoImage} no-image + ${rejectedAd} ads + ${rejectedDuplicate} duplicates + ${failed} other`);
}

export async function runFeedMonitoring(): Promise<void> {
  log('=== Starting Feed Monitoring ===');
  
  await monitorRSSFeeds();
  await monitorGoogleNews();
  
  log('=== Feed Monitoring Complete ===');
}
