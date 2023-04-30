// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA3dnNt6qJ1-slp0U9jS7XzRbHWcsoEBJM",
  authDomain: "werdell-42cb7.firebaseapp.com",
  projectId: "werdell-42cb7",
  storageBucket: "werdell-42cb7.appspot.com",
  messagingSenderId: "718335020950",
  appId: "1:718335020950:web:50bea7c0330654760357b7",
  measurementId: "G-4RFD7PFYHQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
