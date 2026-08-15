import { db, auth } from './firebase';
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
  try {
    const ref = doc(db, TRIPS_COL, trip.id);
    await setDoc(ref, cleanData({
      ...trip,
      collaborators: trip.collaborators || []
    }), { merge: true });
  } catch (err: any) {
    console.warn('saveTripToFirestore info/warn:', err?.message || err);
  }
}

/**
 * Delete trip and its associated items from Firestore
 */
export async function deleteTripFromFirestore(tripId: string) {
  try {
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
      deleteByTripId(NOTES_COL),
      deleteByTripId(PLACES_COL),
      deleteByTripId('moodboards')
    ]);
  } catch (err: any) {
    console.warn('deleteTripFromFirestore error:', err?.message || err);
  }
}

/**
 * Add a collaborator email to a trip
 */
export async function addCollaboratorToTrip(tripId: string, collaboratorEmail: string) {
  try {
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
  } catch (err: any) {
    console.warn('addCollaboratorToTrip error:', err?.message || err);
  }
}

/**
 * Remove a collaborator from a trip
 */
export async function removeCollaboratorFromTrip(tripId: string, collaboratorEmail: string) {
  try {
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
      collaborators: arrayRemove(emailLower),
      ...(targetUid ? { memberIds: arrayRemove(targetUid) } : {})
    });
  } catch (err: any) {
    console.warn('removeCollaboratorFromTrip error:', err?.message || err);
  }
}

/**
 * Save generic item to a collection
 */
export async function saveItemToFirestore(colName: string, id: string, data: any) {
  try {
    const ref = doc(db, colName, id);
    const currentUid = auth.currentUser?.uid;
    const payload = {
      ...data,
      ...(currentUid && !data.userId ? { userId: currentUid } : {})
    };
    await setDoc(ref, cleanData(payload), { merge: true });
  } catch (err: any) {
    console.warn(`saveItemToFirestore (${colName}) info/warn:`, err?.message || err);
  }
}

/**
 * Delete generic item from a collection
 */
export async function deleteItemFromFirestore(colName: string, id: string) {
  try {
    const ref = doc(db, colName, id);
    await deleteDoc(ref);
  } catch (err: any) {
    console.warn(`deleteItemFromFirestore (${colName}) error:`, err?.message || err);
  }
}
