import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; // libフォルダの場所に合わせて調整してください

export default function CouponPage() {
  const [lastUsedAt, setLastUsedAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 1. ページを開いた時に、現在のユーザーの使用状況を確認
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
  }, []);

  // 2. 1時間タイマーの計算
  useEffect(() => {
    const timer = setInterval(() => {
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
    return () => clearInterval(timer);
  }, [lastUsedAt]);

  // 3. ボタンを押した時の処理
  const handleUseCoupon = async () => {
    const confirmUse = confirm("店員さんに提示してください。\nOKを押すと1時間は再利用できません。よろしいですか？");
    if (!confirmUse) return;

    const { data: { user } } = await supabase.auth.getUser();
    const now = new Date().toISOString();
    
    const { error } = await supabase
      .from('profiles')
      .update({ last_used_at: now })
      .eq('id', user.id);

    if (!error) setLastUsedAt(now);
  };

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>読み込み中...</div>;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto', minHeight: '100vh', backgroundColor: '#fff' }}>
      {/* 背景画像 */}
      <img src="/images/10off.jpg" alt="Coupon Background" style={{ width: '100%', display: 'block' }} />

      {/* アクションエリア */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        left: '0',
        right: '0',
        textAlign: 'center',
        padding: '0 20px'
      }}>
        {timeLeft > 0 ? (
          <div style={{
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: '#fff',
            padding: '20px',
            borderRadius: '15px',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            利用済み<br />
            <span style={{ fontSize: '24px', color: '#ffd700' }}>
              あと {minutes}分 {seconds}秒 で回復
            </span>
          </div>
        ) : (
          <button 
            onClick={handleUseCoupon}
            style={{
              backgroundColor: '#e60012',
              color: '#fff',
              padding: '20px 40px',
              borderRadius: '50px',
              fontSize: '20px',
              fontWeight: 'bold',
              border: 'none',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              width: '100%',
              cursor: 'pointer'
            }}
          >
            クーポンを利用する
          </button>
        )}
      </div>
    </div>
  );
}