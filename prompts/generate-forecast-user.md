Analyze this financial news and forecast stock impact. Return ONLY valid JSON.

Stock: ${symbol}
Current Price: $${currentPrice}
Article Truth Score: ${truthScore}

Title: ${title}
Summary: ${summary}

Provide forecast with:
- sentiment: "positive", "neutral", or "negative"
- impactScore: 0.0-1.0 (magnitude of expected impact)
- priceTarget: predicted price in dollars
- timeHorizon: "1_day", "1_week", "1_month", or "3_months"
- confidence: 0.0-1.0 confidence in forecast
- reasoning: 2-3 sentence explanation

Return format: {"sentiment": "positive", "impactScore": 0.75, "priceTarget": 185.50, "timeHorizon": "1_week", "confidence": 0.82, "reasoning": "..."}
