import azureClient from './azure-client';
import geminiClient from './gemini-client';

const provider = process.env.AI_PROVIDER || 'azure';

export async function chat(messages: Array<{ role: string; content: string }>, temperature = 0.7): Promise<string> {
  const client = provider === 'gemini' ? geminiClient : azureClient;
  
  try {
    return await client.chat(messages, temperature);
  } catch (error) {
    console.error(`${provider} failed, trying fallback...`);
    // Try fallback provider
    const fallback = provider === 'gemini' ? azureClient : geminiClient;
    return await fallback.chat(messages, temperature);
  }
}

export default { chat };
