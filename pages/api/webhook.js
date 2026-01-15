import { buffer } from 'micro';
import admin from 'firebase-admin';

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
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const buf = await buffer(req);
    const event = JSON.parse(buf.toString());
    const session = event.data.object;

    // 🚀 修正ポイント：Stripeから送られてくるIDを取得
    const lineUserId = session.client_reference_id; 

    if (!lineUserId) {
      console.log("No client_reference_id found");
      return res.status(200).json({ received: true });
    }

    const userRef = db.collection('users').doc(lineUserId);

    // 決済完了時
    if (event.type === 'checkout.session.completed' || event.type === 'invoice.paid') {
      await userRef.update({ 
        isPaid: true, 
        stripeCustomerId: session.customer 
      });
      console.log(`Success: Updated user ${lineUserId}`);
    }

    // 解約・失敗時
    if (event.type === 'invoice.payment_failed' || event.type === 'customer.subscription.deleted') {
      await userRef.update({ isPaid: false });
      console.log(`Status reset: User ${lineUserId}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook Error:', error.message);
    res.status(400).send(`Error: ${error.message}`);
  }
}