import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// Firebase config
const firebaseConfig = {
  apiKey:
    Constants.expoConfig?.extra?.firebaseApiKey || process.env.FIREBASE_API_KEY,
  authDomain: "instalingo-434320.firebaseapp.com",
  projectId: "instalingo-434320",
  storageBucket: "instalingo-434320.appspot.com",
  messagingSenderId: "495756842233",
  appId:
    Constants.expoConfig?.extra?.firebaseAppId || process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// console.log("Firebase config:", firebaseConfig);

export { auth };
