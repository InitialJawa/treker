export type CurrencyCode = 'IDR' | 'USD' | 'EUR' | 'SGD' | 'JPY' | 'AUD';

export type TripStatus = 'current' | 'upcoming' | 'past';

export interface Trip {
  id: string;
  userId?: string;
  collaborators?: string[];
  tenantId?: string;
  memberIds?: string[];
  allowPublicView?: boolean;
  name: string;
  destination: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  travelersCount: number;
  currency: CurrencyCode;
  budget: number;
  actualSpent: number;
  description: string;
  coverImage: string;
  status: TripStatus;
  isTemplate?: boolean;
  isFavorite: boolean;
  createdAt: string;
}

export type ItineraryCategory = 'Food' | 'Transport' | 'Hotel' | 'Activity' | 'Shopping' | 'Free time' | 'Other';

export interface ItineraryDay {
  id: string;
  isTemplate?: boolean;
  tripId: string;
  dayNumber: number;
  date: string; // YYYY-MM-DD
  title: string;
}

export interface ItineraryItem {
  id: string;
  isTemplate?: boolean;
  dayId: string;
  tripId: string;
  time: string; // HH:mm
  duration: string; // e.g., '1h 30m'
  title: string;
  location: string;
  category: ItineraryCategory;
  estimatedCost: number;
  description?: string;
  notes?: string;
  imageUrl?: string;
  transportType?: string;
  sortOrder: number;
}

export type PlaceStatus = 'wishlist' | 'planned' | 'visited' | 'want_to_visit';

export interface Place {
  id: string;
  isTemplate?: boolean;
  tripId?: string;
  userId?: string;
  name: string;
  location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  category: string;
  rating: number;
  estimatedCost?: number;
  priceEstimate?: number;
  description?: string;
  openingHours?: string;
  website?: string;
  notes?: string;
  photos?: string[];
  status: PlaceStatus;
  isFavorite?: boolean;
}

export type ExpenseCategory = 
  | 'Transportation' 
  | 'Accommodation' 
  | 'Food' 
  | 'Activities' 
  | 'Shopping' 
  | 'Tickets' 
  | 'Rental' 
  | 'Emergency' 
  | 'Other';

export interface Expense {
  id: string;
  isTemplate?: boolean;
  tripId: string;
  category: ExpenseCategory;
  title: string;
  estimatedAmount: number;
  actualAmount: number;
  status: 'paid' | 'unpaid';
  date: string;
  notes?: string;
}

export type BookingType = 'Flight' | 'Train' | 'Hotel' | 'Restaurant' | 'Car rental' | 'Attraction' | 'Other';
export type BookingStatus = 'Need Booking' | 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';

export interface Booking {
  id: string;
  isTemplate?: boolean;
  tripId: string;
  type: BookingType;
  name: string;
  provider: string;
  confirmationNumber: string;
  date: string;
  time: string;
  location: string;
  price: number;
  status: BookingStatus;
  notes?: string;
  attachmentName?: string;
  imageUrl?: string;
}

export type PackingCategory = 'Documents' | 'Clothing' | 'Electronics' | 'Toiletries' | 'Other';

export interface PackingItem {
  id: string;
  isTemplate?: boolean;
  tripId: string;
  category: PackingCategory;
  name: string;
  quantity: number;
  isPacked: boolean;
}

export type TransportType = 'Walking' | 'Car' | 'Motorcycle' | 'Taxi' | 'Bus' | 'Train' | 'Plane' | 'Boat' | 'Other';

export interface TransportLeg {
  id: string;
  isTemplate?: boolean;
  tripId: string;
  origin: string;
  destination: string;
  type: TransportType;
  distance: string;
  duration: string;
  estimatedCost: number;
  notes?: string;
}

export interface Note {
  id: string;
  isTemplate?: boolean;
  tripId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  color?: string;
  imageUrl?: string;
}

export interface MoodboardItem {
  id: string;
  isTemplate?: boolean;
  tripId: string;
  imageUrl: string;
  title?: string;
  caption?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  zIndex?: number;
  createdAt: string;
}
