import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  OAuthProvider, // LineAuthProviderの代わりにこちらを使用
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

// アプリの初期化
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// ログイン状態の維持設定
setPersistence(auth, browserLocalPersistence); 

// 🚀 LINEログイン用の設定（OAuthProviderを使用）
const lineProvider = new OAuthProvider('oidc.line');
lineProvider.addScope('profile');
lineProvider.addScope('openid');
lineProvider.addScope('email');

const db = getFirestore(app);

export { auth, lineProvider, db };