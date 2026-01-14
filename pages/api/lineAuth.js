import admin from 'firebase-admin';
import axios from 'axios';
import qs from 'querystring';

// Firebase Admin SDKの初期化（二重初期化を防止）
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // 改行コード \n が正しく認識されるように処理
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code } = req.body;

  try {
    // 1. LINE APIに「認可コード」を送り、「アクセストークン」を取得
    const tokenResponse = await axios.post(
      'https://api.line.me/oauth2/v2.1/token',
      qs.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'https://app.smilooop.com/callback', // LINE Developersの設定と一致させること
        client_id: process.env.LINE_CLIENT_ID,
        client_secret: process.env.LINE_CLIENT_SECRET,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    // 2. LINEのアクセストークンからユーザーID（sub）を取得
    // IDトークンの中にユーザー情報が含まれています
    const idToken = tokenResponse.data.id_token;
    const verifyResponse = await axios.post(
      'https://api.line.me/oauth2/v2.1/verify',
      qs.stringify({
        id_token: idToken,
        client_id: process.env.LINE_CLIENT_ID,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const lineUserId = verifyResponse.data.sub; // LINEの一意なユーザーID

    // 3. Firebaseのカスタムトークンを発行
    // これにより、LINEユーザーIDをそのままFirebaseのUIDとしてログインできるようになります
    const firebaseCustomToken = await admin.auth().createCustomToken(lineUserId);

    // 4. カスタムトークンをフロントエンドに返す
    res.status(200).json({ customToken: firebaseCustomToken });

  } catch (error) {
    console.error('LINE Auth Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Authentication failed' });
  }
}