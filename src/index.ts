import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mockData from '../mock-data.json';
import pool from './db';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 23000;

app.use(cors());
app.use(express.json());

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected:', res.rows[0].now);
  }
});

// Articles endpoints
app.get('/v1/articles', (req, res) => {
  const { symbol, from, source, page = '1', limit = '10' } = req.query;
  let filtered = [...mockData.articles];
  
  if (symbol) filtered = filtered.filter(a => a.symbols.includes(symbol as string));
  if (from) filtered = filtered.filter(a => new Date(a.publishedAt) >= new Date(from as string));
  if (source) filtered = filtered.filter(a => a.source === source);
  
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const start = (pageNum - 1) * limitNum;
  const paginated = filtered.slice(start, start + limitNum);
  
  res.json({
    data: paginated,
    pagination: { page: pageNum, limit: limitNum, total: filtered.length }
  });
});

app.get('/v1/articles/:id', (req, res) => {
  const article = mockData.articles.find(a => a.id === req.params.id);
  if (!article) return res.status(404).json({ error: 'Article not found' });
  res.json(article);
});

app.post('/v1/articles/ingest', async (req, res) => {
  const { url, symbol } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });
  
  try {
    const { ingestArticle } = await import('./services/ingest-article');
    const article = await ingestArticle(url, symbol);
    res.status(201).json(article);
  } catch (error: any) {
    console.error('Ingest error:', error);
    res.status(500).json({ error: error.message || 'Failed to ingest article' });
  }
});

app.post('/v1/articles/:id/score', (req, res) => {
  const article = mockData.articles.find(a => a.id === req.params.id);
  if (!article) return res.status(404).json({ error: 'Article not found' });
  
  res.json({
    ...article,
    truthScore: Math.random() * 0.3 + 0.7,
    scoredAt: new Date().toISOString()
  });
});

// Sources endpoints
app.get('/v1/sources', (req, res) => {
  res.json({ data: mockData.sources });
});

app.get('/v1/sources/:id', (req, res) => {
  const source = mockData.sources.find(s => s.id === req.params.id);
  if (!source) return res.status(404).json({ error: 'Source not found' });
  res.json(source);
});

app.post('/v1/sources', (req, res) => {
  const { name, domain, credibilityScore } = req.body;
  if (!name || !domain) return res.status(400).json({ error: 'Name and domain required' });
  
  const newSource = {
    id: `src_${Date.now()}`,
    name,
    domain,
    credibilityScore: credibilityScore || 0.5,
    category: 'custom',
    verifiedPublisher: false
  };
  
  res.status(201).json(newSource);
});

app.delete('/v1/sources/:id', (req, res) => {
  res.status(204).send();
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
    console.error('Stocks error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Forecasts endpoints
app.get('/v1/forecasts/:id', (req, res) => {
  const forecast = mockData.forecasts.find(f => f.id === req.params.id);
  if (!forecast) return res.status(404).json({ error: 'Forecast not found' });
  res.json(forecast);
});

app.post('/v1/forecasts', (req, res) => {
  const { articleId, symbol } = req.body;
  if (!articleId || !symbol) return res.status(400).json({ error: 'articleId and symbol required' });
  
  const newForecast = {
    id: `fct_${Date.now()}`,
    articleId,
    symbol,
    sentiment: 'neutral',
    impactScore: 0.5,
    priceTarget: 100.0,
    timeHorizon: '1_week',
    confidence: 0.75,
    reasoning: 'Mock forecast - real implementation will use AI analysis',
    generatedAt: new Date().toISOString()
  };
  
  res.status(201).json(newForecast);
});

// Feed monitoring endpoint (admin only - add auth later)
app.post('/v1/admin/monitor-feeds', async (req, res) => {
  try {
    const { runFeedMonitoring } = await import('./services/monitor-feeds');
    
    // Run in background
    runFeedMonitoring().catch(console.error);
    
    res.json({ message: 'Feed monitoring started in background' });
  } catch (error: any) {
    console.error('Monitor feeds error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stock price update endpoint (admin only)
app.post('/v1/admin/update-prices', async (req, res) => {
  try {
    const { getStocksNeedingUpdate, updateStockPrices } = await import('./services/stock-prices');
    
    const symbols = await getStocksNeedingUpdate();
    
    // Run in background
    updateStockPrices(symbols).catch(console.error);
    
    res.json({ message: `Updating prices for ${symbols.length} stocks`, symbols });
  } catch (error: any) {
    console.error('Update prices error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`BIAZ Finance API running on port ${PORT}`);
});
