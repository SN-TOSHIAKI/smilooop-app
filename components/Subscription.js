// components/Subscription.js
import { buttonStyle } from './styles';

export default function Subscription({ isAgreed, setIsAgreed, onPayment }) {
  return (
    <div style={{ marginBottom: '30px' }}>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
        限定クーポンを利用するには<br />サブスク会員の申し込みが必要です。
      </p>

      <div style={{ 
        backgroundColor: '#f9f9f9', 
        padding: '15px', 
        borderRadius: '12px', 
        marginBottom: '20px',
        textAlign: 'left',
        border: '1px solid #eee'
      }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer', fontSize: '13px', lineHeight: '1.6' }}>
          <input 
            type="checkbox" 
            checked={isAgreed} 
            onChange={(e) => setIsAgreed(e.target.checked)}
            style={{ marginRight: '10px', marginTop: '3px', width: '18px', height: '18px' }}
          />
          <span>
            <a href="https://smilooop.com/legal/userterms/" target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3', fontWeight: 'bold' }}>会員規約</a>、
            <a href="https://smilooop.com/legal/privacy/" target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3', fontWeight: 'bold' }}>プライバシーポリシー</a>
            および
            <a href="https://smilooop.com/legal/tokusho/" target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3', fontWeight: 'bold' }}>特定商取引法に基づく表記</a>
            の内容を確認し、これに同意します。
          </span>
        </label>
      </div>

      <button 
        onClick={onPayment} 
        disabled={!isAgreed} 
        style={buttonStyle(isAgreed ? '#0070f3' : '#ccc')}
      >
        {isAgreed ? 'プランに申し込む（決済へ）' : '規約に同意して進む'}
      </button>
    </div>
  );
}