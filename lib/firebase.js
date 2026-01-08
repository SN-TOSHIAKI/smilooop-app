import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  OAuthProvider, 
  setPersistence, 
  browserLocalPersistence 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDMgGreK_ftK1PSfO8yowNIGXuNExHglSg",
  authDomain: "smilooop-app.firebaseapp.com",
  projectId: "smilooop-app",
  storageBucket: "smilooop-app.firebasestorage.app",
  messagingSenderId: "125183663318",
  appId: "1:125183663318:web:5e029c41df358db11afd77",
  measurementId: "G-JQXW1NYNWY"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// サーバーサイドでのエラーを防ぐためのガード
if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence);
}

// 🚀 エラーの元になる 'LineAuthProvider' は使わず、汎用的な 'OAuthProvider' を使う
const lineProvider = new OAuthProvider('oidc.line');
lineProvider.addScope('profile');
lineProvider.addScope('openid');
lineProvider.addScope('email');

const db = getFirestore(app);

export { auth, lineProvider, db };