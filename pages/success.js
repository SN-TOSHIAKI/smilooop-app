import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';

export default function Success() {
  const [status, setStatus] = useState('会員情報を更新中...');
  const router = useRouter();

  useEffect(() => {
    // ログイン状態を確認
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Firestoreの isPaid を true に更新
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            isPaid: true
          });
          setStatus('会員登録が完了しました！クーポン画面へ移動します。');
          
          // 3秒後に自動でトップ（またはクーポンページ）へ移動
          setTimeout(() => {
            router.push('/');
          }, 3000);
        } catch (error) {
          console.error("更新エラー:", error);
          setStatus('エラーが発生しました。トップページから再度お試しください。');
        }
      } else {
        setStatus('ログインが確認できません。ログインしてから再度アクセスしてください。');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
      <div style={{ fontSize: '50px' }}>✅</div>
      <h2>決済ありがとうございます！</h2>
      <p>{status}</p>
      
      <button 
        onClick={() => router.push('/')}
        style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
      >
        トップページへ戻る
      </button>
    </div>
  );
}