import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyDfQQG-IY41ytk9ltJeu7UnByzuBJJX_e4',
  authDomain: 'motogp-rpg.firebaseapp.com',
  projectId: 'motogp-rpg',
  storageBucket: 'motogp-rpg.firebasestorage.app',
  messagingSenderId: '407306527269',
  appId: '1:407306527269:web:27896c0776426efcb3d5cc',
  measurementId: 'G-KF5EYGPW72',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

isSupported().then(supported => {
  if (supported) getAnalytics(app);
}).catch(() => {});
