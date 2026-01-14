import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../lib/firebase'; // firebase.jsからauthをインポート
import { signInWithCustomToken } from 'firebase/auth';
import axios from 'axios';

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    // URLから code （認可コード）を取得
    const { code } = router.query;

    if (code) {
      // API Route (pages/api/lineAuth.js) に送る
      axios.post('/api/lineAuth', { code })
        .then(async (response) => {
          const { customToken } = response.data;
          
          // Firebaseでサインイン！
          await signInWithCustomToken(auth, customToken);
          
          console.log("Firebaseログイン成功！");
          // ログイン後のマイページなどへ飛ばす
          router.push('/member'); 
        })
        .catch((error) => {
          console.error("ログインエラー:", error);
          alert("ログインに失敗しました。");
        });
    }
  }, [router.query]);

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>LINE認証を確認中...</h2>
      <p>そのまま少々お待ちください。</p>
    </div>
  );
}