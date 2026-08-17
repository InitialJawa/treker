import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Trip, ItineraryDay, ItineraryItem, Place, Expense, Booking, PackingItem, TransportLeg, Note, CurrencyCode, PlaceStatus, MoodboardItem
} from '../types/travel';
import { 
  INITIAL_TRIPS, INITIAL_ITINERARY_DAYS, INITIAL_ITINERARY_ITEMS, INITIAL_PLACES, 
  INITIAL_EXPENSES, INITIAL_BOOKINGS, INITIAL_PACKING_ITEMS, INITIAL_TRANSPORTS, INITIAL_NOTES 
} from '../data/mockData';
import { banyuwangiTrip, banyuwangiDays, banyuwangiItems, banyuwangiPlaces } from '../data/banyuwangiTemplate';
import { generateItineraryWithAI, generatePackingListWithAI } from '../services/aiService';
import { syncItineraryDaysDates } from '../utils/formatters';
import { useAuth } from './AuthContext';
import { 
  saveTripToSupabase, 
  deleteTripFromSupabase, 
  addCollaboratorToTrip, 
  removeCollaboratorFromTrip, 
  saveItemToSupabase, 
  deleteItemFromSupabase, 
  fetchAllDataFromSupabase 
} from '../services/supabaseService';
import { loadBanyuwangiTemplateToSupabase } from '../scripts/loadTemplate';

interface TripContextType {
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
  loading: boolean;
  
