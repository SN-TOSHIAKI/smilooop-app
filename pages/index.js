// pages/index.js
import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
      <h1>smilooop アプリへようこそ</h1>
      <p>お得なクーポンをご利用ください。</p>
      
      <Link href="/coupon">
        <button style={{
          backgroundColor: '#e60012',
          color: '#fff',
          padding: '15px 30px',
          borderRadius: '50px',
          fontSize: '18px',
          fontWeight: 'bold',
          border: 'none',
          cursor: 'pointer',
          marginTop: '20px'
        }}>
          クーポンを表示する
        </button>
      </Link>
    </div>
  );
}