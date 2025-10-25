Extract factual claims from this financial news article. Return ONLY a JSON array of claims.

Title: ${title}

Article: ${articleText}

Extract specific, verifiable factual claims (numbers, dates, events, statements). For each claim, provide:
- text: the exact claim
- confidence: 0.0-1.0 based on how specific and verifiable it is

Return format: [{"text": "claim text", "confidence": 0.95}, ...]
