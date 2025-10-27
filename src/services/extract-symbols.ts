import { chat } from '../ai';
import { getPrompt } from '../ai/prompts';

const COMMON_SYMBOLS = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'AMD', 'INTC', 'NFLX'];

export async function extractSymbols(title: string, text: string, manualSymbol?: string): Promise<string[]> {
  if (manualSymbol) {
    return [manualSymbol.toUpperCase()];
  }

  try {
    // First try regex pattern matching
    const regexSymbols = extractSymbolsRegex(title + ' ' + text);
    if (regexSymbols.length > 0) {
      return regexSymbols;
    }

    // Fallback to AI extraction for explicitly mentioned symbols
    const systemPrompt = 'You are a financial analyst. Return only valid JSON arrays of stock symbols.';
    const userPrompt = `Extract stock ticker symbols that are EXPLICITLY MENTIONED by name or ticker in this text. Return ONLY a JSON array.

Title: ${title}
Text: ${text.substring(0, 500)}

Return format: ["AAPL", "TSLA"]`;

    const response = await chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], 0.3);

    const jsonMatch = response.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      const symbols = JSON.parse(jsonMatch[0]);
      return symbols.map((s: string) => s.toUpperCase()).slice(0, 5);
    }

    return [];
  } catch (error) {
    console.error('Symbol extraction error:', error);
    return [];
  }
}

export async function extractAffectedSymbols(title: string, text: string): Promise<string[]> {
  try {
    const systemPrompt = 'You are a financial analyst specializing in market impact analysis. Return only valid JSON arrays of stock symbols.';
    const userPrompt = `Analyze this news and identify publicly traded companies (US stock symbols) that would be SIGNIFICANTLY AFFECTED by these events, even if not explicitly mentioned.

Title: ${title}
Text: ${text.substring(0, 1000)}

Consider:
- Insurance companies (for natural disasters)
- Retailers, hotels, airlines (for travel/tourism impacts)
- Construction, home improvement (for rebuilding)
- Utilities, energy companies (for infrastructure)
- Supply chain and logistics companies
- Industry leaders and major competitors

Return ONLY a JSON array of 3-7 most relevant US stock symbols.
Format: ["ALL", "TRV", "HD", "LOW", "UAL"]`;

    const response = await chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], 0.5);

    const jsonMatch = response.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      const symbols = JSON.parse(jsonMatch[0]);
      return symbols.map((s: string) => s.toUpperCase()).slice(0, 7);
    }

    return [];
  } catch (error) {
    console.error('Affected symbols extraction error:', error);
    return [];
  }
}

function extractSymbolsRegex(text: string): string[] {
  const symbols = new Set<string>();
  
  // Match common patterns like "AAPL", "$AAPL", "NASDAQ:AAPL"
  const patterns = [
    /\b([A-Z]{2,5})\b/g,
    /\$([A-Z]{2,5})\b/g,
    /NASDAQ:([A-Z]{2,5})\b/g,
    /NYSE:([A-Z]{2,5})\b/g,
  ];

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const symbol = match[1];
      if (COMMON_SYMBOLS.includes(symbol)) {
        symbols.add(symbol);
      }
    }
  }

  return Array.from(symbols).slice(0, 5);
}
