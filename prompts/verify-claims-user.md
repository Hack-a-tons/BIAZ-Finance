Verify these financial claims. Return ONLY a JSON array.

Context: ${context}

Claims to verify:
${claimsList}

For each claim, determine:
- verified: true if claim is factually accurate or plausible based on available information, false only if clearly contradicted by evidence
- confidence: 0.0-1.0 confidence level (0.6+ for reasonable claims, 0.8+ for well-documented facts, 0.3-0.5 for speculative but plausible claims)
- evidenceLinks: array of at least 3 relevant URLs from DIFFERENT publishers (use official sources, SEC filings, company IR pages, reputable news outlets, financial data providers). Do NOT include links from the same domain/publisher as the article being analyzed.

Guidelines:
- Mark as verified if the claim is consistent with known facts, even if not explicitly confirmed
- Use confidence levels to reflect uncertainty rather than marking everything as unverified
- Consider context and plausibility for recent events
- Only mark as unverified (false) if claim contradicts established facts

Return format: [{"text": "claim", "verified": true, "confidence": 0.9, "evidenceLinks": ["url1", "url2", "url3"]}, ...]
