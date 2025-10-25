# Image Service Configuration

## Current Implementation

### Image Validation
All article images are validated before being stored in the database:
- HTTP HEAD request with 5-second timeout
- Checks for HTTP 200 status
- Verifies `Content-Type` header starts with `image/`
- Articles without valid images are **rejected** during ingestion

### Fallback Image Service

**Current:** Pexels (Free)
- URL: `https://images.pexels.com/photos/534216/pexels-photo-534216.jpeg?auto=compress&cs=tinysrgb&w=800&h=600`
- Status: ✅ Working (HTTP 200)
- License: Free to use
- Note: Currently uses a static finance-themed image for all articles

**Previous:** Unsplash Source API
- URL: `https://source.unsplash.com/800x600/?{symbol},stock,finance,business`
- Status: ❌ Not working (HTTP 503)
- Reason: Free tier discontinued

## Alternative Image Services

### 1. Pixabay API (Recommended)
```typescript
function generateStockImage(symbol: string): string {
  const apiKey = process.env.PIXABAY_API_KEY;
  return `https://pixabay.com/api/?key=${apiKey}&q=${symbol}+stock+market&image_type=photo&per_page=3`;
}
```
- Free tier: 100 requests/minute
- No attribution required
- High-quality images
- Requires API key (free signup)

### 2. Lorem Picsum
```typescript
function generateStockImage(symbol: string): string {
  return `https://picsum.photos/800/600?random=${symbol}`;
}
```
- Completely free
- No API key needed
- Random images (not finance-specific)

### 3. Placeholder.com
```typescript
function generateStockImage(symbol: string): string {
  return `https://via.placeholder.com/800x600/1a1a2e/eee?text=${symbol}`;
}
```
- Completely free
- No API key needed
- Simple colored placeholders with text

### 4. Pexels API (Better Implementation)
```typescript
async function generateStockImage(symbol: string): Promise<string> {
  const apiKey = process.env.PEXELS_API_KEY;
  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${symbol}+stock+market&per_page=1`,
    { headers: { Authorization: apiKey } }
  );
  const data = await response.json();
  return data.photos[0]?.src?.large || 'fallback-url';
}
```
- Free tier: 200 requests/hour
- Finance-specific images
- Requires API key (free signup)

## Recommendation

For production, use **Pixabay API** or **Pexels API** with proper API key:

1. Sign up for free API key
2. Add to `.env`:
   ```
   PIXABAY_API_KEY=your_key_here
   # or
   PEXELS_API_KEY=your_key_here
   ```
3. Update `generateStockImage()` in `src/services/ingest-article.ts`

## Parallel Fetching Strategy

The system now tries all 3 article fetching methods in parallel:
1. **RSS parsing** - Fastest, lightweight
2. **HTTP + Cheerio** - Direct scraping
3. **Apify** - Most robust (but has memory limits)

First successful method wins. This maximizes chances of getting real article images while maintaining speed.
