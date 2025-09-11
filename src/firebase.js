// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // ✅ make sure this line is here!

const firebaseConfig = {
  apiKey: "AIzaSyA6-0mZ0xSU5cjpS4EasefTGfDjOYlrl1M",
  authDomain: "memz-3ce49.firebaseapp.com",
  projectId: "memz-3ce49",
  storageBucket: "memz-3ce49.firebasestorage.app",
  messagingSenderId: "1037129872867",
  appId: "1:1037129872867:web:29c1ec600690fcd9935cd6"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firestore and export it
export const db = getFirestore(app);
