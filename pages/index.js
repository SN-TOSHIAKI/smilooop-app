import Head from 'next/head';
import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase'; // dbを追加
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore'; // リアルタイム監視用

export default function Home() {
  const [user, setUser] = useState(null);
  const [isPaid, setIsPaid] = useState(false); // 支払い状態を管理

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // 🚀 ログインしている場合、Firestoreの支払い状態をリアルタイム監視
        const userRef = doc(db, 'users', currentUser.uid);
        const unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setIsPaid(docSnap.data().isPaid || false);
          }
        });
        return () => unsubscribeDoc();
      } else {
        setIsPaid(false);
      }
    });

    return () => unsubscribeAuth();
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
    const baseStripeUrl = "https://buy.stripe.com/14A28raHs2ppdOXaJi5wI03"; 
    const paymentUrl = new URL(baseStripeUrl);
    paymentUrl.searchParams.set('client_reference_id', user.uid);
    window.location.href = paymentUrl.toString();
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      fontFamily: 'sans-serif',
      padding: '20px'
    }}>
      <Head>
        <title>Smilooop</title>
      </Head>

      <h1 style={{ marginBottom: '10px' }}>Smilooop</h1>
      
      {!user ? (
        <>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            新しいアプリケーションへようこそ
          </p>
          <button onClick={loginWithLine} style={buttonStyle('#06C755')}>
            LINEでログイン
          </button>
        </>
      ) : (
        <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            こんにちは、{user.displayName || 'ユーザー'}様
          </p>

          {/* 🚀 支払い状態による表示の切り分け */}
          {isPaid ? (
            <div style={{ 
              padding: '30px 20px', 
              border: '3px gold solid', 
              borderRadius: '20px', 
              backgroundColor: '#fffbe6',
              boxShadow: '0 4px 15px rgba(212, 160, 23, 0.2)',
              marginBottom: '30px'
            }}>
              <h2 style={{ color: '#d4a017', margin: '0 0 10px 0' }}>🎁 会員限定特典 🎁</h2>
              <p style={{ fontSize: '14px', color: '#856404' }}>いつもご利用ありがとうございます！</p>
              <hr style={{ border: '0', borderTop: '1px dashed #d4a017', margin: '15px 0' }} />
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>クーポンコード</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', margin: '0' }}>SMILE2026</p>
              <p style={{ fontSize: '11px', color: '#999', marginTop: '15px' }}>※お会計時にこの画面を提示してください</p>
            </div>
          ) : (
            <div style={{ marginBottom: '30px' }}>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                限定クーポンを利用するには<br />プランへの申し込みが必要です。
              </p>
              <button onClick={handlePayment} style={buttonStyle('#0070f3')}>
                プランに申し込む（決済へ）
              </button>
            </div>
          )}

          <button 
            onClick={() => auth.signOut()}
            style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' }}
          >
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
}

const buttonStyle = (bgColor) => ({
  backgroundColor: bgColor,
  color: 'white',
  padding: '16px 32px',
  border: 'none',
  borderRadius: '15px',
  fontSize: '18px',
  cursor: 'pointer',
  fontWeight: 'bold',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  width: '100%'
});