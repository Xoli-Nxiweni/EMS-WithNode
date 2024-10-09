// Import the functions you need from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // Import Firebase Storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBltEHTXgScmTMrse2uPWDYhF45iGojTAk",
  authDomain: "employee-management-syst-b975e.firebaseapp.com",
  projectId: "employee-management-syst-b975e",
  storageBucket: "employee-management-syst-b975e.appspot.com",
  messagingSenderId: "581239231770",
  appId: "1:581239231770:web:b4081e05dd6b902e8fc8a3",
  measurementId: "G-5N37ZV8CHJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app);

export { firestore };

// Initialize Firebase services
const analytics = getAnalytics(app);
const db = getFirestore(app); // Correct Firestore initialization
const auth = getAuth(app); // Firebase Authentication instance
const storage = getStorage(app); // Firebase Storage instance
const imgDB = getStorage(app)
const txtDB = getFirestore(app)

export {};

// Export Firebase services for use in other components
export { app, db, auth, storage, analytics, imgDB,txtDB };
