import styles from './Subscription.module.css';

// 🚀 「export default function...」で囲む必要があります
export default function Subscription({ userName, isAgreed, setIsAgreed, onPayment }) {
  return (
    <div className={styles.container}>
      {/* ヘッダーセクション */}
      <section className={styles.headerSection}>
        <p className={styles.headerTitle}>こんにちは、{userName}様</p>
        <div className={styles.lineConnection}>
          <img src="/images/sub-app-icon.png" alt="LINE-smilooop" className={styles.iconMain} />
        </div>
        <p className={styles.connectionStatus}>LINE連携が完了しました！</p>
      </section>

      {/* ヒーローセクション */}
      <section className={styles.heroSection}>
        <h1 className={styles.heroText}>
          <img src="/images/sub-header.png" alt="smilooop" className={styles.logoMain} />
        </h1>
      </section>

      {/* 特典セクション */}
      <section className={styles.benefitSection}>
        <h2 className={styles.sectionTitle}>会員だけの特別な体験</h2>
        <div className={styles.benefitCard}>
          <img src="/images/benefit-maintext.png" alt="提携店舗でいつでも10%OFF！" />
          <p className={styles.benefitDetail}>
            お食事、お買い物、リラクゼーションなど、<br />
            smilooop提携店舗での<br />
            ご利用が<span className={styles.redText}>何度でも10%OFF</span>になります。
          </p>
        </div>
      </section>

      {/* 価格セクション */}
      <section className={styles.priceSection}>
        <h2 className={styles.sectionTitle}>ご利用価格</h2>
        <div className={styles.priceValue}>
          <img src="/images/price-value.png" alt="月額500円（税込）" />
        </div>
        <p className={styles.priceNote}>
          ※コーヒー1杯分のお値段で、<br />
          1ヶ月間ずっと街歩きが楽しくなります。
        </p>
      </section>

      {/* 安心セクション */}
      <section className={styles.trustSection}>
        <h2 className={styles.sectionTitle}>安心して<br />ご登録いただくために</h2>
        <div>
          <img src="/images/trust-text.png" alt="1ヶ月ごとの自動更新ですが、契約の縛りはありません。" />
        </div>
      </section>

      {/* 同意フォームとボタン */}
      <section className={styles.formSection}>
        <div className={styles.agreementBox}>
          <label className={styles.label}>
            <input 
              type="checkbox" 
              className={styles.checkbox}
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
            />
            <span>
              <a href="https://smilooop.com/legal/userterms/" target="_blank" className={styles.link}>会員規約</a>、
              <a href="https://smilooop.com/legal/privacy/" target="_blank" className={styles.link}>プライバシーポリシー</a>および
              <a href="https://smilooop.com/legal/tokusho/" target="_blank" className={styles.link}>特定商取引法に基づく表記</a>の内容を確認し、これに同意します。
            </span>
          </label>
        </div>

        <button 
          className={styles.submitButton} 
          onClick={onPayment}
          disabled={!isAgreed}
        >
          月額500円でサブスク会員になる
        </button>
        
      </section>
    </div>
  ); // 🚀 ここで return を閉じる
} // 🚀 ここで function を閉じる