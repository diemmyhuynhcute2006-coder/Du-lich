import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import {
  loadUserDataFromFirestore,
  saveUserDataToFirestore,
  validateUsername,
  usernameToSyntheticEmail,
  getUsernameFromEmailOrUser,
  registerUsernameRecord,
} from '../services/travelDb';
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
  ActiveTab,
} from '../types/travel';
import {
  SAMPLE_TRIP,
  SAMPLE_DESTINATIONS,
  SAMPLE_ACTIVITIES,
  SAMPLE_PLACES,
  SAMPLE_EXPENSES,
  SAMPLE_LUGGAGE,
  SAMPLE_PREP_TASKS,
  SAMPLE_JOURNALS,
} from '../data/sampleTrip';
import { resolveValidImageUrl } from '../utils/imageUtils';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'info';
}

interface TravelContextType {
  // Auth & Cloud Sync
  user: User | null;
  username: string;
  isAuthLoading: boolean;
  isSyncing: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signInWithUsername: (username: string, pass: string) => Promise<void>;
  signUpWithUsername: (username: string, pass: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;

  trips: Trip[];
  activeTripId: string | null;
  activeTrip: Trip | null;
  currency: Currency;
  activeTab: ActiveTab;
  toasts: ToastMessage[];

  // Navigation & Settings
  setActiveTab: (tab: ActiveTab) => void;
  setActiveTripId: (id: string) => void;
  setCurrency: (c: Currency) => void;
  showToast: (message: string, type?: 'success' | 'warning' | 'info') => void;
  removeToast: (id: string) => void;
  formatCurrency: (amount: number) => string;

  // Trips CRUD
  createTrip: (tripData: Omit<Trip, 'id' | 'createdAt'>) => string;
  updateTrip: (id: string, tripData: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  resetToSampleData: () => void;
  clearAllData: () => void;

  // Destinations CRUD
  destinations: DestinationStop[];
  addDestination: (data: Omit<DestinationStop, 'id' | 'tripId' | 'order'>) => void;
  updateDestination: (id: string, data: Partial<DestinationStop>) => void;
  deleteDestination: (id: string) => void;
  moveDestination: (id: string, direction: 'up' | 'down') => void;

  // Activities CRUD
  activities: Activity[];
  addActivity: (data: Omit<Activity, 'id' | 'tripId'>) => void;
  updateActivity: (id: string, data: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  toggleActivityComplete: (id: string) => void;

  // Places CRUD
  places: Place[];
  addPlace: (data: Omit<Place, 'id' | 'tripId'>) => void;
  updatePlace: (id: string, data: Partial<Place>) => void;
  deletePlace: (id: string) => void;
  toggleFavoritePlace: (id: string) => void;

  // Expenses CRUD
  expenses: ExpenseItem[];
  addExpense: (data: Omit<ExpenseItem, 'id' | 'tripId'>) => void;
  updateExpense: (id: string, data: Partial<ExpenseItem>) => void;
  deleteExpense: (id: string) => void;
  updateBudgetGoal: (amount: number) => void;

  // Luggage CRUD
  luggage: LuggageItem[];
  addLuggageItem: (data: Omit<LuggageItem, 'id' | 'tripId' | 'isPacked'>) => void;
  updateLuggageItem: (id: string, data: Partial<LuggageItem>) => void;
  deleteLuggageItem: (id: string) => void;
  toggleLuggageItem: (id: string) => void;

  // Prep tasks CRUD
  prepTasks: PrepTask[];
  addPrepTask: (data: Omit<PrepTask, 'id' | 'tripId' | 'isCompleted'>) => void;
  updatePrepTask: (id: string, data: Partial<PrepTask>) => void;
  deletePrepTask: (id: string) => void;
  togglePrepTask: (id: string) => void;

  // Journals CRUD
  journals: JournalEntry[];
  addJournalEntry: (data: Omit<JournalEntry, 'id' | 'tripId' | 'createdAt'>) => void;
  updateJournalEntry: (id: string, data: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;

  // Aggregated Stats
  stats: {
    totalDays: number;
    destinationCount: number;
    activityCount: number;
    placeCount: number;
    totalBudget: number;
    totalSpent: number;
    remainingBudget: number;
    spentPercentage: number;
    luggagePacked: number;
    luggageTotal: number;
    luggagePercentage: number;
    prepCompleted: number;
    prepTotal: number;
    prepPercentage: number;
    journalCount: number;
    overallPrepProgress: number;
  };
}

const STORAGE_KEY = 'hanh_trinh_travel_app_v2';

const TravelContext = createContext<TravelContextType | undefined>(undefined);

export const TravelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const safeSetItem = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`[TravelApp] Failed to persist ${key} to localStorage:`, e);
    }
  };

