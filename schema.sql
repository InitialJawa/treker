-- Cloudflare D1 SQL Database Schema for Traveler Trip Planner

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  uid TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  displayName TEXT,
  photoURL TEXT,
  subscriptionPlan TEXT DEFAULT 'free',
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 2. Trips Table
CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  startDate TEXT,
  endDate TEXT,
  totalBudget REAL DEFAULT 0,
  currency TEXT DEFAULT 'IDR',
  coverImage TEXT,
  status TEXT DEFAULT 'planning',
  isFavorite INTEGER DEFAULT 0,
  isPublicTemplate INTEGER DEFAULT 0,
  collaborators TEXT, -- JSON array string
  memberIds TEXT,     -- JSON array string
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 3. Itinerary Days
CREATE TABLE IF NOT EXISTS itinerary_days (
  id TEXT PRIMARY KEY,
  tripId TEXT NOT NULL,
  dayNumber INTEGER NOT NULL,
  date TEXT,
  title TEXT,
  notes TEXT,
  FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE
);

-- 4. Itinerary Items
CREATE TABLE IF NOT EXISTS itinerary_items (
  id TEXT PRIMARY KEY,
  tripId TEXT NOT NULL,
  dayId TEXT NOT NULL,
  title TEXT NOT NULL,
  time TEXT,
  duration TEXT,
  location TEXT,
  category TEXT,
  cost REAL DEFAULT 0,
  transportType TEXT,
  isCompleted INTEGER DEFAULT 0,
  sortOrder INTEGER DEFAULT 0,
  notes TEXT,
  FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE
);

-- 5. Places
CREATE TABLE IF NOT EXISTS places (
  id TEXT PRIMARY KEY,
  tripId TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  address TEXT,
  lat REAL,
  lng REAL,
  rating REAL,
  status TEXT DEFAULT 'want_to_visit',
  isFavorite INTEGER DEFAULT 0,
  notes TEXT,
  priceEstimate REAL DEFAULT 0,
  FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE
);

-- 6. Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  tripId TEXT NOT NULL,
  title TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT,
  date TEXT,
  paidBy TEXT,
  receiptUrl TEXT,
  notes TEXT,
  FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE
);

-- 7. Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  tripId TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT,
  provider TEXT,
  confirmationCode TEXT,
  cost REAL DEFAULT 0,
  checkIn TEXT,
  checkOut TEXT,
  status TEXT DEFAULT 'confirmed',
  notes TEXT,
  FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE
);

-- 8. Packing Items
CREATE TABLE IF NOT EXISTS packing_items (
  id TEXT PRIMARY KEY,
  tripId TEXT NOT NULL,
  category TEXT,
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  isPacked INTEGER DEFAULT 0,
  FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE
);

-- 9. Transport Legs
CREATE TABLE IF NOT EXISTS transports (
  id TEXT PRIMARY KEY,
  tripId TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT,
  departureLocation TEXT,
  arrivalLocation TEXT,
  departureTime TEXT,
  arrivalTime TEXT,
  confirmationCode TEXT,
  cost REAL DEFAULT 0,
  notes TEXT,
  FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE
);

-- 10. Notes
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  tripId TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE
);

-- 11. User Custom Themes
CREATE TABLE IF NOT EXISTS user_themes (
  userId TEXT PRIMARY KEY,
  presetId TEXT,
  colorsJson TEXT NOT NULL,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for ultra-fast query performance
CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(userId);
CREATE INDEX IF NOT EXISTS idx_itinerary_days_trip ON itinerary_days(tripId);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_trip ON itinerary_items(tripId);
CREATE INDEX IF NOT EXISTS idx_places_trip ON places(tripId);
CREATE INDEX IF NOT EXISTS idx_expenses_trip ON expenses(tripId);
