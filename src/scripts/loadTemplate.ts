import { banyuwangiTrip, banyuwangiDays, banyuwangiItems, banyuwangiPlaces } from '../data/banyuwangiTemplate';
import { saveTripToSupabase, saveItemToSupabase } from '../services/supabaseService';

export const loadBanyuwangiTemplateToSupabase = async (userId: string) => {
  const newTripId = banyuwangiTrip.id + '-' + userId.substring(0, 6);
  
  const trip = {
    ...banyuwangiTrip,
    id: newTripId,
    userId: userId,
  };
  await saveTripToSupabase(trip);
  
  for (const day of banyuwangiDays) {
    const newDayId = day.id + '-' + userId.substring(0, 6);
    await saveItemToSupabase('itineraryDays', newDayId, {
      ...day,
      id: newDayId,
      tripId: newTripId,
    });
  }
  
  for (const item of banyuwangiItems) {
    const newItemId = item.id + '-' + userId.substring(0, 6);
    const newDayId = item.dayId ? item.dayId + '-' + userId.substring(0, 6) : item.dayId;
    await saveItemToSupabase('itineraryItems', newItemId, {
      ...item,
      id: newItemId,
      tripId: newTripId,
      dayId: newDayId,
    });
  }

  for (const place of banyuwangiPlaces) {
    const newPlaceId = place.id + '-' + userId.substring(0, 6);
    await saveItemToSupabase('places', newPlaceId, {
      ...place,
      id: newPlaceId,
      tripId: newTripId,
    });
  }
};
