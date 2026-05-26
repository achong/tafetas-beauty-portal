import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  onSnapshot,
  writeBatch,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User, Service, ScheduleEntry, Booking } from '@/types';

// Default service categories (same as before)
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

// Helper to generate default services for initial setup
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

// Initialize default data if collections are empty
export async function initializeData(): Promise<void> {
  try {
    const servicesRef = collection(db, 'services');
    const servicesSnapshot = await getDocs(servicesRef);
    
    if (servicesSnapshot.empty) {
      // Create default admin user
      const adminUser: User = {
        uid: 'admin1',
        role: 'admin',
        name: 'Administrator',
        username: 'admin',
        password: 'admin123', // In production, use Firebase Auth
        isTemp: false,
      };
      await setDoc(doc(db, 'users', adminUser.uid), adminUser);

      // Create default services
      const defaultServices = generateDefaultServices();
      const batch = writeBatch(db);
      defaultServices.forEach((service) => {
        const serviceRef = doc(collection(db, 'services'));
        batch.set(serviceRef, service);
      });
      await batch.commit();

      console.log('Default data initialized');
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}

export function useClinicData() {
  const [users, setUsersState] = useState<User[]>([]);
  const [services, setServicesState] = useState<Service[]>([]);
  const [schedule, setScheduleState] = useState<ScheduleEntry[]>([]);
  const [bookings, setBookingsState] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set up real-time listeners for all collections
  useEffect(() => {
    const unsubscribeUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        } as User));
        setUsersState(usersData);
      },
      (err) => {
        console.error('Error listening to users:', err);
        setError('Failed to load users');
      }
    );

    const unsubscribeServices = onSnapshot(
      collection(db, 'services'),
      (snapshot) => {
        const servicesData = snapshot.docs.map(doc => ({
          service_id: doc.id,
          ...doc.data()
        } as Service));
        setServicesState(servicesData);
      },
      (err) => {
        console.error('Error listening to services:', err);
        setError('Failed to load services');
      }
    );

    const unsubscribeSchedule = onSnapshot(
      collection(db, 'schedule'),
      (snapshot) => {
        const scheduleData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ScheduleEntry & { id: string }));
        // Convert to ScheduleEntry format (without id field)
        setScheduleState(scheduleData.map(({ id, ...rest }) => rest));
      },
      (err) => {
        console.error('Error listening to schedule:', err);
        setError('Failed to load schedule');
      }
    );

    const unsubscribeBookings = onSnapshot(
      collection(db, 'bookings'),
      (snapshot) => {
        const bookingsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Booking));
        setBookingsState(bookingsData);
      },
      (err) => {
        console.error('Error listening to bookings:', err);
        setError('Failed to load bookings');
      }
    );

    // Initialize default data on first load
    initializeData();
    setLoading(false);

    // Cleanup listeners on unmount
    return () => {
      unsubscribeUsers();
      unsubscribeServices();
      unsubscribeSchedule();
      unsubscribeBookings();
    };
  }, []);

  // User operations
  const addUser = useCallback(async (user: User) => {
    try {
      await setDoc(doc(db, 'users', user.uid), user);
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
      await updateDoc(doc(db, 'users', updatedUser.uid), updatedUser);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
      throw err;
    }
  }, []);

  // Booking operations
  const addBooking = useCallback(async (booking: Booking) => {
    try {
      const bookingRef = doc(collection(db, 'bookings'));
      await setDoc(bookingRef, { ...booking, id: bookingRef.id });
    } catch (err) {
      console.error('Error adding booking:', err);
      setError('Failed to add booking');
      throw err;
    }
  }, []);

  // Schedule operations
  const setSchedule = useCallback(async (newSchedule: ScheduleEntry[]) => {
    try {
      // For simplicity, we'll replace the entire schedule collection
      // In production, you might want to use batched writes with individual updates
      const batch = writeBatch(db);
      const scheduleRef = collection(db, 'schedule');
      
      // Delete existing schedule entries (optional - depends on your use case)
      const existingSnapshot = await getDocs(scheduleRef);
      existingSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      // Add new entries
      newSchedule.forEach((entry) => {
        const entryRef = doc(scheduleRef);
        batch.set(entryRef, entry);
      });
      
      await batch.commit();
    } catch (err) {
      console.error('Error updating schedule:', err);
      setError('Failed to update schedule');
      throw err;
    }
  }, []);

  // Reset all data (admin function)
  const resetAllData = useCallback(async () => {
    try {
      const collections = ['users', 'services', 'schedule', 'bookings'];
      for (const colName of collections) {
        const colRef = collection(db, colName);
        const snapshot = await getDocs(colRef);
        const batch = writeBatch(db);
        snapshot.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
      }
      // Re-initialize default data
      await initializeData();
    } catch (err) {
      console.error('Error resetting data:', err);
      setError('Failed to reset data');
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
