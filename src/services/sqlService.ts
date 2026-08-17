import { 
  Trip, ItineraryDay, ItineraryItem, Place, Expense, Booking, PackingItem, TransportLeg, Note, MoodboardItem 
} from '../types/travel';

export interface AllSqlData {
  trips: Trip[];
  itineraryDays: ItineraryDay[];
  itineraryItems: ItineraryItem[];
  places: Place[];
  expenses: Expense[];
  bookings: Booking[];
  packingItems: PackingItem[];
  transports: TransportLeg[];
  notes: Note[];
  moodboardItems: MoodboardItem[];
}

export async function fetchAllDataFromSql(userId: string): Promise<AllSqlData | null> {
  try {
    const res = await fetch(`/api/sql/all-data?userId=${encodeURIComponent(userId || 'guest')}`);
    if (!res.ok) throw new Error('Failed to fetch data from Cloud SQL');
    return await res.json();
  } catch (err) {
    console.warn('fetchAllDataFromSql notice:', err);
    return null;
  }
}

export async function saveTripToSql(trip: Trip): Promise<boolean> {
  try {
    const res = await fetch('/api/sql/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trip),
    });
    return res.ok;
  } catch (err) {
    console.warn('saveTripToSql notice:', err);
    return false;
  }
}

export async function deleteTripFromSql(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/sql/trips/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('deleteTripFromSql notice:', err);
    return false;
  }
}

export async function saveEntityToSql(type: string, data: any): Promise<boolean> {
  try {
    const res = await fetch(`/api/sql/entity/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (err) {
    console.warn(`saveEntityToSql (${type}) notice:`, err);
    return false;
  }
}

export async function deleteEntityFromSql(type: string, id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/sql/entity/${type}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn(`deleteEntityFromSql (${type}) notice:`, err);
    return false;
  }
}

export async function seedBanyuwangiToSql(userId: string): Promise<boolean> {
  try {
    const res = await fetch('/api/sql/seed-banyuwangi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userId || 'guest' }),
    });
    return res.ok;
  } catch (err) {
    console.warn('seedBanyuwangiToSql notice:', err);
    return false;
  }
}
