import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function CouponPage() {
  const [lastUsedAt, setLastUsedAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [nowTime, setNowTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // 1. ユーザーの使用状況とリアルタイム時計の管理
  useEffect(() => {
    async function fetchUserStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('last_used_at')
          .eq('id', user.id)
          .single();
        if (data) setLastUsedAt(data.last_used_at);
      }
      setIsLoading(false);
    }
    fetchUserStatus();

    // 毎秒時計を更新
    const clockTimer = setInterval(() => setNowTime(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // 2. 1時間のカウントダウンロジック
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

  // 3. クーポン使用実行
  const handleUseCoupon = async () => {
    try {
      const confirmUse = confirm("店員さんに提示してください。\nOKを押すと使用済み画面に切り替わります。");
      if (!confirmUse) return;

      // ユーザー情報の取得を試みる
      const { data: { user } } = await supabase.auth.getUser();
      const now = new Date().toISOString();

      // ログインしている場合のみ、データベース(Supabase)に記録する
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ last_used_at: now })
          .eq('id', user.id);
        
        if (error) {
          console.error("Supabase更新エラー:", error.message);
        }
      }

      // 【重要】ログインしていなくても、画面上は「使用済み」に切り替えて反転させる
      setLastUsedAt(now);

    } catch (e) {
      console.error("予期せぬエラー:", e);
      // 万が一エラーが起きても、強制的に画面を切り替える
      setLastUsedAt(new Date().toISOString());
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
      minHeight: '100vh', 
      backgroundColor: '#f8f8f8',
      fontFamily: 'sans-serif' 
    }}>
      
      {/* 背景画像エリア */}
      <div style={{ width: '100%', lineHeight: 0 }}>
        <img src="/images/10off.jpg" alt="Coupon" style={{ width: '100%', height: 'auto' }} />
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
            クーポンを利用する
          </button>
        )}

        {/* --- LINEに戻るボタン（常に下向き・持ち主用） --- */ }
        <button 
          onClick={() => window.location.href = 'https://line.me/R/nv/chat'} 
          style={{
            backgroundColor: '#06C755',
            color: '#fff',
            padding: '15px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            border: 'none',
            marginTop: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span>LINEに戻る</span>
        </button>

        {timeLeft > 0 && (
          <p style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
            あと {minutes}分 {seconds}秒 で再利用可能になります
          </p>
        )}
      </div>
    </div>
  );
}