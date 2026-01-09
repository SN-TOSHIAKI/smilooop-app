'use client';
import { auth, lineProvider } from '../lib/firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ログイン状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ログイン処理（ポップアップ方式）
  const login = async () => {
    try {
      await signInWithPopup(auth, lineProvider);
    } catch (error) {
      alert("ログインエラー: " + error.message);
      console.error(error);
    }
  };

  // ログアウト処理
  const logout = () => signOut(auth);

  if (loading) return <div style={{ padding: '20px' }}>読み込み中...</div>;

  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>LINEログイン テスト</h1>
      
      {!user ? (
        <div>
          <p>まだログインしていません</p>
          <button onClick={login} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#00B900', color: '#fff', border: 'none', borderRadius: '5px' }}>
            LINEでログイン
          </button>
        </div>
      ) : (
        <div>
          <p>🎉 ログイン成功！</p>
          <p>表示名: <strong>{user.displayName}</strong></p>
          <p>ユーザーID(UID): <code>{user.uid}</code></p>
          <button onClick={logout} style={{ marginTop: '20px' }}>ログアウト</button>
        </div>
      )}

      <hr style={{ margin: '40px 0' }} />
      <p style={{ fontSize: '12px', color: '#666' }}>
        現在のドメイン: {typeof window !== 'undefined' ? window.location.hostname : ''}
      </p>
    </div>
  );
}