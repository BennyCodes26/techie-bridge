
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgEpKKC1C3IBaYkpBSdWHAn62OJDCOYw8",
  authDomain: "fixifytest-437b6.firebaseapp.com",
  projectId: "fixifytest-437b6",
  storageBucket: "fixifytest-437b6.firebasestorage.app",
  messagingSenderId: "999996118740",
  appId: "1:999996118740:web:627f8ffd2b745995214d41",
  measurementId: "G-4FVG5X96C3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, storage, googleProvider };
export default app;
