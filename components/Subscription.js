import styles from './Subscription.module.css';
import homeStyles from '../styles/Home.module.css'; // 共通ボタンを使う

export default function Subscription({ isAgreed, setIsAgreed, onPayment }) {
  return (
    <div className={styles.container}>
      <p className={styles.text}>
        限定クーポンを利用するには<br />サブスクの申し込みが必要です。
      </p>

      <div className={styles.agreementBox}>
        <label className={styles.label}>
          <input 
            type="checkbox" 
            checked={isAgreed} 
            onChange={(e) => setIsAgreed(e.target.checked)}
            className={styles.checkbox}
          />
          <span>
            <a href="https://smilooop.com/legal/userterms/" target="_blank" className={styles.link}>会員規約</a>、
            <a href="https://smilooop.com/legal/privacy/" target="_blank" className={styles.link}>プライバシーポリシー</a>
            および
            <a href="https://smilooop.com/legal/tokusho/" target="_blank" className={styles.link}>特定商取引法に基づく表記</a>
            の内容を確認し同意します。
          </span>
        </label>
      </div>

      <button 
        onClick={onPayment} 
        disabled={!isAgreed} 
        className={homeStyles.baseButton}
        style={{ backgroundColor: isAgreed ? '#0070f3' : '#ccc' }}
      >
        {isAgreed ? 'プランに申し込む（決済へ）' : '規約に同意して進む'}
      </button>
    </div>
  );
}