/**
 * Portfolio Context
 * 
 * Manages user's stock portfolio with persistent storage.
 * Uses AsyncStorage to persist portfolio across app sessions.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

const PORTFOLIO_STORAGE_KEY = '@biaz_portfolio';

/**
 * PortfolioStock Type
 * 
 * Represents a single stock position in the user's portfolio
 */
export type PortfolioStock = {
  symbol: string;
  shares: number;
  avgPrice: number;
  alertThreshold?: number;
  priceHistory?: { price: number; timestamp: number }[];
  lastNotificationTime?: number;
};

/**
 * Portfolio Context Provider
 * 
 * Provides methods to:
 * - Add stocks to portfolio
 * - Remove stocks from portfolio
 * - Check if stock is in portfolio
 * - Get all portfolio stocks
 */
export const [PortfolioProvider, usePortfolio] = createContextHook(() => {
  const [portfolioStocks, setPortfolioStocks] = useState<PortfolioStock[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Save portfolio to AsyncStorage
   */
  const savePortfolio = useCallback(async () => {
    try {
      await AsyncStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(portfolioStocks));
      console.log('[PortfolioContext] Saved', portfolioStocks.length, 'stocks to storage');
    } catch (error) {
      console.error('[PortfolioContext] Failed to save portfolio:', error);
    }
  }, [portfolioStocks]);

  /**
   * Load portfolio from AsyncStorage
   */
  const loadPortfolio = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(PORTFOLIO_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PortfolioStock[];
        setPortfolioStocks(parsed);
        console.log('[PortfolioContext] Loaded', parsed.length, 'stocks from storage');
      }
    } catch (error) {
      console.error('[PortfolioContext] Failed to load portfolio:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load portfolio from AsyncStorage on mount
  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  // Save portfolio to AsyncStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      savePortfolio();
    }
  }, [portfolioStocks, isLoading, savePortfolio]);

  /**
   * Add stock to portfolio
   */
  const addStock = useCallback((stock: PortfolioStock) => {
    setPortfolioStocks((prev) => {
      // Check if already in portfolio
      if (prev.some((s) => s.symbol === stock.symbol)) {
        console.log('[PortfolioContext] Stock already in portfolio:', stock.symbol);
        return prev;
      }
      console.log('[PortfolioContext] Added to portfolio:', stock.symbol);
      return [...prev, stock];
    });
  }, []);

  /**
   * Remove stock from portfolio by symbol
   */
  const removeStock = useCallback((symbol: string) => {
    setPortfolioStocks((prev) => {
      console.log('[PortfolioContext] Removed from portfolio:', symbol);
      return prev.filter((s) => s.symbol !== symbol);
    });
  }, []);

  /**
   * Update stock in portfolio
   */
  const updateStock = useCallback((symbol: string, shares: number, avgPrice: number) => {
    setPortfolioStocks((prev) => {
      console.log('[PortfolioContext] Updated stock in portfolio:', symbol);
      return prev.map((s) => 
        s.symbol === symbol ? { ...s, shares, avgPrice } : s
      );
    });
  }, []);

  /**
   * Check if stock is in portfolio
   */
  const isInPortfolio = useCallback((symbol: string): boolean => {
    return portfolioStocks.some((s) => s.symbol === symbol);
  }, [portfolioStocks]);

  /**
   * Set alert threshold for a stock
   */
  const setAlertThreshold = useCallback((symbol: string, threshold: number) => {
    setPortfolioStocks((prev) => {
      console.log('[PortfolioContext] Set alert threshold for', symbol, ':', threshold);
      return prev.map((s) => 
        s.symbol === symbol ? { ...s, alertThreshold: threshold } : s
      );
    });
  }, []);

  /**
   * Update price history for a stock
   */
  const updatePriceHistory = useCallback((symbol: string, price: number) => {
    setPortfolioStocks((prev) => {
      return prev.map((s) => {
        if (s.symbol === symbol) {
          const newHistory = [
            ...(s.priceHistory || []),
            { price, timestamp: Date.now() }
          ].slice(-20);
          return { ...s, priceHistory: newHistory };
        }
        return s;
      });
    });
  }, []);

  /**
   * Set last notification time for a stock
   */
  const setLastNotificationTime = useCallback((symbol: string) => {
    setPortfolioStocks((prev) => {
      return prev.map((s) => 
        s.symbol === symbol ? { ...s, lastNotificationTime: Date.now() } : s
      );
    });
  }, []);

  return useMemo(() => ({
    portfolioStocks,
    isLoading,
    addStock,
    removeStock,
    updateStock,
    isInPortfolio,
    setAlertThreshold,
    updatePriceHistory,
    setLastNotificationTime,
  }), [portfolioStocks, isLoading, addStock, removeStock, updateStock, isInPortfolio, setAlertThreshold, updatePriceHistory, setLastNotificationTime]);
});
