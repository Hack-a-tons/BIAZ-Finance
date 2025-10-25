# Image Generation Capabilities

**Date:** 2025-10-25  
**Purpose:** Use AI to generate unique article images instead of placeholders

---

## Available Models

### Azure OpenAI
✅ **DALL-E 3** (`dall-e-3-3.0`)
- Highest quality
- 1024x1024, 1024x1792, 1792x1024
- ~$0.04 per image

✅ **DALL-E 2** (`dall-e-2-2.0`)
- Good quality
- 256x256, 512x512, 1024x1024
- ~$0.02 per image

### Google Gemini
✅ **Imagen 3.0** (`imagen-3.0-generate-002`)
- High quality
- Production ready

✅ **Imagen 4.0 Preview** (`imagen-4.0-generate-preview-06-06`)
- Latest model
- Preview/beta

---

## Current Situation

**Problem:**
- 64 articles deleted because all had placeholder images (Unsplash/Pexels)
- Only 1 article re-ingested (only 1 had real image)
- Most news sources don't provide images in RSS feeds
- Image extraction methods often fail

**Current Fallbacks:**
- Pexels static image (rejected by current criteria)
- Unsplash by symbol (rejected by current criteria)

---

## Proposed Solution: AI-Generated Images

Generate unique, article-specific images using DALL-E or Imagen.

### Implementation Options

#### Option A: Generate on Ingestion (Recommended)
```typescript
async function generateArticleImage(article: {
  title: string;
  summary: string;
  symbols: string[];
}): Promise<string> {
  const prompt = `Professional financial news illustration for: ${article.title}. 
  Related to ${article.symbols.join(', ')} stocks. 
  Style: Modern, clean, business-focused, no text.`;
  
  // Use DALL-E 3 via Azure OpenAI
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    size: "1024x1024",
    quality: "standard",
    n: 1,
  });
  
  return response.data[0].url;
}
```

**Pros:**
- Unique image per article
- Always available
- Professional quality
- No duplicate image issues

**Cons:**
- Cost: ~$0.04 per article
- Slower ingestion (~5-10s per image)
- Need to store/host generated images

#### Option B: Generate on Demand
Generate images only when article is viewed for first time.

**Pros:**
- Only generate for viewed articles
- Lower cost

**Cons:**
- Slower first view
- More complex caching

#### Option C: Batch Generation
Generate images for all articles without images in background job.

**Pros:**
- Doesn't slow down ingestion
- Can retry failures

**Cons:**
- Articles temporarily without images
- More complex

---

## Cost Analysis

### Current Ingestion Rate
- ~130 articles found per monitoring run
- ~20 articles would be ingested (without image restrictions)
- Monitoring runs every 30 minutes = 48 runs/day
- Potential: 960 articles/day

### Image Generation Costs

**DALL-E 3 (Recommended):**
- $0.04 per image
- 20 articles/run × 48 runs/day = 960 images/day
- Cost: $38.40/day = $1,152/month

**DALL-E 2 (Budget):**
- $0.02 per image
- 960 images/day
- Cost: $19.20/day = $576/month

**Imagen 3.0:**
- Pricing varies by region
- Similar to DALL-E 3

### Cost Optimization

**Option 1: Rate Limiting**
- Max 5 new articles per feed (current)
- Max 10 articles per monitoring run
- Cost: 10 × 48 = 480 images/day = $19.20/day = $576/month

**Option 2: Only Generate for High-Quality Articles**
- Only generate if truth score > 0.7
- Only generate if has 3+ verified claims
- Estimated: 50% reduction = $288/month

**Option 3: Use DALL-E 2 for Most, DALL-E 3 for Featured**
- DALL-E 2 for regular articles: $0.02
- DALL-E 3 for high-score articles: $0.04
- Estimated: $400/month

---

## Implementation Plan

### Phase 1: Basic Implementation (2-3 hours)

1. **Create image generation service**
   ```typescript
   // src/services/generate-image.ts
   export async function generateArticleImage(
     title: string,
     symbols: string[]
   ): Promise<string>
   ```

2. **Integrate into ingestion**
   ```typescript
   // In ingest-article.ts
   if (!imageUrl) {
     imageUrl = await generateArticleImage(article.title, symbols);
   }
   ```

3. **Store generated images**
   - Upload to S3 or similar
   - Store permanent URL in database

### Phase 2: Optimization (1-2 hours)

1. **Add caching**
   - Cache generated images by content hash
   - Reuse similar images

2. **Add quality checks**
   - Only generate for articles with truth score > 0.5
   - Skip for low-quality articles

3. **Add cost tracking**
   - Log image generation costs
   - Monitor daily spending

### Phase 3: Advanced (Optional)

1. **Batch generation**
   - Background job for articles without images
   - Retry failed generations

2. **A/B testing**
   - Compare DALL-E 2 vs DALL-E 3
   - Test different prompt styles

3. **Image optimization**
   - Compress generated images
   - Generate multiple sizes

---

## Example Prompts

### Generic Financial News
```
Professional financial news illustration showing stock market charts, 
business growth, and technology. Modern, clean style. No text or logos.
```

### Stock-Specific
```
Professional illustration for {SYMBOL} stock news. 
Incorporate themes of {industry} and {sentiment}. 
Modern business style, no text.
```

### Earnings Report
```
Financial earnings report illustration showing quarterly results, 
revenue growth charts, and business analytics. 
Professional, clean, modern style.
```

---

## Testing

### Test DALL-E 3 Generation
```bash
curl https://super-m8iodvzz-eastus2.cognitiveservices.azure.com/openai/deployments/dall-e-3/images/generations?api-version=2025-01-01-preview \
  -H "api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Professional financial news illustration for Apple stock earnings report. Modern, clean, business-focused, no text.",
    "size": "1024x1024",
    "quality": "standard",
    "n": 1
  }'
```

### Test Imagen 3.0 Generation
```bash
curl https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=YOUR_KEY \
  -H "Content-Type: application/json" \
  -d '{
    "instances": [{
      "prompt": "Professional financial news illustration for Apple stock earnings report"
    }]
  }'
```

---

## Recommendation

**Implement Option A (Generate on Ingestion) with Cost Optimization:**

1. Use **DALL-E 2** for cost efficiency ($0.02/image)
2. Limit to **10 articles per monitoring run** (480 images/day)
3. Only generate for articles with **truth score > 0.5**
4. Store images in **S3** or similar

**Expected Results:**
- All articles have unique, professional images
- No duplicate image rejections
- Cost: ~$10-20/day = $300-600/month
- Acceptance rate: 80-90% (up from current ~1%)

**Next Steps:**
1. Create `src/services/generate-image.ts`
2. Integrate into `ingest-article.ts`
3. Set up S3 bucket for image storage
4. Deploy and test with 5-10 articles
5. Monitor costs and adjust limits

---

## Alternative: Hybrid Approach

**Best of Both Worlds:**

1. Try to extract real image from article (current methods)
2. If real image found → use it (free)
3. If no real image → generate with AI ($0.02)

**Expected:**
- 20% articles have real images (free)
- 80% need generated images ($0.02)
- Average cost: $0.016 per article
- 480 articles/day = $7.68/day = $230/month

This is the **recommended approach** - try real images first, generate only when needed.
