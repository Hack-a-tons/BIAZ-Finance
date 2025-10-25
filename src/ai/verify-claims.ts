import { chat } from './index';

export interface VerifiedClaim {
  text: string;
  verified: boolean;
  confidence: number;
  evidenceLinks: string[];
}

export async function verifyClaims(claims: Array<{ text: string; confidence: number }>, context: string): Promise<VerifiedClaim[]> {
  const prompt = `Verify these financial claims. Return ONLY a JSON array.

Context: ${context}

Claims to verify:
${claims.map((c, i) => `${i + 1}. ${c.text}`).join('\n')}

For each claim, determine:
- verified: true if claim can be reasonably verified, false if speculative/unverified
- confidence: 0.0-1.0 confidence in verification
- evidenceLinks: array of relevant URLs (use official sources, SEC filings, company IR pages)

Return format: [{"text": "claim", "verified": true, "confidence": 0.9, "evidenceLinks": ["url1", "url2"]}, ...]`;

  const response = await chat([
    { role: 'system', content: 'You are a fact-checker for financial news. Return only valid JSON.' },
    { role: 'user', content: prompt }
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
