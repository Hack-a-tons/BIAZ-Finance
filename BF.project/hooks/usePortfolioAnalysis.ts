import { useMemo } from 'react';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { useNewsArticles } from './useNewsArticles';
import type { NewsItem } from '@/mocks/news';

export type PortfolioInsight = {
  type: 'positive' | 'warning' | 'negative';
  title: string;
  description: string;
  timestamp: string;
  affectedSymbols: string[];
};

export type PortfolioRecommendation = {
  text: string;
  priority: 'high' | 'medium' | 'low';
};

export function usePortfolioAnalysis() {
  const { portfolioStocks } = usePortfolio();
  const { data: articles = [] } = useNewsArticles({ limit: 50 });

  const analysis = useMemo(() => {
    if (portfolioStocks.length === 0 || articles.length === 0) {
      return {
        insights: [] as PortfolioInsight[],
        recommendations: [] as PortfolioRecommendation[],
        totalValue: 0,
        hasData: false,
      };
    }

    const portfolioSymbols = portfolioStocks.map(stock => stock.symbol);
    const insights: PortfolioInsight[] = [];
    const recommendations: PortfolioRecommendation[] = [];

    articles.forEach((article: NewsItem) => {
      const affectedStocks = article.relatedStocks.filter(stock =>
        portfolioSymbols.includes(stock.symbol)
      );

      if (affectedStocks.length > 0) {
        const sentiment = article.prediction.sentiment;
        
        let insightType: 'positive' | 'warning' | 'negative';
        if (sentiment === 'positive') {
          insightType = 'positive';
        } else if (sentiment === 'negative') {
          insightType = 'negative';
        } else {
          insightType = 'warning';
        }

        insights.push({
          type: insightType,
          title: article.title,
          description: article.prediction.shortAnalysis,
          timestamp: article.timestamp,
          affectedSymbols: affectedStocks.map(s => s.symbol),
        });
      }
    });

    insights.sort((a, b) => {
      const priority = { negative: 3, warning: 2, positive: 1 };
      return priority[b.type] - priority[a.type];
    });

    const limitedInsights = insights.slice(0, 3);

    const positiveStocks = articles
      .flatMap(article => article.relatedStocks.filter(s => 
        portfolioSymbols.includes(s.symbol) && article.prediction.sentiment === 'positive'
      ))
      .map(s => s.symbol);
    
    const negativeStocks = articles
      .flatMap(article => article.relatedStocks.filter(s => 
        portfolioSymbols.includes(s.symbol) && article.prediction.sentiment === 'negative'
      ))
      .map(s => s.symbol);

    const uniquePositive = [...new Set(positiveStocks)];
    const uniqueNegative = [...new Set(negativeStocks)];

    if (uniqueNegative.length > 0) {
      recommendations.push({
        text: `Consider reviewing your positions in ${uniqueNegative.join(', ')} due to negative sentiment in recent news`,
        priority: 'high',
      });
    }

    if (uniquePositive.length > 0) {
      recommendations.push({
        text: `Strong positive sentiment detected for ${uniquePositive.join(', ')} - good opportunity for gains`,
        priority: 'medium',
      });
    }

    const techStocksCount = portfolioStocks.filter(stock => 
      ['AAPL', 'NVDA', 'MSFT', 'GOOGL', 'META', 'TSLA', 'AMD', 'INTC'].includes(stock.symbol)
    ).length;

    if (techStocksCount / portfolioStocks.length > 0.7) {
      recommendations.push({
        text: `High tech sector concentration (${Math.round(techStocksCount / portfolioStocks.length * 100)}%). Consider diversifying into other sectors`,
        priority: 'medium',
      });
    }

    portfolioStocks.forEach(stock => {
      if (!stock.alertThreshold) {
        recommendations.push({
          text: `Set price alert for ${stock.symbol} to monitor significant price changes`,
          priority: 'low',
        });
      }
    });

    const totalValue = portfolioStocks.reduce((sum, stock) => {
      return sum + (stock.shares * stock.avgPrice);
    }, 0);

    return {
      insights: limitedInsights,
      recommendations: recommendations.slice(0, 3),
      totalValue,
      hasData: true,
    };
  }, [portfolioStocks, articles]);

  return analysis;
}
