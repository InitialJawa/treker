import { CurrencyCode } from '../types/travel';

export function formatCurrency(amount: number | undefined | null, currency: CurrencyCode = 'IDR'): string {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;

  if (currency === 'IDR') {
    return `Rp ${safeAmount.toLocaleString('id-ID')}`;
  }

  const symbolMap: Record<CurrencyCode, string> = {
    IDR: 'Rp',
    USD: '$',
    EUR: '€',
    SGD: 'S$',
    JPY: '¥',
    AUD: 'A$'
  };

  const symbol = symbolMap[currency] || '$';
  return `${symbol}${safeAmount.toLocaleString('en-US')}`;
}

export function parseLocalDateParts(dateStr: string): { year: number; month: number; day: number } | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.trim().split('T')[0].split('-');
  if (parts.length < 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return { year, month, day };
}

export function formatDateRange(startDateStr: string, endDateStr: string): string {
  const startParts = parseLocalDateParts(startDateStr);
  const endParts = parseLocalDateParts(endDateStr);

  if (!startParts || !endParts) return '';

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const startDay = startParts.day;
  const endDay = endParts.day;
  const startMonth = months[startParts.month];
  const endMonth = months[endParts.month];

  if (startParts.year === endParts.year) {
    if (startParts.month === endParts.month) {
      return `${startDay} — ${endDay} ${startMonth} ${startParts.year}`;
    }
    return `${startDay} ${startMonth} — ${endDay} ${endMonth} ${startParts.year}`;
  }
  return `${startDay} ${startMonth} ${startParts.year} — ${endDay} ${endMonth} ${endParts.year}`;
}

export function calculateDaysToGo(startDateStr: string): number {
  if (!startDateStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDateStr);
  if (isNaN(start.getTime())) return 0;
  start.setHours(0, 0, 0, 0);
  const diff = start.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function calculateTripDurationDays(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 1;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
}

export function getCurrencySymbol(currency: CurrencyCode = 'IDR'): string {
  const symbolMap: Record<CurrencyCode, string> = {
    IDR: 'Rp',
    USD: '$',
    EUR: '€',
    SGD: 'S$',
    JPY: '¥',
    AUD: 'A$'
  };
  return symbolMap[currency] || '$';
}

export function generateDaysForTrip(tripId: string, startDateStr: string, endDateStr: string, destination: string): any[] {
  if (!startDateStr || !endDateStr) return [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  let diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
  if (diffDays > 60) {
    diffDays = 60; // Cap to prevent infinite loops from typos
  }
  
  const days = [];
  for (let i = 0; i < diffDays; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push({
      id: `day-${tripId}-${Date.now()}-${i}`,
      tripId,
      dayNumber: i + 1,
      date: d.toISOString().split('T')[0],
      title: i === 0 ? `Hari Kedatangan di ${destination}` : i === diffDays - 1 ? `Hari Kepulangan` : `Eksplorasi ${destination}`
    });
  }
  return days;
}

export async function syncItineraryDaysDates(tripId: string, startDateStr: string, endDateStr: string, existingDays: any[], destination: string, saveItemFn: any, deleteItemFn: any) {
  if (!startDateStr || !endDateStr) return;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  let diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
  if (diffDays > 60) {
    diffDays = 60; // Cap to prevent infinite loops from typos
  }
  
  // Sort existing days by dayNumber
  const sortedDays = [...existingDays].sort((a, b) => a.dayNumber - b.dayNumber);
  
  for (let i = 0; i < diffDays; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    
    if (i < sortedDays.length) {
      // Update existing day
      const day = sortedDays[i];
      if (day.date !== dateStr) {
        await saveItemFn('itineraryDays', day.id, { ...day, date: dateStr, dayNumber: i + 1 });
      } else if (day.dayNumber !== i + 1) {
        await saveItemFn('itineraryDays', day.id, { ...day, dayNumber: i + 1 });
      }
    } else {
      // Create new day
      const newDay = {
        id: `day-${tripId}-${Date.now()}-${i}`,
        tripId,
        dayNumber: i + 1,
        date: dateStr,
        title: i === 0 ? `Hari Kedatangan di ${destination}` : i === diffDays - 1 ? `Hari Kepulangan` : `Eksplorasi ${destination}`
      };
      await saveItemFn('itineraryDays', newDay.id, newDay);
    }
  }
  
  // Delete extra days if we shrunk the trip length
  if (sortedDays.length > diffDays) {
    for (let i = diffDays; i < sortedDays.length; i++) {
      await deleteItemFn('itineraryDays', sortedDays[i].id);
    }
  }
}
