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

app.post('/v1/articles/ingest', (req, res) => {
  const { url, symbol } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });
  
  const newArticle = {
    id: `art_${Date.now()}`,
    title: 'Ingested Article (Mock)',
    summary: 'This is a mock ingested article',
    url,
    imageUrl: 'https://picsum.photos/seed/mock/800/600',
    publishedAt: new Date().toISOString(),
    source: 'src_001',
    symbols: symbol ? [symbol] : [],
    truthScore: 0.85,
    impactSentiment: 'neutral',
    claims: [],
    explanation: 'Mock ingestion - real implementation will extract and verify claims',
    forecastId: null
  };
  
  res.status(201).json(newArticle);
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
app.get('/v1/stocks', (req, res) => {
  const { search } = req.query;
  let filtered = [...mockData.stocks];
  
  if (search) {
    const term = (search as string).toUpperCase();
    filtered = filtered.filter(s => 
      s.symbol.includes(term) || s.name.toUpperCase().includes(term)
    );
  }
  
  res.json({ data: filtered });
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

app.listen(PORT, () => {
  console.log(`BIAZ Finance API running on port ${PORT}`);
});
