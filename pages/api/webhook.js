import { buffer } from 'micro';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
    bodyParser: false, // Stripe署名検証のために生データが必要
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // 🚀 署名検証（セキュリティのために必須）
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error(`❌ Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const session = event.data.object;

  try {
    switch (event.type) {
      // ✅ 1. 初回決済完了時
      case 'checkout.session.completed':
        const firebaseUid = session.client_reference_id; // index.jsでセットしたUID
        const stripeCustomerId = session.customer;

        if (firebaseUid) {
          await db.collection('users').doc(firebaseUid).update({
            isPaid: true,
            stripeCustomerId: stripeCustomerId,
          });
          console.log(`💰 User ${firebaseUid} marked as PAID`);
        }
        break;

      // ✅ 2. 更新時の支払成功（継続時）
      case 'invoice.paid':
        // 顧客IDからユーザーを特定
        const paidUserSnap = await db.collection('users').where('stripeCustomerId', '==', session.customer).get();
        if (!paidUserSnap.empty) {
          await paidUserSnap.docs[0].ref.update({ isPaid: true });
        }
        break;

      // ❌ 3. 支払失敗 or サブスクリプション削除（解約完了）
      case 'invoice.payment_failed':
      case 'customer.subscription.deleted':
        const unpaidUserSnap = await db.collection('users').where('stripeCustomerId', '==', session.customer).get();
        if (!unpaidUserSnap.empty) {
          await unpaidUserSnap.docs[0].ref.update({ isPaid: false });
          console.log(`🚫 User ${unpaidUserSnap.docs[0].id} marked as UNPAID`);
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Firestore Update Error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}