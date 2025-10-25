import { AzureOpenAI } from 'openai';

const client = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiVersion: process.env.AZURE_API_VERSION,
});

export async function chat(messages: Array<{ role: string; content: string }>, temperature = 0.7): Promise<string> {
  try {
    const response = await client.chat.completions.create({
      model: process.env.AZURE_DEPLOYMENT_NAME!,
      messages,
      temperature,
    });
    
    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Azure OpenAI error:', error);
    throw error;
  }
}

export default { chat };
