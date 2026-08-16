import { GoogleGenAI } from '@google/genai';
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.status(500).json({ error: 'NO_API_KEY' });
  }
  try {
    const { destination, days } = req.body || {};
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Generate a travel packing list for a ${days}-day trip to "${destination}".
Return strictly valid JSON array of objects with schema:
[{"category": "Documents"|"Clothing"|"Electronics"|"Toiletries"|"Other", "name": "Item name", "quantity": 1}]
Provide 12 to 18 essential items in Bahasa Indonesia.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return res.json(JSON.parse(response.text || '[]'));
  } catch (err: any) {
    console.error('AI packing generation error:', err);
    return res.status(500).json({ error: err.message || 'AI generation failed' });
  }
}