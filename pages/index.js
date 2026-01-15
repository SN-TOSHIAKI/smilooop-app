import Head from 'next/head';
import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function Home() {
  const [user, setUser] = useState(null);

  // ログイン状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // LINE認証画面へリダイレクト
  const loginWithLine = () => {
    const clientId = process.env.LINE_CLIENT_ID; 
    const redirectUri = encodeURIComponent('https://app.smilooop.com/callback');
    const state = '12345abcde';
    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=profile%20openid%20email`;
    window.location.href = lineAuthUrl;
  };

  // Stripe決済画面へリダイレクト
  const handlePayment = () => {
    if (!user) return;
    
    // 🚀 あなたのStripe支払いリンクをここに貼ってください
    // 末尾に client_reference_id をつけることで、メールアドレスが違っても紐付け可能になります
    const stripePaymentUrl = `https://buy.stripe.com/test_xxxxxx?client_reference_id=${user.uid}`;
    
    window.location.href = stripePaymentUrl;
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      fontFamily: 'sans-serif' 
    }}>
      <Head>
        <title>Smilooop</title>
      </Head>

      <h1 style={{ marginBottom: '10px' }}>Smilooop</h1>
      
      {!user ? (
        <>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            sアプリケーションへようこそ
          </p>
          <button 
            onClick={loginWithLine}
            style={buttonStyle('#06C755')}
          >
            LINEでログイン
          </button>
        </>
      ) : (
        <>
          <p style={{ color: '#666', marginBottom: '10px' }}>
            ログインしました：{user.displayName || 'ユーザー'}様
          </p>
          <p style={{ color: '#666', marginBottom: '30px', fontSize: '14px' }}>
            サービスを利用するにはプランにお申し込みください。
          </p>
          <button 
            onClick={handlePayment}
            style={buttonStyle('#0070f3')}
          >
            プランに申し込む（決済へ）
          </button>
          <button 
            onClick={() => auth.signOut()}
            style={{ marginTop: '20px', background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', textDecoration: 'underline' }}
          >
            ログアウト
          </button>
        </>
      )}

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#ccc' }}>
        {!user ? 'Step 1: ユーザー認証を開始します' : 'Step 2: 決済を完了させてください'}
      </div>
    </div>
  );
}

// ボタンの共通スタイル
const buttonStyle = (bgColor) => ({
  backgroundColor: bgColor,
  color: 'white',
  padding: '14px 28px',
  border: 'none',
  borderRadius: '12px',
  fontSize: '18px',
  cursor: 'pointer',
  fontWeight: 'bold',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  transition: 'transform 0.1s'
});