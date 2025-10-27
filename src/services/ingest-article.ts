import { query } from '../db';
import { fetchArticle } from './fetch-article';
import { fetchArticleRSS } from './fetch-article-rss';
import { matchSource } from './match-source';
import { extractSymbols } from './extract-symbols';
import { extractClaims } from '../ai/extract-claims';
import { verifyClaims, calculateTruthScore } from '../ai/verify-claims';
import type { Article } from '../models';

export async function ingestArticle(url: string, manualSymbol?: string, rssItem?: any, method: 'apify' | 'rss' | 'http' = 'apify', directContent?: string, directTitle?: string): Promise<Article> {
  try {
    console.log(`[${new Date().toISOString()}] Ingesting article: ${url}`);

    // Check if article already exists
    const existing = await query('SELECT id FROM articles WHERE url = $1', [url]);
    if (existing.rows.length > 0) {
      console.log(`[${new Date().toISOString()}] Article already exists: ${existing.rows[0].id}`);
      // Return existing article with full details
      const articleId = existing.rows[0].id;
      const articleResult = await query(
        'SELECT * FROM articles WHERE id = $1',
        [articleId]
      );
      const symbolsResult = await query(
        'SELECT symbol FROM article_symbols WHERE article_id = $1',
        [articleId]
      );
      const claimsResult = await query(
        'SELECT c.*, array_agg(ce.url) as evidence_links FROM claims c LEFT JOIN claim_evidence ce ON c.id = ce.claim_id WHERE c.article_id = $1 GROUP BY c.id',
        [articleId]
      );
      
      const article = articleResult.rows[0];
      return {
        id: article.id,
        title: article.title,
        summary: article.summary,
        url: article.url,
        imageUrl: article.image_url,
        publishedAt: article.published_at,
        source: article.source_id,
        symbols: symbolsResult.rows.map(r => r.symbol),
        truthScore: parseFloat(article.truth_score),
        impactSentiment: article.impact_sentiment,
        claims: claimsResult.rows.map(c => ({
          id: c.id,
          text: c.text,
          verified: c.verified,
          confidence: parseFloat(c.confidence),
          evidenceLinks: c.evidence_links.filter((l: string) => l !== null)
        })),
        explanation: article.explanation,
        forecastId: null
      };
    }

    // 1. Fetch article content - skip if content provided directly
    let fetched;
    
    if (directContent) {
      fetched = {
        title: directTitle || 'Demo Article',
        content: directContent,
        url,
        publishedAt: new Date().toISOString()
      };
    } else {
      let fetchMethod = method;
      try {
        if (method === 'rss' || rssItem) {
          fetched = await fetchArticleRSS(url, rssItem);
          fetchMethod = 'rss';
        } else if (method === 'http') {
          fetched = await fetchArticleRSS(url);
          fetchMethod = 'http';
        } else {
          fetched = await fetchArticle(url);
          fetchMethod = 'apify';
        }
      } catch (error) {
        console.log(`[${new Date().toISOString()}] ${fetchMethod} fetch failed, trying fallback...`);
        if (fetchMethod === 'apify') {
          try {
            fetched = await fetchArticleRSS(url, rssItem);
            fetchMethod = 'http';
          } catch (e) {
            throw new Error(`All fetch methods failed: ${error}`);
          }
        } else {
          throw error;
        }
      }
    }
    
    console.log(`[${new Date().toISOString()}] Fetched via ${fetchMethod}: ${fetched.title}`);

    // 2. Match or create source
    const sourceId = await matchSource(fetched.sourceDomain);
    console.log(`[${new Date().toISOString()}] Source: ${sourceId}`);

    // 3. Extract symbols
    const symbols = await extractSymbols(fetched.title, fetched.fullText, manualSymbol);
    console.log(`[${new Date().toISOString()}] Symbols: ${symbols.join(', ')}`);
    
    // Reject articles without stocks
    if (symbols.length === 0) {
      console.warn(`[${new Date().toISOString()}] Skipping article (no stock symbols): ${url}`);
      throw new Error('No stock symbols found in article');
    }
    
    // Reject advertisement articles
    const lowerTitle = fetched.title.toLowerCase();
    const lowerText = fetched.fullText.toLowerCase();
    const adKeywords = ['subscribe to', 'sign up', 'get access', 'become a member', 'join now', 'premium content'];
    const isAd = adKeywords.some(keyword => lowerTitle.includes(keyword) || lowerText.substring(0, 500).includes(keyword));
    
    if (isAd) {
      console.warn(`[${new Date().toISOString()}] Skipping article (advertisement): ${url}`);
      throw new Error('Article appears to be an advertisement');
    }

    // 4. Extract claims
    const extractedClaims = await extractClaims(fetched.fullText, fetched.title);
    console.log(`[${new Date().toISOString()}] Extracted ${extractedClaims.length} claims`);

    // 5. Verify claims
    const verifiedClaims = await verifyClaims(extractedClaims, fetched.fullText);
    console.log(`[${new Date().toISOString()}] Verified ${verifiedClaims.filter(c => c.verified).length} claims`);

    // 6. Calculate truth score
    const truthScore = calculateTruthScore(verifiedClaims);
    console.log(`[${new Date().toISOString()}] Truth score: ${truthScore.toFixed(2)}`);

    // 7. Determine impact sentiment
    const impactSentiment = determineImpactSentiment(verifiedClaims, fetched.fullText);

    // 8. Generate forecast summary
    const { generateForecastSummary } = await import('../ai/generate-forecast');
    const forecastSummary = await generateForecastSummary(
      { title: fetched.title, fullText: fetched.fullText, truthScore },
      symbols
    );
    console.log(`[${new Date().toISOString()}] Generated forecast summary`);

    // 9. Store in database
    const articleId = `art_${Date.now()}`;
    
    // Validate and set image URL
    let imageUrl = null;
    if (fetched.imageUrl && await validateImageUrl(fetched.imageUrl)) {
      // Check if image already used by another article
      const existingImage = await query('SELECT id FROM articles WHERE image_url = $1', [fetched.imageUrl]);
      if (existingImage.rows.length === 0) {
        imageUrl = fetched.imageUrl;
      }
    }
    
    if (!imageUrl && symbols.length > 0) {
      const fallbackUrl = generateStockImage(symbols[0]);
      if (await validateImageUrl(fallbackUrl)) {
        // Check if fallback image already used
        const existingFallback = await query('SELECT id FROM articles WHERE image_url = $1', [fallbackUrl]);
        if (existingFallback.rows.length === 0) {
          imageUrl = fallbackUrl;
        }
      }
    }
    
    // Try AI image generation if still no image
    if (!imageUrl && symbols.length > 0) {
      console.log(`[${new Date().toISOString()}] Generating AI image for ${symbols[0]}`);
      const { generateImage } = await import('../ai/generate-image');
      const generatedUrl = await generateImage(fetched.title, symbols[0]);
      if (generatedUrl) {
        imageUrl = generatedUrl;
        console.log(`[${new Date().toISOString()}] AI image generated successfully`);
      }
    }
    
    // Reject articles without valid unique images
    if (!imageUrl) {
      console.warn(`[${new Date().toISOString()}] Skipping article (no unique image): ${url}`);
      throw new Error('No valid unique image URL found for article');
    }
    
    // Check for duplicate titles
    const existingTitle = await query('SELECT id FROM articles WHERE title = $1', [fetched.title]);
    if (existingTitle.rows.length > 0) {
      console.warn(`[${new Date().toISOString()}] Skipping article (duplicate title): ${url}`);
      throw new Error('Article with same title already exists');
    }
    
    // Ensure title and summary are different
    if (!fetched.summary || fetched.summary.trim() === '' || fetched.title === fetched.summary || fetched.summary.startsWith(fetched.title)) {
      // Generate new summary from first sentences of article
      const sentences = fetched.fullText.split(/[.!?]+/).filter(s => s.trim().length > 20);
      fetched.summary = sentences.slice(0, 2).join('. ').trim() + '.';
    }
    
    await query(
      `INSERT INTO articles (id, title, summary, forecast_summary, url, image_url, published_at, source_id, truth_score, impact_sentiment, explanation)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        articleId,
        fetched.title,
        fetched.summary,
        forecastSummary,
        url,
        imageUrl,
        fetched.publishedAt,
        sourceId,
        truthScore,
        impactSentiment,
        generateExplanation(verifiedClaims, truthScore)
      ]
    );

    // Store symbols
    for (const symbol of symbols) {
      // Fetch and store stock info
      try {
        const { getStockPrice } = await import('./stock-prices');
        const quote = await getStockPrice(symbol);
        
        if (quote) {
          await query(
            `INSERT INTO stocks (symbol, name, exchange, sector, current_price, change, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())
             ON CONFLICT (symbol) 
             DO UPDATE SET 
               name = EXCLUDED.name,
               current_price = EXCLUDED.current_price,
               change = EXCLUDED.change,
               updated_at = NOW()`,
            [symbol, quote.name, quote.exchange, 'Technology', quote.price, quote.change]
          );
        }
      } catch (error) {
        console.error(`Failed to fetch price for ${symbol}:`, error);
        // Continue anyway with basic stock entry
        await query(
          `INSERT INTO stocks (symbol, name, exchange, sector)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (symbol) DO NOTHING`,
          [symbol, `${symbol} Inc.`, 'NASDAQ', 'Technology']
        );
      }

      await query(
        'INSERT INTO article_symbols (article_id, symbol) VALUES ($1, $2)',
        [articleId, symbol]
      );
    }

    // Store claims
    for (const claim of verifiedClaims) {
      const claimId = `clm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await query(
        `INSERT INTO claims (id, article_id, text, verified, confidence)
         VALUES ($1, $2, $3, $4, $5)`,
        [claimId, articleId, claim.text, claim.verified, claim.confidence]
      );

      // Store evidence links
      for (const link of claim.evidenceLinks) {
        await query(
          'INSERT INTO claim_evidence (claim_id, url) VALUES ($1, $2)',
          [claimId, link]
        );
      }
    }

    console.log(`[${new Date().toISOString()}] Article ingested: ${articleId}`);

    return {
      id: articleId,
      title: fetched.title,
      summary: fetched.summary,
      url,
      imageUrl,
      publishedAt: fetched.publishedAt,
      source: sourceId,
      symbols,
      truthScore,
      impactSentiment,
      claims: verifiedClaims.map(c => ({
        id: `clm_${Date.now()}`,
        text: c.text,
        verified: c.verified,
        confidence: c.confidence,
        evidenceLinks: c.evidenceLinks
      })),
      explanation: generateExplanation(verifiedClaims, truthScore),
      forecastId: null
    };
  } catch (error) {
    throw error;
  }
}

