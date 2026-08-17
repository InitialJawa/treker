import { pgTable, text, integer, boolean, numeric, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoURL: text('photo_url'),
  subscriptionPlan: text('subscription_plan').default('free'),
  createdAt: timestamp('created_at').defaultNow(),
  lastLoginAt: timestamp('last_login_at').defaultNow(),
});

// User settings & custom themes
export const userSettings = pgTable('user_settings', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  userEmail: text('user_email'),
  theme: jsonb('theme'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Trips table
export const trips = pgTable('trips', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  destination: text('destination').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  totalBudget: numeric('total_budget').notNull().default('0'),
  actualSpent: numeric('actual_spent').notNull().default('0'),
  currency: text('currency').notNull().default('IDR'),
  coverImage: text('cover_image'),
  isFavorite: boolean('is_favorite').default(false),
  isTemplate: boolean('is_template').default(false),
  allowPublicView: boolean('allow_public_view').default(true),
  memberIds: jsonb('member_ids'),
  collaborators: jsonb('collaborators'),
  userId: text('user_id').notNull(),
  tenantId: text('tenant_id'),
  status: text('status').default('planning'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Itinerary Days
export const itineraryDays = pgTable('itinerary_days', {
  id: text('id').primaryKey(),
  tripId: text('trip_id').notNull(),
  dayNumber: integer('day_number').notNull(),
  date: text('date').notNull(),
  title: text('title').notNull(),
  userId: text('user_id').notNull(),
});

// Itinerary Items / Activities
export const itineraryItems = pgTable('itinerary_items', {
  id: text('id').primaryKey(),
  dayId: text('day_id').notNull(),
  tripId: text('trip_id').notNull(),
  time: text('time').notNull(),
  title: text('title').notNull(),
  location: text('location'),
  category: text('category').notNull().default('sightseeing'),
  cost: numeric('cost').default('0'),
  notes: text('notes'),
  sortOrder: integer('sort_order').default(0),
  transportType: text('transport_type'),
  isBooked: boolean('is_booked').default(false),
  userId: text('user_id').notNull(),
});

// Places / Attractions / Wishlist
export const places = pgTable('places', {
  id: text('id').primaryKey(),
  tripId: text('trip_id'),
  name: text('name').notNull(),
  category: text('category').notNull().default('Nature'),
  rating: numeric('rating').default('4.5'),
  reviewsCount: integer('reviews_count').default(0),
  address: text('address'),
  lat: numeric('lat'),
  lng: numeric('lng'),
  imageUrl: text('image_url'),
  priceEstimate: numeric('price_estimate').default('0'),
  notes: text('notes'),
  isFavorite: boolean('is_favorite').default(false),
  status: text('status').default('want_to_visit'),
  openingHours: text('opening_hours'),
  tag: text('tag'),
  userId: text('user_id').notNull(),
});

// Expenses
export const expenses = pgTable('expenses', {
  id: text('id').primaryKey(),
  tripId: text('trip_id').notNull(),
  title: text('title').notNull(),
  category: text('category').notNull().default('General'),
  amount: numeric('amount').notNull().default('0'),
  date: text('date').notNull(),
  paidBy: text('paid_by'),
  splitWith: jsonb('split_with'),
  notes: text('notes'),
  userId: text('user_id').notNull(),
});

// Bookings
export const bookings = pgTable('bookings', {
  id: text('id').primaryKey(),
  tripId: text('trip_id').notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  referenceNumber: text('reference_number'),
  provider: text('provider'),
  checkIn: text('check_in'),
  checkOut: text('check_out'),
  cost: numeric('cost').default('0'),
  confirmationUrl: text('confirmation_url'),
  notes: text('notes'),
  isConfirmed: boolean('is_confirmed').default(true),
  userId: text('user_id').notNull(),
});

// Packing Items
export const packingItems = pgTable('packing_items', {
  id: text('id').primaryKey(),
  tripId: text('trip_id').notNull(),
  category: text('category').notNull().default('General'),
  item: text('item').notNull(),
  isPacked: boolean('is_packed').default(false),
  quantity: integer('quantity').default(1),
  notes: text('notes'),
  userId: text('user_id').notNull(),
});

// Transport Legs
export const transports = pgTable('transports', {
  id: text('id').primaryKey(),
  tripId: text('trip_id').notNull(),
  type: text('type').notNull(),
  from: text('from_location').notNull(),
  to: text('to_location').notNull(),
  departureTime: text('departure_time').notNull(),
  arrivalTime: text('arrival_time'),
  cost: numeric('cost').default('0'),
  carrier: text('carrier'),
  notes: text('notes'),
  userId: text('user_id').notNull(),
});

// Notes
export const notes = pgTable('notes', {
  id: text('id').primaryKey(),
  tripId: text('trip_id').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull().default(''),
  color: text('color').default('yellow'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
  userId: text('user_id').notNull(),
});

// Moodboard
export const moodboardItems = pgTable('moodboard_items', {
  id: text('id').primaryKey(),
  tripId: text('trip_id').notNull(),
  imageUrl: text('image_url').notNull(),
  title: text('title'),
  caption: text('caption'),
  userId: text('user_id').notNull(),
});
