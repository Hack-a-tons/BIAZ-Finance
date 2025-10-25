import { chat } from './index';
import { getPrompt } from './prompts';

export interface ExtractedClaim {
  text: string;
  confidence: number;
}

export async function extractClaims(articleText: string, title: string): Promise<ExtractedClaim[]> {
  const systemPrompt = getPrompt('extract-claims-system');
  const userPrompt = getPrompt('extract-claims-user', { title, articleText });

  const response = await chat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], 0.3);

  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found in response');
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Failed to parse claims:', error);
    return [];
  }
}
