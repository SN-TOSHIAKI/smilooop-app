import Head from 'next/head';
import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

// スタイルとコンポーネントをインポート
import styles from '../styles/Home.module.css';
import Coupon from '../components/Coupon';
import Subscription from '../components/Subscription';

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
    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=12345abcde&scope=profile%20openid%20email`;
    window.location.href = lineAuthUrl;
  };

  const handlePayment = () => {
    if (!user || !isAgreed) return;
    const paymentUrl = new URL("https://buy.stripe.com/14A28raHs2ppdOXaJi5wI03");
    paymentUrl.searchParams.set('client_reference_id', user.uid);
    window.location.href = paymentUrl.toString();
  };

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <p style={{ color: '#999' }}>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className={styles.mainContainer}>
      <Head><title>地域のお店とお客様をつなぐ　smilooop</title></Head>

      {/* 🚀 1. ロゴ：ログイン前、または支払い済みの時だけ表示する */}
      {!user && (
        <img src="/images/login-header.png" alt="さあ、はじめよう！Smilooop" className={styles.logo} />
      )}
      
      {!user ? (
        <>
          <p className={styles.welcomeText}>ようこそアプリケーションへ</p>
          <p className={styles.welcomeText}>まずはLINEでログインしてください。</p>
          <button onClick={loginWithLine} className={styles.lineButton}>LINEでログイン</button>
        </>
      ) : (
        <div style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}>
          
          {/* 🚀 2. 名前：支払い済みの時（クーポン画面）だけ表示する */}
          {isPaid && (
            <p className={styles.userName}>こんにちは、{userName}様</p>
          )}

          {isPaid ? (
            <Coupon />
          ) : (
            <Subscription 
              userName={userName} // 🚀 Subscription.js 内で名前を表示するために渡す
              isAgreed={isAgreed} 
              setIsAgreed={setIsAgreed} 
              onPayment={handlePayment} 
              onLogout={() => auth.signOut()} // 必要であればログアウトも渡す
            />
          )}

          {/* クーポン画面（isPaid）の時だけ、外側にログアウトボタンを置く */}
          {isPaid && (
            <button onClick={() => auth.signOut()} className={styles.logoutButton}>
              ログアウト
            </button>
          )}
        </div>
      )}
    </div>
  );
}