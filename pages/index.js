import { useState, useEffect } from 'react';
import { auth, lineProvider } from '../lib/firebase';
import { signInWithRedirect, getRedirectResult, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. リダイレクトから戻ってきた結果（LINEからの成功情報）があるか確認
        const result = await getRedirectResult(auth);
        
        if (result?.user) {
          // ログイン成功直後なら、即座に会員ページへ
          router.push('/member');
          return;
        }

        // 2. すでにログイン済みか、セッションがあるか確認
        onAuthStateChanged(auth, (user) => {
          if (user) {
            router.push('/member');
          } else {
            // 本当にログインしていない時だけ、ボタンを表示する
            setLoading(false);
          }
        });
      } catch (error) {
        // 🚀 エラーの内容を具体的に画面に表示させる
        console.error("Authエラー詳細:", error);
        setErrorMessage(`【認証エラー】 ${error.code}: ${error.message}`);
        setLoading(false);
      }
    };

    initAuth();
  }, [router]);

  const handleLogin = () => {
    setLoading(true);
    setErrorMessage(""); // 再試行時はエラーを消す
    signInWithRedirect(auth, lineProvider);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
        <p>読み込み中...</p>
        <div style={{ margin: '20px auto', width: '30px', height: '30px', border: '3px solid #ccc', borderTop: '3px solid #06C755', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <img 
        src="/images/logo.png" 
        alt="logo" 
        style={{ width: '80%', maxWidth: '300px', marginBottom: '30px' }} 
      />

      {/* 🚀 エラーが出た場合、ここに赤い枠で表示されます */}
      {errorMessage && (
        <div style={{ 
          backgroundColor: '#fff5f5', 
          color: '#e53e3e', 
          padding: '15px', 
          borderRadius: '8px', 
          border: '1px solid #feb2b2', 
          marginBottom: '20px',
          fontSize: '0.9rem',
          textAlign: 'left',
          wordBreak: 'break-all'
        }}>
          <strong>⚠️ ログインできませんでした</strong><br/>
          {errorMessage}
        </div>
      )}

      <button 
        onClick={handleLogin}
        style={{ 
          backgroundColor: '#06C755', 
          color: 'white', 
          padding: '16px 32px', 
          border: 'none', 
          borderRadius: '8px', 
          fontWeight: 'bold', 
          fontSize: '1rem',
          cursor: 'pointer',
          width: '100%',
          maxWidth: '300px'
        }}
      >
        LINEでログイン
      </button>

      <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '30px' }}>
        ※エラーが続く場合は、ブラウザの「履歴とWebサイトデータを消去」をお試しください。
      </p>
    </div>
  );
}