/**
 * Data Transformers
 * 
 * Utilities to transform API data into app data structures
 */

import type { Article } from '@/types/api';
import type { NewsItem, Stock, Prediction } from '@/mocks/news';
import { stocksApi, forecastsApi } from '@/services/api';

/**
 * Calculate relative time string (e.g., "2 hours ago")
 */
function getRelativeTime(isoDate: string): string {
  const now = new Date();
  const published = new Date(isoDate);
  const diffMs = now.getTime() - published.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return published.toLocaleDateString();
  }
}

/**
 * Transform timeHorizon from API to display string
 */
function transformTimeHorizon(horizon: string): string {
  const map: Record<string, string> = {
    '1_day': 'Short-term (1 day)',
    '1_week': 'Short-term (1 week)',
    '1_month': 'Mid-term (1 month)',
    '3_months': 'Mid-term (3 months)',
  };
  return map[horizon] || horizon;
}

/**
 * Transform impactScore to impactLevel
 */
function getImpactLevel(score: number): 'low' | 'medium' | 'high' {
  if (score >= 0.7) return 'high';
  if (score >= 0.4) return 'medium';
  return 'low';
}

/**
 * Fetch stock data for symbols and transform to app format
 * Makes a single API call to get all stocks, then filters locally
 */
async function fetchStockDataForSymbols(symbols: string[]): Promise<Stock[]> {
  try {
    console.log('[DataTransformer] Fetching stock data for symbols:', symbols);
    const stocksResponse = await stocksApi.list();
    const stocks = stocksResponse.data;
    
    console.log('[DataTransformer] Received stocks data:', stocks?.length || 0, 'stocks');
    
    return symbols.map(symbol => {
      const stockInfo = stocks.find(s => s.symbol === symbol);
      
      if (stockInfo) {
        const changeValue = parseFloat(stockInfo.change.replace('%', ''));
        const priceChangeValue = stockInfo.currentPrice * (changeValue / 100);
        
        console.log(`[DataTransformer] Found stock ${symbol}:`, stockInfo);
        
        return {
          symbol: stockInfo.symbol,
          companyName: stockInfo.name,
          currentPrice: stockInfo.currentPrice,
          priceChange: changeValue,
          priceChangeValue: priceChangeValue,
        };
      }
      
      console.warn(`[DataTransformer] Stock ${symbol} not found in API, using placeholder`);
      
      return {
        symbol,
        companyName: symbol,
        currentPrice: 150.00,
        priceChange: 2.5,
        priceChangeValue: 3.75,
      };
    });
  } catch (error) {
    console.error('[DataTransformer] Error fetching stock data, using placeholders:', error);
    return symbols.map(symbol => ({
      symbol,
      companyName: symbol,
      currentPrice: 150.00,
      priceChange: 2.5,
      priceChangeValue: 3.75,
    }));
  }
}

/**
 * Transform forecast object to prediction format
 */
function transformForecastToPrediction(forecast: import('@/types/api').Forecast): Prediction {
  return {
    sentiment: forecast.sentiment,
    shortAnalysis: forecast.reasoning.substring(0, 200) + '...',
    description: forecast.reasoning,
    impactLevel: getImpactLevel(forecast.impactScore),
    timeframe: transformTimeHorizon(forecast.timeHorizon),
    keyPoints: [
      `Price target: ${forecast.priceTarget.toFixed(2)}`,
      `Confidence: ${(forecast.confidence * 100).toFixed(0)}%`,
      `Impact score: ${(forecast.impactScore * 100).toFixed(0)}%`,
      `Primary symbol: ${forecast.symbol}`,
    ],
  };
}

/**
 * Fetch forecast for article and transform to prediction format
 */
