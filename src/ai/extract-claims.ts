import { chat } from './index';

export interface ExtractedClaim {
  text: string;
  confidence: number;
}

export async function extractClaims(articleText: string, title: string): Promise<ExtractedClaim[]> {
  const prompt = `Extract factual claims from this financial news article. Return ONLY a JSON array of claims.

Title: ${title}

Article: ${articleText}

Extract specific, verifiable factual claims (numbers, dates, events, statements). For each claim, provide:
- text: the exact claim
- confidence: 0.0-1.0 based on how specific and verifiable it is

Return format: [{"text": "claim text", "confidence": 0.95}, ...]`;

  const response = await chat([
    { role: 'system', content: 'You are a financial analyst extracting factual claims from news articles. Return only valid JSON.' },
    { role: 'user', content: prompt }
  ], 0.3);

  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found in response');
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Failed to parse claims:', error);
    return [];
  }
}
