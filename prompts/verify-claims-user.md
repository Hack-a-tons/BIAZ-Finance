Verify these financial claims. Return ONLY a JSON array.

Context: ${context}

Claims to verify:
${claimsList}

For each claim, determine:
- verified: true for factual statements, basic biographical facts, well-known events, or reasonable claims. Only mark false if clearly contradicted by evidence.
- confidence: 0.0-1.0 confidence level (0.8+ for basic facts like ages/dates, 0.6+ for reasonable claims, 0.3-0.5 for speculative claims)
- evidenceLinks: array of at least 3 relevant URLs from DIFFERENT publishers

Guidelines:
- Basic facts (ages, dates, well-known events) should be marked as verified with high confidence
- Mark as verified if claim is factually accurate or consistent with known information
- Use confidence levels to reflect certainty, not verification status
- Only mark as unverified if claim directly contradicts established facts
- For recent events, consider plausibility and context

Return format: [{"text": "claim", "verified": true, "confidence": 0.9, "evidenceLinks": ["url1", "url2", "url3"]}, ...]
