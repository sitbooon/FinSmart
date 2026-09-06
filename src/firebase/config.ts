/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import localConfig from '../../firebase-applet-config.json';

// Firebase configuration: prefers client environment variables (useful for Vercel deployments),
// with full fallback to local generated config and hardcoded project settings.
const metaEnv = (import.meta as any).env || {};

const FALLBACK_CONFIG = {
  projectId: "zippy-palace-g6rpq",
  appId: "1:210870018294:web:7462337bef098ecd864cd7",
  apiKey: "AIzaSyCcoFL2evuiuJw2itX0v-o34koxMQbjr_0",
  authDomain: "zippy-palace-g6rpq.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-5b167304-2025-400f-8dde-e2e438bb0a2b",
  storageBucket: "zippy-palace-g6rpq.firebasestorage.app",
  messagingSenderId: "210870018294",
};

export const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || localConfig?.apiKey || FALLBACK_CONFIG.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || localConfig?.authDomain || FALLBACK_CONFIG.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || localConfig?.projectId || FALLBACK_CONFIG.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || localConfig?.storageBucket || FALLBACK_CONFIG.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || localConfig?.messagingSenderId || FALLBACK_CONFIG.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || localConfig?.appId || FALLBACK_CONFIG.appId,
  firestoreDatabaseId: metaEnv.VITE_FIREBASE_DATABASE_ID || localConfig?.firestoreDatabaseId || FALLBACK_CONFIG.firestoreDatabaseId,
};


const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore (with databaseId if available)
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Auth & Google Auth Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Test connection on boot (per Firebase Integration standard)
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore: the client is currently offline. Operating from offline cache.');
    }
    return false;
  }
}

testConnection();

export default app;
