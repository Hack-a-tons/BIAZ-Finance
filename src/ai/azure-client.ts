import { AzureOpenAI } from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const client = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiVersion: process.env.AZURE_API_VERSION,
});

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function chat(messages: Array<{ role: string; content: string }>, temperature = 0.7): Promise<string> {
  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: process.env.AZURE_DEPLOYMENT_NAME!,
        messages: messages as ChatCompletionMessageParam[],
        temperature,
      });
      
      return response.choices[0]?.message?.content || '';
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a rate limit error (429)
      if (error.status === 429) {
        const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.warn(`[${new Date().toISOString()}] Rate limit hit, waiting ${waitTime}ms before retry ${attempt + 1}/${maxRetries}`);
        await sleep(waitTime);
        continue;
      }
      
      // For other errors, throw immediately
      console.error('Azure OpenAI error:', error);
      throw error;
    }
  }

  // All retries exhausted
  console.error('Azure OpenAI error after retries:', lastError);
  throw lastError;
}

export default { chat };
