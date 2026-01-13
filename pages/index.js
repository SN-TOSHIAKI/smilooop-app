'use client';
import { auth, lineProvider } from '../lib/firebase';
import { 
  signInWithRedirect, 
  getRedirectResult, 
  onAuthStateChanged 
} from 'firebase/auth';
import { useEffect, useState } from 'react';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. リダイレクトから戻ってきた結果を確認
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log("ログイン成功:", result.user);
        }
      })
      .catch((error) => {
        console.error("リダイレクトエラー:", error);
      });

    // 2. ログイン状態の監視
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithRedirect(auth, lineProvider);
    } catch (error) {
      alert("ログイン開始エラー: " + error.code);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>アプリを起動中...</div>;

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>LINEログイン テスト</h1>
      {!user ? (
        <button onClick={login} style={{ padding: '10px 20px', backgroundColor: '#00B900', color: '#fff' }}>
          LINEでログイン
        </button>
      ) : (
        <div>
          <p>こんにちは、{user.displayName}さん</p>
          <button onClick={() => auth.signOut()}>ログアウト</button>
        </div>
      )}
    </div>
  );
}