import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { saveTripToFirestore, saveItemToFirestore } from './firestoreService';
import { 
  INITIAL_TRIPS, INITIAL_ITINERARY_DAYS, INITIAL_ITINERARY_ITEMS, INITIAL_PLACES, 
  INITIAL_EXPENSES, INITIAL_BOOKINGS, INITIAL_PACKING_ITEMS, INITIAL_TRANSPORTS, INITIAL_NOTES 
} from '../data/mockData';
import { banyuwangiDays, banyuwangiItems } from '../data/banyuwangiTemplate';

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
            let payload = { ...item, id: newItemId, tripId: newTripId };
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

      await setDoc(userRef, { hasSeededTemplates: true, hasUpdatedBanyuwangiDay2: true }, { merge: true });
      console.log("Seeding complete!");
    } else if (!userData.hasUpdatedBanyuwangiDay2) {
      // Sync update for existing users to add new Day 2 Banyuwangi schedule
      console.log("Updating Banyuwangi Day 2 schedule for existing user...");
      const day2 = banyuwangiDays.find(d => d.dayNumber === 2);
      if (day2) {
        const userSuffix = userId.substring(0, 6);
        const day2Id = `${day2.id}-${userSuffix}`;
        const tripId = `${day2.tripId}-${userSuffix}`;

        // Update day title in Firestore
        await saveItemToFirestore('itineraryDays', day2Id, {
          ...day2,
          id: day2Id,
          tripId: tripId,
        });

        // Add/Update Day 2 items
        const day2Items = banyuwangiItems.filter(i => i.dayId === 'bwg-day-2');
        for (const item of day2Items) {
          const itemId = `${item.id}-${userSuffix}`;
          await saveItemToFirestore('itineraryItems', itemId, {
            ...item,
            id: itemId,
            tripId: tripId,
            dayId: day2Id,
          });
        }
      }

      await setDoc(userRef, { hasUpdatedBanyuwangiDay2: true }, { merge: true });
    }
  } catch (err) {
    console.error("Error seeding templates:", err);
  }
};
