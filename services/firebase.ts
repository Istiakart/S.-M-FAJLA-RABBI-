
// Fix: Ensure modular Firebase SDK v9+ imports are used correctly. 
// This syntax is standard for modular Firebase and should be supported by the project's module resolution.
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC0bsWVzqP-Q_aUjJqisIWEqb8teaNh6Ww",
  authDomain: "fir-m-fajla-rabbi.firebaseapp.com",
  projectId: "fir-m-fajla-rabbi",
  storageBucket: "fir-m-fajla-rabbi.firebasestorage.app",
  messagingSenderId: "219234532037",
  appId: "1:219234532037:web:e6f39ee4c9d14d2639ceac",
  measurementId: "G-848457XHBB"
};

// Initialize the modular Firebase app instance and get the Firestore database reference.
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
