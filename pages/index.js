import { useState, useEffect } from 'react';
import { auth, lineProvider, db } from '../lib/firebase';
import { signInWithRedirect, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function Home() {
  const [user, setUser] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Firestoreの記録を確認
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().isPaid) {
            setIsMember(true);
          }
        } catch (error) {
          console.error("Firestore読み込みエラー:", error);
        }
      }
      
      setLoading(false); // 判定が終わったらローディング解除
    });
    
    return () => unsubscribe();
  }, []);

  // LINEログイン実行関数（スマホ・LINEブラウザ対応）
  const loginWithLine = () => {
    signInWithRedirect(auth, lineProvider);
  };

  // ログアウト関数
  const handleLogout = () => {
    signOut(auth);
    setIsMember(false);
    setUser(null);
  };

  // 読み込み中の画面
  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
        <p>ログイン確認中...</p>
      </div>
    );
  }

  // メイン画面
  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
      
      {/* ロゴ画像 */}
      <img 
        src="/images/logo.png" 
        alt="Smilooop" 
        style={{ 
          width: '80%', 
          maxWidth: '500px', 
          height: 'auto', 
          display: 'block',
          margin: '0 auto 20px', 
        }} 
      />

      {!user ? (
        // 未ログイン時
        <button 
          onClick={loginWithLine} 
          style={{ backgroundColor: '#06C755', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '5px', fontSize: '1rem', cursor: 'pointer' }}
        >
          LINEでログイン
        </button>
      ) : (
        // ログイン済み
        <div>
          <p>ようこそ、{user.displayName} さん！</p>
          
          {isMember ? (
            // 会員限定画面
            <div style={{ padding: '20px' }}>
              <h2>🎉 会員認証済み</h2>
              <p>クーポンを表示します...</p>
              <button 
                onClick={() => window.location.href = '/coupon'}
                style={{ backgroundColor: 'gold', padding: '15px 30px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
              >
                クーポン画面を開く
              </button>
            </div>
          ) : (
            // 未払いユーザー画面
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

          <button 
            onClick={handleLogout} 
            style={{ marginTop: '50px', background: 'none', border: 'none', textDecoration: 'underline', color: '#666', cursor: 'pointer' }}
          >
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
}