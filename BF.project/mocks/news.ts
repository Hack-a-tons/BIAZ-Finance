/**
 * News Data Types and Mock Data
 * 
 * This file contains:
 * - Type definitions for news items, stocks, and predictions
 * - Mock news data for demonstration and testing
 * 
 * In a production app, this data would be fetched from a backend API
 * and the types would be shared between frontend and backend.
 */

/**
 * NewsItem Type
 * 
 * Represents a single news article with related stocks and AI-powered impact prediction
 */
export type NewsItem = {
  id: string;  // Unique identifier
  
  // ===== SECTION 1: NEWS ARTICLE DATA =====
  title: string;       // Article headline
  snippet: string;     // Brief article preview/summary
  imageUrl: string;    // News image URL (from Unsplash)
  source: string;      // News source (e.g., "Bloomberg", "Reuters")
  timestamp: string;   // Publication time (e.g., "2 hours ago")
  
  // ===== SECTION 2: RELATED STOCKS DATA =====
  relatedStocks: Stock[];  // Array of stocks affected by this news
  
  // ===== SECTION 3: AI IMPACT PREDICTION =====
  prediction: Prediction;  // AI-generated forecast of news impact on stocks
  
  // ===== SECTION 4: TRUTH SCORE (from API) =====
  truthScore?: number;  // Truth score from API (0.0 to 1.0)
};

/**
 * Stock Type
 * 
 * Represents stock information for a company
 */
export type Stock = {
  symbol: string;           // Stock ticker symbol (e.g., "AAPL")
  companyName: string;      // Full company name (e.g., "Apple Inc.")
  currentPrice: number;     // Current stock price in USD
  priceChange: number;      // Price change percentage (e.g., 2.34 = +2.34%)
  priceChangeValue: number; // Absolute price change in USD
};

/**
 * Prediction Type
 * 
 * Represents AI-generated impact prediction for news
 */
export type Prediction = {
  sentiment: 'positive' | 'negative' | 'neutral';  // Overall market sentiment
  shortAnalysis: string;      // Brief analysis for preview (2-3 sentences)
  description: string;        // Detailed prediction explanation
  impactLevel: 'low' | 'medium' | 'high';  // Predicted impact magnitude
  timeframe: string;          // Time horizon (e.g., "Short-term (1-3 months)")
  keyPoints: string[];        // Bullet points highlighting key insights
};

// ==========================================
// MOCK NEWS DATA
// ==========================================

/**
 * Mock news data array
 * 
 * Contains sample financial news with:
 * - Real company tickers and names
 * - Realistic price changes and predictions
 * - Images from Unsplash
 * 
 * In production, replace with API calls to a backend service
 */
