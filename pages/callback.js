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
          const { customToken } = response.data;
          
          // Firebaseでサインイン
          const userCredential = await signInWithCustomToken(auth, customToken);
          const user = userCredential.user;

          // 🚀 修正ポイント：Firestoreにドキュメントを作成
          // ドキュメントIDを LINEのUIDに設定
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            lastLogin: new Date(),
          }, { merge: true });

          console.log("User data initialized in Firestore");
          router.push('/success'); 
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