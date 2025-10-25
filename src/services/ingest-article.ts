import { query } from '../db';
import { fetchArticle } from './fetch-article';
import { matchSource } from './match-source';
import { extractSymbols } from './extract-symbols';
import { extractClaims } from '../ai/extract-claims';
import { verifyClaims, calculateTruthScore } from '../ai/verify-claims';
import type { Article } from '../models';

export async function ingestArticle(url: string, manualSymbol?: string): Promise<Article> {
  try {
    console.log(`Ingesting article: ${url}`);

    // 1. Fetch article content
    const fetched = await fetchArticle(url);
    console.log(`Fetched: ${fetched.title}`);

    // 2. Match or create source
    const sourceId = await matchSource(fetched.sourceDomain);
    console.log(`Source: ${sourceId}`);

    // 3. Extract symbols
    const symbols = await extractSymbols(fetched.title, fetched.fullText, manualSymbol);
    console.log(`Symbols: ${symbols.join(', ')}`);

    // 4. Extract claims
    const extractedClaims = await extractClaims(fetched.fullText, fetched.title);
    console.log(`Extracted ${extractedClaims.length} claims`);

    // 5. Verify claims
    const verifiedClaims = await verifyClaims(extractedClaims, fetched.fullText);
    console.log(`Verified ${verifiedClaims.filter(c => c.verified).length} claims`);

    // 6. Calculate truth score
    const truthScore = calculateTruthScore(verifiedClaims);
    console.log(`Truth score: ${truthScore.toFixed(2)}`);

    // 7. Determine impact sentiment
    const impactSentiment = determineImpactSentiment(verifiedClaims, fetched.fullText);

    // 8. Store in database
    const articleId = `art_${Date.now()}`;
    
    await query(
      `INSERT INTO articles (id, title, summary, url, image_url, published_at, source_id, truth_score, impact_sentiment, explanation)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        articleId,
        fetched.title,
        fetched.summary,
        url,
        fetched.imageUrl || `https://picsum.photos/seed/${articleId}/800/600`,
        fetched.publishedAt,
        sourceId,
        truthScore,
        impactSentiment,
        generateExplanation(verifiedClaims, truthScore)
      ]
    );

    // Store symbols
    for (const symbol of symbols) {
      // Ensure stock exists
      await query(
        `INSERT INTO stocks (symbol, name, exchange, sector)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (symbol) DO NOTHING`,
        [symbol, `${symbol} Inc.`, 'NASDAQ', 'Technology']
      );

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

    console.log(`Article ingested: ${articleId}`);

    return {
      id: articleId,
      title: fetched.title,
      summary: fetched.summary,
      url,
      imageUrl: fetched.imageUrl || `https://picsum.photos/seed/${articleId}/800/600`,
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
    console.error('Ingestion error:', error);
    throw error;
  }
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