  activeTripId: string | null;
  setActiveTripId: (id: string | null) => void;
  
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Actions
  createNewTrip: (tripData: Omit<Trip, 'id' | 'actualSpent' | 'status' | 'isFavorite' | 'createdAt'>, generateAI?: boolean) => Promise<string>;
  updateTrip: (id: string, updates: Partial<Trip>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  duplicateTrip: (id: string, customName?: string, newStartDate?: string, newEndDate?: string) => Promise<string>;
  toggleTripFavorite: (id: string) => Promise<void>;
  shareTripWithCollaborator: (tripId: string, email: string) => Promise<void>;
  removeCollaborator: (tripId: string, email: string) => Promise<void>;
  importTemplateTrip: (templateTripId: string, customName?: string, newStartDate?: string, newEndDate?: string) => Promise<string>;
  toggleTripTemplate: (tripId: string) => Promise<void>;

  // Itinerary
  addItineraryItem: (item: Omit<ItineraryItem, 'id' | 'sortOrder'>) => Promise<void>;
  updateItineraryItem: (id: string, updates: Partial<ItineraryItem>) => Promise<void>;
  deleteItineraryItem: (id: string) => Promise<void>;
  addItineraryDay: (tripId: string, title: string, insertIndex?: number) => Promise<void>;
  updateItineraryDay: (id: string, title: string) => Promise<void>;
  deleteItineraryDay: (id: string, tripId: string) => Promise<void>;
  reorderItineraryDays: (tripId: string, dayId: string, newIndex: number) => Promise<void>;

  // Places
  addPlace: (place: Omit<Place, 'id'>) => Promise<void>;
  updatePlaceStatus: (id: string, status: PlaceStatus) => Promise<void>;
  togglePlaceFavorite: (id: string) => Promise<void>;
  updatePlace: (id: string, updates: Partial<Place>) => Promise<void>;
  deletePlace: (id: string) => Promise<void>;
  addPlaceToTripItinerary: (place: Place, tripId: string, dayId: string) => Promise<void>;

  // Budget
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // Booking
  addBooking: (booking: Omit<Booking, 'id'>) => Promise<void>;
  updateBooking: (id: string, updates: Partial<Booking>) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;

  // Packing
  addPackingItem: (item: Omit<PackingItem, 'id' | 'isPacked'>) => Promise<void>;
  updatePackingItem: (id: string, updates: Partial<PackingItem>) => Promise<void>;
  togglePackingItem: (id: string) => Promise<void>;
  deletePackingItem: (id: string) => Promise<void>;
  generateAIPackingListForTrip: (tripId: string) => Promise<void>;

  // Transport
  addTransport: (transport: Omit<TransportLeg, 'id'>) => Promise<void>;
  deleteTransport: (id: string) => Promise<void>;

  // Notes
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  addMoodboardItem: (tripId: string, imageUrl: string, title?: string, caption?: string, category?: string) => Promise<void>;
  deleteMoodboardItem: (id: string) => Promise<void>;
  updateMoodboardItem: (id: string, updates: Partial<MoodboardItem>) => Promise<void>;

  // System
  resetToDefaults: () => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [trips, setTrips] = useState<Trip[]>(() => {
    try {
      const saved = localStorage.getItem('traveler_trips');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [banyuwangiTrip];
  });
  
  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>(() => {
    try {
      const saved = localStorage.getItem('traveler_days');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return banyuwangiDays;
  });

  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>(() => {
    try {
      const saved = localStorage.getItem('traveler_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return banyuwangiItems;
  });

  const [places, setPlaces] = useState<Place[]>(() => {
    try {
      const saved = localStorage.getItem('traveler_places');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return banyuwangiPlaces;
  });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [transports, setTransports] = useState<TransportLeg[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [moodboardItems, setMoodboardItems] = useState<MoodboardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [activeTripId, setActiveTripId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('traveler_active_trip_id');
      if (saved) return saved;
    } catch (e) {}
    return banyuwangiTrip.id;
  });
  const [currency, setCurrency] = useState<CurrencyCode>('IDR');
  const [activeTab, setActiveTab] = useState<string>('Overview');

  // Synchronization with Supabase
  useEffect(() => {
    if (!user) {
      setTrips([banyuwangiTrip]);
      setItineraryDays(banyuwangiDays);
      setItineraryItems(banyuwangiItems);
      setPlaces(banyuwangiPlaces);
      setActiveTripId(banyuwangiTrip.id);
      setLoading(false);
      return;
    }

    const loadUserData = async () => {
      let data = await fetchAllDataFromSupabase(user.uid);
      if (!data) return;

      if (data.trips.length === 0) {
        // User baru: seed template Banyuwangi sebagai trip milik user
        try {
          await loadBanyuwangiTemplateToSupabase(user.uid);
        } catch (err) {
          console.warn('Supabase seed template notice:', err);
        }
        data = await fetchAllDataFromSupabase(user.uid);
        if (!data) return;
      }

      if (data.trips.length > 0) {
        setTrips(data.trips);
        if (data.itineraryDays.length > 0) setItineraryDays(data.itineraryDays);
        if (data.itineraryItems.length > 0) setItineraryItems(data.itineraryItems);
        if (data.places.length > 0) setPlaces(data.places);
        if (data.expenses.length > 0) setExpenses(data.expenses);
        if (data.bookings.length > 0) setBookings(data.bookings);
        if (data.packingItems.length > 0) setPackingItems(data.packingItems);
        if (data.transports.length > 0) setTransports(data.transports);
        if (data.notes.length > 0) setNotes(data.notes);
        if (data.moodboardItems.length > 0) setMoodboardItems(data.moodboardItems);
        if (!activeTripId || !data.trips.some(t => t.id === activeTripId)) {
          setActiveTripId(data.trips[0].id);
        }
      }
    };

    loadUserData()
      .catch(err => {
        console.warn('Supabase initial fetch notice:', err);
      })
      .finally(() => setLoading(false));
  }, [user]);

  // Recalculate actual spent for trips whenever expenses change
  useEffect(() => {
    setTrips(prevTrips => prevTrips.map(trip => {
      const tripExpenses = expenses.filter(e => e.tripId === trip.id && e.status === 'paid');
      const totalSpent = tripExpenses.reduce((sum, e) => sum + e.actualAmount, 0);
      return { ...trip, actualSpent: totalSpent };
    }));
  }, [expenses]);

  const createNewTrip = async (
    tripData: Omit<Trip, 'id' | 'actualSpent' | 'status' | 'isFavorite' | 'createdAt'>,
    generateAI = true
  ): Promise<string> => {
    const currentUserId = user?.uid || 'guest';

    // Prevent double / duplicate trip creation with identical name for this user
    let finalTripName = tripData.name.trim();
    let isDuplicateName = trips.some(
      t => t.name.trim().toLowerCase() === finalTripName.toLowerCase() && t.userId === currentUserId
    );
    let counter = 1;
    while (isDuplicateName) {
      finalTripName = `${tripData.name.trim()} (${counter})`;
      // eslint-disable-next-line no-loop-func
      isDuplicateName = trips.some(
        t => t.name.trim().toLowerCase() === finalTripName.toLowerCase() && t.userId === currentUserId
      );
      counter++;
    }

    const newId = `trip-${Date.now()}`;
    const newTrip: Trip = {
      ...tripData,
      name: finalTripName,
      id: newId,
      userId: currentUserId,
      tenantId: currentUserId,
      memberIds: [currentUserId],
      collaborators: [],
      allowPublicView: false,
      actualSpent: 0,
      status: 'upcoming',
      isFavorite: false,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setTrips(prev => {
      const list = [...prev, newTrip];
      try { localStorage.setItem('traveler_trips', JSON.stringify(list)); } catch (e) {}
      return list;
    });

    await saveTripToSupabase(newTrip);

    // Calculate number of days
    const start = new Date(tripData.startDate);
    const end = new Date(tripData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const dayCount = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    const createdDays: ItineraryDay[] = [];
    for (let i = 0; i < dayCount; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      const dateStr = current.toISOString().split('T')[0];
      const dayObj: ItineraryDay = {
        id: `day-${newId}-${i + 1}`,
        tripId: newId,
        dayNumber: i + 1,
        date: dateStr,
        title: `Hari ${i + 1}: Perjalanan ${tripData.destination}`
      };
      createdDays.push(dayObj);
      await saveItemToSupabase('itineraryDays', dayObj.id, dayObj);
    }
    setItineraryDays(prev => [...prev, ...createdDays]);

    if (generateAI) {
      try {
        const aiResult = await generateItineraryWithAI(
          tripData.destination,
          dayCount,
          tripData.travelersCount,
          tripData.budget,
          tripData.currency,
          tripData.description
        );

        if (aiResult && aiResult.activities) {
          const generatedItems: ItineraryItem[] = [];
          for (let index = 0; index < aiResult.activities.length; index++) {
            const act = aiResult.activities[index];
            const dayTarget = createdDays[act.dayNumber - 1] || createdDays[0];
            const itemObj: ItineraryItem = {
              id: `item-${newId}-${index + 1}`,
              dayId: dayTarget.id,
              tripId: newId,
              time: act.time || '09:00',
              duration: act.duration || '1 hour',
              title: act.title,
              location: act.location,
              category: act.category || 'Activity',
              estimatedCost: act.estimatedCost || 0,
              description: act.description,
              notes: act.notes,
              transportType: act.transportType,
              sortOrder: index + 1
            };
            generatedItems.push(itemObj);
            await saveItemToSupabase('itineraryItems', itemObj.id, itemObj);
          }
          setItineraryItems(prev => [...prev, ...generatedItems]);
        }
      } catch (err) {
        console.error('Failed to generate AI itinerary:', err);
      }

      // Generate default packing items
      try {
        const packingRes = await generatePackingListWithAI(tripData.destination, dayCount);
        const generatedPacks: PackingItem[] = [];
        for (let idx = 0; idx < packingRes.length; idx++) {
          const p = packingRes[idx];
          const packObj: PackingItem = {
            id: `pack-${newId}-${idx}`,
            tripId: newId,
            category: p.category,
            name: p.name,
            quantity: p.quantity,
            isPacked: false
          };
          generatedPacks.push(packObj);
          await saveItemToSupabase('packingItems', packObj.id, packObj);
        }
        setPackingItems(prev => [...prev, ...generatedPacks]);
      } catch (e) {
        console.error('Failed packing list AI:', e);
      }
    }

    // Add initial welcome note
    const welcomeNote: Note = {
      id: `note-${newId}-welcome`,
      tripId: newId,
      title: `Catatan Perjalanan ${tripData.name}`,
      content: `Selamat! Workspace perjalanan ${tripData.name} telah dibuat. Gunakan tab Itinerary, Budget, dan Bookings untuk melengkapi persiapan perjalananmu.`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      color: '#E0F2FE'
    };
    await saveItemToSupabase('notes', welcomeNote.id, welcomeNote);
    setNotes(prev => [...prev, welcomeNote]);

    setActiveTripId(newId);
    return newId;
  };

  const updateTrip = async (id: string, updates: Partial<Trip>) => {
    const existing = trips.find(t => t.id === id);
    if (existing) {
      const updated = { ...existing, ...updates };
      setTrips(prev => prev.map(t => t.id === id ? updated : t));
      await saveTripToSupabase(updated);
      
      const existingDays = itineraryDays.filter(d => d.tripId === id);
      await syncItineraryDaysDates(
        id, 
        updated.startDate, 
        updated.endDate, 
        existingDays, 
        updated.destination, 
        saveItemToSupabase, 
        deleteItemFromSupabase
      );
    }
  };

  const deleteTrip = async (id: string) => {
    setTrips(prev => prev.filter(t => t.id !== id));
    await deleteTripFromSupabase(id);
    if (activeTripId === id) {
      const remainingTrips = trips.filter(t => t.id !== id);
      setActiveTripId(remainingTrips[0]?.id || null);
    }
  };

  const duplicateTrip = async (origTripId: string, customName?: string, newStartDate?: string, newEndDate?: string): Promise<string> => {
    const currentUserId = user?.uid || 'guest';
    const origTrip = trips.find(t => t.id === origTripId) || INITIAL_TRIPS.find(t => t.id === origTripId);
    if (!origTrip) throw new Error("Trip tidak ditemukan.");

    const newId = `trip-${Date.now()}`;
    const duplicatedTrip: Trip = {
      ...origTrip,
      id: newId,
      userId: currentUserId,
      tenantId: currentUserId,
      memberIds: [currentUserId],
      collaborators: [],
      allowPublicView: false,
      isTemplate: false,
      name: customName || `${origTrip.name} (Salin)`,
      startDate: newStartDate || origTrip.startDate,
      endDate: newEndDate || origTrip.endDate,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setTrips(prev => [...prev, duplicatedTrip]);
    await saveTripToSupabase(duplicatedTrip);

    let dayOffset = 0;
    if (newStartDate && origTrip.startDate) {
      const oldStart = new Date(origTrip.startDate);
      const newStart = new Date(newStartDate);
      const diffTime = newStart.getTime() - oldStart.getTime();
      dayOffset = Math.round(diffTime / (1000 * 3600 * 24));
    }

    // Duplicate days
    let oldDays = itineraryDays.filter(d => d.tripId === origTripId);
    if (oldDays.length === 0) {
      oldDays = INITIAL_ITINERARY_DAYS.filter(d => d.tripId === origTripId);
    }
    const dayMap = new Map<string, string>();
    const newDaysList: ItineraryDay[] = [];

    for (const d of oldDays) {
      const newDayId = `day-${newId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      dayMap.set(d.id, newDayId);
      
      let newDateStr = d.date;
      if (dayOffset !== 0) {
        const oldDateObj = new Date(d.date);
        oldDateObj.setDate(oldDateObj.getDate() + dayOffset);
        newDateStr = oldDateObj.toISOString().split('T')[0];
      }

      const newDay: ItineraryDay = { ...d, id: newDayId, tripId: newId, date: newDateStr, userId: currentUserId };
      newDaysList.push(newDay);
      await saveItemToSupabase('itineraryDays', newDayId, newDay);
    }
    setItineraryDays(prev => [...prev, ...newDaysList]);

    // Duplicate items
    let oldItems = itineraryItems.filter(i => i.tripId === origTripId);
    if (oldItems.length === 0) {
      oldItems = INITIAL_ITINERARY_ITEMS.filter(i => i.tripId === origTripId);
    }
    const newItemsList: ItineraryItem[] = [];
    for (let idx = 0; idx < oldItems.length; idx++) {
      const item = oldItems[idx];
      const newItem: ItineraryItem = {
        ...item,
        id: `item-${newId}-${idx + 1}`,
        tripId: newId,
        dayId: dayMap.get(item.dayId) || item.dayId,
        userId: currentUserId
      };
      newItemsList.push(newItem);
      await saveItemToSupabase('itineraryItems', newItem.id, newItem);
    }
    setItineraryItems(prev => [...prev, ...newItemsList]);

    setActiveTripId(newId);
    return newId;
  };

  const importTemplateTrip = async (templateTripId: string, customName?: string, newStartDate?: string, newEndDate?: string): Promise<string> => {
    return await duplicateTrip(templateTripId, customName, newStartDate, newEndDate);
  };

  const shareTripWithCollaborator = async (tripId: string, email: string) => {
    await addCollaboratorToTrip(tripId, email);
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        const collabs = t.collaborators || [];
        return { ...t, collaborators: [...collabs, email] };
      }
      return t;
    }));
  };

  const removeCollaborator = async (tripId: string, email: string) => {
    await removeCollaboratorFromTrip(tripId, email);
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return { ...t, collaborators: (t.collaborators || []).filter(c => c !== email) };
      }
      return t;
    }));
  };

  const toggleTripTemplate = async (tripId: string) => {
    const target = trips.find(t => t.id === tripId);
    if (target) {
      const updated = { ...target, isTemplate: !target.isTemplate };
      setTrips(prev => prev.map(t => t.id === tripId ? updated : t));
      await saveTripToSupabase(updated);
    }
  };

  const toggleTripFavorite = async (id: string) => {
    const target = trips.find(t => t.id === id);
    if (target) {
      const updated = { ...target, isFavorite: !target.isFavorite };
      setTrips(prev => prev.map(t => t.id === id ? updated : t));
      await saveTripToSupabase(updated);
    }
  };

  const addItineraryItem = async (item: Omit<ItineraryItem, 'id' | 'sortOrder'>) => {
    const newItem: ItineraryItem = {
      ...item,
      id: `item-${Date.now()}`,
      sortOrder: itineraryItems.filter(i => i.dayId === item.dayId).length + 1
    };
    setItineraryItems(prev => [...prev, newItem]);
    await saveItemToSupabase('itineraryItems', newItem.id, newItem);
  };

  const updateItineraryItem = async (id: string, updates: Partial<ItineraryItem>) => {
    const existing = itineraryItems.find(i => i.id === id);
    if (existing) {
      const updated = { ...existing, ...updates };
      setItineraryItems(prev => prev.map(i => i.id === id ? updated : i));
      await saveItemToSupabase('itineraryItems', id, updated);
    }
  };

  const deleteItineraryItem = async (id: string) => {
    setItineraryItems(prev => prev.filter(i => i.id !== id));
    await deleteItemFromSupabase('itineraryItems', id);
  };

  const updateItineraryDay = async (id: string, title: string) => {
    const existing = itineraryDays.find(d => d.id === id);
    if (existing) {
      const updated = { ...existing, title };
      setItineraryDays(prev => prev.map(d => d.id === id ? updated : d));
      await saveItemToSupabase('itineraryDays', id, updated);
    }
  };

  const deleteItineraryDay = async (id: string, tripId: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    const tripDays = itineraryDays.filter(d => d.tripId === tripId).sort((a, b) => a.dayNumber - b.dayNumber);
    const dayToDelete = tripDays.find(d => d.id === id);
    if (!dayToDelete) return;

    // Delete day & items in state
    setItineraryDays(prev => prev.filter(d => d.id !== id));
    setItineraryItems(prev => prev.filter(i => i.dayId !== id));

    await deleteItemFromSupabase('itineraryDays', id);
    const itemsInDay = itineraryItems.filter(i => i.dayId === id);
    for (const item of itemsInDay) {
      await deleteItemFromSupabase('itineraryItems', item.id);
    }

    // Re-index remaining days
    const remainingDays = tripDays.filter(d => d.id !== id);
    const start = new Date(trip.startDate);
    
    for (let i = 0; i < remainingDays.length; i++) {
      const day = remainingDays[i];
      const newDayNum = i + 1;
      const newDate = new Date(start);
      newDate.setDate(start.getDate() + i);
      const newDateStr = newDate.toISOString().split('T')[0];

      if (day.dayNumber !== newDayNum || day.date !== newDateStr) {
        await saveItemToSupabase('itineraryDays', day.id, { ...day, dayNumber: newDayNum, date: newDateStr });
      }
    }

    const currentEnd = new Date(trip.startDate);
    currentEnd.setDate(currentEnd.getDate() + Math.max(0, remainingDays.length - 1));
    const updatedTrip = { ...trip, endDate: currentEnd.toISOString().split('T')[0] };
    setTrips(prev => prev.map(t => t.id === tripId ? updatedTrip : t));
    await saveTripToSupabase(updatedTrip);
  };

  const reorderItineraryDays = async (tripId: string, dayId: string, newIndex: number) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    const tripDays = itineraryDays.filter(d => d.tripId === tripId).sort((a, b) => a.dayNumber - b.dayNumber);
    const draggedDayIndex = tripDays.findIndex(d => d.id === dayId);
    if (draggedDayIndex === -1 || draggedDayIndex === newIndex) return;

    const newOrder = [...tripDays];
    const [draggedDay] = newOrder.splice(draggedDayIndex, 1);
    newOrder.splice(newIndex, 0, draggedDay);

    const start = new Date(trip.startDate);
    for (let i = 0; i < newOrder.length; i++) {
      const day = newOrder[i];
      const newDayNum = i + 1;
      const newDate = new Date(start);
      newDate.setDate(start.getDate() + i);
      const newDateStr = newDate.toISOString().split('T')[0];
      
      if (day.dayNumber !== newDayNum || day.date !== newDateStr) {
        await saveItemToSupabase('itineraryDays', day.id, { ...day, dayNumber: newDayNum, date: newDateStr });
      }
    }
  };

  const addItineraryDay = async (tripId: string, title: string, insertIndex?: number) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    const start = new Date(trip.startDate);
    const tripDays = itineraryDays.filter(d => d.tripId === tripId).sort((a, b) => a.dayNumber - b.dayNumber);
    
    const indexToInsert = (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= tripDays.length) 
         ? insertIndex 
         : tripDays.length;

    const newDayId = `day-${tripId}-${Date.now()}`;
    const newDayObj: ItineraryDay = {
      id: newDayId,
      tripId,
      dayNumber: indexToInsert + 1,
      date: '',
      title: title || `Hari ${indexToInsert + 1}`
    };

    const newOrder = [...tripDays];
    newOrder.splice(indexToInsert, 0, newDayObj);

    for (let i = 0; i < newOrder.length; i++) {
      const day = newOrder[i];
      const newDayNum = i + 1;
      const newDate = new Date(start);
      newDate.setDate(start.getDate() + i);
      const newDateStr = newDate.toISOString().split('T')[0];
      
      if (day.id === newDayId) {
         if (!title) day.title = `Hari ${newDayNum}`;
         await saveItemToSupabase('itineraryDays', day.id, { ...day, dayNumber: newDayNum, date: newDateStr });
      } else if (day.dayNumber !== newDayNum || day.date !== newDateStr) {
         await saveItemToSupabase('itineraryDays', day.id, { ...day, dayNumber: newDayNum, date: newDateStr });
      }
    }

    setItineraryDays(newOrder);

    const currentEnd = new Date(trip.startDate);
    currentEnd.setDate(currentEnd.getDate() + Math.max(0, newOrder.length - 1));
    const updatedTrip = { ...trip, endDate: currentEnd.toISOString().split('T')[0] };
    setTrips(prev => prev.map(t => t.id === tripId ? updatedTrip : t));
    await saveTripToSupabase(updatedTrip);
  };

  const addPlace = async (place: Omit<Place, 'id'>) => {
    const newPlace: Place = {
      ...place,
      id: `place-${Date.now()}`,
      tripId: place.tripId || activeTripId || '',
      userId: user?.uid
    };
    setPlaces(prev => {
      const updated = [...prev, newPlace];
      try { localStorage.setItem('traveler_places', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    await saveItemToSupabase('places', newPlace.id, newPlace);
  };

  const updatePlaceStatus = async (id: string, status: PlaceStatus) => {
    const existing = places.find(p => p.id === id);
    if (existing) {
      const updatedItem = { ...existing, status };
      setPlaces(prev => {
        const updated = prev.map(p => p.id === id ? updatedItem : p);
        try { localStorage.setItem('traveler_places', JSON.stringify(updated)); } catch (e) {}
        return updated;
      });
      await saveItemToSupabase('places', id, updatedItem);
    }
  };

  const togglePlaceFavorite = async (id: string) => {
    const existing = places.find(p => p.id === id);
    if (existing) {
      const updated = { ...existing, isFavorite: !existing.isFavorite };
      setPlaces(prev => {
        const list = prev.map(p => p.id === id ? updated : p);
        try { localStorage.setItem('traveler_places', JSON.stringify(list)); } catch (e) {}
        return list;
      });
      await saveItemToSupabase('places', id, updated);
    }
  };

  const updatePlace = async (id: string, updates: Partial<Place>) => {
    const existing = places.find(p => p.id === id);
    if (existing) {
      const updated = { ...existing, ...updates };
      setPlaces(prev => {
        const list = prev.map(p => p.id === id ? updated : p);
        try { localStorage.setItem('traveler_places', JSON.stringify(list)); } catch (e) {}
        return list;
      });
      await saveItemToSupabase('places', id, updated);
    }
  };

  const deletePlace = async (id: string) => {
    setPlaces(prev => {
      const list = prev.filter(p => p.id !== id);
      try { localStorage.setItem('traveler_places', JSON.stringify(list)); } catch (e) {}
      return list;
    });
    await deleteItemFromSupabase('places', id);
  };

  const addPlaceToTripItinerary = async (place: Place, tripId: string, dayId: string) => {
    const newItem: ItineraryItem = {
      id: `item-${Date.now()}`,
      dayId,
      tripId,
      time: '10:00',
      duration: '2 hours',
      title: place.name,
      location: place.location,
      category: 'Activity',
      estimatedCost: place.estimatedCost || 0,
      description: place.description,
      notes: place.notes,
      sortOrder: itineraryItems.filter(i => i.dayId === dayId).length + 1
    };
    setItineraryItems(prev => [...prev, newItem]);
    await saveItemToSupabase('itineraryItems', newItem.id, newItem);
  };

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: `exp-${Date.now()}`
    };
    setExpenses(prev => [...prev, newExpense]);
    await saveItemToSupabase('expenses', newExpense.id, newExpense);
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    const existing = expenses.find(e => e.id === id);
    if (existing) {
      const updated = { ...existing, ...updates };
      setExpenses(prev => prev.map(e => e.id === id ? updated : e));
      await saveItemToSupabase('expenses', id, updated);
    }
  };

  const deleteExpense = async (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    await deleteItemFromSupabase('expenses', id);
  };

  const addBooking = async (booking: Omit<Booking, 'id'>) => {
    const newBooking: Booking = {
      ...booking,
      id: `book-${Date.now()}`
    };
    setBookings(prev => [...prev, newBooking]);
    await saveItemToSupabase('bookings', newBooking.id, newBooking);
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    const existing = bookings.find(b => b.id === id);
    if (existing) {
      const updated = { ...existing, ...updates };
      setBookings(prev => prev.map(b => b.id === id ? updated : b));
      await saveItemToSupabase('bookings', id, updated);
    }
  };

  const deleteBooking = async (id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    await deleteItemFromSupabase('bookings', id);
  };

  const addPackingItem = async (item: Omit<PackingItem, 'id' | 'isPacked'>) => {
    const newItem: PackingItem = {
      ...item,
      id: `pack-${Date.now()}`,
      isPacked: false
    };
    setPackingItems(prev => [...prev, newItem]);
    await saveItemToSupabase('packingItems', newItem.id, newItem);
  };

  const updatePackingItem = async (id: string, updates: Partial<PackingItem>) => {
    const existing = packingItems.find(p => p.id === id);
    if (existing) {
      const updated = { ...existing, ...updates };
      setPackingItems(prev => prev.map(p => p.id === id ? updated : p));
      await saveItemToSupabase('packingItems', id, updated);
    }
  };

  const togglePackingItem = async (id: string) => {
    const existing = packingItems.find(p => p.id === id);
    if (existing) {
      const updated = { ...existing, isPacked: !existing.isPacked };
      setPackingItems(prev => prev.map(p => p.id === id ? updated : p));
      await saveItemToSupabase('packingItems', id, updated);
    }
  };

  const deletePackingItem = async (id: string) => {
    setPackingItems(prev => prev.filter(p => p.id !== id));
    await deleteItemFromSupabase('packingItems', id);
  };

  const generateAIPackingListForTrip = async (tripId: string) => {
    const targetTrip = trips.find(t => t.id === tripId);
    if (!targetTrip) return;
    const items = await generatePackingListWithAI(targetTrip.destination, 3);
    const newPacks: PackingItem[] = [];
    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const packObj: PackingItem = {
        id: `pack-${tripId}-${Date.now()}-${idx}`,
        tripId,
        category: item.category,
        name: item.name,
        quantity: item.quantity,
        isPacked: false
      };
      newPacks.push(packObj);
      await saveItemToSupabase('packingItems', packObj.id, packObj);
    }
    setPackingItems(prev => [...prev, ...newPacks]);
  };

  const addTransport = async (transport: Omit<TransportLeg, 'id'>) => {
    const newTr: TransportLeg = {
      ...transport,
      id: `tr-${Date.now()}`
    };
    setTransports(prev => [...prev, newTr]);
    await saveItemToSupabase('transports', newTr.id, newTr);
  };

  const deleteTransport = async (id: string) => {
    setTransports(prev => prev.filter(t => t.id !== id));
    await deleteItemFromSupabase('transports', id);
  };

  const addNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newNote: Note = {
      ...note,
      id: `note-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    setNotes(prev => [...prev, newNote]);
    await saveItemToSupabase('notes', newNote.id, newNote);
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    const now = new Date().toISOString().split('T')[0];
    const existing = notes.find(n => n.id === id);
    if (existing) {
      const updated = { ...existing, ...updates, updatedAt: now };
      setNotes(prev => prev.map(n => n.id === id ? updated : n));
      await saveItemToSupabase('notes', id, updated);
    }
  };

  const deleteNote = async (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    await deleteItemFromSupabase('notes', id);
  };

  const addMoodboardItem = async (tripId: string, imageUrl: string, title?: string, caption?: string, category?: string) => {
    const newItem: MoodboardItem = {
      id: 'mb-' + Date.now(),
      tripId,
      imageUrl,
      title: title || '',
      caption: caption || '',
      category: category || 'Spot Foto',
      x: Math.floor(Math.random() * 100),
      y: Math.floor(Math.random() * 100),
      width: 250,
      height: 250,
      zIndex: Date.now() % 100000,
      createdAt: new Date().toISOString()
    };
    setMoodboardItems(prev => [...prev, newItem]);
    await saveItemToSupabase('moodboardItems', newItem.id, newItem);
  };

  const deleteMoodboardItem = async (id: string) => {
    setMoodboardItems(prev => prev.filter(m => m.id !== id));
    await deleteItemFromSupabase('moodboardItems', id);
  };

  const updateMoodboardItem = async (id: string, updates: Partial<MoodboardItem>) => {
    const existing = moodboardItems.find(m => m.id === id);
    if (existing) {
      const updated = { ...existing, ...updates };
      setMoodboardItems(prev => prev.map(m => m.id === id ? updated : m));
      await saveItemToSupabase('moodboardItems', id, updated);
    }
  };

  const resetToDefaults = () => {
    setTrips(INITIAL_TRIPS);
    setItineraryDays(INITIAL_ITINERARY_DAYS);
    setItineraryItems(INITIAL_ITINERARY_ITEMS);
    setPlaces(INITIAL_PLACES);
    setExpenses(INITIAL_EXPENSES);
    setBookings(INITIAL_BOOKINGS);
    setPackingItems(INITIAL_PACKING_ITEMS);
    setTransports(INITIAL_TRANSPORTS);
    setNotes(INITIAL_NOTES);
  };

  return (
    <TripContext.Provider
      value={{
        trips,
        itineraryDays,
        itineraryItems,
        places,
        expenses,
        bookings,
        packingItems,
        transports,
        notes,
        moodboardItems,
        loading,
        activeTripId,
        setActiveTripId,
        currency,
        setCurrency,
        activeTab,
        setActiveTab,
        createNewTrip,
        updateTrip,
        deleteTrip,
        duplicateTrip,
        shareTripWithCollaborator,
        removeCollaborator,
        importTemplateTrip,
        toggleTripTemplate,
        toggleTripFavorite,
        addItineraryItem,
        updateItineraryItem,
        deleteItineraryItem,
        addItineraryDay,
        updateItineraryDay,
        deleteItineraryDay,
        reorderItineraryDays,
        addPlace,
        updatePlaceStatus,
        togglePlaceFavorite,
        updatePlace,
        deletePlace,
        addPlaceToTripItinerary,
        addExpense,
        updateExpense,
        deleteExpense,
        addBooking,
        updateBooking,
        deleteBooking,
        addPackingItem,
        updatePackingItem,
        togglePackingItem,
        deletePackingItem,
        generateAIPackingListForTrip,
        addTransport,
        deleteTransport,
        addNote,
        updateNote,
        deleteNote,
        addMoodboardItem,
        deleteMoodboardItem,
        updateMoodboardItem,
        resetToDefaults
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTripContext = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTripContext must be used within a TripProvider');
  }
  return context;
};
