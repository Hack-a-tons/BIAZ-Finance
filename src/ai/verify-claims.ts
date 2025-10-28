import { chat } from './index';
import { getPrompt } from './prompts';
import { cacheGet, cacheSet, aiCacheKey } from '../cache';

export interface VerifiedClaim {
  text: string;
  verified: boolean;
  confidence: number;
  evidenceLinks: string[];
}

export async function verifyClaims(claims: Array<{ text: string; confidence: number }>, context: string, sourceDomain?: string, progressCallback?: (claimIndex: number, total: number) => Promise<void>): Promise<VerifiedClaim[]> {
  const claimsList = claims.map((c, i) => `${i + 1}. ${c.text}`).join('\n');
  
  if (progressCallback) {
    await progressCallback(0, claims.length);
  }
  
  // Check cache
  const cacheKey = aiCacheKey('verify-claims', claimsList + context + (sourceDomain || ''));
  const cached = await cacheGet(cacheKey);
  if (cached) {
    if (progressCallback) {
      await progressCallback(claims.length, claims.length);
    }
    return JSON.parse(cached);
  }

  const systemPrompt = getPrompt('verify-claims-system');
  const userPrompt = getPrompt('verify-claims-user', { context, claimsList });

  if (progressCallback) {
    await progressCallback(Math.floor(claims.length / 2), claims.length);
  }

  const response = await chat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], 0.3);

  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found in response');
    
    const verified = JSON.parse(jsonMatch[0]);
    
    // Filter out same-publisher links
    const filtered = verified.map((v: VerifiedClaim) => ({
      ...v,
      evidenceLinks: v.evidenceLinks.filter(link => {
        try {
          const linkDomain = new URL(link).hostname.replace('www.', '');
          const srcDomain = sourceDomain?.replace('www.', '') || 'demo.example.com';
          return linkDomain !== srcDomain;
        } catch {
          return true;
        }
      })
    }));
    
    // Cache for 24 hours
    await cacheSet(cacheKey, JSON.stringify(filtered), 86400);
    
    return filtered;
  } catch (error) {
    console.error('Failed to parse verification:', error);
    return claims.map(c => ({
      text: c.text,
      verified: false,
      confidence: c.confidence,
      evidenceLinks: []
    }));
  }
}

export function calculateTruthScore(verifiedClaims: VerifiedClaim[]): number {
  if (verifiedClaims.length === 0) return 0.5;
  
  const totalWeight = verifiedClaims.reduce((sum, c) => sum + c.confidence, 0);
  const verifiedWeight = verifiedClaims
    .filter(c => c.verified)
    .reduce((sum, c) => sum + c.confidence, 0);
  
  return totalWeight > 0 ? verifiedWeight / totalWeight : 0.5;
}
