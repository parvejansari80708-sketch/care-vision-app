// Auth state for the whole app — wrap root layout with <AuthProvider>
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth';
import { DEMO_MODE, auth } from '../lib/firebase';

// Demo mode (no Firebase keys yet): a local fake user so the whole UI can be
// explored on the phone. Real Firebase takes over automatically once .env keys exist.
const DEMO_USER = {
  uid: 'demo-user',
  isAnonymous: true,
  email: null,
  displayName: 'Demo User',
} as unknown as User;

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInGuest: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthContextType | null>(null);

function friendly(e: any): Error {
  const code = e?.code || '';
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password')
    return new Error('Wrong email or password.');
  if (code === 'auth/email-already-in-use')
    return new Error('This email is already registered. Try login.');
  if (code === 'auth/weak-password')
    return new Error('Password must be at least 6 characters.');
  if (code === 'auth/invalid-email') return new Error('Invalid email address.');
  return new Error(e?.message || 'Authentication failed.');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      // Start signed out in demo so the auth screen is visible; any
      // sign-in button below switches to the local demo user.
      setUser(null);
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth!, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signIn = async (email: string, password: string) => {
    if (DEMO_MODE) {
      setUser(DEMO_USER);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth!, email.trim(), password);
    } catch (e) {
      throw friendly(e);
    }
  };

  const signUp = async (email: string, password: string) => {
    if (DEMO_MODE) {
      setUser(DEMO_USER);
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth!, email.trim(), password);
    } catch (e) {
      throw friendly(e);
    }
  };

  const signInGuest = async () => {
    if (DEMO_MODE) {
      setUser(DEMO_USER);
      return;
    }
    try {
      await signInAnonymously(auth!);
    } catch (e) {
      throw friendly(e);
    }
  };

  const signOut = async () => {
    if (DEMO_MODE) {
      setUser(null);
      return;
    }
    await fbSignOut(auth!);
  };

  return (
    <Ctx.Provider value={{ user, loading, signIn, signUp, signInGuest, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthContextType {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth must be used inside <AuthProvider>');
  return c;
}
