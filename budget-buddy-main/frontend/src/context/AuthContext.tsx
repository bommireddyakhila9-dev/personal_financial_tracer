import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { firebaseAuth, isFirebaseConfigured } from "@/lib/firebase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseAuth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signIn: async (email, password) => {
        if (!firebaseAuth || !isFirebaseConfigured) {
          throw new Error("Firebase is not configured. Add VITE_FIREBASE_* variables.");
        }
        await signInWithEmailAndPassword(firebaseAuth, email, password);
      },
      signUp: async (email, password) => {
        if (!firebaseAuth || !isFirebaseConfigured) {
          throw new Error("Firebase is not configured. Add VITE_FIREBASE_* variables.");
        }
        await createUserWithEmailAndPassword(firebaseAuth, email, password);
      },
      logOut: async () => {
        if (!firebaseAuth || !isFirebaseConfigured) {
          return;
        }
        await signOut(firebaseAuth);
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
