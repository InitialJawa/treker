import { Router, Request, Response } from 'express';
import { db } from '../db/index';
import { 
  trips, itineraryDays, itineraryItems, places, expenses, bookings, 
  packingItems, transports, notes, moodboardItems, userSettings, users 
} from '../db/schema';
import { eq, or } from 'drizzle-orm';
import { banyuwangiTrip, banyuwangiDays, banyuwangiItems, banyuwangiPlaces } from '../data/banyuwangiTemplate';

export const apiRouter = Router();

// GET all user data in one single fast query
apiRouter.get('/all-data', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'guest';
    
    // Fetch trips (user's trips or templates)
    const userTrips = await db.select().from(trips).where(
      or(
        eq(trips.userId, userId),
        eq(trips.isTemplate, true),
        eq(trips.allowPublicView, true)
      )
    ).catch(err => {
      console.warn('DB all-data query error:', err);
      return [];
    });

    const userDays = await db.select().from(itineraryDays).catch(() => []);
    const userItems = await db.select().from(itineraryItems).catch(() => []);
    const userPlaces = await db.select().from(places).catch(() => []);
    const userExpenses = await db.select().from(expenses).catch(() => []);
    const userBookings = await db.select().from(bookings).catch(() => []);
    const userPacking = await db.select().from(packingItems).catch(() => []);
    const userTransports = await db.select().from(transports).catch(() => []);
    const userNotes = await db.select().from(notes).catch(() => []);
    const userMoodboard = await db.select().from(moodboardItems).catch(() => []);

    res.json({
      trips: userTrips.map(t => ({
        ...t,
        budget: Number(t.totalBudget || 0),
        actualSpent: Number(t.actualSpent || 0),
        memberIds: (t.memberIds as string[]) || [],
        collaborators: (t.collaborators as string[]) || [],
      })),
      itineraryDays: userDays,
      itineraryItems: userItems.map(i => ({ 
        ...i, 
        estimatedCost: Number(i.cost || 0),
        cost: Number(i.cost || 0)
      })),
      places: userPlaces.map(p => ({ 
        ...p, 
        rating: Number(p.rating || 4.5), 
        priceEstimate: Number(p.priceEstimate || 0),
        estimatedCost: Number(p.priceEstimate || 0),
        lat: Number(p.lat || 0),
        lng: Number(p.lng || 0)
      })),
      expenses: userExpenses.map(e => ({ ...e, amount: Number(e.amount || 0) })),
      bookings: userBookings.map(b => ({ ...b, cost: Number(b.cost || 0) })),
      packingItems: userPacking,
      transports: userTransports.map(tr => ({ ...tr, cost: Number(tr.cost || 0) })),
      notes: userNotes,
      moodboardItems: userMoodboard,
    });
  } catch (error: any) {
    console.error('Error fetching all data:', error);
    res.status(500).json({ error: error.message || 'Internal DB Error' });
  }
});

