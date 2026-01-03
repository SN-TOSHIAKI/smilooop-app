// pages/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { supabase } from '../lib/supabase'; // 2-1で作成したファイルを参照
import liff from '@line/liff';

// あなたのLIFF IDをここに記述！
const LIFF_ID = '2008811405-AwPJHD5h'; // ここにあなたのLIFF IDを貼り付けてください

export default function Home() {
  const [liffError, setLiffError] = useState(null);
  const [lineProfile, setLineProfile] = useState(null);
  const [appUser, setAppUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    liff.init({ liffId: LIFF_ID })
      .then(() => {
        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        Promise.all([
          liff.getProfile(),
          liff.getIDToken()
        ]).then(async ([profile, idToken]) => {
          setLineProfile(profile);
          const lineUserId = profile.userId;

          // 4. Supabaseにユーザー情報を登録/更新
          const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('line_user_id', lineUserId)
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Supabase fetch error:', fetchError);
            setIsLoading(false);
            return;
          }

          let userData;
          if (existingUser) {
            const { data: updatedData, error: updateError } = await supabase
              .from('users')
              .update({ display_name: profile.displayName })
              .eq('id', existingUser.id)
              .select()
              .single();
            userData = updatedData;
          } else {
            const { data: newData, error: insertError } = await supabase
              .from('users')
              .insert({ line_user_id: lineUserId, display_name: profile.displayName })
              .select()
              .single();
            userData = newData;
          }
          
          setAppUser(userData);
          setIsLoading(false);

        }).catch((err) => {
          console.error('LIFF/Profile Error:', err);
          setLiffError(err.toString());
          setIsLoading(false);
        });
      })
      .catch((err) => {
        console.error('LIFF Init Error:', err);
        setLiffError(err.toString());
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div>LINEログインとデータ連携中です...</div>;
  }

  if (liffError) {
    return <div>LIFFエラーが発生しました: {liffError}</div>;
  }

  if (!lineProfile || !appUser) {
    return <div>ログイン情報が取得できませんでした。</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <Head>
        <title>smilooop アプリ</title>
      </Head>

      <h1>ログイン完了！ようこそ、{lineProfile.displayName}様</h1>

      <p>この画面が「smilooopアプリ」のマイページになります。</p>

      <h2>Supabase 連携情報</h2>
      <p><strong>DB内のユーザーID:</strong> {appUser.id}</p>
      <p><strong>DB内のパートナーフラグ:</strong> {appUser.is_partner ? 'ON' : 'OFF'}</p>
      
      <h2>LINE プロフィール情報</h2>
      <p><strong>LINEユーザーID:</strong> {lineProfile.userId}</p>
      {lineProfile.pictureUrl && (
        <img src={lineProfile.pictureUrl} alt="Profile" style={{ width: '80px', borderRadius: '50%' }} />
      )}
      
      <button onClick={() => liff.logout()}>LINEログアウト</button>
    </div>
  );
}// JavaScript Document