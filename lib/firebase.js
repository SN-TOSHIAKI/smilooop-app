import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  OAuthProvider, 
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

// 初期化（これ自体はサーバーでも動く）
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// 🚀 LINEプロバイダーの設定
const lineProvider = new OAuthProvider('oidc.line');
lineProvider.addScope('profile');
lineProvider.addScope('openid');
// OpenIDの承認がまだなら、一旦emailはコメントアウトしておくとより安全です
// lineProvider.addScope('email'); 

export { auth, lineProvider, db };