// Seed Banyuwangi 5H4M Template to Cloud SQL
apiRouter.post('/seed-banyuwangi', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const targetUserId = userId || 'guest';
    const tripId = 'template-banyuwangi-explore-3d2n';

    // 1. Insert/Update Trip
    await db.insert(trips).values({
      id: tripId,
      name: 'Explore Banyuwangi 5H4M (Super Lengkap)',
      destination: banyuwangiTrip.destination,
      startDate: banyuwangiTrip.startDate,
      endDate: banyuwangiTrip.endDate,
      totalBudget: String(banyuwangiTrip.budget || 0),
      actualSpent: String(banyuwangiTrip.actualSpent || 0),
      currency: banyuwangiTrip.currency,
      coverImage: banyuwangiTrip.coverImage,
      isFavorite: true,
      isTemplate: true,
      allowPublicView: true,
      memberIds: [targetUserId],
      collaborators: [],
      userId: targetUserId,
      status: 'planning',
    }).onConflictDoUpdate({
      target: trips.id,
      set: {
        name: 'Explore Banyuwangi 5H4M (Super Lengkap)',
        destination: banyuwangiTrip.destination,
        coverImage: banyuwangiTrip.coverImage,
      }
    });

    // 2. Insert all 5 Days
    for (const day of banyuwangiDays) {
      await db.insert(itineraryDays).values({
        id: day.id,
        tripId: tripId,
        dayNumber: day.dayNumber,
        date: day.date,
        title: day.title,
        userId: targetUserId,
      }).onConflictDoUpdate({
        target: itineraryDays.id,
        set: {
          title: day.title,
          date: day.date,
          dayNumber: day.dayNumber
        }
      });
    }

    // 3. Insert all items
    for (const item of banyuwangiItems) {
      const itemCost = String(item.estimatedCost || (item as any).cost || 0);
      await db.insert(itineraryItems).values({
        id: item.id,
        dayId: item.dayId,
        tripId: tripId,
        time: item.time,
        title: item.title,
        location: item.location || '',
        category: item.category || 'Activity',
        cost: itemCost,
        notes: item.notes || '',
        sortOrder: item.sortOrder || 0,
        transportType: item.transportType || '',
        isBooked: false,
        userId: targetUserId,
      }).onConflictDoUpdate({
        target: itineraryItems.id,
        set: {
          title: item.title,
          time: item.time,
          cost: itemCost,
          location: item.location || '',
          notes: item.notes || '',
        }
      });
    }

    // 4. Insert places
    for (const place of banyuwangiPlaces) {
      const priceEst = String(place.priceEstimate || place.estimatedCost || 0);
      const placeImg = (place as any).imageUrl || place.photos?.[0] || '';
      await db.insert(places).values({
        id: place.id,
        tripId: tripId,
        name: place.name,
        category: place.category,
        rating: String(place.rating || 4.5),
        reviewsCount: 0,
        address: place.address || place.location || '',
        lat: String(place.lat || place.latitude || 0),
        lng: String(place.lng || place.longitude || 0),
        imageUrl: placeImg,
        priceEstimate: priceEst,
        notes: place.notes || '',
        isFavorite: !!place.isFavorite,
        status: place.status || 'want_to_visit',
        openingHours: place.openingHours || '',
        tag: '',
        userId: targetUserId,
      }).onConflictDoUpdate({
        target: places.id,
        set: {
          name: place.name,
          category: place.category,
          imageUrl: placeImg,
          address: place.address || place.location || '',
          rating: String(place.rating || 4.5),
        }
      });
    }

    res.json({ success: true, message: 'Banyuwangi 5H4M successfully seeded to Cloud SQL PostgreSQL!' });
  } catch (error: any) {
    console.error('Error seeding Banyuwangi to Cloud SQL:', error);
    res.status(500).json({ error: error.message || 'Seeding failed' });
  }
});

