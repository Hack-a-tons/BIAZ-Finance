import axios from 'axios';
import * as cheerio from 'cheerio';
import type { FetchedArticle } from './fetch-article';

export async function fetchArticleRSS(url: string, rssItem?: any): Promise<FetchedArticle> {
  try {
    // If we have RSS item data, use it directly
    if (rssItem) {
      const domain = new URL(url).hostname.replace('www.', '');
      
      // Extract image from RSS
      let imageUrl = rssItem.enclosure?.url || 
                     rssItem['media:content']?.$?.url ||
                     rssItem['media:thumbnail']?.$?.url;
      
      // If no image in RSS, try to extract from content
      if (!imageUrl && rssItem.content) {
        const $ = cheerio.load(rssItem.content);
        imageUrl = $('img').first().attr('src');
      }
      
      return {
        title: rssItem.title || 'Untitled',
        summary: rssItem.contentSnippet || rssItem.summary || '',
        fullText: rssItem.content || rssItem.contentSnippet || rssItem.summary || '',
        publishedAt: rssItem.pubDate || rssItem.isoDate || new Date().toISOString(),
        sourceDomain: domain,
        imageUrl,
      };
    }
    
    // Fallback: fetch the page
    return await fetchArticleHTTP(url);
  } catch (error) {
    console.error('RSS fetch error:', error);
    throw error;
  }
}

async function fetchArticleHTTP(url: string): Promise<FetchedArticle> {
  const response = await axios.get(url, {
    timeout: 10000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; BIAZ-Finance/1.0)',
    },
  });
  
  const $ = cheerio.load(response.data);
  const domain = new URL(url).hostname.replace('www.', '');
  
  // Extract metadata
  const title = $('meta[property="og:title"]').attr('content') || 
                $('title').text() || 
                'Untitled';
  
  const description = $('meta[property="og:description"]').attr('content') || 
                      $('meta[name="description"]').attr('content') || 
                      '';
  
  const imageUrl = $('meta[property="og:image"]').attr('content') || 
                   $('meta[name="twitter:image"]').attr('content') ||
                   $('article img').first().attr('src');
  
  const publishedTime = $('meta[property="article:published_time"]').attr('content') ||
                        $('time').attr('datetime') ||
                        new Date().toISOString();
  
  // Extract article text
  const articleText = $('article').text() || 
                      $('main').text() || 
                      $('body').text();
  
  return {
    title: title.substring(0, 200),
    summary: description.substring(0, 300),
    fullText: articleText.substring(0, 5000),
    publishedAt: publishedTime,
    sourceDomain: domain,
    imageUrl: imageUrl ? makeAbsoluteUrl(imageUrl, url) : undefined,
  };
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
