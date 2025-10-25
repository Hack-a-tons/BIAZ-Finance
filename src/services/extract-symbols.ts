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

    // Fallback to AI extraction
    const systemPrompt = getPrompt('extract-symbols-system');
    const userPrompt = getPrompt('extract-symbols-user', {
      title,
      text: text.substring(0, 500)
    });

    const response = await chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], 0.3);

    const jsonMatch = response.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      const symbols = JSON.parse(jsonMatch[0]);
      return symbols.map((s: string) => s.toUpperCase()).slice(0, 3);
    }

    return [];
  } catch (error) {
    console.error('Symbol extraction error:', error);
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

  return Array.from(symbols).slice(0, 3);
}
