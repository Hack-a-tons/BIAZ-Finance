import { ApifyClient } from 'apify-client';

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

export interface FetchedArticle {
  title: string;
  summary: string;
  fullText: string;
  publishedAt: string;
  sourceDomain: string;
  imageUrl?: string;
}

export async function fetchArticle(url: string): Promise<FetchedArticle> {
  try {
    // Use Apify's Website Content Crawler
    const run = await client.actor('apify/website-content-crawler').call({
      startUrls: [{ url }],
      maxCrawlDepth: 0,
      maxCrawlPages: 1,
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    
    if (!items || items.length === 0) {
      throw new Error('No content extracted from URL');
    }

    const item = items[0];
    const domain = new URL(url).hostname.replace('www.', '');
    
    // Extract text content
    const fullText = item.text || item.markdown || '';
    const title = item.metadata?.title || extractTitle(fullText);
    const summary = generateSummary(fullText);
    const publishedAt = item.metadata?.publishedTime || new Date().toISOString();
    const imageUrl = item.metadata?.image || item.metadata?.ogImage;

    return {
      title,
      summary,
      fullText,
      publishedAt,
      sourceDomain: domain,
      imageUrl,
    };
  } catch (error) {
    console.error('Apify fetch error:', error);
    throw new Error(`Failed to fetch article: ${error}`);
  }
}

function extractTitle(text: string): string {
  const lines = text.split('\n').filter(l => l.trim());
  return lines[0]?.substring(0, 200) || 'Untitled Article';
}

function generateSummary(text: string, maxLength = 300): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength).trim() + '...';
}
