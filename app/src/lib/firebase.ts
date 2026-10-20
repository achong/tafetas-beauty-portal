// app/src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// ✅ PASTE YOUR NEW CONFIG HERE (Keep the 'export' keyword!)
export const firebaseConfig = {
  apiKey: "AIzaSyCZhNbX0QygxeebFtjIqLrIk8imn_06PK8",
  authDomain: "tafetas-beauty-portal.firebaseapp.com",
  projectId: "tafetas-beauty-portal",
  storageBucket: "tafetas-beauty-portal.firebasestorage.app",
  messagingSenderId: "154732899060",
  appId: "1:154732899060:web:068a8fb3b7a85de1ee8ca1"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);