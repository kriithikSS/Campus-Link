// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore} from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "campuslink-33c6b.firebaseapp.com",
  projectId: "campuslink-33c6b",
  storageBucket: "campuslink-33c6b.appspot.com",
  messagingSenderId: "703647517346",
  appId: "1:703647517346:web:198fa2077a51722f1f25fb",
  measurementId: "G-J01SQT9HWG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db=getFirestore(app)
//const analytics = getAnalytics(app);
export const storage = getStorage(app);