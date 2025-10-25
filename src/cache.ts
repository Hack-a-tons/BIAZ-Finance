import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

const client = createClient({ url: REDIS_URL });

client.on('error', (err) => console.error('Redis error:', err));
client.on('connect', () => console.log('Redis connected'));

// Connect on startup
client.connect().catch(console.error);

export async function cacheGet(key: string): Promise<string | null> {
  try {
    return await client.get(key);
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function cacheSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  try {
    await client.setEx(key, ttlSeconds, value);
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    await client.del(key);
  } catch (error) {
    console.error('Cache del error:', error);
  }
}

// Helper: Generate cache key for article list queries
export function articleListCacheKey(params: Record<string, any>): string {
  const sorted = Object.keys(params).sort().map(k => `${k}:${params[k]}`).join('|');
  return `articles:list:${sorted}`;
}

// Helper: Generate cache key for AI responses (based on content hash)
export function aiCacheKey(operation: string, content: string): string {
  // Simple hash function for content
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `ai:${operation}:${Math.abs(hash)}`;
}

export default client;
