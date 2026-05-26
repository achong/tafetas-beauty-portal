import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  writeBatch,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User, Service, ScheduleEntry, Booking } from '@/types';

export const SERVICE_CATEGORIES: Record<string, { name: string; price: number }[]> = {
  'Nail Services': [
    { name: 'Manicure', price: 10 },
    { name: 'Pedicure', price: 10 },
    { name: 'Full Set Acrylic/Gels/Dip', price: 15 },
    { name: 'Gel polish over acrylic/hard gel extra', price: 20 },
    { name: 'Overlays – Gel, Acrylic & Dip', price: 10 },
    { name: 'Gel toes - Gel Polish', price: 10 },
    { name: 'Rebalance – Gel, Acrylic & Dip', price: 10 },
    { name: 'Removal of Nail Enhancement product', price: 10 },
    { name: 'Nail Art (per nail)', price: 1 },
  ],
  'Waxing': [
    { name: '½ Leg Wax', price: 8 },
    { name: 'Full Leg Wax', price: 10 },
    { name: 'Bikini Wax', price: 6 },
    { name: 'Brazilian', price: 10 },
    { name: 'Under-arm', price: 5 },
    { name: 'Arms', price: 8 },
    { name: 'Eyebrow wax', price: 6 },
    { name: 'Face Wax – Lip or chin', price: 4 },
    { name: 'Face Wax – side', price: 5 },
    { name: 'Chest Wax', price: 8 },
    { name: 'Back Wax', price: 8 },
    { name: 'Lash & Brow', price: 6 },
    { name: 'Eyebrow Tint', price: 8 },
    { name: 'Eye Lash Tint', price: 15 },
    { name: 'Lash Lift and Tint', price: 27 },
    { name: 'Lash Lift, Lash Tint, Brow tint and wax/shape', price: 25 },
    { name: 'Lash extensions Full Set/Infills', price: 25 },
    { name: 'Lash extension removal', price: 0 },
  ],
  'Facials': [
    { name: 'Facial (standard)', price: 10 },
    { name: 'Specialised Facial/ Micro', price: 15 },
    { name: 'Microdermabrasion / Hydro dermabrasion', price: 15 },
    { name: 'Body massage', price: 10 },
    { name: 'Back massage', price: 5 },
    { name: 'Make-up – Day/Evening/Mature', price: 5 },
    { name: 'Lashes strip or clusters', price: 5 },
    { name: 'Spray tan service (Full Body)', price: 10 },
  ],
};

export const CLINIC_TIME_SLOTS = [
  '9:00', '9:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00',
];

function generateDefaultServices(): Service[] {
  const services: Service[] = [];
  let counter = 1;
  for (const [category, items] of Object.entries(SERVICE_CATEGORIES)) {
    for (const item of items) {
      services.push({ 
        service_id: `s${counter}`, 
        category, 
        name: item.name, 
        price: item.price 
      });
      counter++;
    }
  }
  return services;
}

