Verify these claims. Return ONLY a JSON array.

Context: ${context}

Claims:
${claimsList}

For each claim:
- verified: true if claim seems reasonable/plausible, false only if clearly wrong
- confidence: 0.5-0.7 for reasonable claims, 0.8+ for well-known facts, 0.3-0.4 for speculative claims
- evidenceLinks: 3 relevant URLs from different sources

Be generous with verification - mark as verified unless clearly false.

Return: [{"text": "claim", "verified": true, "confidence": 0.7, "evidenceLinks": ["url1", "url2", "url3"]}, ...]