async function fetchForecastForArticle(article: Article): Promise<Prediction> {
  try {
    if (article.forecast) {
      return transformForecastToPrediction(article.forecast);
    }
    
    if (article.forecastId) {
      const forecast = await forecastsApi.getById(article.forecastId);
      return transformForecastToPrediction(forecast);
    }
    
    return {
      sentiment: article.impactSentiment,
      shortAnalysis: article.forecastSummary || article.summary,
      description: article.summary,
      impactLevel: 'medium',
      timeframe: 'Short-term (1 week)',
      keyPoints: [
        'Truth score: ' + (article.truthScore * 100).toFixed(0) + '%',
        'Based on verified claims',
      ],
    };
  } catch (error) {
    console.error('[DataTransformer] Error fetching forecast:', error);
    
    return {
      sentiment: article.impactSentiment,
      shortAnalysis: article.forecastSummary || article.summary,
      description: article.summary,
      impactLevel: 'medium',
      timeframe: 'Short-term (1 week)',
      keyPoints: [
        'Truth score: ' + (article.truthScore * 100).toFixed(0) + '%',
      ],
    };
  }
}



/**
 * Transform Article from API to NewsItem for the app
 */
export async function transformArticleToNewsItem(article: Article): Promise<NewsItem> {
  console.log('[DataTransformer] Transforming article:', article.id);
  
  const [relatedStocks, prediction] = await Promise.all([
    fetchStockDataForSymbols(article.symbols),
    fetchForecastForArticle(article),
  ]);
  
  console.log('[DataTransformer] Transformed article:', article.id, 'with', relatedStocks.length, 'stocks');

  return {
    id: article.id,
    title: article.title,
    snippet: article.forecastSummary || article.summary,
    imageUrl: article.imageUrl,
    source: article.sourceName || article.source,
    timestamp: getRelativeTime(article.publishedAt),
    relatedStocks,
    prediction,
    truthScore: article.truthScore,
  };
}

/**
 * Transform multiple articles efficiently
 * Fetches all stocks data once and reuses for all articles
 */
export async function transformArticlesToNewsItems(articles: Article[]): Promise<NewsItem[]> {
  console.log('[DataTransformer] Transforming', articles.length, 'articles');
  
  let stocksCache: Map<string, Stock> | null = null;
  
  try {
    const stocksResponse = await stocksApi.list();
    stocksCache = new Map(
      stocksResponse.data.map(stock => {
        const changeValue = parseFloat(stock.change.replace('%', ''));
        const priceChangeValue = stock.currentPrice * (changeValue / 100);
        
        return [
          stock.symbol,
          {
            symbol: stock.symbol,
            companyName: stock.name,
            currentPrice: stock.currentPrice,
            priceChange: changeValue,
            priceChangeValue: priceChangeValue,
          }
        ];
      })
    );
    console.log('[DataTransformer] Cached', stocksCache.size, 'stocks');
  } catch (error) {
    console.error('[DataTransformer] Failed to fetch stocks cache:', error);
  }
  
  const newsItems = await Promise.all(
    articles.map(async article => {
      let relatedStocks: Stock[] = [];
      
      if (article.symbols && article.symbols.length > 0) {
        relatedStocks = article.symbols.map(symbol => {
          if (stocksCache?.has(symbol)) {
            return stocksCache.get(symbol)!;
          }
          
          console.warn(`[DataTransformer] Stock ${symbol} not in cache, using placeholder`);
          return {
            symbol,
            companyName: symbol,
            currentPrice: 150.00,
            priceChange: 2.5,
            priceChangeValue: 3.75,
          };
        });
      } else {
        console.log(`[DataTransformer] Article ${article.id} has no symbols, adding placeholder stock`);
        relatedStocks = [{
          symbol: 'N/A',
          companyName: 'No specific stocks',
          currentPrice: 0,
          priceChange: 0,
          priceChangeValue: 0,
        }];
      }
      
      const prediction = await fetchForecastForArticle(article);
      
      return {
        id: article.id,
        title: article.title,
        snippet: article.forecastSummary || article.summary,
        imageUrl: article.imageUrl,
        source: article.sourceName || article.source,
        timestamp: getRelativeTime(article.publishedAt),
        relatedStocks,
        prediction,
        truthScore: article.truthScore,
      };
    })
  );
  
  console.log('[DataTransformer] Successfully transformed', newsItems.length, 'articles');
  return newsItems;
}
