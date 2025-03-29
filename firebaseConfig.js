// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "apikey
    ",
  authDomain: "email-end-to-end-encryption.firebaseapp.com",
  projectId: "email-end-to-end-encryption",
  storageBucket: "email-end-to-end-encryption.firebasestorage.app",
  messagingSenderId: "....",
  appId: "....",
  measurementId: "....."
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider, signInWithPopup, signOut };
