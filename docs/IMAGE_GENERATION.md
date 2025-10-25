# AI Image Generation

## Overview

The BIAZ Finance API automatically generates professional financial news illustrations using Azure DALL-E (FLUX-1.1-pro deployment) for articles that don't have images.

## Features

- **Rate Limiting**: Respects 50 requests per minute limit
- **Error Handling**: Automatically retries on 429 (rate limit) errors with 60-second backoff
- **Base64 Decoding**: Receives base64-encoded images and saves them to filesystem
- **Unique Filenames**: Format `{SYMBOL}-{timestamp}.jpg`
- **Automatic Integration**: Called during article ingestion when no image is available

## Configuration

Required environment variables in `.env`:

```bash
DALLE_ENDPOINT=https://super-m9xgpjtl-eastus.services.ai.azure.com
DALLE_API_KEY=your-api-key
DALLE_DEPLOYMENT_NAME=FLUX-1.1-pro
DALLE_API_VERSION=2024-02-01
```

## Usage

### Automatic (during article ingestion)

Images are automatically generated when:
1. Article has no image URL from source
2. Fallback stock image is unavailable or already used
3. DALL-E credentials are configured

### Manual Testing

```bash
# Basic test
./scripts/test-generate-image.sh AAPL "Apple announces new product"

# Verbose mode
./scripts/test-generate-image.sh -v TSLA "Tesla reports earnings"

# Help
./scripts/test-generate-image.sh --help
```

### Programmatic

```typescript
import { generateImage } from './ai/generate-image';

const imageUrl = await generateImage(
  'Apple announces record earnings',
  'AAPL'
);
// Returns: /images/AAPL-1761433427313.jpg
```

## Rate Limiting

The implementation tracks requests per minute:
- Maximum 50 requests per 60-second window
- Automatic waiting when limit is reached
- Logs wait time to console
- Handles 429 errors with 60-second retry

## File Storage

- Images saved to: `public/images/`
- Format: JPEG (base64-decoded from API)
- Size: ~200-500KB per image
- Accessible via: `/images/{filename}`

## Error Handling

- Returns `null` if credentials missing
- Returns `null` on API errors (logged to console)
- Retries once on 429 errors
- Continues article ingestion even if image generation fails

## API Response Format

```json
{
  "created": 1761433082,
  "data": [{
    "url": null,
    "b64_json": "base64-encoded-jpeg-data..."
  }]
}
```

## Testing Results

✓ Successfully generates images for AAPL, TSLA
✓ Rate limiting works correctly
✓ 429 error handling implemented
✓ Images saved to filesystem
✓ Returns correct URL paths
