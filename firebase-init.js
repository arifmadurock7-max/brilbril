// =====================================================
// FIREBASE INITIALIZATION - Ratu Coffee
// =====================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB35RjvLANJStHEGbauvtptXFihHDhYsVo",
  authDomain: "ratu-coffee-b1329.firebaseapp.com",
  projectId: "ratu-coffee-b1329",
  storageBucket: "ratu-coffee-b1329.firebasestorage.app",
  messagingSenderId: "116258927654",
  appId: "1:116258927654:web:2a15172a2681428e0262e7",
  measurementId: "G-6SYKQW4Q86"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