async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(10000) });
    const contentType = response.headers.get('content-type');
    // Accept images, octet-stream (some CDNs), or missing content-type
    return response.ok && (
      contentType?.startsWith('image/') || 
      contentType?.includes('octet-stream') || 
      !contentType
    );
  } catch {
    return false;
  }
}

function generateStockImage(symbol: string): string {
  // Pexels provides free stock photos via their API
  // Using their search URL format for finance-related images
  const query = encodeURIComponent(`${symbol} stock market finance`);
  return `https://images.pexels.com/photos/534216/pexels-photo-534216.jpeg?auto=compress&cs=tinysrgb&w=800&h=600`;
}

function determineImpactSentiment(claims: any[], text: string): string {
  const positiveWords = ['growth', 'profit', 'revenue', 'beat', 'success', 'gain', 'up', 'rise'];
  const negativeWords = ['loss', 'decline', 'miss', 'fail', 'down', 'fall', 'investigation', 'fine'];
  
  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(w => lowerText.includes(w)).length;
  const negativeCount = negativeWords.filter(w => lowerText.includes(w)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function generateExplanation(claims: any[], truthScore: number): string {
  const verifiedCount = claims.filter(c => c.verified).length;
  const totalCount = claims.length;
  
  if (truthScore >= 0.8) {
    return `High confidence: ${verifiedCount} of ${totalCount} claims verified with strong evidence.`;
  } else if (truthScore >= 0.6) {
    return `Moderate confidence: ${verifiedCount} of ${totalCount} claims verified. Some claims lack strong evidence.`;
  } else {
    return `Low confidence: Only ${verifiedCount} of ${totalCount} claims verified. Many claims are speculative or unverified.`;
  }
}
