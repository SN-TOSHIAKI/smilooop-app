'use client';
import { auth, lineProvider } from '../lib/firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ログイン状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
  try {
    // 1. まずリダイレクト用のメソッドをインポート
    const { signInWithRedirect } = await import('firebase/auth');
    
    // 2. ポップアップではなくリダイレクトを実行
    // これにより、ブロックされずにLINEの承認画面へ飛びます
    await signInWithRedirect(auth, lineProvider);
  } catch (error) {
    alert("エラー詳細\nコード: " + error.code + "\nメッセージ: " + error.message);
    console.error(error);
  }
};
}