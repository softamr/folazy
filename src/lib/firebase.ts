
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCFU5mi3wDBCKFqIN2zwxxAXHwtMidv7VA",
  authDomain: "marketsquare-9nk44.firebaseapp.com",
  projectId: "marketsquare-9nk44",
  storageBucket: "marketsquare-9nk44.firebasestorage.app", // Corrected: .appspot.com is typical for storageBucket
  messagingSenderId: "860812012286",
  appId: "1:860812012286:web:a41b6ec8ceecdffddbd3af"
  // measurementId can be added here if you have one and need it
};

// Initialize Firebase
// Conditional initialization to avoid re-initializing on HMR or server-side
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Initialize Firebase Analytics if supported
const analytics = isAnalyticsSupported().then(yes => yes ? getAnalytics(app) : null);

export { app, db, auth, storage, analytics, firebaseConfig };

