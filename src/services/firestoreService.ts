import { 
  db 
} from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot, 
  arrayUnion, 
  arrayRemove 
} from 'firebase/firestore';
import { 
  Trip, ItineraryDay, ItineraryItem, Place, Expense, Booking, PackingItem, TransportLeg, Note 
} from '../types/travel';

// Collections
const TRIPS_COL = 'trips';
const DAYS_COL = 'itineraryDays';
const ITEMS_COL = 'itineraryItems';
const PLACES_COL = 'places';
const EXPENSES_COL = 'expenses';
const BOOKINGS_COL = 'bookings';
const PACKING_COL = 'packingItems';
const TRANSPORTS_COL = 'transports';
const NOTES_COL = 'notes';

/**
 * Save or update a trip in Firestore
 */
export async function saveTripToFirestore(trip: Trip) {
  const ref = doc(db, TRIPS_COL, trip.id);
  await setDoc(ref, {
    ...trip,
    collaborators: trip.collaborators || []
  }, { merge: true });
}

/**
 * Delete trip and its associated items from Firestore
 */
export async function deleteTripFromFirestore(tripId: string) {
  // Delete main trip
  await deleteDoc(doc(db, TRIPS_COL, tripId));

  // Helper to delete associated sub-documents by tripId
  const deleteByTripId = async (colName: string) => {
    try {
      const q = query(collection(db, colName), where('tripId', '==', tripId));
      const snap = await getDocs(q);
      snap.forEach(d => deleteDoc(d.ref));
    } catch (err) {
      console.warn(`Error deleting ${colName}:`, err);
    }
  };

  await Promise.all([
    deleteByTripId(DAYS_COL),
    deleteByTripId(ITEMS_COL),
    deleteByTripId(EXPENSES_COL),
    deleteByTripId(BOOKINGS_COL),
    deleteByTripId(PACKING_COL),
    deleteByTripId(TRANSPORTS_COL),
    deleteByTripId(NOTES_COL)
  ]);
}

/**
 * Add a collaborator email to a trip
 */
export async function addCollaboratorToTrip(tripId: string, collaboratorEmail: string) {
  const ref = doc(db, TRIPS_COL, tripId);
  await updateDoc(ref, {
    collaborators: arrayUnion(collaboratorEmail.trim().toLowerCase())
  });
}

/**
 * Remove a collaborator from a trip
 */
export async function removeCollaboratorFromTrip(tripId: string, collaboratorEmail: string) {
  const ref = doc(db, TRIPS_COL, tripId);
  await updateDoc(ref, {
    collaborators: arrayRemove(collaboratorEmail)
  });
}

/**
 * Save generic item to a collection
 */
export async function saveItemToFirestore(colName: string, id: string, data: any) {
  const ref = doc(db, colName, id);
  await setDoc(ref, data, { merge: true });
}

/**
 * Delete generic item from a collection
 */
export async function deleteItemFromFirestore(colName: string, id: string) {
  const ref = doc(db, colName, id);
  await deleteDoc(ref);
}
