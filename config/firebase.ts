import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB4IppZjz941_kv3sONxsu7TVLGXdFlOWY",
  authDomain: "smart-roard.firebaseapp.com",
  projectId: "smart-roard",
  storageBucket: "smart-roard.firebasestorage.app",
  messagingSenderId: "24235107102",
  appId: "1:24235107102:web:fa04f85f676ee7f2c05f0f"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
