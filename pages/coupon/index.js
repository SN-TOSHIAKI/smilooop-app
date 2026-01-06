// pages/coupon/index.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function CouponPage() {
  const [lastUsedAt, setLastUsedAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [nowTime, setNowTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserStatus() {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user;
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('last_used_at')
            .eq('id', user.id)
            .single();
          if (profile) setLastUsedAt(profile.last_used_at);
        }
      } catch (e) {
        console.log("状態の取得をスキップしました");
      }
      setIsLoading(false);
    }
    fetchUserStatus();
    const clockTimer = setInterval(() => setNowTime(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

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
    try {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (user && user.id) {
        await supabase.from('profiles').update({ last_used_at: now }).eq('id', user.id);
      }
    } catch (e) {
      console.log("DB update skipped");
    }
  };

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>読み込み中...</div>;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = nowTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      maxWidth: '500px', 
      margin: '0 auto', 
      height: '100dvh', // 画面の高さを100%に固定
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#fff',
      fontFamily: 'sans-serif',
      overflow: 'hidden' // スクロールを完全に禁止
    }}>
      
      {/* 背景画像エリア：ボタン以外の残りのスペースをすべて使い、下側をカットする */}
      <div style={{ flex: 1, width: '100%', overflow: 'hidden' }}>
        <img 
          src="/images/10off.jpg" 
          alt="Coupon" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', // 比率を保ったままエリアを埋める
            objectPosition: 'top' // 画像の上部を基準にする（下側が切れる）
          }} 
        />
      </div>

      {/* ボタン・コンテンツエリア：ここが必要な分だけの高さを取る */}
      <div style={{ 
        padding: '20px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px',
        backgroundColor: '#fff',
        boxShadow: '0 -5px 15px rgba(0,0,0,0.05)', // 画像との境界を少し出す
        zIndex: 10
      }}>
        
        {timeLeft > 0 ? (
          /* --- 【使用済み：180度回転】 --- */
          <div style={{
            transform: 'rotate(180deg)',
            backgroundColor: '#fff',
            border: '4px solid #e60012',
            padding: '15px',
            borderRadius: '20px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#e60012', fontWeight: 'bold', fontSize: '18px', margin: '0' }}>店員様確認用画面</p>
            <h2 style={{ fontSize: '32px', margin: '5px 0', color: '#333' }}>10% OFF</h2>
            <div style={{ backgroundColor: '#f0f0f0', padding: '8px', borderRadius: '10px' }}>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>{timeString}</p>
            </div>
          </div>
        ) : (
          /* --- 【利用するボタン】 --- */
          <button 
            onClick={handleUseCoupon}
            style={{
              backgroundColor: '#e60012',
              color: '#fff',
              padding: '18px',
              borderRadius: '50px',
              fontSize: '20px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            10％OFFを利用する
          </button>
        )}

        {/* --- LINEに戻るボタン：ここが画面最下部に必ず収まる --- */}
        <button 
          onClick={() => window.location.href = 'https://line.me/R/nv/chat'} 
          style={{
            backgroundColor: '#06C755',
            color: '#fff',
            padding: '14px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          LINEに戻る
        </button>

        {timeLeft > 0 && (
          <p style={{ textAlign: 'center', color: '#666', fontSize: '13px', margin: '0' }}>
            あと {minutes}分 {seconds}秒
          </p>
        )}
      </div>
    </div>
  );
}