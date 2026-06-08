// src/App.tsx
import { useState, useCallback, useEffect } from 'react'
import { initializeApp } from 'firebase/app' // ✅ Added for secondary auth
import { onAuthStateChanged, signOut, User as FirebaseUser, createUserWithEmailAndPassword, getAuth } from 'firebase/auth' // ✅ Added getAuth
import { doc, getDoc } from 'firebase/firestore'
import './App.css'

// Firebase
import { auth, db, firebaseConfig } from '@/lib/firebase' // ✅ Added firebaseConfig

// Sections
import { Navbar } from '@/sections/Navbar'
import { ServicesCatalog } from '@/sections/ServicesCatalog'
import { BookingView } from '@/sections/BookingView'
import { AdminLogin } from '@/sections/AdminLogin'
import { AdminDashboard } from '@/sections/AdminDashboard'
import { StudentLogin } from '@/sections/StudentLogin'
import { StudentDashboard } from '@/sections/StudentDashboard'

// Hooks & Types
import { useClinicData, resetAllData } from '@/hooks/useClinicData'
import type { User, ViewName, Booking, ScheduleEntry } from '@/types'

// ✅ CREATE SECONDARY AUTH INSTANCE HERE (Outside the component)
const secondaryApp = initializeApp(firebaseConfig, 'Secondary');
const secondaryAuth = getAuth(secondaryApp);

function App() {
  const [currentView, setCurrentView] = useState<ViewName>('catalog')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  
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
  } = useClinicData()

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (userDoc.exists()) {
            setCurrentUser(userDoc.data() as User)
          } else {
            await signOut(auth)
            setCurrentUser(null)
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          setCurrentUser(null)
        }
      } else {
        setCurrentUser(null)
      }
      setAuthLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Auth handlers
  const handleLogin = useCallback((user: User) => {
    setCurrentUser(user)
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
    }
    setCurrentUser(null)
    setCurrentView('catalog')
  }, [])

  // Navigation
  const handleSwitchView = useCallback((view: ViewName) => {
    if (view === 'admin-dashboard' && currentUser?.role !== 'admin') {
      setCurrentView('admin-login')
      return
    }
    if (view === 'student-dashboard' && currentUser?.role !== 'student') {
      setCurrentView('student-login')
      return
    }
    setCurrentView(view)
  }, [currentUser])

  // ✅ Admin actions (Using secondaryAuth to prevent admin logout!)
  const handleAddStudent = useCallback(async (student: User) => {
    try {
      const authResult = await createUserWithEmailAndPassword(secondaryAuth, student.email!, student.password);
      const studentWithAuthUid = { 
        ...student, 
        uid: authResult.user.uid 
      };
      await addUser(studentWithAuthUid);
      await refresh();
    } catch (err: any) {
      console.error('Failed to create student:', err);
      if (err.code === 'auth/email-already-in-use') {
        alert('A user with this email already exists.');
      } else {
        alert('Error creating student. Check console for details.');
      }
      throw err; 
    }
  }, [addUser, refresh]);

  const handleAddAdmin = useCallback(async (admin: User) => {
    try {
      const authResult = await createUserWithEmailAndPassword(secondaryAuth, admin.email!, admin.password);
      const adminWithAuthUid = { 
        ...admin, 
        uid: authResult.user.uid 
      };
      await addUser(adminWithAuthUid);
      await refresh();
    } catch (err: any) {
      console.error('Failed to create admin:', err);
      if (err.code === 'auth/email-already-in-use') {
        alert('An admin with this email already exists.');
      } else {
        alert('Error creating admin. Check console for details.');
      }
      throw err;
    }
  }, [addUser, refresh]);

  const handleRemoveStudent = useCallback((uid: string) => {
    removeUser(uid);
    refresh();
  }, [removeUser, refresh]);

  const handleUpdateUser = useCallback((user: User) => {
    updateUser(user);
    if (currentUser?.uid === user.uid) {
      setCurrentUser(user);
    }
    refresh();
  }, [updateUser, currentUser, refresh]);

  const handleUpdateSchedule = useCallback((newSchedule: ScheduleEntry[]) => {
    setSchedule(newSchedule);
    refresh();
  }, [setSchedule, refresh]);

  const handleBook = useCallback((booking: Booking) => {
    addBooking(booking);
    refresh();
  }, [addBooking, refresh]);

  const handleResetData = useCallback(() => {
    resetAllData();
    setCurrentUser(null);
    setCurrentView('catalog');
    refresh();
    window.location.reload();
  }, [refresh]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    )
  }

  const renderView = () => {
    switch (currentView) {
      case 'catalog':
        return <ServicesCatalog categories={SERVICE_CATEGORIES} />
      
      case 'booking':
        return (
          <BookingView
            currentUser={currentUser}
            services={services}
            users={users}
            schedule={schedule}
            bookings={bookings}
            onBook={handleBook}
            categories={SERVICE_CATEGORIES}
          />
        )
      
      case 'admin-login':
        return currentUser?.role === 'admin' ? (
          <AdminDashboard
            currentUser={currentUser}
            users={users}
            services={services}
            bookings={bookings}
            onAddStudent={handleAddStudent}
            onAddAdmin={handleAddAdmin}
            onRemoveStudent={handleRemoveStudent}
            onResetData={handleResetData}
            onUpdateUser={handleUpdateUser}
          />
        ) : (
          <AdminLogin onLogin={handleLogin} onSwitchView={handleSwitchView} />
        )
      
      case 'admin-dashboard':
        return currentUser?.role === 'admin' ? (
          <AdminDashboard
            currentUser={currentUser}
            users={users}
            services={services}
            bookings={bookings}
            onAddStudent={handleAddStudent}
            onAddAdmin={handleAddAdmin}
            onRemoveStudent={handleRemoveStudent}
            onResetData={handleResetData}
            onUpdateUser={handleUpdateUser}
          />
        ) : (
          <AdminLogin onLogin={handleLogin} onSwitchView={handleSwitchView} />
        )
      
      case 'student-login':
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
          <StudentLogin onLogin={handleLogin} onSwitchView={handleSwitchView} />
        )
      
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
          <StudentLogin onLogin={handleLogin} onSwitchView={handleSwitchView} />
        )
      
      default:
        return <ServicesCatalog categories={SERVICE_CATEGORIES} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        currentUser={currentUser}
        onSwitchView={handleSwitchView}
        onLogout={handleLogout}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>
    </div>
  )
}

export default App