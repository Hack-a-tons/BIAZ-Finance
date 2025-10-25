import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import mockData from '../mock-data.json';
import pool from './db';
import { cacheGet, cacheSet, articleListCacheKey } from './cache';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 23000;
const startTime = Date.now();

// Trust proxy - required for rate limiting behind nginx
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());

// General rate limiter - generous for hackathon demos
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Expensive operations limiter (AI-powered endpoints)
const expensiveLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 requests per 5 minutes per IP
  message: { error: 'Rate limit exceeded for this operation. Please wait a few minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

// Request logging middleware
app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const method = req.method;
  const path = req.path;
  const query = Object.keys(req.query).length > 0 ? `?${new URLSearchParams(req.query as any).toString()}` : '';
  const body = req.body && Object.keys(req.body).length > 0 ? ` ${JSON.stringify(req.body)}` : '';
  
  // Truncate to 100 chars total
  const summary = `${method} ${path}${query}${body}`.substring(0, 100);
  
  console.log(`[${new Date().toISOString()}] ${ip} - ${summary}`);
  next();
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.warn(`[${new Date().toISOString()}] Database connection failed: ${err.message}`);
  } else {
    console.log(`[${new Date().toISOString()}] Database connected`);
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const checks: Record<string, string> = {};
  let healthy = true;

  // Check database
  try {
    await pool.query('SELECT 1');
    checks.database = 'ok';
  } catch (error) {
    checks.database = 'error';
    healthy = false;
  }

  // Check AI provider (optional - don't fail health check if AI is down)
  const aiProvider = process.env.AI_PROVIDER || 'azure';
  checks.ai = aiProvider;

  const status = healthy ? 'healthy' : 'unhealthy';
  const statusCode = healthy ? 200 : 503;

  res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks
  });
});

