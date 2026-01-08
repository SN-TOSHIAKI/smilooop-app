import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore'; // onSnapshotに変更
import { useRouter } from 'next/router';

export default function Success() {
  const [status, setStatus] = useState('お支払いを処理中です。少々お待ちください...');
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 🚀 ここがポイント：データの変化を「リアルタイムに監視」する
        const userRef = doc(db, 'users', user.uid);
        const unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists() && docSnap.data().isPaid === true) {
            // Webhookによってデータが true になった瞬間を検知！
            setStatus('会員登録が完了しました！自動でトップへ戻ります。');
            setTimeout(() => {
              router.push('/');
            }, 2000);
          }
        });

        return () => unsubscribeDoc();
      } else {
        setStatus('ログインが確認できません。');
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
      <div style={{ fontSize: '50px' }}>🎉</div>
      <h2>決済ありがとうございます！</h2>
      <p style={{ color: '#666', fontSize: '1.1rem' }}>{status}</p>
      
      <button 
        onClick={() => router.push('/')}
        style={{ 
          marginTop: '30px', 
          padding: '12px 24px', 
          backgroundColor: '#0070f3', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer' 
        }}
      >
        トップページへ戻る
      </button>
    </div>
  );
}