import { query } from '../db';
import { fetchArticle } from './fetch-article';
import { fetchArticleRSS } from './fetch-article-rss';
import { matchSource } from './match-source';
import { extractSymbols, extractAffectedSymbols } from './extract-symbols';
import { extractClaims } from '../ai/extract-claims';
import { verifyClaims, calculateTruthScore } from '../ai/verify-claims';
import type { Article } from '../models';

function removeAdvertisements(text: string): string {
  // Remove common advertisement patterns
  const adPatterns = [
    /subscribe to.*?newsletter/gi,
    /sign up for.*?updates/gi,
    /get access to.*?premium/gi,
    /become a member.*?today/gi,
    /join now.*?free/gi,
    /limited time offer.*?\./gi,
    /click here to.*?subscribe/gi,
    /advertisement\s*$/gmi,
    /sponsored content\s*$/gmi,
    /\[ad\].*?\[\/ad\]/gi,
    /\*\*advertisement\*\*/gi
  ];
  
  let cleanedText = text;
  adPatterns.forEach(pattern => {
    cleanedText = cleanedText.replace(pattern, '');
  });
  
  // Remove excessive whitespace
  cleanedText = cleanedText.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
  
  return cleanedText;
}

export async function ingestArticle(url: string, manualSymbol?: string, rssItem?: any, method: 'apify' | 'rss' | 'http' = 'apify', directContent?: string, directTitle?: string, progressCallback?: (progress: number, message: string) => Promise<void>): Promise<Article> {
  try {
    const logUrl = directContent ? 'Pasted article' : url;
    console.log(`[${new Date().toISOString()}] Ingesting article: ${logUrl}`);

    // Check if article already exists
    let checkUrl = url;
    if (directContent) {
      // For demo content, use hash of trimmed content as URL
      const crypto = await import('crypto');
      const trimmedContent = directContent.trim();
      const hash = crypto.createHash('sha256').update(trimmedContent).digest('hex').substring(0, 16);
      checkUrl = `https://demo.example.com/${hash}`;
    }
    
    const existing = await query('SELECT id FROM articles WHERE url = $1', [checkUrl]);
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
    let fetchMethod = 'direct';
    
    if (directContent) {
      // Generate title from content if not provided
      let title = directTitle;
      if (!title || title.length < 10) {
        const { chat } = await import('../ai');
        const titleResponse = await chat([
          { role: 'system', content: 'You are a news editor. Generate concise, informative headlines.' },
          { role: 'user', content: `Generate a short, clear headline (max 80 chars) for this article:\n\n${directContent.substring(0, 500)}` }
        ], 0.5);
        title = titleResponse.trim().replace(/^["']|["']$/g, '');
      }
      
      fetched = {
        title,
        summary: directContent.substring(0, 200) + '...',
        fullText: directContent,
        url,
        publishedAt: new Date().toISOString(),
        sourceDomain: 'demo.example.com'
      };
    } else {
      fetchMethod = method;
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
    console.log(`[${new Date().toISOString()}] Source: ${sourceId} - "${fetched.title.substring(0, 60)}${fetched.title.length > 60 ? '...' : ''}"`);

    // 3. Extract symbols (mentioned and affected)
    if (progressCallback) await progressCallback(0, 'Identifying stock symbols...');
    const mentionedSymbols = await extractSymbols(fetched.title, fetched.fullText, manualSymbol);
    const affectedSymbols = mentionedSymbols.length === 0 ? await extractAffectedSymbols(fetched.title, fetched.fullText) : [];
    const symbols = [...new Set([...mentionedSymbols, ...affectedSymbols])]; // Combine and dedupe
    
    console.log(`[${new Date().toISOString()}] Symbols mentioned: ${mentionedSymbols.join(', ') || 'none'}`);
    console.log(`[${new Date().toISOString()}] Symbols affected: ${affectedSymbols.join(', ') || 'none'}`);
    if (progressCallback) await progressCallback(0, `Found symbols: ${symbols.join(', ') || 'none'}`);
    
    // Allow articles without stocks for demo/analysis purposes
    if (symbols.length === 0 && !directContent) {
      console.warn(`[${new Date().toISOString()}] Skipping article (no stock symbols): ${checkUrl}`);
      throw new Error('No stock symbols found in article');
    }
    
    // Remove advertisement content before analysis
    const cleanedText = removeAdvertisements(fetched.fullText);
    const cleanedTitle = fetched.title;
    
    // Update fetched content with cleaned version
    fetched.fullText = cleanedText;

    // 4. Extract claims
    if (progressCallback) await progressCallback(0, 'Looking for claims in article...');
    const extractedClaims = await extractClaims(fetched.fullText, fetched.title);
    console.log(`[${new Date().toISOString()}] Extracted ${extractedClaims.length} claims`);
    if (progressCallback) await progressCallback(0, `Found ${extractedClaims.length} claims to verify`);

    // 5. Verify claims
    if (progressCallback) await progressCallback(0, `Verifying ${extractedClaims.length} claims with evidence...`);
    
    const verifiedClaims = await verifyClaims(extractedClaims, fetched.fullText, fetched.sourceDomain, async (claimIndex, total) => {
      const percentage = Math.round((claimIndex / total) * 100);
      if (progressCallback) await progressCallback(0, `Processed claims: ${claimIndex} of ${total} (${percentage}%)`);
    });
    
    const verifiedCount = verifiedClaims.filter(c => c.verified).length;
    console.log(`[${new Date().toISOString()}] Verified ${verifiedCount} of ${verifiedClaims.length} claims`);
    if (progressCallback) await progressCallback(0, `Verified ${verifiedCount} of ${verifiedClaims.length} claims`);

    // 6. Calculate truth score
    const truthScore = calculateTruthScore(verifiedClaims);
    console.log(`[${new Date().toISOString()}] Truth score: ${truthScore.toFixed(2)}`);

    // 7. Determine impact sentiment
    const impactSentiment = determineImpactSentiment(verifiedClaims, fetched.fullText);

    // 8. Generate forecast summary (only if symbols exist)
    let forecastSummary = null;
    if (symbols.length > 0) {
      const { generateForecastSummary } = await import('../ai/generate-forecast');
      forecastSummary = await generateForecastSummary(
        { title: fetched.title, fullText: fetched.fullText, truthScore },
        symbols
      );
      console.log(`[${new Date().toISOString()}] Generated forecast summary`);
    }

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
    
    // For demo content, use generic news image
    if (!imageUrl && directContent) {
      imageUrl = 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=800&h=600';
    }
    
    // Reject articles without valid unique images (except demo content)
    if (!imageUrl && !directContent) {
      console.warn(`[${new Date().toISOString()}] Skipping article (no unique image): ${url}`);
      throw new Error('No valid unique image URL found for article');
    }
    
    // Check for duplicate titles (skip for demo content - already checked by hash)
    if (!directContent) {
      const existingTitle = await query('SELECT id FROM articles WHERE title = $1', [fetched.title]);
      if (existingTitle.rows.length > 0) {
        console.warn(`[${new Date().toISOString()}] Skipping article (duplicate title): ${checkUrl}`);
        throw new Error('Article with same title already exists');
      }
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
        checkUrl,
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

      // Ensure symbol exists before inserting into article_symbols
      try {
        await query(
          'INSERT INTO article_symbols (article_id, symbol) VALUES ($1, $2)',
          [articleId, symbol]
        );
      } catch (symbolError: any) {
        console.error(`Failed to insert article_symbol for ${symbol}:`, symbolError.message);
        // Try to insert the symbol first if it doesn't exist
        await query(
          `INSERT INTO stocks (symbol, name, exchange, sector)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (symbol) DO NOTHING`,
          [symbol, `${symbol} Inc.`, 'NASDAQ', 'Technology']
        );
        // Retry the article_symbols insert
        await query(
          'INSERT INTO article_symbols (article_id, symbol) VALUES ($1, $2)',
          [articleId, symbol]
        );
      }
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

    // Fetch stock details for response
    const stockDetails = await Promise.all(symbols.map(async (symbol) => {
      const stockResult = await query('SELECT * FROM stocks WHERE symbol = $1', [symbol]);
      if (stockResult.rows.length > 0) {
        const stock = stockResult.rows[0];
        // Parse change string ("+0.01%" or "-0.01%") to number
        let changeNum = null;
        if (stock.change) {
          const match = stock.change.match(/([+-]?\d+\.?\d*)/);
          if (match) changeNum = parseFloat(match[1]);
        }
        return {
          symbol: stock.symbol,
          name: stock.name,
          price: stock.current_price,
          change: changeNum,
          link: `https://finance.yahoo.com/quote/${stock.symbol}`
        };
      }
      return {
        symbol,
        name: symbol,
        price: null,
        change: null,
        link: `https://finance.yahoo.com/quote/${symbol}`
      };
    }));

    return {
      id: articleId,
      title: fetched.title,
      summary: fetched.summary,
      forecastSummary,
      url: checkUrl,
      imageUrl,
      publishedAt: fetched.publishedAt,
      source: sourceId,
      symbols,
      symbolsMentioned: mentionedSymbols.map(s => stockDetails.find(sd => sd.symbol === s) || { symbol: s, name: s, price: null, change: null, link: `https://finance.yahoo.com/quote/${s}` }),
      symbolsAffected: affectedSymbols.map(s => stockDetails.find(sd => sd.symbol === s) || { symbol: s, name: s, price: null, change: null, link: `https://finance.yahoo.com/quote/${s}` }),
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
      forecastId: null,
      permanentUrl: `https://api.news.biaz.hurated.com/article/${articleId}`
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
