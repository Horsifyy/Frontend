import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDy9tvMGcn5b5vA5fHNAF4ABrQXOniHSdA",
  projectId: "horsifyapp",
  storageBucket: "horsifyapp.firebasestorage.app",
  appId: "1:1091505035748:android:5d7596e01e07bde9c0cff1",
  messagingSenderId: "1091505035748",
};

// Initialize Firebase if no apps are initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Get the default app instance
const app = firebase.app();

export { app, auth, firestore };