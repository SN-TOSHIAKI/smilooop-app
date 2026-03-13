// components/Coupon.js
export default function Coupon() {
  return (
    <div style={{ 
      padding: '30px 20px', 
      border: '3px gold solid', 
      borderRadius: '20px', 
      backgroundColor: '#fffbe6',
      boxShadow: '0 4px 15px rgba(212, 160, 23, 0.2)',
      marginBottom: '30px'
    }}>
      <h2 style={{ color: '#d4a017', margin: '0 0 10px 0' }}>🎁 会員限定特典 🎁</h2>
      <p style={{ fontSize: '14px', color: '#856404' }}>いつもご利用ありがとうございます！</p>
      <hr style={{ border: '0', borderTop: '1px dashed #d4a017', margin: '15px 0' }} />
      <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>クーポンコード</p>
      <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', margin: '0' }}>SMILE2026</p>
      <p style={{ fontSize: '11px', color: '#999', marginTop: '15px' }}>※お会計時にこの画面を提示してください</p>
    </div>
  );
}