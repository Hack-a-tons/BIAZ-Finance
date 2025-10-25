/**
 * useNewsArticles Hook
 * 
 * React Query hook for fetching news articles from the API
 */

import { useQuery } from '@tanstack/react-query';
import { articlesApi } from '@/services/api';
import { transformArticlesToNewsItems } from '@/utils/dataTransformers';
import { mockNewsData } from '@/mocks/news';
import type { NewsItem } from '@/mocks/news';
import type { ArticlesQuery } from '@/types/api';

/**
 * Hook to fetch and transform news articles
 * 
 * Features:
 * - Automatic caching with React Query
 * - Background refetching
 * - Error handling
 * - Loading states
 * 
 * @param query - Optional query parameters (symbol, source, page, limit)
 * @returns React Query result with transformed NewsItem[]
 */
export function useNewsArticles(query?: ArticlesQuery) {
  return useQuery<NewsItem[], Error>({
    queryKey: ['articles', query],
    queryFn: async () => {
      console.log('[useNewsArticles] Fetching articles with query:', query);
      
      try {
        console.log('[useNewsArticles] Attempting to fetch from API...');
        const response = await articlesApi.list(query);
        console.log('[useNewsArticles] Received response:', response);
        console.log('[useNewsArticles] Articles count:', response?.data?.length || 'No data field');
        
        if (!response || !response.data || !Array.isArray(response.data)) {
          console.warn('[useNewsArticles] Invalid response format, using mock data as fallback');
          return mockNewsData;
        }
        
        if (response.data.length === 0) {
          console.warn('[useNewsArticles] API returned empty array, using mock data as fallback');
          return mockNewsData;
        }
        
        console.log('[useNewsArticles] Transforming', response.data.length, 'articles...');
        const newsItems = await transformArticlesToNewsItems(response.data);
        console.log('[useNewsArticles] Successfully transformed', newsItems.length, 'news items');
        
        if (!newsItems || newsItems.length === 0) {
          console.warn('[useNewsArticles] Transformation resulted in empty array, using mock data as fallback');
          return mockNewsData;
        }
        
        return newsItems;
      } catch (error) {
        console.error('[useNewsArticles] API fetch failed:', error);
        console.error('[useNewsArticles] Error details:', error instanceof Error ? error.message : String(error));
        console.warn('[useNewsArticles] Using mock data as fallback');
        return mockNewsData;
      }
    },
    staleTime: 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
