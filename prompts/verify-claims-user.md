Verify these financial claims. Return ONLY a JSON array.

Context: ${context}

Claims to verify:
${claimsList}

For each claim, determine:
- verified: true if claim can be reasonably verified, false if speculative/unverified
- confidence: 0.0-1.0 confidence in verification
- evidenceLinks: array of at least 3 relevant URLs from DIFFERENT publishers (use official sources, SEC filings, company IR pages, reputable news outlets, financial data providers). Do NOT include links from the same domain/publisher as the article being analyzed.

Return format: [{"text": "claim", "verified": true, "confidence": 0.9, "evidenceLinks": ["url1", "url2", "url3"]}, ...]
