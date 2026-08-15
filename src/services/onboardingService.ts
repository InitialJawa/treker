import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { saveTripToFirestore, saveItemToFirestore } from './firestoreService';
import { banyuwangiTrip, banyuwangiDays, banyuwangiItems } from '../data/banyuwangiTemplate';

export const initializeUserTemplates = async (userId: string) => {
  const localSeedKey = `seeded_user_${userId}`;
  if (localStorage.getItem(localSeedKey)) {
    return;
  }

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data() || {};
    
    if (!userSnap.exists() || !userData.hasSeededTemplates) {
      console.log("Seeding initial starter project for new user...");
      
      const userSuffix = userId.substring(0, 6);
      const tripId = `banyuwangi-starter-${userSuffix}`;

      // Seed 1 starter trip
      await saveTripToFirestore({
        ...banyuwangiTrip,
        id: tripId,
        name: 'Explore Banyuwangi 3H2M',
        userId: userId,
        tenantId: userId,
        memberIds: [userId],
        collaborators: [],
        allowPublicView: false,
        isTemplate: false,
      });

      // Save initial days & items for this starter trip
      for (const day of banyuwangiDays) {
        const dayId = `${day.id}-${userSuffix}`;
        await saveItemToFirestore('itineraryDays', dayId, {
          ...day,
          id: dayId,
          tripId: tripId,
          userId: userId
        });
      }

      for (const item of banyuwangiItems) {
        const itemId = `${item.id}-${userSuffix}`;
        const dayId = `${item.dayId}-${userSuffix}`;
        await saveItemToFirestore('itineraryItems', itemId, {
          ...item,
          id: itemId,
          tripId: tripId,
          dayId: dayId,
          userId: userId
        });
      }

      await setDoc(userRef, { hasSeededTemplates: true, hasUpdatedBanyuwangiDay2: true, hasUpdatedBanyuwangiDay34: true }, { merge: true });
      localStorage.setItem(localSeedKey, 'true');
      console.log("Starter project seeding complete!");
    } else {
      localStorage.setItem(localSeedKey, 'true');
    }
  } catch (err: any) {
    if (err?.code === 'resource-exhausted' || err?.message?.includes('quota')) {
      console.warn("Firestore write quota reached. Marking seeded in local cache to prevent retries.");
      localStorage.setItem(localSeedKey, 'true');
    } else {
      console.warn("Starter project seeding notice (Firestore offline or quota exceeded):", err?.message || err);
      localStorage.setItem(localSeedKey, 'true');
    }
  }
};
