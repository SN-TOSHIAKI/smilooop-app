import { useState, useEffect } from 'react';
import { auth, lineProvider } from '../lib/firebase';
import { signInWithRedirect, getRedirectResult, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. まずリダイレクトから戻ってきた「結果」を待つ
        const result = await getRedirectResult(auth);
        
        if (result?.user) {
          // ログイン成功直後なら、即座にmemberページへ
          router.push('/member');
          return;
        }

        // 2. すでにログインセッションがあるか確認
        onAuthStateChanged(auth, (user) => {
          if (user) {
            router.push('/member');
          } else {
            // 本当にログインしていない時だけ、ボタンを表示する
            setLoading(false);
          }
        });
      } catch (error) {
        console.error("認証エラー:", error);
        setLoading(false);
      }
    };

    initAuth();
  }, [router]);

  const handleLogin = () => {
    setLoading(true);
    signInWithRedirect(auth, lineProvider);
  };

  // 読み込み中（または転送中）は何も出さない、もしくは「確認中」と出す
  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
        <p>ログイン情報を確認しています...</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
      <img src="/images/logo.png" style={{ width: '80%', maxWidth: '400px', marginBottom: '30px' }} alt="logo" />
      <button 
        onClick={handleLogin}
        style={{ backgroundColor: '#06C755', color: 'white', padding: '16px 32px', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem' }}
      >
        LINEでログイン
      </button>
    </div>
  );
}