  // Load state from localStorage or initialize with sample data
  const [trips, setTrips] = useState<Trip[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_trips`);
      if (saved) {
        const parsed: Trip[] = JSON.parse(saved);
        return parsed.map((t) => ({
          ...t,
          coverImage: t.coverImage ? resolveValidImageUrl(t.coverImage) : t.coverImage,
        }));
      }
    } catch (e) {
      console.error(e);
    }
    return [SAMPLE_TRIP];
  });

  const [activeTripId, setActiveTripId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_activeTripId`);
      if (saved && trips.some((t) => t.id === saved)) return saved;
    } catch (e) {
      console.error(e);
    }
    return trips[0]?.id || null;
  });

  const [currency, setCurrencyState] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_currency`);
      if (saved === 'VND' || saved === 'JPY' || saved === 'USD') return saved;
    } catch (e) {
      console.error(e);
    }
    return 'VND';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sub-entities state
  const [destinationsState, setDestinationsState] = useState<DestinationStop[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_destinations`);
      if (saved) {
        const parsed: DestinationStop[] = JSON.parse(saved);
        return parsed.map((d) => ({
          ...d,
          image: d.image ? resolveValidImageUrl(d.image) : d.image,
        }));
      }
    } catch (e) {
      console.error(e);
    }
    return SAMPLE_DESTINATIONS;
  });

  const [activitiesState, setActivitiesState] = useState<Activity[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_activities`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return SAMPLE_ACTIVITIES;
  });

  const [placesState, setPlacesState] = useState<Place[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_places`);
      if (saved) {
        const parsed: Place[] = JSON.parse(saved);
        return parsed.map((p) => ({
          ...p,
          image: p.image ? resolveValidImageUrl(p.image) : p.image,
        }));
      }
    } catch (e) {
      console.error(e);
    }
    return SAMPLE_PLACES;
  });

  const [expensesState, setExpensesState] = useState<ExpenseItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_expenses`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return SAMPLE_EXPENSES;
  });

  const [luggageState, setLuggageState] = useState<LuggageItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_luggage`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return SAMPLE_LUGGAGE;
  });

  const [prepTasksState, setPrepTasksState] = useState<PrepTask[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_prepTasks`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return SAMPLE_PREP_TASKS;
  });

  const [journalsState, setJournalsState] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_journals`);
      if (saved) {
        const parsed: JournalEntry[] = JSON.parse(saved);
        return parsed.map((j) => ({
          ...j,
          images: j.images?.map((img) => resolveValidImageUrl(img)),
        }));
      }
    } catch (e) {
      console.error(e);
    }
    return SAMPLE_JOURNALS;
  });

  // Persistent storage synchronizer
  useEffect(() => {
    safeSetItem(`${STORAGE_KEY}_trips`, JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    if (activeTripId) {
      safeSetItem(`${STORAGE_KEY}_activeTripId`, activeTripId);
    } else {
      try {
        localStorage.removeItem(`${STORAGE_KEY}_activeTripId`);
      } catch (e) {
        // ignore
      }
    }
  }, [activeTripId]);

  useEffect(() => {
    safeSetItem(`${STORAGE_KEY}_currency`, currency);
  }, [currency]);

  useEffect(() => {
    safeSetItem(`${STORAGE_KEY}_destinations`, JSON.stringify(destinationsState));
  }, [destinationsState]);

  useEffect(() => {
    safeSetItem(`${STORAGE_KEY}_activities`, JSON.stringify(activitiesState));
  }, [activitiesState]);

  useEffect(() => {
    safeSetItem(`${STORAGE_KEY}_places`, JSON.stringify(placesState));
  }, [placesState]);

  useEffect(() => {
    safeSetItem(`${STORAGE_KEY}_expenses`, JSON.stringify(expensesState));
  }, [expensesState]);

  useEffect(() => {
    safeSetItem(`${STORAGE_KEY}_luggage`, JSON.stringify(luggageState));
  }, [luggageState]);

  useEffect(() => {
    safeSetItem(`${STORAGE_KEY}_prepTasks`, JSON.stringify(prepTasksState));
  }, [prepTasksState]);

  useEffect(() => {
    safeSetItem(`${STORAGE_KEY}_journals`, JSON.stringify(journalsState));
  }, [journalsState]);

  // Auth & Cloud Database Sync state
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string>('');
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const signInWithUsername = async (rawUsername: string, pass: string) => {
    const v = validateUsername(rawUsername);
    if (!v.isValid) {
      throw new Error(v.error || 'Tên tài khoản không hợp lệ');
    }
    const cleanUsername = rawUsername.trim().toLowerCase();
    const syntheticEmail = usernameToSyntheticEmail(cleanUsername);
    await signInWithEmailAndPassword(auth, syntheticEmail, pass);
  };

  const signUpWithUsername = async (rawUsername: string, pass: string, displayName?: string) => {
    const v = validateUsername(rawUsername);
    if (!v.isValid) {
      throw new Error(v.error || 'Tên tài khoản không hợp lệ');
    }
    if (!pass || pass.length < 6) {
      throw new Error('Mật khẩu phải có tối thiểu 6 ký tự');
    }
    const cleanUsername = rawUsername.trim().toLowerCase();
    const syntheticEmail = usernameToSyntheticEmail(cleanUsername);
    const chosenName = displayName?.trim() || cleanUsername;

    const cred = await createUserWithEmailAndPassword(auth, syntheticEmail, pass);
    if (cred.user) {
      try {
        await updateProfile(cred.user, { displayName: chosenName });
      } catch (e) {
        console.warn('Failed to update displayName:', e);
      }
      await registerUsernameRecord(cleanUsername, cred.user.uid);
      setUsername(cleanUsername);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUsername('');
    showToast('Đã đăng xuất tài khoản', 'info');
  };

  // Flag to know whether initial cloud data has been loaded for the current user session
  const cloudDataLoadedRef = useRef(false);

  // Monitor Auth state & restore Cloud Data automatically
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const currentUsername = getUsernameFromEmailOrUser(currentUser.email, currentUser.displayName);
        setUsername(currentUsername);

        try {
          const cloudData = await loadUserDataFromFirestore(currentUser.uid);
          if (cloudData && cloudData.trips && cloudData.trips.length > 0) {
            setTrips(cloudData.trips);
            if (cloudData.activeTripId) setActiveTripId(cloudData.activeTripId);
            if (cloudData.currency) setCurrencyState(cloudData.currency);
            if (cloudData.destinations) setDestinationsState(cloudData.destinations);
            if (cloudData.activities) setActivitiesState(cloudData.activities);
            if (cloudData.places) setPlacesState(cloudData.places);
            if (cloudData.expenses) setExpensesState(cloudData.expenses);
            if (cloudData.luggage) setLuggageState(cloudData.luggage);
            if (cloudData.prepTasks) setPrepTasksState(cloudData.prepTasks);
            if (cloudData.journals) setJournalsState(cloudData.journals);
            showToast(`Chào mừng, ${currentUsername}! Đã khôi phục dữ liệu hành trình.`, 'success');
          } else {
            // New user without cloud data:
            // Automatically sync current local data to their new account so created itineraries are preserved
            await saveUserDataToFirestore(currentUser.uid, {
              trips,
              activeTripId,
              currency,
              destinations: destinationsState,
              activities: activitiesState,
              places: placesState,
              expenses: expensesState,
              luggage: luggageState,
              prepTasks: prepTasksState,
              journals: journalsState,
            });
            showToast(`Đã lưu dữ liệu hành trình vào tài khoản đám mây của bạn!`, 'success');
          }
        } catch (err) {
          console.error('Error restoring data from Firestore:', err);
        } finally {
          cloudDataLoadedRef.current = true;
          setIsAuthLoading(false);
        }
      } else {
        setUsername('');
        cloudDataLoadedRef.current = false;
        setIsAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Debounced Cloud Sync when user changes data while authenticated
  const syncTimerRef = useRef<any>(null);

  useEffect(() => {
    if (!user || isAuthLoading || !cloudDataLoadedRef.current) return;

    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }

    syncTimerRef.current = setTimeout(async () => {
      setIsSyncing(true);
      try {
        await saveUserDataToFirestore(user.uid, {
          trips,
          activeTripId,
          currency,
          destinations: destinationsState,
          activities: activitiesState,
          places: placesState,
          expenses: expensesState,
          luggage: luggageState,
          prepTasks: prepTasksState,
          journals: journalsState,
        });
      } catch (err) {
        console.error('Failed to sync to Cloud Firestore:', err);
      } finally {
        setIsSyncing(false);
      }
    }, 600);

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [
    user,
    isAuthLoading,
    trips,
    activeTripId,
    currency,
    destinationsState,
    activitiesState,
    placesState,
    expensesState,
    luggageState,
    prepTasksState,
    journalsState,
  ]);

  // Current active trip
  const activeTrip = trips.find((t) => t.id === activeTripId) || null;

  // Filter child items for current active trip
  const destinations = destinationsState
    .filter((d) => d.tripId === activeTripId)
    .sort((a, b) => a.order - b.order);

  const activities = activitiesState
    .filter((a) => a.tripId === activeTripId)
    .sort((a, b) => {
      if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber;
      return a.time.localeCompare(b.time);
    });

  const places = placesState.filter((p) => p.tripId === activeTripId);
  const expenses = expensesState.filter((e) => e.tripId === activeTripId);
  const luggage = luggageState.filter((l) => l.tripId === activeTripId);
  const prepTasks = prepTasksState.filter((t) => t.tripId === activeTripId);
  const journals = journalsState
    .filter((j) => j.tripId === activeTripId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Toast feedback
  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Currency Formatter
  const formatCurrency = (amount: number): string => {
    if (currency === 'JPY') {
      // Exchange rate approx: 1 JPY ~ 165 VND, 1 USD ~ 150 JPY
      const jpyAmount = Math.round(amount / 165);
      return `${new Intl.NumberFormat('ja-JP').format(jpyAmount)} ¥`;
    }
    if (currency === 'USD') {
      const usdAmount = amount / 25000;
      return `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(usdAmount)}`;
    }
    // Default VND
    return `${new Intl.NumberFormat('vi-VN').format(amount)} đ`;
  };

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    showToast(`Đã đổi đơn vị tiền tệ sang ${c}`);
  };

  // Calculate Days count
  const calculateTotalDays = (start?: string, end?: string): number => {
    if (!start || !end) return 1;
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    if (isNaN(s) || isNaN(e)) return 1;
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  // Aggregated Stats
  const totalDays = activeTrip ? calculateTotalDays(activeTrip.startDate, activeTrip.endDate) : 0;
  const totalBudget = activeTrip?.budgetGoal || 0;
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const remainingBudget = Math.max(0, totalBudget - totalSpent);
  const spentPercentage = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

  const luggagePacked = luggage.filter((i) => i.isPacked).length;
  const luggageTotal = luggage.length;
  const luggagePercentage = luggageTotal > 0 ? Math.round((luggagePacked / luggageTotal) * 100) : 0;

  const prepCompleted = prepTasks.filter((t) => t.isCompleted).length;
  const prepTotal = prepTasks.length;
  const prepPercentage = prepTotal > 0 ? Math.round((prepCompleted / prepTotal) * 100) : 0;

  // Overall prep progress = average of tasks and luggage
  const overallPrepProgress =
    prepTotal + luggageTotal > 0
      ? Math.round(((prepCompleted + luggagePacked) / (prepTotal + luggageTotal)) * 100)
      : 0;

  const stats = {
    totalDays,
    destinationCount: destinations.length,
    activityCount: activities.length,
    placeCount: places.length,
    totalBudget,
    totalSpent,
    remainingBudget,
    spentPercentage,
    luggagePacked,
    luggageTotal,
    luggagePercentage,
    prepCompleted,
    prepTotal,
    prepPercentage,
    journalCount: journals.length,
    overallPrepProgress,
  };

  // Trips CRUD
  const createTrip = (tripData: Omit<Trip, 'id' | 'createdAt'>): string => {
    const newId = `trip-${Date.now()}`;
    const newTrip: Trip = {
      ...tripData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setTrips((prev) => [newTrip, ...prev]);
    setActiveTripId(newId);
    showToast('✅ Đã tạo chuyến đi mới!');
    return newId;
  };

  const updateTrip = (id: string, tripData: Partial<Trip>) => {
    setTrips((prev) => prev.map((t) => (t.id === id ? { ...t, ...tripData } : t)));
    showToast('✅ Đã cập nhật thông tin chuyến đi');
  };

  const deleteTrip = (id: string) => {
    const nextTrips = trips.filter((t) => t.id !== id);
    setTrips(nextTrips);
    if (activeTripId === id) {
      setActiveTripId(nextTrips[0]?.id || null);
    }
    // Delete cascade
    setDestinationsState((prev) => prev.filter((d) => d.tripId !== id));
    setActivitiesState((prev) => prev.filter((a) => a.tripId !== id));
    setPlacesState((prev) => prev.filter((p) => p.tripId !== id));
    setExpensesState((prev) => prev.filter((e) => e.tripId !== id));
    setLuggageState((prev) => prev.filter((l) => l.tripId !== id));
    setPrepTasksState((prev) => prev.filter((t) => t.tripId !== id));
    setJournalsState((prev) => prev.filter((j) => j.tripId !== id));

    showToast('✅ Đã xóa chuyến đi thành công');
  };

  const resetToSampleData = () => {
    setTrips([SAMPLE_TRIP]);
    setActiveTripId(SAMPLE_TRIP.id);
    setDestinationsState(SAMPLE_DESTINATIONS);
    setActivitiesState(SAMPLE_ACTIVITIES);
    setPlacesState(SAMPLE_PLACES);
    setExpensesState(SAMPLE_EXPENSES);
    setLuggageState(SAMPLE_LUGGAGE);
    setPrepTasksState(SAMPLE_PREP_TASKS);
    setJournalsState(SAMPLE_JOURNALS);
    showToast('✅ Đã khôi phục dữ liệu mẫu chuyến đi Nhật Bản');
  };

  const clearAllData = () => {
    setTrips([]);
    setActiveTripId(null);
    setDestinationsState([]);
    setActivitiesState([]);
    setPlacesState([]);
    setExpensesState([]);
    setLuggageState([]);
    setPrepTasksState([]);
    setJournalsState([]);
    showToast('Đã xóa tất cả dữ liệu chuyến đi', 'info');
  };

  // Destinations CRUD
  const addDestination = (data: Omit<DestinationStop, 'id' | 'tripId' | 'order'>) => {
    if (!activeTripId) return;
    const maxOrder = destinations.reduce((max, d) => Math.max(max, d.order), 0);
    const newStop: DestinationStop = {
      ...data,
      id: `dest-${Date.now()}`,
      tripId: activeTripId,
      order: maxOrder + 1,
    };
    setDestinationsState((prev) => [...prev, newStop]);
    showToast('✅ Đã thêm điểm đến vào hành trình');
  };

  const updateDestination = (id: string, data: Partial<DestinationStop>) => {
    setDestinationsState((prev) => prev.map((d) => (d.id === id ? { ...d, ...data } : d)));
    showToast('✅ Đã cập nhật điểm đến');
  };

  const deleteDestination = (id: string) => {
    setDestinationsState((prev) => prev.filter((d) => d.id !== id));
    showToast('✅ Đã xóa điểm đến');
  };

  const moveDestination = (id: string, direction: 'up' | 'down') => {
    const list = [...destinations];
    const index = list.findIndex((d) => d.id === id);
    if (index === -1) return;
    if (direction === 'up' && index > 0) {
      const prevStop = list[index - 1];
      const curStop = list[index];
      const tempOrder = prevStop.order;
      prevStop.order = curStop.order;
      curStop.order = tempOrder;
      setDestinationsState((prev) =>
        prev.map((d) => (d.id === curStop.id ? curStop : d.id === prevStop.id ? prevStop : d))
      );
    } else if (direction === 'down' && index < list.length - 1) {
      const nextStop = list[index + 1];
      const curStop = list[index];
      const tempOrder = nextStop.order;
      nextStop.order = curStop.order;
      curStop.order = tempOrder;
      setDestinationsState((prev) =>
        prev.map((d) => (d.id === curStop.id ? curStop : d.id === nextStop.id ? nextStop : d))
      );
    }
  };

  // Activities CRUD
  const addActivity = (data: Omit<Activity, 'id' | 'tripId'>) => {
    if (!activeTripId) return;
    const newAct: Activity = {
      ...data,
      id: `act-${Date.now()}`,
      tripId: activeTripId,
    };
    setActivitiesState((prev) => [...prev, newAct]);
    showToast('✅ Đã lưu lịch trình hoạt động');
  };

  const updateActivity = (id: string, data: Partial<Activity>) => {
    setActivitiesState((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
    showToast('✅ Đã cập nhật lịch trình');
  };

  const deleteActivity = (id: string) => {
    setActivitiesState((prev) => prev.filter((a) => a.id !== id));
    showToast('✅ Đã xóa hoạt động khỏi lịch trình');
  };

  const toggleActivityComplete = (id: string) => {
    setActivitiesState((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isCompleted: !a.isCompleted } : a))
    );
  };

  // Places CRUD
  const addPlace = (data: Omit<Place, 'id' | 'tripId'>) => {
    if (!activeTripId) return;
    const newPlace: Place = {
      ...data,
      id: `place-${Date.now()}`,
      tripId: activeTripId,
    };
    setPlacesState((prev) => [...prev, newPlace]);
    showToast('✅ Đã thêm địa điểm mới');
  };

  const updatePlace = (id: string, data: Partial<Place>) => {
    setPlacesState((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    showToast('✅ Đã cập nhật địa điểm');
  };

  const deletePlace = (id: string) => {
    setPlacesState((prev) => prev.filter((p) => p.id !== id));
    showToast('✅ Đã xóa địa điểm');
  };

  const toggleFavoritePlace = (id: string) => {
    setPlacesState((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextFav = !p.isFavorite;
          showToast(nextFav ? '❤️ Đã lưu vào địa điểm yêu thích' : 'Đã bỏ yêu thích', 'info');
          return { ...p, isFavorite: nextFav };
        }
        return p;
      })
    );
  };

  // Expenses CRUD
  const addExpense = (data: Omit<ExpenseItem, 'id' | 'tripId'>) => {
    if (!activeTripId) return;
    const newExp: ExpenseItem = {
      ...data,
      id: `exp-${Date.now()}`,
      tripId: activeTripId,
    };
    setExpensesState((prev) => [newExp, ...prev]);
    showToast('✅ Đã cập nhật ngân sách chi tiêu');
  };

  const updateExpense = (id: string, data: Partial<ExpenseItem>) => {
    setExpensesState((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
    showToast('✅ Đã cập nhật khoản chi');
  };

  const deleteExpense = (id: string) => {
    setExpensesState((prev) => prev.filter((e) => e.id !== id));
    showToast('✅ Đã xóa khoản chi tiêu');
  };

  const updateBudgetGoal = (amount: number) => {
    if (!activeTripId) return;
    setTrips((prev) =>
      prev.map((t) => (t.id === activeTripId ? { ...t, budgetGoal: amount } : t))
    );
    showToast('✅ Đã cập nhật mục tiêu ngân sách');
  };

  // Luggage CRUD
  const addLuggageItem = (data: Omit<LuggageItem, 'id' | 'tripId' | 'isPacked'>) => {
    if (!activeTripId) return;
    const newItem: LuggageItem = {
      ...data,
      id: `lug-${Date.now()}`,
      tripId: activeTripId,
      isPacked: false,
    };
    setLuggageState((prev) => [...prev, newItem]);
    showToast('✅ Đã thêm đồ vào danh sách hành lý');
  };

  const updateLuggageItem = (id: string, data: Partial<LuggageItem>) => {
    setLuggageState((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)));
    showToast('✅ Đã cập nhật món đồ hành lý');
  };

  const deleteLuggageItem = (id: string) => {
    setLuggageState((prev) => prev.filter((i) => i.id !== id));
    showToast('✅ Đã xóa món đồ khỏi hành lý');
  };

  const toggleLuggageItem = (id: string) => {
    setLuggageState((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isPacked: !i.isPacked } : i))
    );
  };

  // Prep tasks CRUD
  const addPrepTask = (data: Omit<PrepTask, 'id' | 'tripId' | 'isCompleted'>) => {
    if (!activeTripId) return;
    const newTask: PrepTask = {
      ...data,
      id: `prep-${Date.now()}`,
      tripId: activeTripId,
      isCompleted: false,
    };
    setPrepTasksState((prev) => [...prev, newTask]);
    showToast('✅ Đã thêm việc cần chuẩn bị');
  };

  const updatePrepTask = (id: string, data: Partial<PrepTask>) => {
    setPrepTasksState((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
    showToast('✅ Đã cập nhật công việc chuẩn bị');
  };

  const deletePrepTask = (id: string) => {
    setPrepTasksState((prev) => prev.filter((t) => t.id !== id));
    showToast('✅ Đã xóa công việc');
  };

  const togglePrepTask = (id: string) => {
    setPrepTasksState((prev) => {
      let isCompletedNow = false;
      const nextList = prev.map((t) => {
        if (t.id === id) {
          isCompletedNow = !t.isCompleted;
          return { ...t, isCompleted: isCompletedNow };
        }
        return t;
      });
      if (isCompletedNow) {
        showToast('✅ Đã hoàn thành công việc');
      }
      return nextList;
    });
  };

  // Journals CRUD
  const addJournalEntry = (data: Omit<JournalEntry, 'id' | 'tripId' | 'createdAt'>) => {
    if (!activeTripId) return;
    const newEntry: JournalEntry = {
      ...data,
      id: `journal-${Date.now()}`,
      tripId: activeTripId,
      createdAt: new Date().toISOString(),
    };
    setJournalsState((prev) => [newEntry, ...prev]);
    showToast('✅ Đã lưu bài nhật ký chuyến đi');
  };

  const updateJournalEntry = (id: string, data: Partial<JournalEntry>) => {
    setJournalsState((prev) => prev.map((j) => (j.id === id ? { ...j, ...data } : j)));
    showToast('✅ Đã cập nhật bài nhật ký');
  };

  const deleteJournalEntry = (id: string) => {
    setJournalsState((prev) => prev.filter((j) => j.id !== id));
    showToast('✅ Đã xóa bài nhật ký');
  };

  return (
    <TravelContext.Provider
      value={{
        user,
        username,
        isAuthLoading,
        isSyncing,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        signInWithUsername,
        signUpWithUsername,
        logout,
        trips,
        activeTripId,
        activeTrip,
        currency,
        activeTab,
        toasts,
        setActiveTab,
        setActiveTripId,
        setCurrency,
        showToast,
        removeToast,
        formatCurrency,
        createTrip,
        updateTrip,
        deleteTrip,
        resetToSampleData,
        clearAllData,
        destinations,
        addDestination,
        updateDestination,
        deleteDestination,
        moveDestination,
        activities,
        addActivity,
        updateActivity,
        deleteActivity,
        toggleActivityComplete,
        places,
        addPlace,
        updatePlace,
        deletePlace,
        toggleFavoritePlace,
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        updateBudgetGoal,
        luggage,
        addLuggageItem,
        updateLuggageItem,
        deleteLuggageItem,
        toggleLuggageItem,
        prepTasks,
        addPrepTask,
        updatePrepTask,
        deletePrepTask,
        togglePrepTask,
        journals,
        addJournalEntry,
        updateJournalEntry,
        deleteJournalEntry,
        stats,
      }}
    >
      {children}
    </TravelContext.Provider>
  );
};

export const useTravel = () => {
  const context = useContext(TravelContext);
  if (!context) {
    throw new Error('useTravel must be used within a TravelProvider');
  }
  return context;
};
