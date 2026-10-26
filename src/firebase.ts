import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserPopupRedirectResolver,
  GoogleAuthProvider,
} from 'firebase/auth';
import { initializeFirestore, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCBIa_RPbjli4KQqrbN04G_pjObZmzWYd8',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'banafi-kpi.web.app',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'banafi-kpi',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'banafi-kpi.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '176320092517',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:176320092517:web:8137053954bc829fe7e98c',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-3QJ3SP061W',
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Ưu tiên IndexedDB persistence cho iPadOS / iOS Safari PWA
export const auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch {
    return getAuth(app);
  }
})();

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Kết nối tới database chuyên biệt `pkt-survey` trong project `banafi-kpi`
// Bật experimentalAutoDetectLongPolling để hoạt động ổn định trên mạng 4G/Wi-Fi đỉnh Bà Nà
const dbId = import.meta.env.VITE_FIREBASE_APP_DB_ID || 'pkt-survey';

export const db = (() => {
  try {
    return initializeFirestore(
      app,
      { experimentalAutoDetectLongPolling: true },
      dbId
    );
  } catch {
    return getFirestore(app, dbId);
  }
})();

export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
export const FIREBASE_DB_ID = dbId;
