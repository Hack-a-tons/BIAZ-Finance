import fs from 'fs';
import path from 'path';

let requestCount = 0;
let windowStart = Date.now();

async function waitForRateLimit() {
  const now = Date.now();
  const elapsed = now - windowStart;
  
  if (elapsed >= 60000) {
    requestCount = 0;
    windowStart = now;
  }
  
  if (requestCount >= 50) {
    const waitTime = 60000 - elapsed;
    console.log(`Rate limit: waiting ${Math.ceil(waitTime / 1000)}s`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    requestCount = 0;
    windowStart = Date.now();
  }
  
  requestCount++;
}

export async function generateImage(title: string, symbol: string): Promise<string | null> {
  if (!process.env.DALLE_ENDPOINT || !process.env.DALLE_API_KEY || !process.env.DALLE_DEPLOYMENT_NAME) {
    return null;
  }

  await waitForRateLimit();

  try {
    const prompt = `Professional business photography for ${symbol} stock market news. High-quality corporate photo featuring modern office environment, financial technology, stock market displays, or business professionals. Photorealistic, sharp focus, professional lighting, corporate aesthetic.`;
    
    const response = await fetch(
      `${process.env.DALLE_ENDPOINT}/openai/deployments/${process.env.DALLE_DEPLOYMENT_NAME}/images/generations?api-version=${process.env.DALLE_API_VERSION || '2024-02-01'}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.DALLE_API_KEY
        },
        body: JSON.stringify({
          model: process.env.DALLE_DEPLOYMENT_NAME,
          prompt,
          size: '1024x1024',
          quality: 'standard',
          n: 1
        })
      }
    );

    if (response.status === 429) {
      console.error('Rate limit exceeded (429), backing off');
      await new Promise(resolve => setTimeout(resolve, 60000));
      return generateImage(title, symbol);
    }

    if (!response.ok) {
      console.error('DALL-E API error:', response.status, await response.text());
      return null;
    }

    const result: any = await response.json();
    const b64Data = result.data?.[0]?.b64_json;
    
    if (!b64Data) return null;

    const imagesDir = path.join(process.cwd(), 'public', 'images');
    fs.mkdirSync(imagesDir, { recursive: true });

    const filename = `${symbol}-${Date.now()}.jpg`;
    const filepath = path.join(imagesDir, filename);
    
    fs.writeFileSync(filepath, Buffer.from(b64Data, 'base64'));

    const baseUrl = process.env.API_URL || 'https://api.news.biaz.hurated.com';
    return `${baseUrl}/images/${filename}`;
  } catch (error) {
    console.error('DALL-E image generation failed:', error);
    return null;
  }
}
