import { useState, useEffect, useCallback } from 'react';
import type { User, Service, ScheduleEntry, Booking } from '@/types';

const SERVICE_CATEGORIES: Record<string, { name: string; price: number }[]> = {
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
      services.push({ service_id: `s${counter}`, category, name: item.name, price: item.price });
      counter++;
    }
  }
  return services;
}

function getData<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(`clinic_${key}_v3`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setData<T>(key: string, data: T[]): void {
  localStorage.setItem(`clinic_${key}_v3`, JSON.stringify(data));
}

export function initializeData(): void {
  const existingServices = getData<Service>('services');
  if (!existingServices || existingServices.length === 0) {
    const users: User[] = [
      { uid: 'admin1', role: 'admin', name: 'Administrator', username: 'admin', password: 'admin123', isTemp: false },
    ];
    setData('users', users);
    setData('services', generateDefaultServices());
    setData('schedule', [] as ScheduleEntry[]);
    setData('bookings', [] as Booking[]);
    localStorage.setItem('clinic_init_v3', 'true');
  }
}

export function resetAllData(): void {
  localStorage.clear();
  initializeData();
}

export function useClinicData() {
  const [users, setUsersState] = useState<User[]>(getData<User>('users'));
  const [services, setServicesState] = useState<Service[]>(getData<Service>('services'));
  const [schedule, setScheduleState] = useState<ScheduleEntry[]>(getData<ScheduleEntry>('schedule'));
  const [bookings, setBookingsState] = useState<Booking[]>(getData<Booking>('bookings'));

  const persist = useCallback(() => {
    setUsersState(getData<User>('users'));
    setServicesState(getData<Service>('services'));
    setScheduleState(getData<ScheduleEntry>('schedule'));
    setBookingsState(getData<Booking>('bookings'));
  }, []);

  const setUsers = useCallback((data: User[]) => {
    setData('users', data);
    setUsersState(data);
  }, []);

  const setServices = useCallback((data: Service[]) => {
    setData('services', data);
    setServicesState(data);
  }, []);

  const setSchedule = useCallback((data: ScheduleEntry[]) => {
    setData('schedule', data);
    setScheduleState(data);
  }, []);

  const setBookings = useCallback((data: Booking[]) => {
    setData('bookings', data);
    setBookingsState(data);
  }, []);

  useEffect(() => {
    initializeData();
    persist();
  }, [persist]);

  const addUser = useCallback((user: User) => {
    const updated = [...getData<User>('users'), user];
    setUsers(updated);
  }, [setUsers]);

  const removeUser = useCallback((uid: string) => {
    const updated = getData<User>('users').filter((u) => u.uid !== uid);
    setUsers(updated);
  }, [setUsers]);

  const updateUser = useCallback((updatedUser: User) => {
    const all = getData<User>('users').map((u) => (u.uid === updatedUser.uid ? updatedUser : u));
    setUsers(all);
  }, [setUsers]);

  const addBooking = useCallback((booking: Booking) => {
    const updated = [...getData<Booking>('bookings'), booking];
    setBookings(updated);
  }, [setBookings]);

  return {
    users,
    services,
    schedule,
    bookings,
    setUsers,
    setServices,
    setSchedule,
    setBookings,
    addUser,
    removeUser,
    updateUser,
    addBooking,
    refresh: persist,
    SERVICE_CATEGORIES,
  };
}
