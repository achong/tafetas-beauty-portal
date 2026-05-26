import { useState, useCallback } from 'react';
import './App.css';
import { Navbar } from '@/sections/Navbar';
import { ServicesCatalog } from '@/sections/ServicesCatalog';
import { BookingView } from '@/sections/BookingView';
import { AdminLogin } from '@/sections/AdminLogin';
import { AdminDashboard } from '@/sections/AdminDashboard';
import { StudentLogin } from '@/sections/StudentLogin';
import { StudentDashboard } from '@/sections/StudentDashboard';
import { useClinicData, resetAllData } from '@/hooks/useClinicData';
import type { User, ViewName, Booking } from '@/types';

function App() {
  const [currentView, setCurrentView] = useState<ViewName>('catalog');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const {
    users,
    services,
    schedule,
    bookings,
    addUser,
    removeUser,
    updateUser,
    addBooking,
    setSchedule,
    refresh,
    SERVICE_CATEGORIES,
  } = useClinicData();

  const handleLogin = useCallback((user: User) => {
    setCurrentUser(user);
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setCurrentView('catalog');
  }, []);

  const handleSwitchView = useCallback((view: ViewName) => {
    setCurrentView(view);
  }, []);

  const handleAddStudent = useCallback(
    (student: User) => {
      addUser(student);
      refresh();
    },
    [addUser, refresh]
  );

  const handleRemoveStudent = useCallback(
    (uid: string) => {
      removeUser(uid);
      refresh();
    },
    [removeUser, refresh]
  );

  const handleUpdateUser = useCallback(
    (user: User) => {
      updateUser(user);
      if (currentUser?.uid === user.uid) {
        setCurrentUser(user);
      }
      refresh();
    },
    [updateUser, currentUser, refresh]
  );

  const handleUpdateSchedule = useCallback(
    (newSchedule: import('@/types').ScheduleEntry[]) => {
      setSchedule(newSchedule);
      refresh();
    },
    [setSchedule, refresh]
  );

  const handleBook = useCallback(
    (booking: Booking) => {
      addBooking(booking);
      refresh();
    },
    [addBooking, refresh]
  );

  const handleResetData = useCallback(() => {
    resetAllData();
    setCurrentUser(null);
    setCurrentView('catalog');
    refresh();
    window.location.reload();
  }, [refresh]);

  const renderView = () => {
    switch (currentView) {
      case 'catalog':
        return <ServicesCatalog categories={SERVICE_CATEGORIES} />;
      case 'booking':
        return (
          <BookingView
            services={services}
            users={users}
            schedule={schedule}
            bookings={bookings}
            onBook={handleBook}
            categories={SERVICE_CATEGORIES}
          />
        );
      case 'admin-login':
        return (
          <AdminLogin
            users={users}
            onLogin={handleLogin}
            onSwitchView={handleSwitchView}
          />
        );
case 'admin-dashboard':
  return currentUser?.role === 'admin' ? (
    <AdminDashboard
      currentUser={currentUser}
      users={users}
      services={services}
      bookings={bookings}
      onAddStudent={handleAddStudent}
      onRemoveStudent={handleRemoveStudent}
      onResetData={handleResetData}
      onUpdateUser={handleUpdateUser}
    />
  ) : (
    <AdminLogin
      users={users}
      onLogin={handleLogin}
      onSwitchView={handleSwitchView}
    />
  );
      case 'student-login':
        return (
          <StudentLogin
            users={users}
            onLogin={handleLogin}
            onSwitchView={handleSwitchView}
          />
        );
      case 'student-dashboard':
        return currentUser?.role === 'student' ? (
          <StudentDashboard
            currentUser={currentUser}
            services={services}
            schedule={schedule}
            bookings={bookings}
            categories={SERVICE_CATEGORIES}
            onUpdateUser={handleUpdateUser}
            onUpdateSchedule={handleUpdateSchedule}
          />
        ) : (
          <StudentLogin
            users={users}
            onLogin={handleLogin}
            onSwitchView={handleSwitchView}
          />
        );
      default:
        return <ServicesCatalog categories={SERVICE_CATEGORIES} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar
        currentUser={currentUser}
        onSwitchView={handleSwitchView}
        onLogout={handleLogout}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>
      <Footer />
    </div>
  );
}

export default App;
