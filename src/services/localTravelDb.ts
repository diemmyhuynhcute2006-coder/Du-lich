import {
  Trip,
  DestinationStop,
  Activity,
  Place,
  ExpenseItem,
  LuggageItem,
  PrepTask,
  JournalEntry,
  Currency,
} from '../types/travel';
import { resolveValidImageUrl } from '../utils/imageUtils';

export interface UserTravelData {
  trips: Trip[];
  activeTripId: string | null;
  currency: Currency;
  destinations: DestinationStop[];
  activities: Activity[];
  places: Place[];
  expenses: ExpenseItem[];
  luggage: LuggageItem[];
  prepTasks: PrepTask[];
  journals: JournalEntry[];
  updatedAt?: string;
}

const USER_DATA_PREFIX = 'journey_userdata_';
const GUEST_STORAGE_KEY = 'journey_app_v1';

/**
 * Sanitize all image URLs within travel data
 */
export function sanitizeLoadedData(raw: any): UserTravelData {
  const trips: Trip[] = Array.isArray(raw?.trips)
    ? raw.trips.map((t: Trip) => ({
        ...t,
        coverImage: t.coverImage ? resolveValidImageUrl(t.coverImage) : t.coverImage,
      }))
    : [];

  const destinations: DestinationStop[] = Array.isArray(raw?.destinations)
    ? raw.destinations.map((d: DestinationStop) => ({
        ...d,
        image: d.image ? resolveValidImageUrl(d.image) : d.image,
      }))
    : [];

  const places: Place[] = Array.isArray(raw?.places)
    ? raw.places.map((p: Place) => ({
        ...p,
        image: p.image ? resolveValidImageUrl(p.image) : p.image,
      }))
    : [];

  const journals: JournalEntry[] = Array.isArray(raw?.journals)
    ? raw.journals.map((j: JournalEntry) => ({
        ...j,
        images: Array.isArray(j.images)
          ? j.images.map((img: string) => resolveValidImageUrl(img))
          : [],
      }))
    : [];

  return {
    trips,
    activeTripId: typeof raw?.activeTripId === 'string' ? raw.activeTripId : trips[0]?.id || null,
    currency: raw?.currency === 'JPY' || raw?.currency === 'USD' ? raw.currency : 'VND',
    destinations,
    activities: Array.isArray(raw?.activities) ? raw.activities : [],
    places,
    expenses: Array.isArray(raw?.expenses) ? raw.expenses : [],
    luggage: Array.isArray(raw?.luggage) ? raw.luggage : [],
    prepTasks: Array.isArray(raw?.prepTasks) ? raw.prepTasks : [],
    journals,
    updatedAt: raw?.updatedAt,
  };
}

/**
 * Save per-user travel data to localStorage
 */
export function saveUserTravelData(userId: string, data: Omit<UserTravelData, 'updatedAt'>): void {
  if (!userId) return;
  try {
    const payload: UserTravelData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(`${USER_DATA_PREFIX}${userId}`, JSON.stringify(payload));
  } catch (error) {
    console.error(`Failed to save travel data for user ${userId}:`, error);
  }
}

/**
 * Load per-user travel data from localStorage
 */
export function loadUserTravelData(userId: string): UserTravelData | null {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(`${USER_DATA_PREFIX}${userId}`);
    if (!raw) return null;
    return sanitizeLoadedData(JSON.parse(raw));
  } catch (error) {
    console.error(`Failed to load travel data for user ${userId}:`, error);
    return null;
  }
}

/**
 * Read existing data that may already exist in the browser's localStorage
 * under the guest storage keys, preserving current user itinerary.
 */
export function getExistingLocalData(): UserTravelData | null {
  try {
    const tripsRaw = localStorage.getItem(`${GUEST_STORAGE_KEY}_trips`);
    if (!tripsRaw) return null;

    const trips: Trip[] = JSON.parse(tripsRaw);
    if (!Array.isArray(trips) || trips.length === 0) return null;

    const activeTripId = localStorage.getItem(`${GUEST_STORAGE_KEY}_activeTripId`);
    const currency = localStorage.getItem(`${GUEST_STORAGE_KEY}_currency`) as Currency || 'VND';

    const destinationsRaw = localStorage.getItem(`${GUEST_STORAGE_KEY}_destinations`);
    const activitiesRaw = localStorage.getItem(`${GUEST_STORAGE_KEY}_activities`);
    const placesRaw = localStorage.getItem(`${GUEST_STORAGE_KEY}_places`);
    const expensesRaw = localStorage.getItem(`${GUEST_STORAGE_KEY}_expenses`);
    const luggageRaw = localStorage.getItem(`${GUEST_STORAGE_KEY}_luggage`);
    const prepTasksRaw = localStorage.getItem(`${GUEST_STORAGE_KEY}_prepTasks`);
    const journalsRaw = localStorage.getItem(`${GUEST_STORAGE_KEY}_journals`);

    return sanitizeLoadedData({
      trips,
      activeTripId,
      currency,
      destinations: destinationsRaw ? JSON.parse(destinationsRaw) : [],
      activities: activitiesRaw ? JSON.parse(activitiesRaw) : [],
      places: placesRaw ? JSON.parse(placesRaw) : [],
      expenses: expensesRaw ? JSON.parse(expensesRaw) : [],
      luggage: luggageRaw ? JSON.parse(luggageRaw) : [],
      prepTasks: prepTasksRaw ? JSON.parse(prepTasksRaw) : [],
      journals: journalsRaw ? JSON.parse(journalsRaw) : [],
    });
  } catch (e) {
    console.error('Error reading existing local data:', e);
    return null;
  }
}
