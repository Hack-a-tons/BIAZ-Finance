Verify these financial claims. Return ONLY a JSON array.

Context: ${context}

Claims to verify:
${claimsList}

For each claim, determine:
- verified: true if claim can be reasonably verified, false if speculative/unverified
- confidence: 0.0-1.0 confidence in verification
- evidenceLinks: array of relevant URLs (use official sources, SEC filings, company IR pages)

Return format: [{"text": "claim", "verified": true, "confidence": 0.9, "evidenceLinks": ["url1", "url2"]}, ...]
