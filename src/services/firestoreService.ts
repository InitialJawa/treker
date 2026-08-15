import { db, auth } from './firebase';
import { 
  collection, doc, setDoc, getDocs, updateDoc, deleteDoc, 
  query, where, arrayUnion, arrayRemove 
} from 'firebase/firestore';
import { 
  Trip 
} from '../types/travel';
import { 
  saveTripToSql, deleteTripFromSql, saveEntityToSql, deleteEntityFromSql 
} from './sqlService';

// Track quota state so we don't spam writes when daily limit is hit
let isQuotaExhausted = false;
try {
  if (sessionStorage.getItem('firestore_quota_exhausted') === 'true') {
    isQuotaExhausted = true;
  }
} catch (e) {}

export function isFirestoreQuotaExhausted(): boolean {
  return isQuotaExhausted;
}

export function handleFirestoreError(err: any, operationName: string): void {
  const msg = err?.message || String(err || '');
  const code = err?.code || '';
  if (
    code === 'resource-exhausted' || 
    msg.includes('Quota limit exceeded') || 
    msg.includes('resource-exhausted') || 
    msg.includes('Free daily write units')
  ) {
    if (!isQuotaExhausted) {
      isQuotaExhausted = true;
      try { sessionStorage.setItem('firestore_quota_exhausted', 'true'); } catch (e) {}
      console.warn(`[Firestore Quota Reached] Auto-persisting ${operationName} directly to Cloud SQL (PostgreSQL).`);
    }
    return;
  }
  console.warn(`Firestore notice [${operationName}]:`, msg);
}

// Helper to remove undefined values, which Firestore doesn't accept
function cleanData(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(cleanData);
  
  const cleaned: any = {};
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
 * Save or update a trip in Cloud SQL & Firestore
 */
export async function saveTripToFirestore(trip: Trip) {
  // Always persist to Cloud SQL PostgreSQL
  saveTripToSql(trip).catch(() => {});

  if (isQuotaExhausted) return;
  try {
    const ref = doc(db, TRIPS_COL, trip.id);
    await setDoc(ref, cleanData({
      ...trip,
      collaborators: trip.collaborators || []
    }), { merge: true });
  } catch (err: any) {
    handleFirestoreError(err, 'saveTripToFirestore');
  }
}

/**
 * Delete trip and its associated items from Cloud SQL & Firestore
 */
export async function deleteTripFromFirestore(tripId: string) {
  // Delete from Cloud SQL PostgreSQL
  deleteTripFromSql(tripId).catch(() => {});

  if (isQuotaExhausted) return;
  try {
    await deleteDoc(doc(db, TRIPS_COL, tripId));
    const deleteByTripId = async (colName: string) => {
      try {
        const q = query(collection(db, colName), where('tripId', '==', tripId));
        const snap = await getDocs(q);
        snap.forEach(d => deleteDoc(d.ref).catch(() => {}));
      } catch (err) {
        handleFirestoreError(err, `deleteByTripId_${colName}`);
      }
    };
    await Promise.allSettled([
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
    handleFirestoreError(err, 'deleteTripFromFirestore');
  }
}

/**
 * Add a collaborator email to a trip
 */
export async function addCollaboratorToTrip(tripId: string, collaboratorEmail: string) {
  if (isQuotaExhausted) return;
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
    handleFirestoreError(err, 'addCollaboratorToTrip');
  }
}

/**
 * Remove a collaborator from a trip
 */
export async function removeCollaboratorFromTrip(tripId: string, collaboratorEmail: string) {
  if (isQuotaExhausted) return;
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
    handleFirestoreError(err, 'removeCollaboratorFromTrip');
  }
}

/**
 * Save generic item to Cloud SQL & Firestore
 */
export async function saveItemToFirestore(colName: string, id: string, data: any) {
  const currentUid = auth.currentUser?.uid;
  const payload = {
    ...data,
    id,
    ...(currentUid && !data.userId ? { userId: currentUid } : {})
  };

  // Always persist to Cloud SQL PostgreSQL
  saveEntityToSql(colName, payload).catch(() => {});

  if (isQuotaExhausted) return;
  try {
    const ref = doc(db, colName, id);
    await setDoc(ref, cleanData(payload), { merge: true });
  } catch (err: any) {
    handleFirestoreError(err, `saveItemToFirestore_${colName}`);
  }
}

/**
 * Delete generic item from Cloud SQL & Firestore
 */
export async function deleteItemFromFirestore(colName: string, id: string) {
  // Delete from Cloud SQL PostgreSQL
  deleteEntityFromSql(colName, id).catch(() => {});

  if (isQuotaExhausted) return;
  try {
    const ref = doc(db, colName, id);
    await deleteDoc(ref);
  } catch (err: any) {
    handleFirestoreError(err, `deleteItemFromFirestore_${colName}`);
  }
}
