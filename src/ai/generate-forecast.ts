import { chat } from './index';
import { getPrompt } from './prompts';

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
