// pages/coupon/index.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function CouponPage() {
  const [lastUsedAt, setLastUsedAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [nowTime, setNowTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // 1. 初期読み込みと時計の管理
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

  // 2. カウントダウンロジック
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

  // 3. クーポン使用実行（エラー回避＆即座に回転する安全版）
  const handleUseCoupon = async () => {
    const confirmUse = confirm("店員さんに提示してください。\nOKを押すと使用済み画面に切り替わります。");
    if (!confirmUse) return;

    // まず画面を「使用済み（回転）」に切り替える
    const now = new Date().toISOString();
    setLastUsedAt(now);

    // その後、バックグラウンドで保存を試みる（失敗しても画面はそのまま）
    try {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (user && user.id) {
        await supabase
          .from('profiles')
          .update({ last_used_at: now })
          .eq('id', user.id);
      }
    } catch (e) {
      console.log("データベースの更新はスキップされました");
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
      margin: '0 auto', // 左右は中央寄せ
      minHeight: '100vh', // 画面の高さを確保
      backgroundColor: '#f8f8f8',
      fontFamily: 'sans-serif',
      // 【ここを追加】中身を強制的に「上基準」で配置します
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start' 
    }}>
      
      {/* 背景画像エリア */}
      <div style={{ width: '100%', lineHeight: 0, flexShrink: 0 }}>
        <img src="/images/10off.jpg" alt="Coupon" style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      {/* コンテンツエリア */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {timeLeft > 0 ? (
          /* --- 【店員さんに見せる画面：180度回転】 --- */
          <div style={{
            transform: 'rotate(180deg)',
            backgroundColor: '#fff',
            border: '4px solid #e60012',
            padding: '25px 15px',
            borderRadius: '20px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <p style={{ color: '#e60012', fontWeight: 'bold', fontSize: '20px', margin: '0' }}>店員様確認用画面</p>
            <h2 style={{ fontSize: '42px', margin: '10px 0', color: '#333' }}>10% OFF</h2>
            <div style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '10px' }}>
              <p style={{ fontSize: '14px', color: '#666', margin: '0' }}>現在時刻（秒単位）</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '5px 0', letterSpacing: '2px' }}>{timeString}</p>
            </div>
            <p style={{ fontSize: '13px', color: '#999', marginTop: '15px' }}>
              ※この画面は持ち主側で「使用済み」になっています
            </p>
          </div>
        ) : (
          /* --- 【通常時のボタン】 --- */
          <button 
            onClick={handleUseCoupon}
            style={{
              backgroundColor: '#e60012',
              color: '#fff',
              padding: '20px',
              borderRadius: '50px',
              fontSize: '20px',
              fontWeight: 'bold',
              border: 'none',
              boxShadow: '0 4px 15px rgba(230,0,18,0.3)',
              cursor: 'pointer'
            }}
          >
            10％OFFを利用する
          </button>
        )}

        {/* --- LINEに戻