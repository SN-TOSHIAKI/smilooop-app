import Head from 'next/head';
import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

// 🚀 切り分けた部品をインポート
import Coupon from '../components/Coupon';
import Subscription from '../components/Subscription';
import { buttonStyle } from '../components/styles';

export default function Home() {
  const [user, setUser] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [userName, setUserName] = useState("お客様");
  const [isAgreed, setIsAgreed] = useState(false);
  const [loading, setLoading] = useState(true);

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
          setLoading(false);
        });
        return () => unsubscribeDoc();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const loginWithLine = () => {
    const clientId = process.env.NEXT_PUBLIC_LINE_CLIENT_ID;
    const redirectUri = encodeURIComponent('https://app.smilooop.com/callback');
    const state = '12345abcde';
    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=profile%20openid%20email`;
    window.location.href = lineAuthUrl;
  };

  const handlePayment = () => {
    if (!user || !isAgreed) return;
    const baseStripeUrl = "https://buy.stripe.com/14A28raHs2ppdOXaJi5wI03"; 
    const paymentUrl = new URL(baseStripeUrl);
    paymentUrl.searchParams.set('client_reference_id', user.uid);
    window.location.href = paymentUrl.toString();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p style={{ color: '#999' }}>読み込み中...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', 
      justifyContent: 'center', minHeight: '100vh', padding: '20px'
    }}>
      <Head><title>Smilooop</title></Head>

      <img src="/images/logo.png" alt="Smilooop Logo" style={{ width: '80%', maxWidth: '300px', marginBottom: '20px' }} />
      
      {!user ? (
        <>
          <p style={{ color: '#666', marginBottom: '30px' }}>新しいアプリケーションへようこそ</p>
          <button onClick={loginWithLine} style={buttonStyle('#06C755')}>LINEでログイン</button>
        </>
      ) : (
        <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <p style={{ color: '#666', marginBottom: '20px' }}>こんにちは、{userName}様</p>

          {/* 🚀 条件分岐でコンポーネントを出し分け */}
          {isPaid ? (
            <Coupon />
          ) : (
            <Subscription 
              isAgreed={isAgreed} 
              setIsAgreed={setIsAgreed} 
              onPayment={handlePayment} 
            />
          )}

          <button onClick={() => auth.signOut()} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px', marginTop: '10px' }}>
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
}