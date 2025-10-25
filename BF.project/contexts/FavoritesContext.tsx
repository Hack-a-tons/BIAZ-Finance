/**
 * Favorites Context
 * 
 * Manages user's favorite/bookmarked news articles with persistent storage.
 * Uses AsyncStorage to persist favorites across app sessions.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Article } from '@/types/api';

const FAVORITES_STORAGE_KEY = '@biaz_favorites';

/**
 * Favorites Context Provider
 * 
 * Provides methods to:
 * - Add articles to favorites
 * - Remove articles from favorites
 * - Check if article is favorited
 * - Get all favorite articles
 */
export const [FavoritesProvider, useFavorites] = createContextHook(() => {
  const [favorites, setFavorites] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Save favorites to AsyncStorage
   */
  const saveFavorites = useCallback(async () => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      console.log('[FavoritesContext] Saved', favorites.length, 'favorites to storage');
    } catch (error) {
      console.error('[FavoritesContext] Failed to save favorites:', error);
    }
  }, [favorites]);

  /**
   * Load favorites from AsyncStorage
   */
  const loadFavorites = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Article[];
        setFavorites(parsed);
        console.log('[FavoritesContext] Loaded', parsed.length, 'favorites from storage');
      }
    } catch (error) {
      console.error('[FavoritesContext] Failed to load favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load favorites from AsyncStorage on mount
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Save favorites to AsyncStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      saveFavorites();
    }
  }, [favorites, isLoading, saveFavorites]);

  /**
   * Add article to favorites
   */
  const addFavorite = useCallback((article: Article) => {
    setFavorites((prev) => {
      // Check if already favorited
      if (prev.some((fav) => fav.id === article.id)) {
        console.log('[FavoritesContext] Article already in favorites:', article.id);
        return prev;
      }
      console.log('[FavoritesContext] Added to favorites:', article.id);
      return [...prev, article];
    });
  }, []);

  /**
   * Remove article from favorites
   */
  const removeFavorite = useCallback((articleId: string) => {
    setFavorites((prev) => {
      console.log('[FavoritesContext] Removed from favorites:', articleId);
      return prev.filter((fav) => fav.id !== articleId);
    });
  }, []);

  /**
   * Toggle article favorite status
   */
  const toggleFavorite = useCallback((article: Article) => {
    setFavorites((prev) => {
      const isFavorited = prev.some((fav) => fav.id === article.id);
      if (isFavorited) {
        console.log('[FavoritesContext] Removed from favorites:', article.id);
        return prev.filter((fav) => fav.id !== article.id);
      } else {
        console.log('[FavoritesContext] Added to favorites:', article.id);
        return [...prev, article];
      }
    });
  }, []);

  /**
   * Check if article is favorited
   */
  const isFavorited = useCallback((articleId: string): boolean => {
    return favorites.some((fav) => fav.id === articleId);
  }, [favorites]);

  return useMemo(() => ({
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorited,
  }), [favorites, isLoading, addFavorite, removeFavorite, toggleFavorite, isFavorited]);
});
