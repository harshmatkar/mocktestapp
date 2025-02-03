
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Firestore
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDK7L79hoO0h1KJpOXGw7auzZ6k_-myjn4",
    authDomain: "jeeapp-7262d.firebaseapp.com",
    projectId: "jeeapp-7262d",
    storageBucket: "jeeapp-7262d.firebasestorage.app",
    messagingSenderId: "482161317861",
    appId: "1:482161317861:web:81b943a8cf3a3d733b810c",
    measurementId: "G-ZLTJ57FFLH"
  };


  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();
  const db = getFirestore(app); // Initialize Firestore
  
  export { auth, googleProvider, db }; // Export Firestore
