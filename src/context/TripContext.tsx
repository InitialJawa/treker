import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Trip, ItineraryDay, ItineraryItem, Place, Expense, Booking, PackingItem, TransportLeg, Note, CurrencyCode, PlaceStatus
} from '../types/travel';
import { 
  INITIAL_TRIPS, INITIAL_ITINERARY_DAYS, INITIAL_ITINERARY_ITEMS, INITIAL_PLACES, 
  INITIAL_EXPENSES, INITIAL_BOOKINGS, INITIAL_PACKING_ITEMS, INITIAL_TRANSPORTS, INITIAL_NOTES 
} from '../data/mockData';
import { generateItineraryWithAI, generatePackingListWithAI } from '../services/aiService';
import { useAuth } from './AuthContext';
import { db } from '../services/firebase';
import { 
  collection, doc, setDoc, getDocs, deleteDoc, query, where, onSnapshot 
} from 'firebase/firestore';
import { 
  saveTripToFirestore, deleteTripFromFirestore, addCollaboratorToTrip, removeCollaboratorFromTrip, saveItemToFirestore, deleteItemFromFirestore 
} from '../services/firestoreService';

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
  addItineraryDay: (tripId: string, title: string) => Promise<void>;

  // Places
  addPlace: (place: Omit<Place, 'id'>) => Promise<void>;
  updatePlaceStatus: (id: string, status: PlaceStatus) => Promise<void>;
  togglePlaceFavorite: (id: string) => Promise<void>;
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

  // System
  resetToDefaults: () => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>([]);
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([]);
  const [places, setPlaces] = useState<Place[]>(INITIAL_PLACES);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [transports, setTransports] = useState<TransportLeg[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [currency, setCurrency] = useState<CurrencyCode>('IDR');
  const [activeTab, setActiveTab] = useState<string>('Overview');

  // Firestore Realtime Synchronization when User is logged in
  useEffect(() => {
    if (!user) {
      setTrips([]);
      setActiveTripId(null);
      return;
    }

    const userEmail = user.email ? user.email.toLowerCase() : '';

    // Realtime listener for trips where userId == uid OR collaborators contains email OR isTemplate == true
    const tripsCol = collection(db, 'trips');
    const unsubTrips = onSnapshot(
      tripsCol,
      async (snapshot) => {
        const fetchedTrips: Trip[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as Trip;
          const belongsToUser = data.userId === user.uid;
          const isSharedWithUser = userEmail && data.collaborators && data.collaborators.includes(userEmail);
          const isTmpl = data.isTemplate === true;

          if (belongsToUser || isSharedWithUser || isTmpl) {
            fetchedTrips.push({ ...data, id: docSnap.id });
          }
        });

        // If user has zero trips in Firestore, seed initial sample trips into Firestore for this user
        if (fetchedTrips.length === 0 && user.uid) {
          const seedPromises = INITIAL_TRIPS.map(t => {
            const seededTrip: Trip = {
              ...t,
              id: `${t.id}-${user.uid.substring(0, 6)}`,
              userId: user.uid,
              collaborators: []
            };
            return saveTripToFirestore(seededTrip);
          });
          await Promise.all(seedPromises);

          // Seed initial sub items
          for (const day of INITIAL_ITINERARY_DAYS) {
            const newDayId = `${day.id}-${user.uid.substring(0, 6)}`;
            const matchingTrip = INITIAL_TRIPS.find(t => t.id === day.tripId);
            if (matchingTrip) {
              const newTripId = `${matchingTrip.id}-${user.uid.substring(0, 6)}`;
              await saveItemToFirestore('itineraryDays', newDayId, { ...day, id: newDayId, tripId: newTripId });
            }
          }
          for (const item of INITIAL_ITINERARY_ITEMS) {
            const newItemId = `${item.id}-${user.uid.substring(0, 6)}`;
            const matchingTrip = INITIAL_TRIPS.find(t => t.id === item.tripId);
            if (matchingTrip) {
              const newTripId = `${matchingTrip.id}-${user.uid.substring(0, 6)}`;
              await saveItemToFirestore('itineraryItems', newItemId, { ...item, id: newItemId, tripId: newTripId });
            }
          }
          return;
        }

        setTrips(fetchedTrips);
        if (!activeTripId && fetchedTrips.length > 0) {
          setActiveTripId(fetchedTrips[0].id);
        }
      },
      (err) => console.warn('Trips snapshot error:', err)
    );

    // Realtime listener for sub-collections
    const unsubDays = onSnapshot(
      collection(db, 'itineraryDays'),
      (snap) => {
        const list: ItineraryDay[] = [];
        snap.forEach(d => list.push({ ...d.data(), id: d.id } as ItineraryDay));
        setItineraryDays(list);
      },
      (err) => console.warn('ItineraryDays snapshot error:', err)
    );

    const unsubItems = onSnapshot(
      collection(db, 'itineraryItems'),
      (snap) => {
        const list: ItineraryItem[] = [];
        snap.forEach(d => list.push({ ...d.data(), id: d.id } as ItineraryItem));
        setItineraryItems(list);
      },
      (err) => console.warn('ItineraryItems snapshot error:', err)
    );

    const unsubExpenses = onSnapshot(
      collection(db, 'expenses'),
      (snap) => {
        const list: Expense[] = [];
        snap.forEach(d => list.push({ ...d.data(), id: d.id } as Expense));
        setExpenses(list);
      },
      (err) => console.warn('Expenses snapshot error:', err)
    );

    const unsubBookings = onSnapshot(
      collection(db, 'bookings'),
      (snap) => {
        const list: Booking[] = [];
        snap.forEach(d => list.push({ ...d.data(), id: d.id } as Booking));
        setBookings(list);
      },
      (err) => console.warn('Bookings snapshot error:', err)
    );

    const unsubPacking = onSnapshot(
      collection(db, 'packingItems'),
      (snap) => {
        const list: PackingItem[] = [];
        snap.forEach(d => list.push({ ...d.data(), id: d.id } as PackingItem));
        setPackingItems(list);
      },
      (err) => console.warn('PackingItems snapshot error:', err)
    );

    const unsubTransports = onSnapshot(
      collection(db, 'transports'),
      (snap) => {
        const list: TransportLeg[] = [];
        snap.forEach(d => list.push({ ...d.data(), id: d.id } as TransportLeg));
        setTransports(list);
      },
      (err) => console.warn('Transports snapshot error:', err)
    );

    const unsubNotes = onSnapshot(
      collection(db, 'notes'),
      (snap) => {
        const list: Note[] = [];
        snap.forEach(d => list.push({ ...d.data(), id: d.id } as Note));
        setNotes(list);
      },
      (err) => console.warn('Notes snapshot error:', err)
    );

    return () => {
      unsubTrips();
      unsubDays();
      unsubItems();
      unsubExpenses();
      unsubBookings();
      unsubPacking();
      unsubTransports();
      unsubNotes();
    };
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
    if (!user) throw new Error('User harus login terlebih dahulu.');

    // Prevent double / duplicate trip creation with identical name for this user
    let finalTripName = tripData.name.trim();
    let isDuplicateName = trips.some(
      t => t.name.trim().toLowerCase() === finalTripName.toLowerCase() && t.userId === user.uid
    );
    let counter = 1;
    while (isDuplicateName) {
      finalTripName = `${tripData.name.trim()} (${counter})`;
      // eslint-disable-next-line no-loop-func
      isDuplicateName = trips.some(
        t => t.name.trim().toLowerCase() === finalTripName.toLowerCase() && t.userId === user.uid
      );
      counter++;
    }

    const newId = `trip-${Date.now()}`;
    const newTrip: Trip = {
      ...tripData,
      name: finalTripName,
      id: newId,
      userId: user.uid,
      collaborators: [],
      actualSpent: 0,
      status: 'upcoming',
      isFavorite: false,
      createdAt: new Date().toISOString().split('T')[0]
    };

    await saveTripToFirestore(newTrip);

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
      await saveItemToFirestore('itineraryDays', dayObj.id, dayObj);
    }

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
            await saveItemToFirestore('itineraryItems', itemObj.id, itemObj);
          }
        }
      } catch (err) {
        console.error('Failed to generate AI itinerary:', err);
      }

      // Generate default packing items
      try {
        const packingRes = await generatePackingListWithAI(tripData.destination, dayCount);
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
          await saveItemToFirestore('packingItems', packObj.id, packObj);
        }
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
    await saveItemToFirestore('notes', welcomeNote.id, welcomeNote);

    setActiveTripId(newId);
    return newId;
  };

  const updateTrip = async (id: string, updates: Partial<Trip>) => {
    const existing = trips.find(t => t.id === id);
    if (existing) {
      const updated = { ...existing, ...updates };
      await saveTripToFirestore(updated);
    }
  };

  const deleteTrip = async (id: string) => {
    await deleteTripFromFirestore(id);
    if (activeTripId === id) {
      const remainingTrips = trips.filter(t => t.id !== id);
      setActiveTripId(remainingTrips[0]?.id || null);
    }
  };

  const duplicateTrip = async (origTripId: string, customName?: string, newStartDate?: string, newEndDate?: string): Promise<string> => {
    if (!user) throw new Error("User belum login.");
    const origTrip = trips.find(t => t.id === origTripId);
    if (!origTrip) throw new Error("Trip tidak ditemukan.");

    const newId = `trip-${Date.now()}`;
    const duplicatedTrip: Trip = {
      ...origTrip,
      id: newId,
      userId: user.uid,
      collaborators: [],
      isTemplate: false,
      name: customName || `${origTrip.name} (Salin)`,
      startDate: newStartDate || origTrip.startDate,
      endDate: newEndDate || origTrip.endDate,
      createdAt: new Date().toISOString().split('T')[0]
    };

    await saveTripToFirestore(duplicatedTrip);

    let dayOffset = 0;
    if (newStartDate && origTrip.startDate) {
      const oldStart = new Date(origTrip.startDate);
      const newStart = new Date(newStartDate);
      const diffTime = newStart.getTime() - oldStart.getTime();
      dayOffset = Math.round(diffTime / (1000 * 3600 * 24));
    }

    // Duplicate days
    const oldDays = itineraryDays.filter(d => d.tripId === origTripId);
    const dayMap = new Map<string, string>();
    for (const d of oldDays) {
      const newDayId = `day-${newId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      dayMap.set(d.id, newDayId);
      
      let newDateStr = d.date;
      if (dayOffset !== 0) {
        const oldDateObj = new Date(d.date);
        oldDateObj.setDate(oldDateObj.getDate() + dayOffset);
        newDateStr = oldDateObj.toISOString().split('T')[0];
      }

      const newDay: ItineraryDay = { ...d, id: newDayId, tripId: newId, date: newDateStr };
      await saveItemToFirestore('itineraryDays', newDayId, newDay);
    }

    // Duplicate items
    const oldItems = itineraryItems.filter(i => i.tripId === origTripId);
    for (let idx = 0; idx < oldItems.length; idx++) {
      const item = oldItems[idx];
      const newItem: ItineraryItem = {
        ...item,
        id: `item-${newId}-${idx + 1}`,
        tripId: newId,
        dayId: dayMap.get(item.dayId) || item.dayId
      };
      await saveItemToFirestore('itineraryItems', newItem.id, newItem);
    }

    // Duplicate expenses
    const oldExpenses = expenses.filter(e => e.tripId === origTripId);
    for (let idx = 0; idx < oldExpenses.length; idx++) {
      const exp = oldExpenses[idx];
      const newExp: Expense = { ...exp, id: `exp-${newId}-${idx + 1}`, tripId: newId };
      await saveItemToFirestore('expenses', newExp.id, newExp);
    }

    // Duplicate bookings
    const oldBookings = bookings.filter(b => b.tripId === origTripId);
    for (let idx = 0; idx < oldBookings.length; idx++) {
      const b = oldBookings[idx];
      const newBook: Booking = { ...b, id: `book-${newId}-${idx + 1}`, tripId: newId };
      await saveItemToFirestore('bookings', newBook.id, newBook);
    }

    // Duplicate packing items
    const oldPacking = packingItems.filter(p => p.tripId === origTripId);
    for (let idx = 0; idx < oldPacking.length; idx++) {
      const p = oldPacking[idx];
      const newPack: PackingItem = { ...p, id: `pack-${newId}-${idx + 1}`, tripId: newId };
      await saveItemToFirestore('packingItems', newPack.id, newPack);
    }

    // Duplicate notes
    const oldNotes = notes.filter(n => n.tripId === origTripId);
    for (let idx = 0; idx < oldNotes.length; idx++) {
      const n = oldNotes[idx];
      const newNote: Note = { ...n, id: `note-${newId}-${idx + 1}`, tripId: newId };
      await saveItemToFirestore('notes', newNote.id, newNote);
    }

    setActiveTripId(newId);
    return newId;
  };

  const importTemplateTrip = async (templateTripId: string, customName?: string, newStartDate?: string, newEndDate?: string): Promise<string> => {
    return await duplicateTrip(templateTripId, customName, newStartDate, newEndDate);
  };

  const shareTripWithCollaborator = async (tripId: string, email: string) => {
    await addCollaboratorToTrip(tripId, email);
  };

  const removeCollaborator = async (tripId: string, email: string) => {
    await removeCollaboratorFromTrip(tripId, email);
  };

  const toggleTripTemplate = async (tripId: string) => {
    const target = trips.find(t => t.id === tripId);
    if (target) {
      await saveTripToFirestore({ ...target, isTemplate: !target.isTemplate });
    }
  };

  const toggleTripFavorite = async (id: string) => {
    const target = trips.find(t => t.id === id);
    if (target) {
      await saveTripToFirestore({ ...target, isFavorite: !target.isFavorite });
    }
  };

  const addItineraryItem = async (item: Omit<ItineraryItem, 'id' | 'sortOrder'>) => {
    const newItem: ItineraryItem = {
      ...item,
      id: `item-${Date.now()}`,
      sortOrder: itineraryItems.filter(i => i.dayId === item.dayId).length + 1
    };
    await saveItemToFirestore('itineraryItems', newItem.id, newItem);
  };

  const updateItineraryItem = async (id: string, updates: Partial<ItineraryItem>) => {
    const existing = itineraryItems.find(i => i.id === id);
    if (existing) {
      await saveItemToFirestore('itineraryItems', id, { ...existing, ...updates });
    }
  };

  const deleteItineraryItem = async (id: string) => {
    await deleteItemFromFirestore('itineraryItems', id);
  };

  const addItineraryDay = async (tripId: string, title: string) => {
    const tripDays = itineraryDays.filter(d => d.tripId === tripId);
    const newDayNum = tripDays.length + 1;
    const newDay: ItineraryDay = {
      id: `day-${tripId}-${Date.now()}`,
      tripId,
      dayNumber: newDayNum,
      date: new Date().toISOString().split('T')[0],
      title: title || `Hari ${newDayNum}`
    };
    await saveItemToFirestore('itineraryDays', newDay.id, newDay);
  };

  const addPlace = async (place: Omit<Place, 'id'>) => {
    const newPlace: Place = {
      ...place,
      id: `place-${Date.now()}`
    };
    await saveItemToFirestore('places', newPlace.id, newPlace);
  };

  const updatePlaceStatus = async (id: string, status: PlaceStatus) => {
    const existing = places.find(p => p.id === id);
    if (existing) {
      await saveItemToFirestore('places', id, { ...existing, status });
    }
  };

  const togglePlaceFavorite = async (id: string) => {
    const existing = places.find(p => p.id === id);
    if (existing) {
      await saveItemToFirestore('places', id, { ...existing, isFavorite: !existing.isFavorite });
    }
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
    await saveItemToFirestore('itineraryItems', newItem.id, newItem);
  };

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: `exp-${Date.now()}`
    };
    await saveItemToFirestore('expenses', newExpense.id, newExpense);
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    const existing = expenses.find(e => e.id === id);
    if (existing) {
      await saveItemToFirestore('expenses', id, { ...existing, ...updates });
    }
  };

  const deleteExpense = async (id: string) => {
    await deleteItemFromFirestore('expenses', id);
  };

  const addBooking = async (booking: Omit<Booking, 'id'>) => {
    const newBooking: Booking = {
      ...booking,
      id: `book-${Date.now()}`
    };
    await saveItemToFirestore('bookings', newBooking.id, newBooking);
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    const existing = bookings.find(b => b.id === id);
    if (existing) {
      await saveItemToFirestore('bookings', id, { ...existing, ...updates });
    }
  };

  const deleteBooking = async (id: string) => {
    await deleteItemFromFirestore('bookings', id);
  };

  const addPackingItem = async (item: Omit<PackingItem, 'id' | 'isPacked'>) => {
    const newItem: PackingItem = {
      ...item,
      id: `pack-${Date.now()}`,
      isPacked: false
    };
    await saveItemToFirestore('packingItems', newItem.id, newItem);
  };

  const togglePackingItem = async (id: string) => {
    const existing = packingItems.find(p => p.id === id);
    if (existing) {
      await saveItemToFirestore('packingItems', id, { ...existing, isPacked: !existing.isPacked });
    }
  };

  const deletePackingItem = async (id: string) => {
    await deleteItemFromFirestore('packingItems', id);
  };

  const generateAIPackingListForTrip = async (tripId: string) => {
    const targetTrip = trips.find(t => t.id === tripId);
    if (!targetTrip) return;
    const items = await generatePackingListWithAI(targetTrip.destination, 3);
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
      await saveItemToFirestore('packingItems', packObj.id, packObj);
    }
  };

  const addTransport = async (transport: Omit<TransportLeg, 'id'>) => {
    const newTr: TransportLeg = {
      ...transport,
      id: `tr-${Date.now()}`
    };
    await saveItemToFirestore('transports', newTr.id, newTr);
  };

  const deleteTransport = async (id: string) => {
    await deleteItemFromFirestore('transports', id);
  };

  const addNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newNote: Note = {
      ...note,
      id: `note-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    await saveItemToFirestore('notes', newNote.id, newNote);
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    const now = new Date().toISOString().split('T')[0];
    const existing = notes.find(n => n.id === id);
    if (existing) {
      await saveItemToFirestore('notes', id, { ...existing, ...updates, updatedAt: now });
    }
  };

  const deleteNote = async (id: string) => {
    await deleteItemFromFirestore('notes', id);
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
        addPlace,
        updatePlaceStatus,
        togglePlaceFavorite,
        addPlaceToTripItinerary,
        addExpense,
        updateExpense,
        deleteExpense,
        addBooking,
        updateBooking,
        deleteBooking,
        addPackingItem,
        togglePackingItem,
        deletePackingItem,
        generateAIPackingListForTrip,
        addTransport,
        deleteTransport,
        addNote,
        updateNote,
        deleteNote,
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
