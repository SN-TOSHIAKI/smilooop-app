import { initializeApp, getApps } from "firebase/app";
import { getAuth, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDMgGreK_ftK1PSfO8yowNIGXuNExHglSg",
  authDomain: "smilooop-app.vercel.app",
  projectId: "smilooop-app",
  storageBucket: "smilooop-app.firebasestorage.app",
  messagingSenderId: "125183663318",
  appId: "1:125183663318:web:5e029c41df358db11afd77",
  measurementId: "G-JQXW1NYNWY"
};

// 初期化
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app); // ←これを追加
const lineProvider = new OAuthProvider('oidc.line');

export { auth, lineProvider, db }; // ← db を追加