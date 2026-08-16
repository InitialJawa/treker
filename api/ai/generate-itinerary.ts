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
    const { destination, days, travelers, budget, currency, description } = req.body || {};
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an expert travel planner. Create a detailed ${days}-day itinerary for a trip to "${destination}" for ${travelers} traveler(s) with an estimated total budget of ${currency} ${budget?.toLocaleString()}.
User details: ${description || 'Sightseeing, local food, nature, culture, and popular landmarks'}.

Output MUST be strictly valid JSON without markdown formatting, matching this exact schema:
{
  "daysTitles": ["Day 1 Title", "Day 2 Title"],
  "activities": [
    {
      "dayNumber": 1,
      "time": "08:00",
      "duration": "1h 30m",
      "title": "Activity name",
      "location": "Specific place name, City",
      "category": "Food",
      "estimatedCost": 50000,
      "description": "Short 1-2 sentence description",
      "notes": "Useful tip",
      "transportType": "Car"
    }
  ]
}
Language: Bahasa Indonesia.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    console.error('AI itinerary generation error:', err);
    return res.status(500).json({ error: err.message || 'AI generation failed' });
  }
}