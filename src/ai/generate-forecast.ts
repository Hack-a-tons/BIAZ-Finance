import { chat } from './index';

export interface GeneratedForecast {
  sentiment: 'positive' | 'neutral' | 'negative';
  impactScore: number;
  priceTarget: number;
  timeHorizon: '1_day' | '1_week' | '1_month' | '3_months';
  confidence: number;
  reasoning: string;
}

export async function generateForecast(
  article: { title: string; summary: string; truthScore: number },
  symbol: string,
  currentPrice: number
): Promise<GeneratedForecast> {
  const prompt = `Analyze this financial news and forecast stock impact. Return ONLY valid JSON.

Stock: ${symbol}
Current Price: $${currentPrice}
Article Truth Score: ${article.truthScore.toFixed(2)}

Title: ${article.title}
Summary: ${article.summary}

Provide forecast with:
- sentiment: "positive", "neutral", or "negative"
- impactScore: 0.0-1.0 (magnitude of expected impact)
- priceTarget: predicted price in dollars
- timeHorizon: "1_day", "1_week", "1_month", or "3_months"
- confidence: 0.0-1.0 confidence in forecast
- reasoning: 2-3 sentence explanation

Return format: {"sentiment": "positive", "impactScore": 0.75, "priceTarget": 185.50, "timeHorizon": "1_week", "confidence": 0.82, "reasoning": "..."}`;

  const response = await chat([
    { role: 'system', content: 'You are a financial analyst forecasting stock price movements. Return only valid JSON.' },
    { role: 'user', content: prompt }
  ], 0.5);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON object found in response');
    
    return JSON.parse(jsonMatch[0]);
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
