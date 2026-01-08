import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';

export default function Member() {
  const [user, setUser] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        // 🚀 ログインしてなければログインページへ戻す
        router.push('/');
        return;
      }
      setUser(currentUser);

      // 支払いチェック
      const docRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().isPaid) {
        setIsPaid(true);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>会員情報確認中...</div>;

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
      <p>ようこそ、{user?.displayName} さん！</p>
      {isPaid ? (
        <div style={{ padding: '30px', border: '2px solid gold', borderRadius: '15px' }}>
          <h2>🎉 会員認証済み</h2>
          <button onClick={() => window.location.href = '/coupon'} style={{ backgroundColor: 'gold', padding: '15px 30px', borderRadius: '10px' }}>
            クーポンを表示
          </button>
        </div>
      ) : (
        <div style={{ padding: '30px', border: '1px solid #ddd', borderRadius: '15px' }}>
          <p>月額会員登録が必要です</p>
          <a href="https://buy.stripe.com/14A28raHs2ppdOXaJi5wI03" style={{ backgroundColor: '#6772E5', color: 'white', padding: '15px 30px', textDecoration: 'none', borderRadius: '8px' }}>
            今すぐ登録
          </a>
        </div>
      )}
      <button onClick={() => signOut(auth)} style={{ marginTop: '50px', background: 'none', border: 'none', textDecoration: 'underline' }}>ログアウト</button>
    </div>
  );
}