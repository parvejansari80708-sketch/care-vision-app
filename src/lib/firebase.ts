// Firebase setup — reads keys from .env (EXPO_PUBLIC_FIREBASE_*)
// Auth persistence: custom AsyncStorage adapter (Firebase v12 removed
// getReactNativePersistence from the 'firebase/auth' entry point).
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { initializeAuth, getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// ---- DEMO MODE ----
// When no Firebase keys are provided (.env not filled yet), the app runs in a
// local demo mode: a fake demo user, on-device storage (AsyncStorage) instead
// of Firestore, and sample AI results clearly labelled as demo. This lets the
// full UI be explored on a phone before any Firebase setup. As soon as real
// keys are added to .env, the app automatically uses real Firebase.
export const DEMO_MODE = !firebaseConfig.apiKey;

type Listener = (value: unknown) => void;

class AsyncStoragePersistence {
  static type = 'LOCAL' as const;
  readonly type = 'LOCAL' as const;
  private listeners: Record<string, Listener[]> = {};

  async _isAvailable(): Promise<boolean> {
    try {
      await AsyncStorage.getItem('__cv_ping');
      return true;
    } catch {
      return false;
    }
  }

  async _set(key: string, value: unknown): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    this.notify(key, value);
  }

  async _get<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async _remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
    this.notify(key, null);
  }

  _addListener(key: string, listener: Listener): void {
    (this.listeners[key] = this.listeners[key] || []).push(listener);
  }

  _removeListener(key: string, listener: Listener): void {
    this.listeners[key] = (this.listeners[key] || []).filter(
      (l) => l !== listener
    );
  }

  private notify(key: string, value: unknown) {
    for (const l of this.listeners[key] || []) {
      try {
        l(value);
      } catch {
        /* ignore */
      }
    }
  }
}

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (!DEMO_MODE) {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    auth = initializeAuth(app, {
      // Firebase v12: persistence must be a CLASS (it does `new cls()` itself).
      // Passing an instance throws "INTERNAL ASSERTION FAILED: Expected a class definition".
      persistence: AsyncStoragePersistence as any,
    });
  } else {
    app = getApps()[0]!;
    auth = getAuth(app);
  }
  db = getFirestore(app!);
}

export { app, auth, db };
