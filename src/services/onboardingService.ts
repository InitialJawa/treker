import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { saveTripToFirestore, saveItemToFirestore } from './firestoreService';
import { 
  INITIAL_TRIPS, INITIAL_ITINERARY_DAYS, INITIAL_ITINERARY_ITEMS, INITIAL_PLACES, 
  INITIAL_EXPENSES, INITIAL_BOOKINGS, INITIAL_PACKING_ITEMS, INITIAL_TRANSPORTS, INITIAL_NOTES 
} from '../data/mockData';
import { banyuwangiTrip, banyuwangiDays, banyuwangiItems } from '../data/banyuwangiTemplate';

export const initializeUserTemplates = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data() || {};
    
    if (!userSnap.exists() || !userData.hasSeededTemplates) {
      console.log("Seeding templates for new user...");
      
      // Seed trips
      const seedPromises = INITIAL_TRIPS.map(t => {
        const seededTrip = {
          ...t,
          id: `${t.id}-${userId.substring(0, 6)}`,
          userId: userId,
          tenantId: userId,
          memberIds: [userId],
          collaborators: [],
          allowPublicView: false,
        };
        return saveTripToFirestore(seededTrip);
      });
      await Promise.all(seedPromises);

      // Seed all sub-collections
      const seedCollection = async (items: any[], collectionName: string) => {
        for (const item of items) {
          const newItemId = `${item.id}-${userId.substring(0, 6)}`;
          const matchingTrip = INITIAL_TRIPS.find(t => t.id === item.tripId);
          if (matchingTrip) {
            const newTripId = `${matchingTrip.id}-${userId.substring(0, 6)}`;
            
            // Handle dayId dependency in itineraryItems
            let payload = { ...item, id: newItemId, tripId: newTripId, userId: userId };
            if (payload.dayId) {
               payload.dayId = `${payload.dayId}-${userId.substring(0, 6)}`;
            }
            await saveItemToFirestore(collectionName, newItemId, payload);
          }
        }
      };

      await seedCollection(INITIAL_ITINERARY_DAYS, 'itineraryDays');
      await seedCollection(INITIAL_ITINERARY_ITEMS, 'itineraryItems');
      await seedCollection(INITIAL_PLACES, 'places');
      await seedCollection(INITIAL_EXPENSES, 'expenses');
      await seedCollection(INITIAL_BOOKINGS, 'bookings');
      await seedCollection(INITIAL_PACKING_ITEMS, 'packingItems');
      await seedCollection(INITIAL_TRANSPORTS, 'transports');
      await seedCollection(INITIAL_NOTES, 'notes');

      await setDoc(userRef, { hasSeededTemplates: true, hasUpdatedBanyuwangiDay2: true, hasUpdatedBanyuwangiDay34: true }, { merge: true });
      console.log("Seeding complete!");
    } else if (!userData.hasUpdatedBanyuwangiDay34) {
      // Sync update for existing users to add Day 3 and Day 4 Banyuwangi schedule
      console.log("Updating Banyuwangi Day 3 & Day 4 schedule for existing user...");
      const userSuffix = userId.substring(0, 6);
      const tripId = `template-banyuwangi-explore-3d2n-${userSuffix}`;

      // Update trip metadata to 4H3M
      await saveTripToFirestore({
        ...banyuwangiTrip,
        id: tripId,
        userId: userId,
        tenantId: userId,
        memberIds: [userId],
        collaborators: [],
        allowPublicView: false,
      });

      // Save all 4 days
      for (const day of banyuwangiDays) {
        const dayId = `${day.id}-${userSuffix}`;
        await saveItemToFirestore('itineraryDays', dayId, {
          ...day,
          id: dayId,
          tripId: tripId,
          userId: userId
        });
      }

      // Save Day 3 & Day 4 items
      const day3and4Items = banyuwangiItems.filter(i => i.dayId === 'bwg-day-3' || i.dayId === 'bwg-day-4');
      for (const item of day3and4Items) {
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

      await setDoc(userRef, { hasUpdatedBanyuwangiDay2: true, hasUpdatedBanyuwangiDay34: true }, { merge: true });
      console.log("Sync of Day 3 & Day 4 complete!");
    }
  } catch (err) {
    console.error("Error seeding templates:", err);
  }
};
