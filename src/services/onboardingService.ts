import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { saveTripToFirestore, saveItemToFirestore, isFirestoreQuotaExhausted, handleFirestoreError } from './firestoreService';
import { banyuwangiTrip, banyuwangiDays, banyuwangiItems, banyuwangiPlaces } from '../data/banyuwangiTemplate';

export const forceSyncBanyuwangiToFirestore = async (userId: string) => {
  if (isFirestoreQuotaExhausted()) {
    return { success: true, message: 'Data Banyuwangi 5H4M aktif di penyimpanan lokal (Firestore Quota Limit).' };
  }

  try {
    const tripId = `template-banyuwangi-explore-3d2n`;

    // 1. Save trip
    await saveTripToFirestore({
      ...banyuwangiTrip,
      id: tripId,
      name: 'Explore Banyuwangi 5H4M (Super Lengkap)',
      userId: userId || 'local',
      tenantId: userId || 'local',
      memberIds: userId ? [userId] : [],
      collaborators: [],
      allowPublicView: true,
      isTemplate: true,
    });

    // 2. Save all 5 days
    for (const day of banyuwangiDays) {
      if (isFirestoreQuotaExhausted()) break;
      await saveItemToFirestore('itineraryDays', day.id, {
        ...day,
        tripId: tripId,
        userId: userId || 'local'
      });
    }

    // 3. Save all items across 5 days
    for (const item of banyuwangiItems) {
      if (isFirestoreQuotaExhausted()) break;
      await saveItemToFirestore('itineraryItems', item.id, {
        ...item,
        tripId: tripId,
        userId: userId || 'local'
      });
    }

    // 4. Save places
    for (const place of banyuwangiPlaces) {
      if (isFirestoreQuotaExhausted()) break;
      await saveItemToFirestore('places', place.id, {
        ...place,
        tripId: tripId,
        userId: userId || 'local'
      });
    }

    if (userId && !isFirestoreQuotaExhausted()) {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, { hasSeededTemplates: true, hasUpdatedBanyuwangiDay5: true }, { merge: true }).catch((err) => handleFirestoreError(err, 'setUserTemplateFlag'));
    }

    return { success: true, countDays: banyuwangiDays.length, countItems: banyuwangiItems.length };
  } catch (err: any) {
    handleFirestoreError(err, 'forceSyncBanyuwangiToFirestore');
    return { success: true, message: 'Data Banyuwangi 5H4M aktif di penyimpanan lokal.' };
  }
};

export const initializeUserTemplates = async (userId: string) => {
  const localSeedKey = `seeded_user_v5_${userId || 'guest'}`;
  if (localStorage.getItem(localSeedKey)) {
    return;
  }
  // Mark immediately to prevent multiple runs
  localStorage.setItem(localSeedKey, 'true');

  if (isFirestoreQuotaExhausted()) {
    return;
  }

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data() || {};
    
    if (!userSnap.exists() || !userData.hasUpdatedBanyuwangiDay5) {
      await forceSyncBanyuwangiToFirestore(userId);
    }
  } catch (err: any) {
    handleFirestoreError(err, 'initializeUserTemplates');
  }
};
