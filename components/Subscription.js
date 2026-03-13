// components/Subscription.js
import styles from './Subscription.module.css';

export default function Subscription({ userName, isAgreed, setIsAgreed, onPayment, onLogout }) {
  return (
    <div className={styles.container}>
      {/* ヘッダーセクション */}
      <section className={styles.headerSection}>
        <p className={styles.headerTitle}>こんにちは、{userName}様</p>
        <div className={styles.lineConnection}>
          <img src="/images/line-icon.png" alt="LINE" className={styles.iconMain} />
          <span className={styles.arrow}>⬅️➡️</span>
          <img src="/images/logo.png" alt="smilooop" className={styles.iconMain} />
        </div>
        <p className={styles.connectionStatus}>LINE連携が完了しました！</p>
      </section>

      {/* ヒーローセクション */}
      <section className={styles.heroSection}>
        <h1 className={styles.heroText}>
          今日から、<br />
          あなたの<span className={styles.highlightGreen}>街のお気に入り</span>を<br />
          もっと<span className={styles.highlightPink}>お得</span>に。
        </h1>
        <img src="/images/logo.png" alt="smilooop" className={styles.logoMain} />
        <img src="/images/people-illustration.png" alt="people" className={styles.illustration} />
      </section>

      {/* 特典セクション */}
      <section className={styles.benefitSection}>
        <h2 className={styles.sectionTitle}>会員だけの特別な体験</h2>
        <div className={styles.benefitCard}>
          <p className={styles.benefitMainText}>
            提携店舗で<br />
            いつでも<span className={styles.percentText}>10%OFF!</span>
          </p>
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
          <span>月額</span>
          <span className={styles.priceNumber}>500</span>
          <span>円 (税込)</span>
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
          <p className={styles.trustHighlight}>1ヶ月ごとの自動更新ですが、</p>
          <p className={styles.trustHighlight}>契約の縛りはありません。</p>
        </div>
        <p className={styles.trustDetail}>
          解約はマイページから<br />
          いつでも簡単に行えますので、<br />
          まずは1ヶ月だけ<br />
          <span className={styles.highlightGreen}>お試し</span>いただくのも<span className={styles.highlightGreen}>大歓迎</span>です。
        </p>
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

        <button className={styles.logoutButton} onClick={onLogout}>
          ログアウト
        </button>
      </section>
    </div>
  );
}