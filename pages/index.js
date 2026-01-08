import { useState, useEffect } from 'react';
import { auth, lineProvider } from '../lib/firebase';
import { signInWithRedirect, getRedirectResult, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1. まずリダイレクトから戻ってきた結果（成功情報）があるか確認
        const result = await getRedirectResult(auth);
        if (result?.user) {
          router.push('/member');
          return;
        }

        // 2. すでにログイン済みか確認
        onAuthStateChanged(auth, (user) => {
          if (user) {
            router.push('/member');
          } else {
            setLoading(false);
          }
        });
      } catch (error) {
        console.error("認証エラー:", error);
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogin = () => {
    setLoading(true);
    signInWithRedirect(auth, lineProvider);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
      <img src="/images/logo.png" style={{ width: '80%', maxWidth: '400px', marginBottom: '30px' }} alt="logo" />
      <button 
        onClick={handleLogin}
        style={{ backgroundColor: '#06C755', color: 'white', padding: '16px 32px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
      >
        LINEでログイン
      </button>
      <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '20px' }}>
        ※ログインできない場合はSafariの「サイト越えトラッキングを防ぐ」をオフにしてください
      </p>
    </div>
  );
}