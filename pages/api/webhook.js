import { buffer } from 'micro';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

// Stripeの初期化（キーがない場合にエラーにならないようガードを入れています）
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // 改行コードの処理を安全に行う
        privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

const db = admin.firestore();

export const config = {
  api: {
    bodyParser: false,
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
    if (!sig || !webhookSecret) throw new Error('Missing stripe-signature or webhook secret');
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error(`❌ Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const session = event.data.object;

    switch (event.type) {
      case 'checkout.session.completed':
        const firebaseUid = session.client_reference_id;
        if (firebaseUid) {
          await db.collection('users').doc(firebaseUid).update({
            isPaid: true,
            stripeCustomerId: session.customer,
          });
        }
        break;

      case 'invoice.paid':
        const paidUserSnap = await db.collection('users').where('stripeCustomerId', '==', session.customer).get();
        if (!paidUserSnap.empty) {
          await paidUserSnap.docs[0].ref.update({ isPaid: true });
        }
        break;

      case 'invoice.payment_failed':
      case 'customer.subscription.deleted':
        const unpaidUserSnap = await db.collection('users').where('stripeCustomerId', '==', session.customer).get();
        if (!unpaidUserSnap.empty) {
          await unpaidUserSnap.docs[0].ref.update({ isPaid: false });
        }
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Firestore Update Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}