import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
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

/**
 * Sanitize all images inside loaded travel data
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
 * Save user travel package into Firestore
 */
export async function saveUserDataToFirestore(
  userId: string,
  data: Omit<UserTravelData, 'updatedAt'>
): Promise<void> {
  const path = `users/${userId}/data/package`;
  try {
    const payload: UserTravelData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', userId, 'data', 'package'), payload);
  } catch (error) {
    console.error('Failed to save user data to Firestore:', error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Load user travel package from Firestore
 */
export async function loadUserDataFromFirestore(
  userId: string
): Promise<UserTravelData | null> {
  const path = `users/${userId}/data/package`;
  try {
    const snap = await getDoc(doc(db, 'users', userId, 'data', 'package'));
    if (!snap.exists()) {
      return null;
    }
    return sanitizeLoadedData(snap.data());
  } catch (error) {
    console.error('Failed to load user data from Firestore:', error);
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Real-time listener for user travel state
 */
export function subscribeToUserData(
  userId: string,
  onData: (data: UserTravelData) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const path = `users/${userId}/data/package`;
  return onSnapshot(
    doc(db, 'users', userId, 'data', 'package'),
    (snap) => {
      if (snap.exists()) {
        const sanitized = sanitizeLoadedData(snap.data());
        onData(sanitized);
      }
    },
    (error) => {
      console.error('Firestore subscription error:', error);
      handleFirestoreError(error, OperationType.GET, path);
      onError?.(error);
    }
  );
}
