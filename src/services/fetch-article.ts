import { ApifyClient } from 'apify-client';
import axios from 'axios';
import * as cheerio from 'cheerio';

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

export interface FetchedArticle {
  title: string;
  summary: string;
  fullText: string;
  publishedAt: string;
  sourceDomain: string;
  imageUrl?: string; // Now optional again for fallback
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

    const item: any = items[0];
    const domain = new URL(url).hostname.replace('www.', '');
    
    // Extract text content
    const fullText = (item.text || item.markdown || '') as string;
    const title = (item.metadata?.title as string) || extractTitle(fullText);
    const summary = generateSummary(fullText);
    const publishedAt = (item.metadata?.publishedTime as string) || new Date().toISOString();
    
    // Extract image - try multiple methods
    let imageUrl = (item.metadata?.image || item.metadata?.ogImage) as string | undefined;
    
    if (!imageUrl) {
      // Fallback: scrape the page directly for images
      const extracted = await extractImageFromUrl(url);
      if (extracted) imageUrl = extracted;
    }
    
    // Image is optional - will use stock-based illustration if not found

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
    throw error;
  }
}

async function extractImageFromUrl(url: string): Promise<string | null> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BIAZ-Finance/1.0)',
      },
    });
    
    const $ = cheerio.load(response.data);
    
    // Try Open Graph image
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage && isValidImageUrl(ogImage)) return ogImage;
    
    // Try Twitter card image
    const twitterImage = $('meta[name="twitter:image"]').attr('content');
    if (twitterImage && isValidImageUrl(twitterImage)) return twitterImage;
    
    // Try article images
    const articleImage = $('article img').first().attr('src');
    if (articleImage && isValidImageUrl(articleImage)) {
      return makeAbsoluteUrl(articleImage, url);
    }
    
    // Try any large image
    const largeImage = $('img[width], img[height]').filter((_, el) => {
      const width = parseInt($(el).attr('width') || '0');
      const height = parseInt($(el).attr('height') || '0');
      return width >= 400 || height >= 300;
    }).first().attr('src');
    
    if (largeImage && isValidImageUrl(largeImage)) {
      return makeAbsoluteUrl(largeImage, url);
    }
    
    return null;
  } catch (error) {
    console.error('Image extraction error:', error);
    return null;
  }
}

function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i) !== null;
}

function makeAbsoluteUrl(imageUrl: string, baseUrl: string): string {
  if (imageUrl.startsWith('http')) return imageUrl;
  if (imageUrl.startsWith('//')) return 'https:' + imageUrl;
  
  const base = new URL(baseUrl);
  if (imageUrl.startsWith('/')) {
    return `${base.protocol}//${base.host}${imageUrl}`;
  }
  return `${base.protocol}//${base.host}/${imageUrl}`;
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
