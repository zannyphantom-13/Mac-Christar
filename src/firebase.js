// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCx0t1uGNSQ1hsb7CJ-nFGFzXqnfeDWtVk",
  authDomain: "the-electric-plug.firebaseapp.com",
  projectId: "the-electric-plug",
  storageBucket: "the-electric-plug.firebasestorage.app",
  messagingSenderId: "184874142487",
  appId: "1:184874142487:web:114c0bcada902d354b0552",
  measurementId: "G-GHRWCY5ZLS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
