import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  LineAuthProvider, 
  setPersistence, 
  browserLocalPersistence 
} from "firebase/auth"; // 🚀 ここに必要な機能を追加しました
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

// 二重初期化を防ぐ書き方
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// 🚀 永続性の設定（これでログイン状態が維持されやすくなります）
setPersistence(auth, browserLocalPersistence); 

// 🚀 LINEログイン用のプロバイダー設定
const lineProvider = new LineAuthProvider();
// メールアドレスを確実に取得するための設定を追加
lineProvider.addScope('profile');
lineProvider.addScope('openid');
lineProvider.addScope('email');

const db = getFirestore(app);

export { auth, lineProvider, db };