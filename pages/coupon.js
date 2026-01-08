import React, { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase'; // Firebaseをインポート
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function CouponPage() {
  const [lastUsedAt, setLastUsedAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [nowTime, setNowTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Firebaseのログイン状態を監視
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          // Firestoreから最後にクーポンを使った時間を取得
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().lastUsedAt) {
            setLastUsedAt(docSnap.data().lastUsedAt);
          }
        } catch (e) {
          console.error("データ取得エラー:", e);
        }
      }
      setIsLoading(false);
    });

    const clockTimer = setInterval(() => setNowTime(new Date()), 1000);
    return () => {
      unsubscribe();
      clearInterval(clockTimer);
    };
  }, []);

  // カウントダウン処理（1時間 = 3600秒）
  useEffect(() => {
    const countdownTimer = setInterval(() => {
      if (!lastUsedAt) return;
      const now = new Date();
      const lastUsed = new Date(lastUsedAt);
      const diffInSeconds = Math.floor((now.getTime() - lastUsed.getTime()) / 1000);
      const oneHour = 3600;
      if (diffInSeconds < oneHour) {
        setTimeLeft(oneHour - diffInSeconds);
      } else {
        setTimeLeft(0);
      }
    }, 1000);
    return () => clearInterval(countdownTimer);
  }, [lastUsedAt]);

  const handleUseCoupon = async () => {
    const confirmUse = confirm("店員さんに提示してください。\nOKを押すと使用済み画面に切り替わります。");
    if (!confirmUse) return;

    const now = new Date().toISOString();
    setLastUsedAt(now);

    if (user) {
      try {
        // Firestoreの利用時間を更新
        const docRef = doc(db, "users", user.uid);
        await updateDoc(docRef, { lastUsedAt: now });
      } catch (e) {
        console.error("DB更新失敗:", e);
      }
    }
  };

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>読み込み中...</div>;
  if (!user) return <div style={{ textAlign: 'center', marginTop: '50px' }}>ログインが必要です</div>;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = nowTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div style={{ 
      width: '100%', maxWidth: '500px', margin: '0 auto', height: '100dvh', 
      display: 'flex', flexDirection: 'column', backgroundColor: '#fff', fontFamily: 'sans-serif', overflow: 'hidden' 
    }}>
      
      <div style={{ flex: 1, width: '100%', overflow: 'hidden' }}>
        <img 
          src="/images/10off.jpg" 
          alt="Coupon" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} 
        />
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#fff', boxShadow: '0 -5px 15px rgba(0,0,0,0.05)', zIndex: 10 }}>
        
        {timeLeft > 0 ? (
          /* --- 【使用済み：180度回転エリア】 --- */
          <div style={{ 
            transform: 'rotate(180deg)', 
            backgroundColor: '#fff', 
            border: '4px solid #e60012', 
            padding: '15px', 
            borderRadius: '20px', 
            textAlign: 'center' 
          }}>
            {/* カウントダウンを回転エリアの上部（相手から見て手前）に配置 */}
            <p style={{ color: '#666', fontSize: '14px', margin: '0 0 10px 0', fontWeight: 'bold' }}>
              再利用まで あと {minutes}分 {seconds}秒
            </p>
            
            <p style={{ color: '#e60012', fontWeight: 'bold', fontSize: '18px', margin: '0' }}>店員様確認用画面</p>
            <h2 style={{ fontSize: '32px', margin: '5px 0', color: '#333' }}>10% OFF</h2>
            
            <div style={{ backgroundColor: '#f0f0f0', padding: '8px', borderRadius: '10px' }}>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>{timeString}</p>
            </div>
          </div>
        ) : (
          /* --- 【利用するボタン】 --- */
          <button onClick={handleUseCoupon} style={{ backgroundColor: '#e60012', color: '#fff', padding: '18px', borderRadius: '50px', fontSize: '20px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
            10％OFFを利用する
          </button>
        )}

        {/* --- LINEに戻るボタン（これは常に下、回転しない） --- */}
        <button onClick={() => window.location.href = 'https://line.me/R/ti/p/@884gzqsd'} style={{ backgroundColor: '#06C755', color: '#fff', padding: '14px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
          トーク画面に戻る
        </button>

      </div>
    </div>
  );
}