import { initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isMissingFirebaseConfig = Object.values(firebaseConfig).some((value) => !value);

if (isMissingFirebaseConfig) {
  // Keep runtime behavior explicit when env is incomplete.
  console.warn("Firebase config is missing. Set VITE_FIREBASE_* variables in frontend/.env.");
}

export const isFirebaseConfigured = !isMissingFirebaseConfig;
export const firebaseApp = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const firebaseAuth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;
