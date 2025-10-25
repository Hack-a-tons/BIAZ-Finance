import { getAzureClient } from './azure-client';

export async function generateImage(title: string, symbol: string): Promise<string | null> {
  // Image generation disabled until Azure DALL-E deployment is created
  // To enable:
  // 1. Create DALL-E 3 deployment in Azure OpenAI Studio
  // 2. Update model name below to match deployment name
  // 3. Uncomment the code below
  
  console.warn(`[${new Date().toISOString()}] Image generation disabled (no deployment configured)`);
  return null;
  
  /* UNCOMMENT WHEN DEPLOYMENT IS READY:
  const prompt = `Professional financial news illustration for ${symbol} stock: ${title}. Modern, clean, business-focused style.`;

  try {
    const client = getAzureClient();
    if (!client) {
      console.warn(`[${new Date().toISOString()}] Azure client not configured`);
      return null;
    }

    const response = await client.images.generate({
      model: 'dall-e-3', // Replace with your deployment name
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard'
    });

    const imageUrl = response.data?.[0]?.url || null;
    if (imageUrl) {
      console.log(`[${new Date().toISOString()}] Generated image with DALL-E 3`);
    }
    return imageUrl;
  } catch (error: any) {
    console.warn(`[${new Date().toISOString()}] Image generation failed: ${error.message}`);
    return null;
  }
  */
}
