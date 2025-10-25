import { getAzureClient } from './azure-client';
import { getGeminiClient } from './gemini-client';

export async function generateImage(title: string, symbol: string): Promise<string | null> {
  const prompt = `Professional financial news illustration for ${symbol} stock: ${title}. Modern, clean, business-focused style.`;

  const results = await Promise.allSettled([
    generateWithAzure(prompt),
    generateWithGemini(prompt)
  ]);

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      return result.value;
    }
  }

  console.warn(`[${new Date().toISOString()}] Image generation failed for ${symbol}`);
  return null;
}

async function generateWithAzure(prompt: string): Promise<string | null> {
  try {
    const client = getAzureClient();
    if (!client) return null;

    const response = await client.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard'
    });

    return response.data?.[0]?.url || null;
  } catch (error: any) {
    console.warn(`[${new Date().toISOString()}] Azure DALL-E failed: ${error.message}`);
    return null;
  }
}

async function generateWithGemini(prompt: string): Promise<string | null> {
  try {
    const client = getGeminiClient();
    if (!client) return null;

    const model = client.getGenerativeModel({ model: 'imagen-4.0-generate-preview-06-06' });
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const response = result.response;
    // Gemini Imagen returns image data, need to extract URL or base64
    // This is a placeholder - actual implementation depends on Gemini's response format
    const imageUrl = (response as any).candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (imageUrl) {
      // Convert base64 to data URL if needed
      return `data:image/png;base64,${imageUrl}`;
    }
    
    return null;
  } catch (error: any) {
    console.warn(`[${new Date().toISOString()}] Gemini Imagen failed: ${error.message}`);
    return null;
  }
}