export const mockNewsData: NewsItem[] = [
  // ========================================
  // NEWS ITEM 1: Apple Vision Pro 2 Launch
  // ========================================
  {
    id: '1',
    title: 'Apple Unveils Revolutionary Vision Pro 2',
    snippet: 'Apple announced the second version of its mixed reality headset with improved resolution and up to 8 hours of battery life.',
    imageUrl: 'https://images.unsplash.com/photo-1611472173362-3f53dbd65d80?w=800&q=80',
    source: 'Bloomberg',
    timestamp: '2 hours ago',
    relatedStocks: [
      {
        symbol: 'AAPL',
        companyName: 'Apple Inc.',
        currentPrice: 178.45,
        priceChange: 2.34,
        priceChangeValue: 4.08
      },
      {
        symbol: 'META',
        companyName: 'Meta Platforms',
        currentPrice: 332.12,
        priceChange: -0.87,
        priceChangeValue: -2.91
      }
    ],
    prediction: {
      sentiment: 'positive',
      shortAnalysis: 'This product launch signals Apple\'s strong commitment to the AR/VR market. The improved specs should drive adoption among early adopters and enterprises, potentially boosting AAPL stock by 8-12% over the next quarter as investors price in future wearables revenue.',
      description: 'The launch of Vision Pro 2 could significantly increase Apple\'s revenue in the wearables segment, establishing a stronger foothold in the emerging mixed reality market.',
      impactLevel: 'high',
      timeframe: 'Mid-term (3-6 months)',
      keyPoints: [
        'Potential revenue growth of 15-20% in Q2',
        'Increased market share in AR/VR devices',
        'Potential pressure on competitors (Meta, Sony)',
        'Positive impact on developer ecosystem'
      ]
    }
  },
  // ========================================
  // NEWS ITEM 2: Tesla Production Record
  // ========================================
  {
    id: '2',
    title: 'Tesla Reaches Record Production Levels',
    snippet: 'Tesla reported producing 500,000 electric vehicles in the last quarter, exceeding analyst expectations by 12%.',
    imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80',
    source: 'Reuters',
    timestamp: '4 hours ago',
    relatedStocks: [
      {
        symbol: 'TSLA',
        companyName: 'Tesla Inc.',
        currentPrice: 242.87,
        priceChange: 5.67,
        priceChangeValue: 13.02
      },
      {
        symbol: 'GM',
        companyName: 'General Motors',
        currentPrice: 38.92,
        priceChange: -1.23,
        priceChangeValue: -0.48
      },
      {
        symbol: 'F',
        companyName: 'Ford Motor',
        currentPrice: 12.45,
        priceChange: -0.95,
        priceChangeValue: -0.12
      }
    ],
    prediction: {
      sentiment: 'positive',
      shortAnalysis: 'Beating production targets by 12% demonstrates Tesla\'s operational excellence and growing demand. This should trigger analyst upgrades and push TSLA higher. Traditional automakers like GM and Ford face increased competitive pressure, likely seeing downward revisions.',
      description: 'Record production strengthens Tesla\'s position as the leader in the electric vehicle market and validates their manufacturing scalability.',
      impactLevel: 'high',
      timeframe: 'Short-term (1-3 months)',
      keyPoints: [
        'Exceeding forecasts could lead to 8-10% growth',
        'Improved operational efficiency',
        'Negative pressure on traditional automakers',
        'Possible analyst target price increases'
      ]
    }
  },
  // ========================================
  // NEWS ITEM 3: Federal Reserve Rate Cuts
  // ========================================
  {
    id: '3',
    title: 'Fed Signals Possible Rate Cuts',
    snippet: 'The Federal Reserve hinted at a potential reduction in interest rates in the next quarter.',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    source: 'Financial Times',
    timestamp: '6 hours ago',
    relatedStocks: [
      {
        symbol: 'JPM',
        companyName: 'JPMorgan Chase',
        currentPrice: 156.78,
        priceChange: -1.45,
        priceChangeValue: -2.31
      },
      {
        symbol: 'BAC',
        companyName: 'Bank of America',
        currentPrice: 34.56,
        priceChange: -1.89,
        priceChangeValue: -0.67
      },
      {
        symbol: 'GS',
        companyName: 'Goldman Sachs',
        currentPrice: 389.23,
        priceChange: -2.12,
        priceChangeValue: -8.43
      }
    ],
    prediction: {
      sentiment: 'negative',
      shortAnalysis: 'Lower interest rates compress bank net interest margins, which is why JPM, BAC, and GS are declining. However, this creates opportunity in rate-sensitive sectors like tech and real estate. Banks could see 5-8% downside near-term, but the broader market may rally.',
      description: 'Rate cuts could negatively impact bank margins in the short term but ultimately stimulate broader economic activity and market growth.',
      impactLevel: 'medium',
      timeframe: 'Mid-term (3-6 months)',
      keyPoints: [
        'Compression of interest margins for banks',
        'Positive for high-valuation tech companies',
        'Potential lending growth',
        'Overall economic stimulus'
      ]
    }
  },
  // ========================================
  // NEWS ITEM 4: NVIDIA AI Chip Launch
  // ========================================
  {
    id: '4',
    title: 'NVIDIA Announces New Generation of AI Chips',
    snippet: 'NVIDIA introduced the H200 chips, promising 2x performance in machine learning tasks compared to the H100.',
    imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80',
    source: 'TechCrunch',
    timestamp: '8 hours ago',
    relatedStocks: [
      {
        symbol: 'NVDA',
        companyName: 'NVIDIA Corp.',
        currentPrice: 478.92,
        priceChange: 7.23,
        priceChangeValue: 32.31
      },
      {
        symbol: 'AMD',
        companyName: 'Advanced Micro Devices',
        currentPrice: 142.67,
        priceChange: -2.34,
        priceChangeValue: -3.42
      },
      {
        symbol: 'INTC',
        companyName: 'Intel Corp.',
        currentPrice: 43.21,
        priceChange: -1.56,
        priceChangeValue: -0.68
      }
    ],
    prediction: {
      sentiment: 'positive',
      shortAnalysis: 'The H200 launch cements NVIDIA\'s AI chip monopoly. With 2x performance gains, hyperscalers will rush to upgrade, driving massive orders. NVDA could see 20-25% upside as revenue guidance increases. AMD and Intel face continued share loss and margin pressure.',
      description: 'The new chips strengthen NVIDIA\'s dominance in the $150 billion AI accelerator market, creating a widening technological moat.',
      impactLevel: 'high',
      timeframe: 'Long-term (6-12 months)',
      keyPoints: [
        'Expected revenue growth of 25-30% in 2025',
        'Widening gap from competitors',
        'High demand from major tech companies',
        'Risk of regulatory restrictions on exports to China'
      ]
    }
  },
  // ========================================
  // NEWS ITEM 5: Amazon Cloud Expansion
  // ========================================
  {
    id: '5',
    title: 'Amazon Expands Data Center Network',
    snippet: 'Amazon Web Services announced a $10 billion investment to build new cloud data centers.',
    imageUrl: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=800&q=80',
    source: 'CNBC',
    timestamp: '10 hours ago',
    relatedStocks: [
      {
        symbol: 'AMZN',
        companyName: 'Amazon.com Inc.',
        currentPrice: 142.35,
        priceChange: 1.87,
        priceChangeValue: 2.61
      },
      {
        symbol: 'MSFT',
        companyName: 'Microsoft Corp.',
        currentPrice: 378.91,
        priceChange: 0.45,
        priceChangeValue: 1.70
      },
      {
        symbol: 'GOOGL',
        companyName: 'Alphabet Inc.',
        currentPrice: 139.82,
        priceChange: 0.23,
        priceChangeValue: 0.32
      }
    ],
    prediction: {
      sentiment: 'positive',
      shortAnalysis: 'Amazon\'s $10B infrastructure bet signals robust cloud demand and AI workload growth. While capex will temporarily pressure margins, this positions AWS to maintain its 32% market share lead. AMZN should see modest 3-5% gains as investors value long-term positioning over near-term margin compression.',
      description: 'Infrastructure investments strengthen AWS\'s position as the leader in the cloud market and support the growing AI and enterprise workload demands.',
      impactLevel: 'medium',
      timeframe: 'Long-term (6-12 months)',
      keyPoints: [
        'Maintaining cloud market leadership (32% share)',
        'Increased capital expenditures may pressure margins',
        'Positive signal of growing demand for cloud services',
        'Competition with Microsoft Azure and Google Cloud'
      ]
    }
  }
];
