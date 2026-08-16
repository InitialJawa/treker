import { supabase, isSupabaseConfigured } from './supabase';
import { Trip, ItineraryDay, ItineraryItem, Place, Expense, Booking, PackingItem, TransportLeg, Note, MoodboardItem } from '../types/travel';

// Local storage key prefix for offline / fallback data
const STORAGE_PREFIX = 'supabase_app_';

/**
 * Helper to save data to localStorage as reliable cache/fallback
 */
function cacheLocally<T>(key: string, data: T) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.warn('Local caching warning:', e);
  }
}

/**
 * Save Trip to Supabase DB (Table: trips)
 */
export async function saveTripToSupabase(trip: Trip): Promise<void> {
  cacheLocally(`trip_${trip.id}`, trip);

  if (!isSupabaseConfigured) {
    return;
  }

  try {
    const { error } = await supabase
      .from('trips')
      .upsert({
        id: trip.id,
        name: trip.name,
        destination: trip.destination,
        start_date: trip.startDate,
        end_date: trip.endDate,
        travelers_count: trip.travelersCount,
        currency: trip.currency,
        budget: trip.budget,
        actual_spent: trip.actualSpent || 0,
        description: trip.description || '',
        cover_image: trip.coverImage || '',
        status: trip.status || 'upcoming',
        is_template: trip.isTemplate || false,
        is_favorite: trip.isFavorite || false,
        user_id: trip.userId || 'guest',
        collaborators: trip.collaborators || [],
        member_ids: trip.memberIds || [trip.userId || 'guest'],
        allow_public_view: trip.allowPublicView || false,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.warn('Supabase saveTrip notice:', error.message);
    }
  } catch (err) {
    console.warn('Supabase saveTrip exception:', err);
  }
}

/**
 * Delete Trip from Supabase DB
 */
export async function deleteTripFromSupabase(tripId: string): Promise<void> {
  try {
    localStorage.removeItem(STORAGE_PREFIX + `trip_${tripId}`);
  } catch {}

  if (!isSupabaseConfigured) return;

  try {
    await supabase.from('trips').delete().eq('id', tripId);
    // Delete related records
    await supabase.from('itinerary_days').delete().eq('trip_id', tripId);
    await supabase.from('itinerary_items').delete().eq('trip_id', tripId);
    await supabase.from('places').delete().eq('trip_id', tripId);
    await supabase.from('expenses').delete().eq('trip_id', tripId);
    await supabase.from('bookings').delete().eq('trip_id', tripId);
    await supabase.from('packing_items').delete().eq('trip_id', tripId);
    await supabase.from('transports').delete().eq('trip_id', tripId);
    await supabase.from('notes').delete().eq('trip_id', tripId);
    await supabase.from('moodboard_items').delete().eq('trip_id', tripId);
  } catch (err) {
    console.warn('Supabase deleteTrip notice:', err);
  }
}

/**
 * Map collection names to Supabase table names
 */
function getTableName(collectionName: string): string {
  const map: Record<string, string> = {
    itineraryDays: 'itinerary_days',
    itineraryItems: 'itinerary_items',
    places: 'places',
    expenses: 'expenses',
    bookings: 'bookings',
    packingItems: 'packing_items',
    transports: 'transports',
    notes: 'notes',
    moodboardItems: 'moodboard_items',
  };
  return map[collectionName] || collectionName;
}

/**
 * Save generic item to Supabase table
 */
async function getCurrentUserId(): Promise<string> {
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id || 'guest';
  } catch {
    return 'guest';
  }
}

export async function saveItemToSupabase(collectionName: string, itemId: string, data: any): Promise<void> {
  cacheLocally(`${collectionName}_${itemId}`, data);

  if (!isSupabaseConfigured) return;

  try {
    const tableName = getTableName(collectionName);
    const ownerId = data.userId || await getCurrentUserId();
    const payload = {
      id: itemId,
      trip_id: data.tripId,
      user_id: ownerId,
      data: data,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from(tableName).upsert(payload);
    if (error) {
      console.warn(`Supabase upsert into ${tableName} notice:`, error.message);
    }
  } catch (err) {
    console.warn(`Supabase saveItem ${collectionName} exception:`, err);
  }
}

/**
 * Delete generic item from Supabase table
 */
export async function deleteItemFromSupabase(collectionName: string, itemId: string): Promise<void> {
  try {
    localStorage.removeItem(STORAGE_PREFIX + `${collectionName}_${itemId}`);
  } catch {}

  if (!isSupabaseConfigured) return;

  try {
    const tableName = getTableName(collectionName);
    await supabase.from(tableName).delete().eq('id', itemId);
  } catch (err) {
    console.warn(`Supabase deleteItem ${collectionName} notice:`, err);
  }
}

/**
 * Add collaborator email to trip
 */
export async function addCollaboratorToTrip(tripId: string, email: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    const { data: trip } = await supabase.from('trips').select('collaborators, member_ids').eq('id', tripId).single();
    if (trip) {
      const currentCollabs: string[] = trip.collaborators || [];
      if (!currentCollabs.includes(email.toLowerCase())) {
        await supabase
          .from('trips')
          .update({
            collaborators: [...currentCollabs, email.toLowerCase()],
          })
          .eq('id', tripId);
      }
    }
  } catch (err) {
    console.warn('Supabase addCollaborator notice:', err);
  }
}

