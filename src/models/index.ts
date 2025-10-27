export interface Source {
  id: string;
  name: string;
  domain: string;
  credibilityScore: number;
  category: string;
  verifiedPublisher: boolean;
  createdAt?: Date;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  url: string;
  imageUrl: string | null;
  publishedAt: string;
  source: string;
  symbols: string[];
  symbolsMentioned?: string[];
  symbolsAffected?: string[];
  truthScore: number;
  impactSentiment: string;
  claims?: Claim[];
  explanation: string;
  forecastId: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Stock {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  currentPrice: number;
  change: string;
  articleCount?: number;
  updatedAt?: Date;
}

export interface Claim {
  id: string;
  text: string;
  verified: boolean;
  confidence: number;
  evidenceLinks: string[];
}

export interface Forecast {
  id: string;
  articleId: string;
  symbol: string;
  sentiment: string;
  impactScore: number;
  priceTarget: number;
  timeHorizon: string;
  confidence: number;
  reasoning: string;
  generatedAt: string;
}
