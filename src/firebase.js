import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDK7L79hoO0h1KJpOXGw7auzZ6k_-myjn4",
    authDomain: "jeeapp-7262d.firebaseapp.com",
    projectId: "jeeapp-7262d",
    storageBucket: "jeeapp-7262d.firebasestorage.app",
    messagingSenderId: "482161317861",
    appId: "1:482161317861:web:81b943a8cf3a3d733b810c",
    measurementId: "G-ZLTJ57FFLH"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
