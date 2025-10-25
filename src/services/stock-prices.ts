import { query } from '../db';

interface StockQuote {
  symbol: string;
  price: number;
  change: string;
  name: string;
  exchange: string;
}

// Cache prices for 15 minutes
const priceCache = new Map<string, { data: StockQuote; timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export async function getStockPrice(symbol: string): Promise<StockQuote | null> {
  try {
    // Check cache
    const cached = priceCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    // Fetch from Yahoo Finance API (free, no key needed)
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    const response = await fetch(url);
    const data: any = await response.json();
    
    if (!data.chart?.result?.[0]) {
      console.error(`No price data for ${symbol}`);
      return null;
    }

    const result = data.chart.result[0];
    const meta = result.meta;
    const price = meta.regularMarketPrice;
    const previousClose = meta.chartPreviousClose || meta.previousClose;
    const change = price - previousClose;
    const changePercent = (change / previousClose) * 100;
    const changeStr = changePercent >= 0 
      ? `+${changePercent.toFixed(2)}%` 
      : `${changePercent.toFixed(2)}%`;

    const stockQuote: StockQuote = {
      symbol,
      price,
      change: changeStr,
      name: meta.longName || meta.shortName || symbol,
      exchange: meta.exchangeName || 'NASDAQ',
    };

    // Cache it
    priceCache.set(symbol, { data: stockQuote, timestamp: Date.now() });

    return stockQuote;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return null;
  }
}

export async function updateStockPrices(symbols: string[]): Promise<void> {
  console.log(`Updating prices for ${symbols.length} stocks...`);
  
  for (const symbol of symbols) {
    try {
      const quote = await getStockPrice(symbol);
      if (!quote) continue;

      // Update database
      await query(
        `INSERT INTO stocks (symbol, name, exchange, sector, current_price, change, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (symbol) 
         DO UPDATE SET 
           name = EXCLUDED.name,
           exchange = EXCLUDED.exchange,
           current_price = EXCLUDED.current_price,
           change = EXCLUDED.change,
           updated_at = NOW()`,
        [symbol, quote.name, quote.exchange, 'Technology', quote.price, quote.change]
      );

      console.log(`Updated ${symbol}: $${quote.price} (${quote.change})`);
    } catch (error) {
      console.error(`Failed to update ${symbol}:`, error);
    }
  }
}

export async function getStocksNeedingUpdate(): Promise<string[]> {
  // Get stocks that haven't been updated in 15 minutes
  const result = await query(
    `SELECT DISTINCT symbol FROM stocks 
     WHERE updated_at < NOW() - INTERVAL '15 minutes' 
     OR updated_at IS NULL`
  );
  
  return result.rows.map(row => row.symbol);
}