// Articles endpoints
app.get('/v1/articles', async (req, res) => {
  try {
    const { symbol, from, source, page = '1', limit = '10' } = req.query;
    
    // Check cache first
    const cacheKey = articleListCacheKey({ symbol, from, source, page, limit });
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    let query = `
      SELECT DISTINCT a.id, a.title, a.summary, a.forecast_summary, a.url, a.image_url, a.published_at,
             a.source_id, s.name as source_name, a.truth_score, a.impact_sentiment
      FROM articles a
      LEFT JOIN article_symbols asym ON a.id = asym.article_id
      LEFT JOIN sources s ON a.source_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;
    
    if (symbol) {
      paramCount++;
      query += ` AND asym.symbol = $${paramCount}`;
      params.push(symbol);
    }
    
    if (from) {
      paramCount++;
      query += ` AND a.published_at >= $${paramCount}`;
      params.push(from);
    }
    
    if (source) {
      paramCount++;
      query += ` AND a.source_id = $${paramCount}`;
      params.push(source);
    }
    
    query += ` ORDER BY a.published_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limitNum, offset);
    
    const result = await pool.query(query, params);
    
    // Get symbols for each article
    const articles = await Promise.all(result.rows.map(async (row: any) => {
      const symbolsResult = await pool.query(
        'SELECT symbol FROM article_symbols WHERE article_id = $1',
        [row.id]
      );
      
      return {
        id: row.id,
        title: row.title,
        summary: row.summary,
        forecastSummary: row.forecast_summary,
        url: row.url,
        imageUrl: row.image_url,
        publishedAt: row.published_at,
        source: row.source_id,
        sourceName: row.source_name,
        symbols: symbolsResult.rows.map((s: any) => s.symbol),
        truthScore: row.truth_score ? parseFloat(row.truth_score) : null,
        impactSentiment: row.impact_sentiment
      };
    }));
    
    // Get total count
    let countQuery = 'SELECT COUNT(DISTINCT a.id) FROM articles a LEFT JOIN article_symbols asym ON a.id = asym.article_id WHERE 1=1';
    const countParams: any[] = [];
    let countParamNum = 0;
    
    if (symbol) {
      countParamNum++;
      countQuery += ` AND asym.symbol = $${countParamNum}`;
      countParams.push(symbol);
    }
    if (from) {
      countParamNum++;
      countQuery += ` AND a.published_at >= $${countParamNum}`;
      countParams.push(from);
    }
    if (source) {
      countParamNum++;
      countQuery += ` AND a.source_id = $${countParamNum}`;
      countParams.push(source);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    
    const response = {
      data: articles,
      pagination: { page: pageNum, limit: limitNum, total }
    };
    
    // Cache for 60 seconds
    await cacheSet(cacheKey, JSON.stringify(response), 60);
    
    res.json(response);
  } catch (error: any) {
    console.warn(`[${new Date().toISOString()}] GET /articles failed: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.get('/v1/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get article
    const articleResult = await pool.query(
      `SELECT a.*, s.name as source_name 
       FROM articles a 
       LEFT JOIN sources s ON a.source_id = s.id 
       WHERE a.id = $1`,
      [id]
    );
    
    if (articleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    const article = articleResult.rows[0];
    
    // Get symbols
    const symbolsResult = await pool.query(
      'SELECT symbol FROM article_symbols WHERE article_id = $1',
      [id]
    );
    
    // Get claims with evidence
    const claimsResult = await pool.query(
      `SELECT c.id, c.text, c.verified, c.confidence,
              array_agg(ce.url) FILTER (WHERE ce.url IS NOT NULL) as evidence_links
       FROM claims c
       LEFT JOIN claim_evidence ce ON c.id = ce.claim_id
       WHERE c.article_id = $1
       GROUP BY c.id, c.text, c.verified, c.confidence
       ORDER BY c.created_at`,
      [id]
    );
    
    // Get forecast if exists
    const forecastResult = await pool.query(
      `SELECT id, symbol, sentiment, impact_score, price_target, 
              time_horizon, confidence, reasoning, generated_at
       FROM forecasts
       WHERE article_id = $1
       LIMIT 1`,
      [id]
    );
    
    res.json({
      id: article.id,
      title: article.title,
      summary: article.summary,
      forecastSummary: article.forecast_summary,
      url: article.url,
      imageUrl: article.image_url,
      publishedAt: article.published_at,
      source: article.source_id,
      sourceName: article.source_name,
      symbols: symbolsResult.rows.map((s: any) => s.symbol),
      truthScore: article.truth_score ? parseFloat(article.truth_score) : null,
      impactSentiment: article.impact_sentiment,
      explanation: article.explanation,
      claims: claimsResult.rows.map((c: any) => ({
        id: c.id,
        text: c.text,
        verified: c.verified,
        confidence: parseFloat(c.confidence),
        evidenceLinks: c.evidence_links || []
      })),
      forecast: forecastResult.rows.length > 0 ? {
        id: forecastResult.rows[0].id,
        symbol: forecastResult.rows[0].symbol,
        sentiment: forecastResult.rows[0].sentiment,
        impactScore: parseFloat(forecastResult.rows[0].impact_score),
        priceTarget: parseFloat(forecastResult.rows[0].price_target),
        timeHorizon: forecastResult.rows[0].time_horizon,
        confidence: parseFloat(forecastResult.rows[0].confidence),
        reasoning: forecastResult.rows[0].reasoning,
        generatedAt: forecastResult.rows[0].generated_at
      } : null
    });
  } catch (error: any) {
    console.warn(`[${new Date().toISOString()}] GET /articles/:id failed: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.post('/v1/articles/ingest', expensiveLimiter, async (req, res) => {
  const { url, symbol } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });
  
  try {
    const { ingestArticle } = await import('./services/ingest-article');
    const article = await ingestArticle(url, symbol);
    res.status(201).json(article);
  } catch (error: any) {
    console.warn(`[${new Date().toISOString()}] Ingest failed: ${error.message}`);
    res.status(500).json({ error: error.message || 'Failed to ingest article' });
  }
});

app.post('/v1/articles/:id/score', expensiveLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get article
    const articleResult = await pool.query(
      'SELECT title, summary, url FROM articles WHERE id = $1',
      [id]
    );
    
    if (articleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    const article = articleResult.rows[0];
    
    // Get existing claims
    const claimsResult = await pool.query(
      'SELECT text, confidence FROM claims WHERE article_id = $1',
      [id]
    );
    
    if (claimsResult.rows.length === 0) {
      return res.status(400).json({ error: 'No claims found for article' });
    }
    
    // Re-verify claims
    const { verifyClaims, calculateTruthScore } = await import('./ai/verify-claims');
    const context = `${article.title}\n\n${article.summary}`;
    const verifiedClaims = await verifyClaims(claimsResult.rows, context);
    const truthScore = calculateTruthScore(verifiedClaims);
    
    // Update claims in database
    for (const claim of verifiedClaims) {
      await pool.query(
        'UPDATE claims SET verified = $1, confidence = $2 WHERE article_id = $3 AND text = $4',
        [claim.verified, claim.confidence, id, claim.text]
      );
      
      // Update evidence links
      await pool.query('DELETE FROM claim_evidence WHERE claim_id IN (SELECT id FROM claims WHERE article_id = $1 AND text = $2)', [id, claim.text]);
      
      if (claim.evidenceLinks.length > 0) {
        const claimIdResult = await pool.query('SELECT id FROM claims WHERE article_id = $1 AND text = $2', [id, claim.text]);
        if (claimIdResult.rows.length > 0) {
          const claimId = claimIdResult.rows[0].id;
          for (const link of claim.evidenceLinks) {
            await pool.query('INSERT INTO claim_evidence (claim_id, url) VALUES ($1, $2)', [claimId, link]);
          }
        }
      }
    }
    
    // Update article truth score
    await pool.query(
      'UPDATE articles SET truth_score = $1, updated_at = NOW() WHERE id = $2',
      [truthScore, id]
    );
    
    // Return updated article
    const updatedResult = await pool.query(
      'SELECT * FROM articles WHERE id = $1',
      [id]
    );
    
    const symbolsResult = await pool.query(
      'SELECT symbol FROM article_symbols WHERE article_id = $1',
      [id]
    );
    
    res.json({
      id: updatedResult.rows[0].id,
      title: updatedResult.rows[0].title,
      summary: updatedResult.rows[0].summary,
      url: updatedResult.rows[0].url,
      imageUrl: updatedResult.rows[0].image_url,
      publishedAt: updatedResult.rows[0].published_at,
      source: updatedResult.rows[0].source_id,
      symbols: symbolsResult.rows.map((s: any) => s.symbol),
      truthScore: parseFloat(updatedResult.rows[0].truth_score),
      impactSentiment: updatedResult.rows[0].impact_sentiment,
      scoredAt: updatedResult.rows[0].updated_at
    });
  } catch (error: any) {
    console.warn(`[${new Date().toISOString()}] POST /articles/:id/score failed: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Sources endpoints
app.get('/v1/sources', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, domain, credibility_score, category, verified_publisher FROM sources ORDER BY name'
    );
    
    res.json({
      data: result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        domain: row.domain,
        credibilityScore: parseFloat(row.credibility_score),
        category: row.category,
        verifiedPublisher: row.verified_publisher
      }))
    });
  } catch (error: any) {
    console.warn(`[${new Date().toISOString()}] GET /sources failed: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.get('/v1/sources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, name, domain, credibility_score, category, verified_publisher FROM sources WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Source not found' });
    }
    
    const row = result.rows[0];
    res.json({
      id: row.id,
      name: row.name,
      domain: row.domain,
      credibilityScore: parseFloat(row.credibility_score),
      category: row.category,
      verifiedPublisher: row.verified_publisher
    });
  } catch (error: any) {
    console.warn(`[${new Date().toISOString()}] GET /sources/:id failed: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.post('/v1/sources', async (req, res) => {
  try {
    const { name, domain, credibilityScore } = req.body;
    
    if (!name || !domain) {
      return res.status(400).json({ error: 'Name and domain required' });
    }
    
    const id = `src_${Date.now()}`;
    const score = credibilityScore || 0.5;
    
    await pool.query(
      'INSERT INTO sources (id, name, domain, credibility_score, category, verified_publisher) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, name, domain, score, 'custom', false]
    );
    
    res.status(201).json({
      id,
      name,
      domain,
      credibilityScore: score,
      category: 'custom',
      verifiedPublisher: false
    });
  } catch (error: any) {
    console.warn(`[${new Date().toISOString()}] POST /sources failed: ${error.message}`);
    if (error.code === '23505') { // Unique violation
      res.status(409).json({ error: 'Domain already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.delete('/v1/sources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM sources WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Source not found' });
    }
    
    res.status(204).send();
  } catch (error: any) {
    console.warn(`[${new Date().toISOString()}] DELETE /sources/:id failed: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Stocks endpoint
app.get('/v1/stocks', async (req, res) => {
  const { search } = req.query;
  
  try {
    let queryText = 'SELECT symbol, name, exchange, sector, current_price, change FROM stocks';
    let params: any[] = [];
    
    if (search) {
      queryText += ' WHERE UPPER(symbol) LIKE $1 OR UPPER(name) LIKE $1';
      params = [`%${(search as string).toUpperCase()}%`];
    }
    
    const result = await pool.query(queryText, params);
    
    // Count articles per symbol
    const stocksWithCounts = await Promise.all(
      result.rows.map(async (stock: any) => {
        const countResult = await pool.query(
          'SELECT COUNT(*) FROM article_symbols WHERE symbol = $1',
          [stock.symbol]
        );
        
        return {
          symbol: stock.symbol,
          name: stock.name,
          exchange: stock.exchange,
          sector: stock.sector,
          currentPrice: parseFloat(stock.current_price) || 0,
          change: stock.change || 'N/A',
          articleCount: parseInt(countResult.rows[0].count)
        };
      })
    );
    
    res.json({ data: stocksWithCounts });
  } catch (error: any) {
    console.warn(`[${new Date().toISOString()}] Stocks failed: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Forecasts endpoints
app.get('/v1/forecasts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT id, article_id, symbol, sentiment, impact_score, price_target,
              time_horizon, confidence, reasoning, generated_at
       FROM forecasts WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Forecast not found' });
    }
    
    const row = result.rows[0];
    res.json({
      id: row.id,
      articleId: row.article_id,
      symbol: row.symbol,
      sentiment: row.sentiment,
      impactScore: parseFloat(row.impact_score),
      priceTarget: parseFloat(row.price_target),
      timeHorizon: row.time_horizon,
      confidence: parseFloat(row.confidence),
      reasoning: row.reasoning,
      generatedAt: row.generated_at
    });
  } catch (error: any) {
    console.warn(`[${new Date().toISOString()}] GET /forecasts/:id failed: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.post('/v1/forecasts', expensiveLimiter, async (req, res) => {
  try {
    const { articleId, symbol } = req.body;
    
    if (!articleId || !symbol) {
      return res.status(400).json({ error: 'articleId and symbol required' });
    }
    
    // Get article
    const articleResult = await pool.query(
      'SELECT title, summary, truth_score FROM articles WHERE id = $1',
      [articleId]
    );
    
    if (articleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    const article = articleResult.rows[0];
    
    // Get current stock price
    const stockResult = await pool.query(
      'SELECT current_price FROM stocks WHERE symbol = $1',
      [symbol]
    );
    
    if (stockResult.rows.length === 0) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    
    const currentPrice = parseFloat(stockResult.rows[0].current_price);
    
    // Generate forecast with AI
    const { generateForecast } = await import('./ai/generate-forecast');
    const forecast = await generateForecast(
      {
        title: article.title,
        summary: article.summary,
        truthScore: parseFloat(article.truth_score) || 0.5
      },
      symbol,
      currentPrice
    );
    
    // Store in database
    const id = `fct_${Date.now()}`;
    await pool.query(
      `INSERT INTO forecasts (id, article_id, symbol, sentiment, impact_score, price_target,
                              time_horizon, confidence, reasoning, generated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [id, articleId, symbol, forecast.sentiment, forecast.impactScore, forecast.priceTarget,
       forecast.timeHorizon, forecast.confidence, forecast.reasoning]
    );
    
    res.status(201).json({
      id,
      articleId,
      symbol,
      sentiment: forecast.sentiment,
      impactScore: forecast.impactScore,
      priceTarget: forecast.priceTarget,
      timeHorizon: forecast.timeHorizon,
      confidence: forecast.confidence,
      reasoning: forecast.reasoning,
      generatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.warn(`[${new Date().toISOString()}] POST /forecasts failed: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Feed monitoring endpoint (admin only - add auth later)
app.post('/v1/admin/monitor-feeds', async (req, res) => {
  try {
    const { runFeedMonitoring } = await import('./services/monitor-feeds');
    
    // Run in background
    runFeedMonitoring().catch(err => 
      console.warn(`[${new Date().toISOString()}] Feed monitoring failed: ${err.message}`)
    );
    
    res.json({ message: 'Feed monitoring started in background' });
  } catch (error: any) {
    console.warn(`[${new Date().toISOString()}] Monitor feeds failed: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Stock price update endpoint (admin only)
app.post('/v1/admin/update-prices', async (req, res) => {
  try {
    const { getStocksNeedingUpdate, updateStockPrices } = await import('./services/stock-prices');
    
    const symbols = await getStocksNeedingUpdate();
    
    // Run in background
    updateStockPrices(symbols).catch(err => 
      console.warn(`[${new Date().toISOString()}] Price update failed: ${err.message}`)
    );
    
    res.json({ message: `Updating prices for ${symbols.length} stocks`, symbols });
  } catch (error: any) {
    console.warn(`[${new Date().toISOString()}] Update prices failed: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`BIAZ Finance API running on port ${PORT}`);
});
