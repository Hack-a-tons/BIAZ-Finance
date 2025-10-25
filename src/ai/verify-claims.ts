import { chat } from './index';
import { getPrompt } from './prompts';

export interface VerifiedClaim {
  text: string;
  verified: boolean;
  confidence: number;
  evidenceLinks: string[];
}

export async function verifyClaims(claims: Array<{ text: string; confidence: number }>, context: string): Promise<VerifiedClaim[]> {
  const claimsList = claims.map((c, i) => `${i + 1}. ${c.text}`).join('\n');
  
  const systemPrompt = getPrompt('verify-claims-system');
  const userPrompt = getPrompt('verify-claims-user', { context, claimsList });

  const response = await chat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], 0.3);

  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found in response');
    
    return JSON.parse(jsonMatch[0]);
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
