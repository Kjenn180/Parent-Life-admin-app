import Constants from "expo-constants";
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";



const extra = Constants.expoConfig?.extra as any;

const firebaseConfig = {
  apiKey: extra.firebaseApiKey,
  authDomain: extra.firebaseAuthDomain,
  projectId: extra.firebaseProjectId,
  storageBucket: extra.firebaseStorageBucket,
  messagingSenderId: extra.firebaseMessagingSenderId,
  appId: extra.firebaseAppId,
};
// console.log("FIREBASE DEBUG apiKey:", extra?.firebaseApiKey);
// console.log("FIREBASE DEBUG authDomain:", extra?.firebaseAuthDomain);
// console.log("FIREBASE DEBUG projectId:", extra?.firebaseProjectId);
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  
