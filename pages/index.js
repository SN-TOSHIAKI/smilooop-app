import { useState, useEffect } from 'react';
import { auth, lineProvider, db } from '../lib/firebase';
import { 
  signInWithRedirect, 
  getRedirectResult, 
  onAuthStateChanged, 
  signOut,
  setPersistence,
  browserSessionPersistence 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function Home() {
  const [user, setUser] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. 永続性を強化（ブラウザがログイン情報を捨てないようにする）
        await setPersistence(auth, browserSessionPersistence);
        
        // 2. リダイレクトから戻ってきた結果を処理
        // ここでエラーが出ても、onAuthStateChangedが後で拾ってくれるので続行させる
        await getRedirectResult(auth);
      } catch (error) {
        console.error("Auth初期化中のエラー:", error);
      }
    };

    initAuth();

    // 3. ログイン状態の監視
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().isPaid) {
            setIsMember(true);
          }
        } catch (e) {
          console.error("Firestore読み込み失敗:", e);
        }
      } else {
        setUser(null);
        setIsMember(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithLine = () => {
    setLoading(true);
    signInWithRedirect(auth, lineProvider);
  };

  const handleLogout = async () => {
    await signOut(auth);
    // 完全にリセットするためにページを再読み込み
    window.location.reload();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
        <p>ログイン確認中...</p>
        <div style={{ margin: '20px auto', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #06C755', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif', padding: '0 20px' }}>
      
      {/* ロゴ画像 */}
      <img 
        src="/images/logo.png" 
        alt="Smilooop" 
        style={{ width: '80%', maxWidth: '400px', height: 'auto', display: 'block', margin: '0 auto 20px' }} 
      />

      {!user ? (
        // 未ログイン状態
        <div>
          <button 
            onClick={loginWithLine} 
            style={{ backgroundColor: '#06C755', color: 'white', padding: '16px 32px', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
          >
            LINEでログイン
          </button>
          <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '20px' }}>
            ※ログイン画面が繰り返される場合は、Safariの「設定」から<br/>「サイト越えトラッキングを防ぐ」をオフにしてください。
          </p>
        </div>
      ) : (
        // ログイン完了状態
        <div>
          <p style={{ fontSize: '1.2rem' }}>ようこそ、<strong>{user.displayName}</strong> さん！</p>
          
          {isMember ? (
            <div style={{ padding: '30px', backgroundColor: '#fff9e6', borderRadius: '15px', border: '2px solid gold', marginTop: '20px' }}>
              <h2 style={{ color: '#d4af37' }}>🎉 会員認証済み</h2>
              <p>限定クーポンが利用可能です</p>
              <button 
                onClick={() => window.location.href = '/coupon'}
                style={{ backgroundColor: 'gold', color: '#333', padding: '15px 30px', borderRadius: '10px', fontWeight: 'bold', border: 'none', fontSize: '1.1rem', cursor: 'pointer' }}
              >
                クーポン画面を開く
              </button>
            </div>
          ) : (
            <div style={{ padding: '30px', border: '1px solid #ddd', borderRadius: '15px', marginTop: '20px' }}>
              <p>クーポンを見るには月額会員登録が必要です</p>
              <a 
                href="https://buy.stripe.com/14A28raHs2ppdOXaJi5wI03" 
                style={{ display: 'inline-block', backgroundColor: '#6772E5', color: 'white', padding: '16px 32px', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem' }}
              >
                今すぐ登録 (月額500円)
              </a>
            </div>
          )}

          <button 
            onClick={handleLogout} 
            style={{ marginTop: '60px', background: 'none', border: 'none', textDecoration: 'underline', color: '#999', cursor: 'pointer' }}
          >
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
}