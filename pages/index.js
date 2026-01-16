import Head from 'next/head';
import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Home() {
  const [user, setUser] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [userName, setUserName] = useState("お客様");
  const [isAgreed, setIsAgreed] = useState(false); // 🚀 同意状態の追加
  const [loading, setLoading] = useState(true);      // 🚀 読み込み状態の追加

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setIsPaid(data.isPaid || false);
            setUserName(data.name || "お客様"); 
          }
          setLoading(false); // データ取得後に読み込み完了
        });
        return () => unsubscribeDoc();
      } else {
        setLoading(false); // 未ログインでも読み込み完了
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const loginWithLine = () => {
    const clientId = process.env.NEXT_PUBLIC_LINE_CLIENT_ID; // NEXT_PUBLIC_ をつけるのが一般的です
    const redirectUri = encodeURIComponent('https://app.smilooop.com/callback');
    const state = '12345abcde';
    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=profile%20openid%20email`;
    window.location.href = lineAuthUrl;
  };

  const handlePayment = () => {
    if (!user || !isAgreed) return; // 🚀 同意していない場合は実行しない
    const baseStripeUrl = "https://buy.stripe.com/14A28raHs2ppdOXaJi5wI03"; 
    const paymentUrl = new URL(baseStripeUrl);
    paymentUrl.searchParams.set('client_reference_id', user.uid);
    window.location.href = paymentUrl.toString();
  };

  // 🚀 読み込み中の画面表示
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p style={{ color: '#999' }}>読み込み中...</p>
      </div>
    );
  }

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

      <img 
        src="/images/logo.png" 
        alt="Smilooop Logo" 
        style={{ 
          width: '80%', 
          maxWidth: '300px', 
          height: 'auto',
          marginBottom: '20px' 
        }} 
      />
      
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
            こんにちは、{userName}様
          </p>

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
                限定クーポンを利用するには<br />サブスクの申し込みが必要です。
              </p>

              {/* 🚀 規約同意エリア */}
              <div style={{ 
                backgroundColor: '#f9f9f9', 
                padding: '15px', 
                borderRadius: '12px', 
                marginBottom: '20px',
                textAlign: 'left',
                border: '1px solid #eee'
              }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer', fontSize: '13px', lineHeight: '1.6' }}>
                  <input 
                    type="checkbox" 
                    checked={isAgreed} 
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    style={{ marginRight: '10px', marginTop: '3px', width: '18px', height: '18px' }}
                  />
                  <span>
                    <a href="https://smilooop.com/legal/userterms/" target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3', fontWeight: 'bold' }}>会員規約</a>、
                    <a href="https://smilooop.com/legal/privacy/" target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3', fontWeight: 'bold' }}>プライバシーポリシー</a>
                    および
                    <a href="https://smilooop.com/legal/tokusho/" target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3', fontWeight: 'bold' }}>特定商取引法に基づく表記</a>
                    の内容を確認し、これに同意します。
                  </span>
                </label>
              </div>

              <button 
                onClick={handlePayment} 
                disabled={!isAgreed} 
                style={buttonStyle(isAgreed ? '#0070f3' : '#ccc')}
              >
                {isAgreed ? 'プランに申し込む（決済へ）' : '規約に同意して進む'}
              </button>
            </div>
          )}

          <button 
            onClick={() => auth.signOut()}
            style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px', marginTop: '10px' }}
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
  width: '100%',
  transition: 'background-color 0.3s ease'
});