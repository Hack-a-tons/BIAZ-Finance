import { chat } from './index';
import { getPrompt } from './prompts';
import { cacheGet, cacheSet, aiCacheKey } from '../cache';

export interface GeneratedForecast {
  sentiment: 'positive' | 'neutral' | 'negative';
  impactScore: number;
  priceTarget: number;
  timeHorizon: '1_day' | '1_week' | '1_month' | '3_months';
  confidence: number;
  reasoning: string;
  summary?: string;
}

export async function generateForecastSummary(
  article: { title: string; fullText: string; truthScore: number },
  symbols: string[]
): Promise<string> {
  const cacheKey = aiCacheKey('forecast-summary', article.title);
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const prompt = `Based on this financial news article, generate a concise 1-2 sentence impact forecast summary for investors.

Article: ${article.title}
Stocks: ${symbols.join(', ')}
Truth Score: ${article.truthScore.toFixed(2)}

Focus on: What this means for stock prices, investor sentiment, and market impact.
Be specific and actionable. Do not repeat the article title.`;

  const response = await chat([
    { role: 'system', content: 'You are a financial analyst providing concise market impact summaries.' },
    { role: 'user', content: prompt }
  ], 0.3);

  const summary = response.trim();
  await cacheSet(cacheKey, summary, 21600); // 6 hours
  return summary;
}

export async function generateForecast(
  article: { title: string; summary: string; truthScore: number },
  symbol: string,
  currentPrice: number
): Promise<GeneratedForecast> {
  // Check cache
  const cacheKey = aiCacheKey('forecast', `${symbol}:${article.title}:${currentPrice}`);
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  const systemPrompt = getPrompt('generate-forecast-system');
  const userPrompt = getPrompt('generate-forecast-user', {
    symbol,
    currentPrice: currentPrice.toFixed(2),
    truthScore: article.truthScore.toFixed(2),
    title: article.title,
    summary: article.summary
  });

  const response = await chat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], 0.5);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON object found in response');
    
    const forecast = JSON.parse(jsonMatch[0]);
    
    // Cache for 6 hours (forecasts can change with price)
    await cacheSet(cacheKey, JSON.stringify(forecast), 21600);
    
    return forecast;
  } catch (error) {
    console.error('Failed to parse forecast:', error);
    return {
      sentiment: 'neutral',
      impactScore: 0.5,
      priceTarget: currentPrice,
      timeHorizon: '1_week',
      confidence: 0.5,
      reasoning: 'Unable to generate forecast due to parsing error.'
    };
  }
}
