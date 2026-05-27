// app/src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "6qQAc9aGYROUJDhRpgiQRD6gaHH2",              // ← From Firebase Console
  authDomain: "tafetas-3ac45.firebaseapp.com",    // ← From Firebase Console
  projectId: "tafetas-3ac45",                     // ← From Firebase Console
  storageBucket: "tafetas-3ac45.appspot.com",     // ← From Firebase Console
  messagingSenderId: "594676311320",              // ← From Firebase Console
  appId: "1:594676311320:web:990ed781daf128ece8aa6d", // ← From Firebase Console
  measurementId: "G-ZVQ1XXG169"                   // ← From Firebase Console (optional)
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);

// In your AdminDashboard component, when adding a student:
const { user } = await createUserWithEmailAndPassword(auth, email, password);

// Then immediately create Firestore document:
await setDoc(doc(db, 'users', user.uid), {
  uid: user.uid,
  role: 'student',
  name: studentName,
  username: email.split('@')[0],
  isTemp: true,
  services_active: [],
});