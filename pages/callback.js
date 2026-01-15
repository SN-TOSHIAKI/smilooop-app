import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../lib/firebase';
import { signInWithCustomToken } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import axios from 'axios';

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const { code } = router.query;

    if (code) {
      axios.post('/api/lineAuth', { code })
        .then(async (response) => {
          // 🚀 修正ポイント: APIから名前(displayName)を受け取る
          const { customToken, displayName, pictureUrl } = response.data;
          
          const userCredential = await signInWithCustomToken(auth, customToken);
          const user = userCredential.user;

          // 🚀 修正ポイント: Firestoreに名前も保存する
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            name: displayName,      // LINEの名前を保存
            picture: pictureUrl,   // LINEの写真を保存
            lastLogin: new Date(),
          }, { merge: true });

          router.push('/'); // トップページへ戻る
        })
        .catch((error) => {
          console.error("Login error:", error);
          alert("ログインに失敗しました。");
        });
    }
  }, [router.query]);

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>認証中...</h2>
    </div>
  );
}