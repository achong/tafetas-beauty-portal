// app/src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAROc3TUVMLIbvfg0zsKkJKGdGDGYOC2sc",
  authDomain: "tafetas-3ac45.firebaseapp.com",
  projectId: "tafetas-3ac45",
  storageBucket: "tafetas-3ac45.firebasestorage.app",
  messagingSenderId: "594676311320",
  appId: "1:594676311320:web:990ed781daf128ece8aa6d",
  measurementId: "G-ZVQ1XXG169"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);