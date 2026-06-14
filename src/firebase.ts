import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  type Auth,
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env
    .VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string,
};

// Everything below is lazily initialized. Firebase is never touched at module
// load time so that prerendering (scripts/prerender.ts runs the app in Node)
// can import any component without booting Auth/Firestore/Analytics. These only
// initialize when a browser-side handler actually calls them.
let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;
let _analytics: ReturnType<typeof getAnalytics> | null = null;

function getApp(): FirebaseApp {
  if (!_app) {
    if (!firebaseConfig.apiKey) {
      throw new Error(
        "Firebase is not configured: VITE_FIREBASE_API_KEY is missing. " +
          "Set the VITE_FIREBASE_* environment variables for this build.",
      );
    }
    _app = initializeApp(firebaseConfig);
  }
  return _app;
}

export function getDb(): Firestore {
  if (!_db) _db = getFirestore(getApp());
  return _db;
}

export function getAuthInstance(): Auth {
  if (!_auth) _auth = getAuth(getApp());
  return _auth;
}

export async function ensureAuth(): Promise<string> {
  const auth = getAuthInstance();
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      if (user) {
        resolve(user.uid);
      } else {
        void signInAnonymously(auth)
          .then((cred) => resolve(cred.user.uid))
          .catch((err: unknown) =>
            reject(err instanceof Error ? err : new Error(String(err))),
          );
      }
    });
  });
}

export function getAnalyticsInstance() {
  if (!_analytics) {
    _analytics = getAnalytics(getApp());
  }
  return _analytics;
}
