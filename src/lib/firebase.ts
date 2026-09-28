import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";

// Firebase web config. The apiKey and appId come from Vercel environment variables.
// NEXT_PUBLIC_FIREBASE_CONFIG may hold the whole `firebaseConfig` snippet copied from the
// Firebase console; the individual NEXT_PUBLIC_FIREBASE_* variables work too.
const snippet = process.env.NEXT_PUBLIC_FIREBASE_CONFIG ?? "";
const fromSnippet = (key: string) => snippet.match(new RegExp(`${key}["']?\\s*:\\s*["']([^"']+)["']`))?.[1];

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || fromSnippet("apiKey"),
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || fromSnippet("authDomain") || "summarist-kljj365.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || fromSnippet("projectId") || "summarist-kljj365",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    fromSnippet("storageBucket") ||
    "summarist-kljj365.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || fromSnippet("messagingSenderId") || "782583028387",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || fromSnippet("appId"),
};

// Local testing: `firebase emulators:start --project demo-summarist` plus
// NEXT_PUBLIC_FIREBASE_EMULATORS=true runs every auth and Firestore call against the
// Emulator Suite, so the flows can be tested without touching the real project.
const useEmulators = process.env.NEXT_PUBLIC_FIREBASE_EMULATORS === "true";
const emulatorConfig = { apiKey: "demo-key", appId: "demo-app", projectId: "demo-summarist", authDomain: "localhost" };

export const firebaseConfigured = useEmulators || Boolean(config.apiKey && config.appId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function firebaseApp(): FirebaseApp {
  if (!firebaseConfigured) {
    throw new Error("Login isn't configured yet. Add the Firebase keys to the environment.");
  }
  if (!app) app = getApps().length ? getApp() : initializeApp(useEmulators ? emulatorConfig : config);
  return app;
}

export function firebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(firebaseApp());
    if (useEmulators) connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  }
  return auth;
}

export function firestore(): Firestore {
  if (!db) {
    db = getFirestore(firebaseApp());
    if (useEmulators) connectFirestoreEmulator(db, "127.0.0.1", 8080);
  }
  return db;
}
