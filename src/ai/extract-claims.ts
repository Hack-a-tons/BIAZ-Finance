import { chat } from './index';
import { getPrompt } from './prompts';
import { cacheGet, cacheSet, aiCacheKey } from '../cache';

export interface ExtractedClaim {
  text: string;
  confidence: number;
}

export async function extractClaims(articleText: string, title: string): Promise<ExtractedClaim[]> {
  // Check cache
  const cacheKey = aiCacheKey('extract-claims', title + articleText);
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  const systemPrompt = getPrompt('extract-claims-system');
  const userPrompt = getPrompt('extract-claims-user', { title, articleText });

  const response = await chat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], 0.3);

  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found in response');
    
    const claims = JSON.parse(jsonMatch[0]);
    
    // Cache for 24 hours (AI responses are deterministic)
    await cacheSet(cacheKey, JSON.stringify(claims), 86400);
    
    return claims;
  } catch (error) {
    console.error('Failed to parse claims:', error);
    return [];
  }
}
