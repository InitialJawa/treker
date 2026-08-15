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

export function formatDateRange(startDateStr: string, endDateStr: string): string {
  if (!startDateStr || !endDateStr) return '';
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const startDay = start.getDate();
  const endDay = end.getDate();
  const startMonth = months[start.getMonth()];
  const endMonth = months[end.getMonth()];
  const year = start.getFullYear();

  if (startMonth === endMonth) {
    return `${startDay} — ${endDay} ${startMonth} ${year}`;
  }
  return `${startDay} ${startMonth} — ${endDay} ${endMonth} ${year}`;
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