// Trip CRUD
apiRouter.post('/trips', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    await db.insert(trips).values({
      ...data,
      totalBudget: String(data.budget || data.totalBudget || 0),
      actualSpent: String(data.actualSpent || 0),
    }).onConflictDoUpdate({
      target: trips.id,
      set: {
        ...data,
        totalBudget: String(data.budget || data.totalBudget || 0),
        actualSpent: String(data.actualSpent || 0),
      }
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/trips/:id', async (req: Request, res: Response) => {
  try {
    const tripId = req.params.id as string;
    await db.delete(trips).where(eq(trips.id, tripId));
    await db.delete(itineraryDays).where(eq(itineraryDays.tripId, tripId));
    await db.delete(itineraryItems).where(eq(itineraryItems.tripId, tripId));
    await db.delete(places).where(eq(places.tripId, tripId));
    await db.delete(expenses).where(eq(expenses.tripId, tripId));
    await db.delete(bookings).where(eq(bookings.tripId, tripId));
    await db.delete(packingItems).where(eq(packingItems.tripId, tripId));
    await db.delete(transports).where(eq(transports.tripId, tripId));
    await db.delete(notes).where(eq(notes.tripId, tripId));
    await db.delete(moodboardItems).where(eq(moodboardItems.tripId, tripId));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Generic entity save / update endpoint
apiRouter.post('/entity/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const data = req.body;

    switch (type) {
      case 'itineraryDays':
        await db.insert(itineraryDays).values(data).onConflictDoUpdate({ target: itineraryDays.id, set: data });
        break;
      case 'itineraryItems':
        await db.insert(itineraryItems).values({ ...data, cost: String(data.cost || data.estimatedCost || 0) }).onConflictDoUpdate({ target: itineraryItems.id, set: { ...data, cost: String(data.cost || data.estimatedCost || 0) } });
        break;
      case 'places':
        await db.insert(places).values({
          ...data,
          rating: String(data.rating || 4.5),
          lat: data.lat || data.latitude ? String(data.lat || data.latitude) : undefined,
          lng: data.lng || data.longitude ? String(data.lng || data.longitude) : undefined,
          priceEstimate: String(data.priceEstimate || data.estimatedCost || 0),
          imageUrl: data.imageUrl || data.photos?.[0] || '',
          address: data.address || data.location || '',
        }).onConflictDoUpdate({
          target: places.id,
          set: {
            ...data,
            rating: String(data.rating || 4.5),
            lat: data.lat || data.latitude ? String(data.lat || data.latitude) : undefined,
            lng: data.lng || data.longitude ? String(data.lng || data.longitude) : undefined,
            priceEstimate: String(data.priceEstimate || data.estimatedCost || 0),
            imageUrl: data.imageUrl || data.photos?.[0] || '',
            address: data.address || data.location || '',
          }
        });
        break;
      case 'expenses':
        await db.insert(expenses).values({ ...data, amount: String(data.amount || 0) }).onConflictDoUpdate({ target: expenses.id, set: { ...data, amount: String(data.amount || 0) } });
        break;
      case 'bookings':
        await db.insert(bookings).values({ ...data, cost: String(data.cost || 0) }).onConflictDoUpdate({ target: bookings.id, set: { ...data, cost: String(data.cost || 0) } });
        break;
      case 'packingItems':
        await db.insert(packingItems).values(data).onConflictDoUpdate({ target: packingItems.id, set: data });
        break;
      case 'transports':
        await db.insert(transports).values({ ...data, cost: String(data.cost || 0) }).onConflictDoUpdate({ target: transports.id, set: { ...data, cost: String(data.cost || 0) } });
        break;
      case 'notes':
        await db.insert(notes).values(data).onConflictDoUpdate({ target: notes.id, set: data });
        break;
      case 'moodboardItems':
        await db.insert(moodboardItems).values(data).onConflictDoUpdate({ target: moodboardItems.id, set: data });
        break;
      case 'userSettings':
        await db.insert(userSettings).values(data).onConflictDoUpdate({ target: userSettings.id, set: data });
        break;
      default:
        return res.status(400).json({ error: `Unknown entity type: ${type}` });
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error('Error saving entity:', err);
    res.status(500).json({ error: err.message });
  }
});

// Generic entity delete
apiRouter.delete('/entity/:type/:id', async (req: Request, res: Response) => {
  try {
    const type = req.params.type;
    const id = req.params.id as string;
    switch (type) {
      case 'itineraryDays':
        await db.delete(itineraryDays).where(eq(itineraryDays.id, id));
        break;
      case 'itineraryItems':
        await db.delete(itineraryItems).where(eq(itineraryItems.id, id));
        break;
      case 'places':
        await db.delete(places).where(eq(places.id, id));
        break;
      case 'expenses':
        await db.delete(expenses).where(eq(expenses.id, id));
        break;
      case 'bookings':
        await db.delete(bookings).where(eq(bookings.id, id));
        break;
      case 'packingItems':
        await db.delete(packingItems).where(eq(packingItems.id, id));
        break;
      case 'transports':
        await db.delete(transports).where(eq(transports.id, id));
        break;
      case 'notes':
        await db.delete(notes).where(eq(notes.id, id));
        break;
      case 'moodboardItems':
        await db.delete(moodboardItems).where(eq(moodboardItems.id, id));
        break;
      default:
        return res.status(400).json({ error: `Unknown entity type: ${type}` });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
