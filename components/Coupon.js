// components/Coupon.js
import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import styles from './Coupon.module.css';

export default function Coupon() {
  const [couponStatus, setCouponStatus] = useState('idle'); // 'idle' or 'active'
  const [timeLeft, setTimeLeft] = useState(0);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
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

  useEffect(() => {
    if (couponStatus === 'active' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft <= 0 && couponStatus === 'active') {
      setCouponStatus('idle');
    }
  }, [timeLeft, couponStatus]);

  const useCoupon = async () => {
    if (!user || couponStatus !== 'idle') return;
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { lastCouponUsedAt: serverTimestamp() });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.couponCard}>
        {/* 🚀 画像の切り替えとアニメーション適用 */}
        <div className={couponStatus === 'active' ? styles.imageWrapperActive : styles.imageWrapper}>
          <img 
            src={couponStatus === 'active' ? "/images/coupon-b.png" : "/images/coupon-a.png"} 
            alt="Coupon" 
            className={styles.couponImg} 
          />
        </div>
        
        {/* 🚀 ボタン表示の切り替え */}
        {couponStatus === 'idle' ? (
          <button className={styles.useButton} onClick={useCoupon}>
            クーポンを今すぐ使う
          </button>
        ) : (
          <button className={styles.usedButton} disabled>
            クーポンを利用しました。<br />
            有効時間（{formatTime(timeLeft)}）
          </button>
        )}
      </div>

      <p className={styles.note}>
        {couponStatus === 'idle' 
          ? "※「使う」を押すと10分間カウントダウンが始まります" 
          : "※店員さんにこの画面を提示してください"}
      </p>
    </div>
  );
}