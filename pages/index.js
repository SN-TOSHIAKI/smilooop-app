// pages/index.js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 現在のログイン状態をチェック
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setIsLoading(false);
    };
    checkUser();

    // ログイン状態の変化を監視（ログイン成功時に実行）
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        // ログイン直後に profiles テーブルにデータがなければ作成
        await supabase.from('profiles').upsert(
          { id: session.user.id, is_paid: false }, 
          { onConflict: 'id' } // すでにある場合は無視、なければ作成
        );
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // LINEログインを実行する関数
  const handleLineLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'line',
      options: {
        redirectTo: window.location.origin + '/coupon', // ログイン後にクーポン画面へ飛ばす
      },
    });
    if (error) alert("ログインエラーが発生しました");
  };

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>読み込み中...</div>;

  return (
    <div style={{ 
      textAlign: 'center', 
      marginTop: '100px', 
      padding: '0 20px',
      fontFamily: 'sans-serif' 
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>smilooop アプリ</h1>
      
      {!user ? (
        <>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            クーポンを利用するには<br />LINEログインが必要です。
          </p>
          {/* LINEログインボタン */}
          <button 
            onClick={handleLineLogin}
            style={{
              backgroundColor: '#06C755', // LINEカラー
              color: '#fff',
              padding: '16px 40px',
              borderRadius: '50px',
              fontSize: '18px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(6,199,85,0.3)',
              width: '100%',
              maxWidth: '300px'
            }}
          >
            LINEでログイン
          </button>
        </>
      ) : (
        <>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            ようこそ！<br />ログインしています。
          </p>
          <button 
            onClick={() => router.push('/coupon')}
            style={{
              backgroundColor: '#e60012',
              color: '#fff',
              padding: '16px 40px',
              borderRadius: '50px',
              fontSize: '18px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(230,0,18,0.3)',
              width: '100%',
              maxWidth: '300px'
            }}
          >
            クーポンを表示する
          </button>
          
          <p 
            onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }}
            style={{ marginTop: '40px', color: '#999', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
          >
            ログアウト
          </p>
        </>
      )}
    </div>
  );
}