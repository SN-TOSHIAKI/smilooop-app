// components/Coupon.js
import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import styles from './Coupon.module.css';

export default function Coupon() {
  const [couponStatus, setCouponStatus] = useState('idle'); // 'idle', 'active', 'cooldown'
  const [timeLeft, setTimeLeft] = useState(0);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    // リアルタイムでクーポンの使用状況を監視
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const lastUsed = data.lastCouponUsedAt?.toDate();
        
        if (lastUsed) {
          const now = new Date();
          const diffInSec = Math.floor((now - lastUsed) / 1000);
          const tenMinutes = 10 * 60;

          if (diffInSec < tenMinutes) {
            setCouponStatus('active');
            setTimeLeft(tenMinutes - diffInSec);
          } else {
            setCouponStatus('idle');
          }
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  // カウントダウンタイマー
  useEffect(() => {
    if (couponStatus === 'active' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft <= 0 && couponStatus === 'active') {
      setCouponStatus('idle');
    }
  }, [timeLeft, couponStatus]);

  const useCoupon = async () => {
    if (!user || couponStatus !== 'idle') return;
    
    // 不正防止のため、Firestoreにサーバー時間で記録
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      lastCouponUsedAt: serverTimestamp()
    });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.container}>
      {/* 🚀 不正防止：店員さん向け逆さロゴ（使用中のみ表示） */}
      {couponStatus === 'active' && (
        <div className={styles.antiFraudHeader}>
          <p className={styles.upsideDownText}>smilooop CERTIFIED - {formatTime(timeLeft)}</p>
        </div>
      )}

      <div className={styles.couponCard}>
        <img src="/images/coupon-image.png" alt="10% OFF Coupon" className={styles.couponImg} />
        
        {couponStatus === 'idle' ? (
          <button className={styles.useButton} onClick={useCoupon}>
            今すぐ使う
          </button>
        ) : (
          <div className={styles.activeStatus}>
            <p className={styles.timerText}>使用中: {formatTime(timeLeft)}</p>
            <p className={styles.statusDetail}>店員さんにこの画面を見せてください</p>
          </div>
        )}
      </div>

      <p className={styles.note}>※一度使用すると10分間再利用できません</p>
    </div>
  );
}