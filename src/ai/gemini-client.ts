import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export function getGeminiClient(): GoogleGenerativeAI | null {
  if (!process.env.GOOGLE_API_KEY) return null;
  return genAI;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function chat(messages: Array<{ role: string; content: string }>, temperature = 0.7): Promise<string> {
  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: process.env.GEMINI_MODEL!,
        generationConfig: { temperature }
      });
      
      // Convert messages to Gemini format
      const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
      
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      lastError = error;
      
      // Check for rate limit or quota errors
      if (error.status === 429 || error.message?.includes('quota') || error.message?.includes('rate limit')) {
        const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.warn(`[${new Date().toISOString()}] Gemini rate limit hit, waiting ${waitTime}ms before retry ${attempt + 1}/${maxRetries}`);
        await sleep(waitTime);
        continue;
      }
      
      // For other errors, throw immediately
      console.error('Gemini error:', error);
      throw error;
    }
  }

  // All retries exhausted
  console.error('Gemini error after retries:', lastError);
  throw lastError;
}

export default { chat };
