export type CurrencyCode = 'IDR' | 'USD' | 'EUR' | 'SGD' | 'JPY' | 'AUD';

export type TripStatus = 'current' | 'upcoming' | 'past';

export interface Trip {
  id: string;
  userId?: string;
  collaborators?: string[];
  isTemplate?: boolean;
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
  isFavorite: boolean;
  createdAt: string;
}

export type ItineraryCategory = 'Food' | 'Transport' | 'Hotel' | 'Activity' | 'Shopping' | 'Free time' | 'Other';

export interface ItineraryDay {
  id: string;
  tripId: string;
  dayNumber: number;
  date: string; // YYYY-MM-DD
  title: string;
}

export interface ItineraryItem {
  id: string;
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
  transportType?: string;
  sortOrder: number;
}

export type PlaceStatus = 'wishlist' | 'planned' | 'visited';

export interface Place {
  id: string;
  tripId?: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  category: string;
  rating: number;
  estimatedCost: number;
  description: string;
  openingHours?: string;
  website?: string;
  notes?: string;
  photos: string[];
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
}

export type PackingCategory = 'Documents' | 'Clothing' | 'Electronics' | 'Toiletries' | 'Other';

export interface PackingItem {
  id: string;
  tripId: string;
  category: PackingCategory;
  name: string;
  quantity: number;
  isPacked: boolean;
}

export type TransportType = 'Walking' | 'Car' | 'Motorcycle' | 'Taxi' | 'Bus' | 'Train' | 'Plane' | 'Boat' | 'Other';

export interface TransportLeg {
  id: string;
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
  tripId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  color?: string;
}