/**
 * Remove collaborator email from trip
 */
export async function removeCollaboratorFromTrip(tripId: string, email: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    const { data: trip } = await supabase.from('trips').select('collaborators').eq('id', tripId).single();
    if (trip) {
      const updated = (trip.collaborators || []).filter((e: string) => e !== email.toLowerCase());
      await supabase.from('trips').update({ collaborators: updated }).eq('id', tripId);
    }
  } catch (err) {
    console.warn('Supabase removeCollaborator notice:', err);
  }
}

/**
 * Fetch public template trips from Supabase
 */
export async function fetchPublicTemplatesFromSupabase(): Promise<Trip[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('is_template', true)
      .limit(20);

    if (error || !data) return [];

    return data.map((t: any) => ({
      id: t.id,
      name: t.name,
      destination: t.destination,
      startDate: t.start_date,
      endDate: t.end_date,
      travelersCount: t.travelers_count,
      currency: t.currency,
      budget: t.budget,
      actualSpent: t.actual_spent,
      description: t.description,
      coverImage: t.cover_image,
      status: t.status,
      isTemplate: true,
      isFavorite: t.is_favorite,
      userId: t.user_id,
      collaborators: t.collaborators || [],
      memberIds: t.member_ids || [],
      createdAt: t.created_at || t.start_date,
    }));
  } catch (err) {
    console.warn('Supabase fetchPublicTemplates notice:', err);
    return [];
  }
}

// Backward-compatible alias exports for components
export const saveTripToFirestore = saveTripToSupabase;
export const deleteTripFromFirestore = deleteTripFromSupabase;
export const saveItemToFirestore = saveItemToSupabase;
export const deleteItemFromFirestore = deleteItemFromSupabase;
export const fetchPublicTemplatesFromFirestore = fetchPublicTemplatesFromSupabase;

// ===== Hydrate semua data user dari Supabase =====

export interface AllSupabaseData {
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

const ITEM_TABLES = [
  'itinerary_days', 'itinerary_items', 'places', 'expenses', 'bookings',
  'packing_items', 'transports', 'notes', 'moodboard_items',
] as const;

/** Baca semua data user dari Supabase. `data` kolom jsonb di-parse kembali. */
export async function fetchAllDataFromSupabase(userId: string): Promise<AllSupabaseData | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data: trips, error: tripsError } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', userId);
    if (tripsError) throw tripsError;

    const result: AllSupabaseData = {
      trips: (trips || []).map(mapTripRow),
      itineraryDays: [], itineraryItems: [], places: [], expenses: [],
      bookings: [], packingItems: [], transports: [], notes: [], moodboardItems: [],
    };

    await Promise.all(ITEM_TABLES.map(async (table) => {
      const { data, error } = await supabase.from(table).select('data').eq('user_id', userId);
      if (error) return;
      const rows = (data || []).map((r: any) => r.data).filter(Boolean);
      (result as any)[camelTableName(table)] = rows;
    }));

    return result;
  } catch (err) {
    console.warn('fetchAllDataFromSupabase notice:', err);
    return null;
  }
}

function camelTableName(snake: string): string {
  return snake.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function mapTripRow(t: any): Trip {
  return {
    id: t.id, name: t.name, destination: t.destination,
    startDate: t.start_date, endDate: t.end_date,
    travelersCount: t.travelers_count ?? 1,
    currency: t.currency ?? 'IDR', budget: Number(t.budget || 0),
    actualSpent: Number(t.actual_spent || 0), description: t.description || '',
    coverImage: t.cover_image || '', status: t.status || 'upcoming',
    isTemplate: !!t.is_template, isFavorite: !!t.is_favorite,
    userId: t.user_id, collaborators: t.collaborators || [],
    memberIds: t.member_ids || [], allowPublicView: !!t.allow_public_view,
    createdAt: t.created_at || t.start_date || '',
  };
}