export async function initializeData(): Promise<void> {
  try {
    const servicesRef = collection(db, 'services');
    const servicesSnapshot = await getDocs(servicesRef);
    
    if (servicesSnapshot.empty) {
      const adminUser: User = {
        uid: 'admin1',
        role: 'admin',
        name: 'Administrator',
        username: 'admin',
        password: 'admin123',
        isTemp: false,
      };
      await setDoc(doc(db, 'users', adminUser.uid), adminUser as DocumentData);

      const defaultServices = generateDefaultServices();
      const batch = writeBatch(db);
      defaultServices.forEach((service) => {
        const serviceRef = doc(collection(db, 'services'));
        batch.set(serviceRef, service as DocumentData);
      });
      await batch.commit();
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}

export async function resetAllData(): Promise<void> {
  try {
    const collections = ['users', 'services', 'schedule', 'bookings'];
    for (const colName of collections) {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      const batch = writeBatch(db);
      snapshot.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
    await initializeData();
  } catch (err) {
    console.error('Error resetting data:', err);
    throw err;
  }
}

export function useClinicData() {
  const [users, setUsersState] = useState<User[]>([]);
  const [services, setServicesState] = useState<Service[]>([]);
  const [schedule, setScheduleState] = useState<ScheduleEntry[]>([]);
  const [bookings, setBookingsState] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ Users
    const unsubscribeUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot: QuerySnapshot<DocumentData>) => {
        const usersData = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            uid: docSnap.id,
            ...data
          } as unknown as User; // 🔧 Double cast to satisfy TypeScript
        });
        setUsersState(usersData);
      },
      (err: Error) => {
        console.error('Error listening to users:', err);
        setError('Failed to load users');
      }
    );

    // ✅ Services
    const unsubscribeServices = onSnapshot(
      collection(db, 'services'),
      (snapshot: QuerySnapshot<DocumentData>) => {
        const servicesData = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            service_id: docSnap.id,
            ...data
          } as unknown as Service; // 🔧 Double cast
        });
        setServicesState(servicesData);
      },
      (err: Error) => {
        console.error('Error listening to services:', err);
        setError('Failed to load services');
      }
    );

    // ✅ Schedule
    const unsubscribeSchedule = onSnapshot(
      collection(db, 'schedule'),
      (snapshot: QuerySnapshot<DocumentData>) => {
        const scheduleData = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data
          } as unknown as ScheduleEntry & { id: string }; // 🔧 Double cast
        });
        setScheduleState(scheduleData.map(({ id, ...rest }) => rest as ScheduleEntry));
      },
      (err: Error) => {
        console.error('Error listening to schedule:', err);
        setError('Failed to load schedule');
      }
    );

    // ✅ Bookings (Fixed: double cast resolves the error)
    const unsubscribeBookings = onSnapshot(
      collection(db, 'bookings'),
      (snapshot: QuerySnapshot<DocumentData>) => {
        const bookingsData = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data
          } as unknown as Booking; // 🔧 Double cast: DocumentData -> unknown -> Booking
        });
        setBookingsState(bookingsData);
      },
      (err: Error) => {
        console.error('Error listening to bookings:', err);
        setError('Failed to load bookings');
      }
    );

    initializeData();
    setLoading(false);

    return () => {
      unsubscribeUsers();
      unsubscribeServices();
      unsubscribeSchedule();
      unsubscribeBookings();
    };
  }, []);

  const addUser = useCallback(async (user: User) => {
    try {
      await setDoc(doc(db, 'users', user.uid), user as DocumentData);
    } catch (err) {
      console.error('Error adding user:', err);
      setError('Failed to add user');
      throw err;
    }
  }, []);

  const removeUser = useCallback(async (uid: string) => {
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch (err) {
      console.error('Error removing user:', err);
      setError('Failed to remove user');
      throw err;
    }
  }, []);

  const updateUser = useCallback(async (updatedUser: User) => {
    try {
      await updateDoc(doc(db, 'users', updatedUser.uid), updatedUser as DocumentData);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
      throw err;
    }
  }, []);

  const addBooking = useCallback(async (booking: Booking) => {
    try {
      const bookingRef = doc(collection(db, 'bookings'));
      await setDoc(bookingRef, { ...booking, id: bookingRef.id } as DocumentData);
    } catch (err) {
      console.error('Error adding booking:', err);
      setError('Failed to add booking');
      throw err;
    }
  }, []);

  const setSchedule = useCallback(async (newSchedule: ScheduleEntry[]) => {
    try {
      const batch = writeBatch(db);
      const scheduleRef = collection(db, 'schedule');
      const existingSnapshot = await getDocs(scheduleRef);
      existingSnapshot.forEach((d) => batch.delete(d.ref));
      newSchedule.forEach((entry) => {
        const entryRef = doc(scheduleRef);
        batch.set(entryRef, entry as DocumentData);
      });
      await batch.commit();
    } catch (err) {
      console.error('Error updating schedule:', err);
      setError('Failed to update schedule');
      throw err;
    }
  }, []);

  return {
    users,
    services,
    schedule,
    bookings,
    loading,
    error,
    addUser,
    removeUser,
    updateUser,
    addBooking,
    setSchedule,
    refresh: initializeData,
    resetAllData,
    SERVICE_CATEGORIES,
  };
}