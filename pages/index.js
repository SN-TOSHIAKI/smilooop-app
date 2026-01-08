import { useState, useEffect } from 'react';
import { auth, lineProvider, db } from '../lib/firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Home() {
  const [user, setUser] = useState(null);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Firebaseのデータベースに「支払い済み」の記録があるか確認
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().isPaid) {
          setIsMember(true);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const loginWithLine = () => signInWithPopup(auth, lineProvider);
  const handleLogout = () => { signOut(auth); setIsMember(false); };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
      
      {/* ロゴ画像に変更 */}
      <img 
        src="/images/logo.png" 
        alt="Smilooop" 
        style={{ 
          width: '80%', 
          maxWidth: '500px', 
          height: 'auto', 
          display: 'block',      // ブロック要素にして横並びを禁止する
          margin: '0 auto 20px', // 上下中央に配置し、下に20pxの余白を作る 
        }} 
      />
      {!user ? (
        <button onClick={loginWithLine} style={{ backgroundColor: '#06C755', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '5px' }}>
          LINEでログイン
        </button>
      ) : (
        <div>
          <p>ようこそ、{user.displayName} さん！</p>
          
          {isMember ? (
            // 【会員限定画面】
            <div style={{ padding: '20px' }}>
    <h2>🎉 会員認証済み</h2>
    <p>クーポンを表示します...</p>
    <button 
      onClick={() => window.location.href = '/coupon'}
      style={{ backgroundColor: 'gold', padding: '15px 30px', borderRadius: '10px', fontWeight: 'bold' }}
    >
      クーポン画面を開く
    </button>
  </div>
          ) : (
            // 【未払い画面】
            <div style={{ padding: '20px', border: '1px solid #ddd' }}>
              <p>クーポンを見るには月額会員登録が必要です</p>
              <a href="https://buy.stripe.com/14A28raHs2ppdOXaJi5wI03" style={{ backgroundColor: '#6772E5', color: 'white', padding: '10px 20px', textDecoration: 'none', borderRadius: '5px' }}>
                今すぐ登録 (月額500円)
              </a>
            </div>
          )}
          <button onClick={handleLogout} style={{ marginTop: '50px', background: 'none', border: 'none', textDecoration: 'underline' }}>ログアウト</button>
        </div>
      )}
    </div>
  );
}