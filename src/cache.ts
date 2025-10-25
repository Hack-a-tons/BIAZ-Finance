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

export default client;
