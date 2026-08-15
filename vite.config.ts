import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { GoogleGenAI } from '@google/genai';

function aiProxyPlugin(): Plugin {
  return {
    name: 'ai-proxy-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/ai/')) {
          return next();
        }
        res.setHeader('Content-Type', 'application/json');

        const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
        if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'NO_API_KEY' }));
          return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const ai = new GoogleGenAI({ apiKey });

            if (req.url === '/api/ai/generate-itinerary') {
              const { destination, days, travelers, budget, currency, description } = data;
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

              res.end(response.text || '{}');
            } else if (req.url === '/api/ai/generate-packing') {
              const { destination, days } = data;
              const prompt = `Generate a travel packing list for a ${days}-day trip to "${destination}".
Return strictly valid JSON array of objects with schema:
[{"category": "Documents"|"Clothing"|"Electronics"|"Toiletries"|"Other", "name": "Item name", "quantity": 1}]
Provide 12 to 18 essential items in Bahasa Indonesia.`;

              const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: prompt,
                config: { responseMimeType: 'application/json' }
              });

              res.end(response.text || '[]');
            } else {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Not found' }));
            }
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message || 'AI generation failed' }));
          }
        });
      });
    }
  };
}

function cloudflareProxyPlugin(): Plugin {
  const memoryD1 = {
    trips: new Map<string, any>(),
    themes: new Map<string, any>()
  };

  return {
    name: 'cloudflare-proxy-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/cloudflare/')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Uid');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        const userUid = (req.headers['x-user-uid'] as string) || 'guest';
        const urlPath = req.url.split('?')[0];

        if (urlPath === '/api/cloudflare/health') {
          res.end(JSON.stringify({
            status: 'ok',
            engine: 'Cloudflare Workers (Dev Proxy)',
            region: 'Edge Local Simulation',
            timestamp: new Date().toISOString()
          }));
          return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            if (urlPath === '/api/cloudflare/trips' && req.method === 'GET') {
              const trips = Array.from(memoryD1.trips.values()).filter(t => t.userId === userUid);
              res.end(JSON.stringify({ success: true, trips, count: trips.length }));
              return;
            }

            if (urlPath === '/api/cloudflare/trips' && req.method === 'POST') {
              const tripData = JSON.parse(body || '{}');
              if (tripData.id) {
                memoryD1.trips.set(tripData.id, { ...tripData, userId: userUid, updatedAt: new Date().toISOString() });
              }
              res.end(JSON.stringify({ success: true, id: tripData.id }));
              return;
            }

            if (urlPath.startsWith('/api/cloudflare/trips/') && req.method === 'DELETE') {
              const tripId = urlPath.split('/')[4];
              if (tripId) {
                memoryD1.trips.delete(tripId);
              }
              res.end(JSON.stringify({ success: true, deletedTripId: tripId }));
              return;
            }

            if (urlPath === '/api/cloudflare/theme' && req.method === 'GET') {
              const theme = memoryD1.themes.get(userUid) || null;
              res.end(JSON.stringify({ success: true, theme }));
              return;
            }

            if (urlPath === '/api/cloudflare/theme' && req.method === 'POST') {
              const themeData = JSON.parse(body || '{}');
              memoryD1.themes.set(userUid, themeData);
              res.end(JSON.stringify({ success: true, userId: userUid }));
              return;
            }

            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Cloudflare endpoint not found' }));
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message || 'Cloudflare plugin error' }));
          }
        });
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), aiProxyPlugin(), cloudflareProxyPlugin()],
    define: {
      'process.env.GOOGLE_MAPS_PLATFORM_KEY': JSON.stringify(process.env.GOOGLE_MAPS_PLATFORM_KEY || '')
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
