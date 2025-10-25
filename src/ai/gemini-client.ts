import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function chat(messages: Array<{ role: string; content: string }>, temperature = 0.7): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL!,
      generationConfig: { temperature }
    });
    
    // Convert messages to Gemini format
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini error:', error);
    throw error;
  }
}

export default { chat };
