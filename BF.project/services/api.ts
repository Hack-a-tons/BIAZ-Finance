/**
 * BIAZ Finance API Service
 * 
 * Client for interacting with the BIAZ Finance API
 * Base URL: https://api.news.biaz.hurated.com/v1
 */

import type {
  Article,
  ArticlesResponse,
  ArticlesQuery,
  Source,
  SourcesResponse,
  StocksResponse,
  StocksQuery,
  Forecast,
  IngestArticleRequest,
  CreateForecastRequest,
  CreateSourceRequest,
} from '@/types/api';

const BASE_URL = 'https://api.news.biaz.hurated.com/v1';

/**
 * Check if API is available
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(BASE_URL, { method: 'HEAD' });
    return response.ok || response.status === 404;
  } catch {
    return false;
  }
}

/**
 * Build URL with query parameters
 */
function buildUrl(endpoint: string, params?: Record<string, string | number | undefined>): string {
  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    console.log('[API] Fetching:', url);
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Error response:', errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[API] Success - Response data:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('[API] Fetch error:', error);
    throw error;
  }
}

/**
 * Articles API
 */
export const articlesApi = {
  /**
   * List articles with optional filters
   */
  list: async (query?: ArticlesQuery): Promise<ArticlesResponse> => {
    const url = buildUrl('/articles', query as Record<string, string | number | undefined>);
    return fetchApi<ArticlesResponse>(url);
  },

  /**
   * Get single article by ID with full details
   */
  getById: async (id: string): Promise<Article> => {
    const url = buildUrl(`/articles/${id}`);
    return fetchApi<Article>(url);
  },

  /**
   * Ingest new article from URL
   */
  ingest: async (request: IngestArticleRequest): Promise<Article> => {
    const url = buildUrl('/articles/ingest');
    return fetchApi<Article>(url, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Recompute truth score for article
   */
  recomputeScore: async (id: string): Promise<Article> => {
    const url = buildUrl(`/articles/${id}/score`);
    return fetchApi<Article>(url, {
      method: 'POST',
    });
  },
};

/**
 * Sources API
 */
export const sourcesApi = {
  /**
   * List all news sources
   */
  list: async (): Promise<SourcesResponse> => {
    const url = buildUrl('/sources');
    return fetchApi<SourcesResponse>(url);
  },

  /**
   * Get single source by ID
   */
  getById: async (id: string): Promise<Source> => {
    const url = buildUrl(`/sources/${id}`);
    return fetchApi<Source>(url);
  },

  /**
   * Add custom source
   */
  create: async (request: CreateSourceRequest): Promise<Source> => {
    const url = buildUrl('/sources');
    return fetchApi<Source>(url, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Delete custom source
   */
  delete: async (id: string): Promise<void> => {
    const url = buildUrl(`/sources/${id}`);
    await fetch(url, { method: 'DELETE' });
  },
};

/**
 * Stocks API
 */
export const stocksApi = {
  /**
   * Search and list stocks
   */
  list: async (query?: StocksQuery): Promise<StocksResponse> => {
    const url = buildUrl('/stocks', query as Record<string, string | undefined>);
    return fetchApi<StocksResponse>(url);
  },
};

/**
 * Forecasts API
 */
export const forecastsApi = {
  /**
   * Get forecast by ID
   */
  getById: async (id: string): Promise<Forecast> => {
    const url = buildUrl(`/forecasts/${id}`);
    return fetchApi<Forecast>(url);
  },

  /**
   * Generate new forecast for article and symbol
   */
  create: async (request: CreateForecastRequest): Promise<Forecast> => {
    const url = buildUrl('/forecasts');
    return fetchApi<Forecast>(url, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
};
