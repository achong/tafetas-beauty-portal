// src/App.tsx
import { useState, useCallback, useEffect } from 'react'
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import './App.css'

// Firebase
import { auth, db } from '@/lib/firebase'

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
        // Fetch user document from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (userDoc.exists()) {
            setCurrentUser(userDoc.data() as User)
          } else {
            // User document doesn't exist - sign out
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
    // Prevent navigation to protected routes if not authenticated
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

  // Admin actions
  const handleAddStudent = useCallback((student: User) => {
    addUser(student)
    refresh()
  }, [addUser, refresh])

  const handleRemoveStudent = useCallback((uid: string) => {
    removeUser(uid)
    refresh()
  }, [removeUser, refresh])

  const handleUpdateUser = useCallback((user: User) => {
    updateUser(user)
    if (currentUser?.uid === user.uid) {
      setCurrentUser(user)
    }
    refresh()
  }, [updateUser, currentUser, refresh])

  const handleUpdateSchedule = useCallback((newSchedule: ScheduleEntry[]) => {
    setSchedule(newSchedule)
    refresh()
  }, [setSchedule, refresh])

  // Booking
  const handleBook = useCallback((booking: Booking) => {
    addBooking(booking)
    refresh()
  }, [addBooking, refresh])

  // Reset
  const handleResetData = useCallback(() => {
    resetAllData()
    setCurrentUser(null)
    setCurrentView('catalog')
    refresh()
    window.location.reload()
  }, [refresh])

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    )
  }

  // View renderer
  const renderView = () => {
    switch (currentView) {
      case 'catalog':
        return <ServicesCatalog categories={SERVICE_CATEGORIES} />
      
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
        )
      
      case 'admin-login':
        // If already logged in as admin, show dashboard directly
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
            onLogin={handleLogin}
            onSwitchView={handleSwitchView}
          />
        )
      
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
            onLogin={handleLogin}
            onSwitchView={handleSwitchView}
          />
        )
      
      case 'student-login':
        // If already logged in as student, show dashboard directly
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
            onLogin={handleLogin}
            onSwitchView={handleSwitchView}
          />
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
          <StudentLogin
            onLogin={handleLogin}
            onSwitchView={handleSwitchView}
          />
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
