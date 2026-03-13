import styles from './Coupon.module.css';

export default function Coupon() {
  return (
    <div className={styles.couponCard}>
      <h2 className={styles.title}>🎁 会員限定特典 🎁</h2>
      <p className={styles.description}>いつもご利用ありがとうございます！</p>
      <hr className={styles.divider} />
      <p className={styles.codeLabel}>クーポンコード</p>
      <p className={styles.code}>SMILE2026</p>
      <p className={styles.note}>※お会計時にこの画面を提示してください</p>
    </div>
  );
}