import { useState, useEffect } from 'react';
import { auth, lineProvider } from '../lib/firebase';
import { signInWithRedirect, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 🚀 ログイン済みなら即座に会員ページへ移動！
        router.push('/member');
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>読み込み中...</div>;

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
      <img src="/images/logo.png" style={{ width: '80%', maxWidth: '400px', marginBottom: '30px' }} />
      <button 
        onClick={() => signInWithRedirect(auth, lineProvider)}
        style={{ backgroundColor: '#06C755', color: 'white', padding: '16px 32px', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}
      >
        LINEでログイン
      </button>
    </div>
  );
}