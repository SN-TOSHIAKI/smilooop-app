import { useState, useEffect } from 'react';
import { auth, lineProvider, db } from '../lib/firebase';
import { 
  signInWithRedirect, 
  getRedirectResult, // 🚀 これを追加
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function Home() {
  const [user, setUser] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. リダイレクトから戻ってきた結果を確認する
    const checkRedirect = async () => {
      try {
        await getRedirectResult(auth);
      } catch (error) {
        console.error("リダイレクトエラー:", error);
      }
    };
    checkRedirect();

    // 2. ログイン状態の監視
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
          console.error("Firestore確認エラー:", e);
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
    setLoading(true); // 画面が切り替わるまで待機状態にする
    signInWithRedirect(auth, lineProvider);
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload(); // ログアウト後は完全にリセット
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
        <div className="spinner"></div>
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
      <img 
        src="/images/logo.png" 
        alt="Smilooop" 
        style={{ width: '80%', maxWidth: '500px', height: 'auto', display: 'block', margin: '0 auto 20px' }} 
      />

      {!user ? (
        <button 
          onClick={loginWithLine} 
          style={{ backgroundColor: '#06C755', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '5px', fontSize: '1rem', fontWeight: 'bold' }}
        >
          LINEでログイン
        </button>
      ) : (
        <div>
          <p>ようこそ、{user.displayName} さん！</p>
          {isMember ? (
            <div style={{ padding: '20px' }}>
              <h2>🎉 会員認証済み</h2>
              <button 
                onClick={() => window.location.href = '/coupon'}
                style={{ backgroundColor: 'gold', padding: '15px 30px', borderRadius: '10px', fontWeight: 'bold', border: 'none' }}
              >
                クーポン画面を開く
              </button>
            </div>
          ) : (
            <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '10px', margin: '0 20px' }}>
              <p>クーポンを見るには月額会員登録が必要です</p>
              <a 
                href="https://buy.stripe.com/14A28raHs2ppdOXaJi5wI03" 
                style={{ display: 'inline-block', backgroundColor: '#6772E5', color: 'white', padding: '15px 25px', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold' }}
              >
                今すぐ登録 (月額500円)
              </a>
            </div>
          )}
          <button onClick={handleLogout} style={{ marginTop: '50px', background: 'none', border: 'none', textDecoration: 'underline', color: '#666' }}>ログアウト</button>
        </div>
      )}
    </div>
  );
}