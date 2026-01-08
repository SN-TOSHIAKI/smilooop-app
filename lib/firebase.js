import { initializeApp, getApps } from "firebase/app";
import { getAuth, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDMgGreK_ftK1PSfO8yowNIGXuNExHglSg",
  authDomain: "smilooop-app.firebaseapp.com",
  projectId: "smilooop-app",
  storageBucket: "smilooop-app.firebasestorage.app",
  messagingSenderId: "125183663318",
  appId: "1:125183663318:web:5e029c41df358db11afd77",
  measurementId: "G-JQXW1NYNWY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🚀 これを追加！ログイン情報を「ブラウザを閉じても残る場所」に強制保存します
setPersistence(auth, browserLocalPersistence); 

const lineProvider = new LineAuthProvider();
const db = getFirestore(app);

export { auth, lineProvider, db };