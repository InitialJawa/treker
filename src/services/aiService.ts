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
  try {
    const res = await fetch('/api/ai/generate-itinerary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination, days, travelers, budget, currency, description })
    });

    if (res.ok) {
      const parsed = await res.json();
      if (parsed && Array.isArray(parsed.activities)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('AI proxy endpoint unavailable or failed, using smart fallback template:', err);
  }

  return getFallbackAIItinerary(destination, days, budget, currency);
}

export async function generatePackingListWithAI(
  destination: string,
  days: number
): Promise<GeneratedPacking[]> {
  try {
    const res = await fetch('/api/ai/generate-packing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination, days })
    });

    if (res.ok) {
      const parsed = await res.json();
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('AI packing endpoint unavailable, using smart fallback:', err);
  }

  return getFallbackPackingList(days);
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
