import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiRouter } from './src/server/apiRouter';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());

// Cloud SQL PostgreSQL API Routes
app.use('/api/sql', apiRouter);

// AI Itinerary & Packing Assistant Endpoints
app.post('/api/ai/generate-itinerary', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(500).json({ error: 'NO_API_KEY' });
    }

    const { destination, days, travelers, budget, currency, description } = req.body;
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

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    console.error('AI itinerary generation error:', err);
    res.status(500).json({ error: err.message || 'AI generation failed' });
  }
});

app.post('/api/ai/generate-packing', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(500).json({ error: 'NO_API_KEY' });
    }

    const { destination, days } = req.body;
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

    res.json(JSON.parse(response.text || '[]'));
  } catch (err: any) {
    console.error('AI packing generation error:', err);
    res.status(500).json({ error: err.message || 'AI generation failed' });
  }
});

// Serve static assets in production
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
