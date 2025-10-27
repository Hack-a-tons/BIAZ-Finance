Extract stock ticker symbols from this financial news. Return ONLY a JSON array of symbols.

Title: ${title}
Text: ${text}

Include:
1. Companies explicitly mentioned by name or ticker
2. Companies that would be significantly affected by the events described (e.g., competitors, suppliers, industry leaders)

Return format: ["AAPL", "TSLA"]
Maximum 5 symbols, prioritize most relevant.
