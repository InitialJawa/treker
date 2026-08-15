import { db } from './firebase';
import { 
  collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, 
  query, where, onSnapshot, arrayUnion, arrayRemove 
} from 'firebase/firestore';
import { 
  Trip, ItineraryDay, ItineraryItem, Place, Expense, Booking, PackingItem, TransportLeg, Note 
} from '../types/travel';

// Helper to remove undefined values, which Firestore doesn't accept
function cleanData(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(cleanData);
  
  const cleaned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      if (val !== undefined) {
        cleaned[key] = (val !== null && typeof val === 'object') ? cleanData(val) : val;
      }
    }
  }
  return cleaned;
}

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
  await setDoc(ref, cleanData({
    ...trip,
    collaborators: trip.collaborators || []
  }), { merge: true });
}

/**
 * Delete trip and its associated items from Firestore
 */
export async function deleteTripFromFirestore(tripId: string) {
  await deleteDoc(doc(db, TRIPS_COL, tripId));
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
  const emailLower = collaboratorEmail.trim().toLowerCase();
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', emailLower));
  const snap = await getDocs(q);
  
  let newUid = null;
  if (!snap.empty) {
    newUid = snap.docs[0].id;
  }
  const ref = doc(db, TRIPS_COL, tripId);
  await updateDoc(ref, {
    collaborators: arrayUnion(emailLower),
    ...(newUid ? { memberIds: arrayUnion(newUid) } : {})
  });
}

/**
 * Remove a collaborator from a trip
 */
export async function removeCollaboratorFromTrip(tripId: string, collaboratorEmail: string) {
  const emailLower = collaboratorEmail.trim().toLowerCase();
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', emailLower));
  const snap = await getDocs(q);
  
  let targetUid = null;
  if (!snap.empty) {
    targetUid = snap.docs[0].id;
  }
  const ref = doc(db, TRIPS_COL, tripId);
  await updateDoc(ref, {
    collaborators: arrayRemove(collaboratorEmail),
    ...(targetUid ? { memberIds: arrayRemove(targetUid) } : {})
  });
}

/**
 * Save generic item to a collection
 */
export async function saveItemToFirestore(colName: string, id: string, data: any) {
  const ref = doc(db, colName, id);
  await setDoc(ref, cleanData(data), { merge: true });
}

/**
 * Delete generic item from a collection
 */
export async function deleteItemFromFirestore(colName: string, id: string) {
  const ref = doc(db, colName, id);
  await deleteDoc(ref);
}
