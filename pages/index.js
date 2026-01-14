import Head from 'next/head';

export default function Home() {
  const loginWithLine = () => {
    // envからLINEのチャネルIDを取得（.env.localに記載したもの）
    const clientId = process.env.LINE_CLIENT_ID; 
    
    // コールバックURL（LINE Developersに登録したものと一致させる）
    // 変数名を統一してエラーを防ぎます
    const redirectUri = encodeURIComponent('https://app.smilooop.com/callback');
    
    // セキュリティ用のランダムな文字列（今回は簡易的に固定）
    const state = '12345abcde';
    
    // LINEの認可画面（ログイン画面）のURLを組み立て
    // ここで ${redirectUri} を正しく呼び出しています
    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=profile%20openid%20email`;
    
    // LINEの画面にジャンプ！
    window.location.href = lineAuthUrl;
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      fontFamily: 'sans-serif' 
    }}>
      <Head>
        <title>Smilooop - ログイン</title>
      </Head>

      <h1 style={{ marginBottom: '10px' }}>Smilooop</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        新しいアプリケーションへようこそ
      </p>
      
      {/* LINEログインボタン */}
      <button 
        onClick={loginWithLine}
        style={{
          backgroundColor: '#06C755', // LINEカラー
          color: 'white',
          padding: '14px 28px',
          border: 'none',
          borderRadius: '12px',
          fontSize: '18px',
          cursor: 'pointer',
          fontWeight: 'bold',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'transform 0.1s'
        }}
        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        LINEでログイン
      </button>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#ccc' }}>
        Step 1: ユーザー認証を開始します
      </div>
    </div>
  );
}