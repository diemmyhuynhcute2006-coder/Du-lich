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
 * Save user travel state to Cloud Firestore
 */
export async function saveUserDataToFirestore(
  userId: string,
  data: Omit<UserTravelData, 'updatedAt'>
): Promise<void> {
  if (!userId) return;
  const path = `users/${userId}/data/package`;
  try {
    const payload = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', userId, 'data', 'package'), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Load user travel state from Cloud Firestore
 */
export async function loadUserDataFromFirestore(
  userId: string
): Promise<UserTravelData | null> {
  if (!userId) return null;
  const path = `users/${userId}/data/package`;
  try {
    const docSnap = await getDoc(doc(db, 'users', userId, 'data', 'package'));
    if (!docSnap.exists()) {
      return null;
    }
    return sanitizeLoadedData(docSnap.data());
  } catch (error) {
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
      if (onError) onError(error);
    }
  );
}

/**
 * Validate that username contains only 3-20 alphanumeric characters or underscores, no spaces, no diacritics
 */
export function validateUsername(username: string): { isValid: boolean; error?: string } {
  const trimmed = username.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Vui lòng nhập tên tài khoản' };
  }
  if (trimmed.length < 3 || trimmed.length > 20) {
    return { isValid: false, error: 'Tên tài khoản phải từ 3 đến 20 ký tự' };
  }
  // Regex strictly allows letters (a-z, A-Z), digits (0-9), and underscores (_)
  const validPattern = /^[a-zA-Z0-9_]+$/;
  if (!validPattern.test(trimmed)) {
    return {
      isValid: false,
      error: 'Tên tài khoản chỉ được chứa chữ cái tiếng Anh (không dấu), số và dấu gạch dưới (_)',
    };
  }
  return { isValid: true };
}

/**
 * Convert user-entered username to internal synthetic Firebase Auth email
 */
export function usernameToSyntheticEmail(username: string): string {
  const clean = username.trim().toLowerCase();
  return `${clean}@journey.app`;
}

/**
 * Extract clean username for UI display
 */
export function getUsernameFromEmailOrUser(
  email?: string | null,
  displayName?: string | null
): string {
  if (displayName && !displayName.includes('@')) {
    return displayName;
  }
  if (!email) return 'Người dùng';
  if (email.endsWith('@journey.app')) {
    return email.replace('@journey.app', '');
  }
  return email.split('@')[0];
}

/**
 * Register username in Firestore registry
 */
export async function registerUsernameRecord(username: string, uid: string): Promise<void> {
  const clean = username.trim().toLowerCase();
  try {
    await setDoc(doc(db, 'usernames', clean), {
      username: clean,
      uid,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Could not record username mapping in Firestore:', error);
  }
}

