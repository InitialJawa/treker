import { GoogleGenAI } from '@google/genai';
import { CurrencyCode, ItineraryCategory, PackingCategory } from '../types/travel';

export interface GeneratedActivity {
  dayNumber: number;
  time: string;
  duration: string;
  title: string;
  location: string;
  category: ItineraryCategory;
  estimatedCost: number;
  description: string;
  notes?: string;
  transportType?: string;
}

export interface GeneratedPacking {
  category: PackingCategory;
  name: string;
  quantity: number;
}

export async function generateItineraryWithAI(
  destination: string,
  days: number,
  travelers: number,
  budget: number,
  currency: CurrencyCode,
  description?: string
): Promise<{ daysTitles: string[]; activities: GeneratedActivity[] }> {
  const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
  const apiKey = metaEnv.VITE_GEMINI_API_KEY || metaEnv.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // Return structured realistic smart fallback
    return getFallbackAIItinerary(destination, days, budget, currency);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an expert travel planner. Create a detailed ${days}-day itinerary for a trip to "${destination}" for ${travelers} traveler(s) with an estimated total budget of ${currency} ${budget.toLocaleString()}.
User details: ${description || 'Sightseeing, local food, nature, culture, and popular landmarks'}.

Output MUST be strictly valid JSON without markdown formatting, matching this exact schema:
{
  "daysTitles": ["Day 1 Title", "Day 2 Title", ...],
  "activities": [
    {
      "dayNumber": 1,
      "time": "08:00",
      "duration": "1h 30m",
      "title": "Activity name",
      "location": "Specific place name, City",
      "category": "Food" | "Transport" | "Hotel" | "Activity" | "Shopping" | "Free time" | "Other",
      "estimatedCost": 50000,
      "description": "Short 1-2 sentence description",
      "notes": "Useful travel tip",
      "transportType": "Car" | "Walking" | "Train" | "Taxi"
    }
  ]
}
Ensure cost values are plain numbers in ${currency}. Provide 3 to 4 activities per day. Language: Bahasa Indonesia.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.text || '';
    const parsed = JSON.parse(responseText);
    if (parsed && Array.isArray(parsed.activities)) {
      return parsed;
    }
    return getFallbackAIItinerary(destination, days, budget, currency);
  } catch (error) {
    console.warn('AI generation error, falling back to template:', error);
    return getFallbackAIItinerary(destination, days, budget, currency);
  }
}

export async function generatePackingListWithAI(
  destination: string,
  days: number
): Promise<GeneratedPacking[]> {
  const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
  const apiKey = metaEnv.VITE_GEMINI_API_KEY || metaEnv.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return getFallbackPackingList(days);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Generate a travel packing list for a ${days}-day trip to "${destination}".
Return strictly valid JSON array of objects with this schema:
[
  {
    "category": "Documents" | "Clothing" | "Electronics" | "Toiletries" | "Other",
    "name": "Item name",
    "quantity": 1
  }
]
Provide 12 to 18 essential items in Bahasa Indonesia.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '[]');
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return getFallbackPackingList(days);
  } catch (err) {
    return getFallbackPackingList(days);
  }
}

// Smart fallback generator for instant responsiveness
function getFallbackAIItinerary(
  destination: string,
  days: number,
  budget: number,
  currency: CurrencyCode
) {
  const daysTitles: string[] = [];
  const activities: GeneratedActivity[] = [];

  const perDayCost = Math.round((budget * 0.7) / days);

  for (let i = 1; i <= days; i++) {
    daysTitles.push(`Hari ${i}: Eksplorasi ${destination}`);

    activities.push(
      {
        dayNumber: i,
        time: '08:30',
        duration: '1 hour',
        title: `Sarapan & Kopi Lokal ${destination}`,
        location: `Kafe Utama ${destination}`,
        category: 'Food',
        estimatedCost: Math.round(perDayCost * 0.15),
        description: `Menikmati sarapan dan kopi hangat sebelum memulai aktivitas di ${destination}.`,
        notes: 'Pilih tempat dengan ulasan tinggi.',
        transportType: 'Walking'
      },
      {
        dayNumber: i,
        time: '10:00',
        duration: '3 hours',
        title: i === 1 ? `Ikon Wisata Populer ${destination}` : i === 2 ? `Wisata Alam & Pemandangan ${destination}` : `Pusat Kebudayaan & Sejarah ${destination}`,
        location: `${destination} Main Landmark`,
        category: 'Activity',
        estimatedCost: Math.round(perDayCost * 0.4),
        description: `Eksplorasi destinasi unggulan di ${destination} dan mengabadikan momen berfoto.`,
        notes: 'Bawa kamera dan kenakan pakaian nyaman.',
        transportType: 'Car'
      },
      {
        dayNumber: i,
        time: '13:30',
        duration: '1.5 hours',
        title: `Makan Siang Kuliner Khas ${destination}`,
        location: `Restoran Tradisional ${destination}`,
        category: 'Food',
        estimatedCost: Math.round(perDayCost * 0.25),
        description: `Mencicipi hidangan kuliner otentik yang wajib dicoba di ${destination}.`,
        transportType: 'Car'
      },
      {
        dayNumber: i,
        time: '16:00',
        duration: '2.5 hours',
        title: `Sunset & Santai Sore ${destination}`,
        location: `Pusat Keramaian ${destination}`,
        category: 'Free time',
        estimatedCost: Math.round(perDayCost * 0.2),
        description: 'Bersantai menikmati suasana sore, berbelanja pernak-pernik atau foto di spot populer.',
        transportType: 'Walking'
      }
    );
  }

  return { daysTitles, activities };
}

function getFallbackPackingList(days: number): GeneratedPacking[] {
  return [
    { category: 'Documents', name: 'KTP / Paspor & SIM', quantity: 1 },
    { category: 'Documents', name: 'Tiket & Konfirmasi Hotel', quantity: 1 },
    { category: 'Clothing', name: 'Kaos / Atasan Harian', quantity: Math.min(days + 1, 7) },
    { category: 'Clothing', name: 'Celana Panjang & Pendek', quantity: Math.ceil(days / 2) },
    { category: 'Clothing', name: 'Pakaian Dalam', quantity: days + 2 },
    { category: 'Clothing', name: 'Jaket / Outer Ringan', quantity: 1 },
    { category: 'Electronics', name: 'Smartphone & Charger', quantity: 1 },
    { category: 'Electronics', name: 'Powerbank Fast Charge', quantity: 1 },
    { category: 'Electronics', name: 'Stopkontak Travel / Adapter', quantity: 1 },
    { category: 'Toiletries', name: 'Sikat & Pasta Gigi', quantity: 1 },
    { category: 'Toiletries', name: 'Sunscreen & Moisturizer', quantity: 1 },
    { category: 'Toiletries', name: 'Tisu Basah & Hand Sanitizer', quantity: 2 },
    { category: 'Other', name: 'Obat-obatan Pribadi & Vitamin', quantity: 1 },
    { category: 'Other', name: 'Kacamata Hitam & Topi', quantity: 1 },
  ];
}
