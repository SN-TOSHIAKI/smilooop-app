import { buffer } from 'micro';
import * as admin from 'firebase-admin';

// Firebase Adminの初期化（サーバーサイドでFirestoreを操作するため）
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

export const config = {
  api: {
    bodyParser: false, // Stripeの署名検証のために生データが必要
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    let event;
    // ここでStripeからの正規の通知かチェック（本番では署名検証を入れるのが理想）
    event = req.body; 

    const session = event.data.object;
    const customerId = session.customer; // Stripeの顧客ID
    const userEmail = session.customer_details?.email; // ユーザーのメールアドレス

    // 1. 決済成功時（サブスク開始）
    if (event.type === 'checkout.session.completed' || event.type === 'invoice.paid') {
      const userSnap = await db.collection('users').where('email', '==', userEmail).get();
      if (!userSnap.empty) {
        const userDoc = userSnap.docs[0];
        await userDoc.ref.update({ isPaid: true, stripeCustomerId: customerId });
      }
    }

    // 2. 決済失敗・解約時（サブスク停止）
    if (event.type === 'invoice.payment_failed' || event.type === 'customer.subscription.deleted') {
      const userSnap = await db.collection('users').where('stripeCustomerId', '==', customerId).get();
      if (!userSnap.empty) {
        const userDoc = userSnap.docs[0];
        await userDoc.ref.update({ isPaid: false });
      }
    }

    res.json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}