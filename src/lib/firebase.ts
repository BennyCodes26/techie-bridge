
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDNmF_6MUmqQ0qZ9LGe7CHd109KwDwELAI",
  authDomain: "fixify-app.firebaseapp.com",
  projectId: "fixify-app",
  storageBucket: "fixify-app.appspot.com",
  messagingSenderId: "844365714618",
  appId: "1:844365714618:web:e04f7d7cbcc68111b4b938",
  measurementId: "G-L3JDL6N9YQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, storage, googleProvider };
export default app;
