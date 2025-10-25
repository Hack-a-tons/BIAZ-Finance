/**
 * BIAZ Finance API Types
 * 
 * Type definitions for the BIAZ Finance API
 * Base URL: https://api.news.biaz.hurated.com/v1
 */

export type ImpactSentiment = 'positive' | 'neutral' | 'negative';
export type TimeHorizon = '1_day' | '1_week' | '1_month' | '3_months';
export type SourceCategory = 'mainstream_media' | 'tech_media' | 'news_agency' | 'custom';

/**
 * Article Claim with verification details
 */
export type Claim = {
  id: string;
  text: string;
  verified: boolean;
  confidence: number;
  evidenceLinks: string[];
};

/**
 * Article from the API
 */
export type Article = {
  id: string;
  title: string;
  summary: string;
  forecastSummary?: string;
  url: string;
  imageUrl: string;
  publishedAt: string;
  source: string;
  sourceName?: string;
  symbols: string[];
  truthScore: number;
  impactSentiment: ImpactSentiment;
  forecast?: Forecast;
  forecastId?: string;
  claims?: Claim[];
  explanation?: string;
  scoredAt?: string;
};

/**
 * Articles list response with pagination
 */
export type ArticlesResponse = {
  data: Article[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
};

/**
 * Query parameters for fetching articles
 */
export type ArticlesQuery = {
  symbol?: string;
  from?: string;
  source?: string;
  page?: number;
  limit?: number;
};

/**
 * News source information
 */
export type Source = {
  id: string;
  name: string;
  domain: string;
  credibilityScore: number;
  category: SourceCategory;
  verifiedPublisher: boolean;
};

/**
 * Sources list response
 */
export type SourcesResponse = {
  data: Source[];
};

/**
 * Stock information
 */
export type StockInfo = {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  currentPrice: number;
  change: string;
  articleCount: number;
};

/**
 * Stocks list response
 */
export type StocksResponse = {
  data: StockInfo[];
};

/**
 * Stocks query parameters
 */
export type StocksQuery = {
  search?: string;
};

/**
 * AI-generated forecast
 */
export type Forecast = {
  id: string;
  articleId: string;
  symbol: string;
  sentiment: ImpactSentiment;
  impactScore: number;
  priceTarget: number;
  timeHorizon: TimeHorizon;
  confidence: number;
  reasoning: string;
  generatedAt: string;
};

/**
 * Request body for ingesting new article
 */
export type IngestArticleRequest = {
  url: string;
  symbol: string;
};

/**
 * Request body for creating new forecast
 */
export type CreateForecastRequest = {
  articleId: string;
  symbol: string;
};

/**
 * Request body for creating custom source
 */
export type CreateSourceRequest = {
  name: string;
  domain: string;
  credibilityScore: number;
};
