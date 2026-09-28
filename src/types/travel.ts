export type Currency = 'VND' | 'JPY' | 'USD';

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  coverImage: string;
  budgetGoal: number;
  note?: string;
  createdAt: string;
}

export interface DestinationStop {
  id: string;
  tripId: string;
  name: string;
  city: string;
  arrivalDate: string;
  departureDate: string;
  order: number;
  image?: string;
  notes?: string;
  highlights: string[];
}

export type ActivityType = 'sightseeing' | 'food' | 'transport' | 'shopping' | 'stay' | 'other';

export interface Activity {
  id: string;
  tripId: string;
  dayNumber: number; // 1, 2, 3...
  date: string;
  time: string; // HH:MM
  title: string;
  location: string;
  type: ActivityType;
  note?: string;
  isCompleted: boolean;
}

export type PlaceCategory = 'sightseeing' | 'food' | 'shopping' | 'entertainment' | 'stay' | 'nature' | 'other';

export interface Place {
  id: string;
  tripId: string;
  name: string;
  address?: string;
  city: string;
  category: PlaceCategory;
  plannedDate?: string;
  time?: string;
  note?: string;
  image?: string;
  isFavorite: boolean;
}

export type ExpenseCategory = 'flight' | 'transport' | 'hotel' | 'food' | 'ticket' | 'shopping' | 'personal' | 'other';

export interface ExpenseItem {
  id: string;
  tripId: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  note?: string;
}

export type LuggageCategory = 'clothes' | 'documents' | 'cosmetics' | 'medicine' | 'electronics' | 'personal' | 'other';

export interface LuggageItem {
  id: string;
  tripId: string;
  name: string;
  category: LuggageCategory;
  isPacked: boolean;
  quantity?: string;
}

export interface PrepTask {
  id: string;
  tripId: string;
  title: string;
  isCompleted: boolean;
  dueDate?: string;
  note?: string;
}

export type JournalMood = 'wonderful' | 'peaceful' | 'excited' | 'reflective' | 'tasty';

export interface JournalEntry {
  id: string;
  tripId: string;
  date: string;
  location: string;
  title: string;
  content: string;
  images: string[];
  reflections?: string;
  mood?: JournalMood;
  createdAt: string;
}

export type ActiveTab =
  | 'home'
  | 'route'
  | 'schedule'
  | 'places'
  | 'budget'
  | 'luggage'
  | 'prep'
  | 'journal'
  | 'settings';
