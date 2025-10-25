import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

let dalleClient: OpenAIClient | null = null;

function getDalleClient(): OpenAIClient | null {
  if (!process.env.DALLE_API_KEY || !process.env.DALLE_ENDPOINT) {
    return null;
  }
  
  if (!dalleClient) {
    dalleClient = new OpenAIClient(
      process.env.DALLE_ENDPOINT,
      new AzureKeyCredential(process.env.DALLE_API_KEY),
      { apiVersion: process.env.DALLE_API_VERSION || '2024-02-01' }
    );
  }
  
  return dalleClient;
}

export async function generateImage(title: string, symbol: string): Promise<string | null> {
  const prompt = `Professional financial news illustration for ${symbol} stock: ${title}. Modern, clean, business-focused style.`;

  try {
    const client = getDalleClient();
    if (!client) {
      console.warn(`[${new Date().toISOString()}] DALL-E client not configured`);
      return null;
    }

    const deploymentName = process.env.DALLE_DEPLOYMENT_NAME || 'dall-e-3';
    
    const results = await client.getImages(deploymentName, prompt, { n: 1, size: '1024x1024' });
    const imageUrl = results.data?.[0]?.url || null;
    
    if (imageUrl) {
      console.log(`[${new Date().toISOString()}] Generated image with DALL-E 3`);
    }
    return imageUrl;
  } catch (error: any) {
    console.warn(`[${new Date().toISOString()}] Image generation failed: ${error.message}`);
    return null;
  }
}
