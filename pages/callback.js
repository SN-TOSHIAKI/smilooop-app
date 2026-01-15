import admin from 'firebase-admin';
import axios from 'axios';
import qs from 'querystring';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
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
    // 1. アクセストークンとIDトークンを取得
    const tokenResponse = await axios.post(
      'https://api.line.me/oauth2/v2.1/token',
      qs.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'https://app.smilooop.com/callback',
        client_id: process.env.LINE_CLIENT_ID,
        client_secret: process.env.LINE_CLIENT_SECRET,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const idToken = tokenResponse.data.id_token;

    // 2. IDトークンを検証してユーザー情報を取得
    const verifyResponse = await axios.post(
      'https://api.line.me/oauth2/v2.1/verify',
      qs.stringify({
        id_token: idToken,
        client_id: process.env.LINE_CLIENT_ID,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    // 🚀 修正ポイント: 名前(name)と写真(picture)を取り出す
    const lineUserId = verifyResponse.data.sub;
    const lineDisplayName = verifyResponse.data.name || "";
    const linePictureUrl = verifyResponse.data.picture || "";

    // 3. Firebaseカスタムトークンの発行
    const firebaseCustomToken = await admin.auth().createCustomToken(lineUserId);

    // 🚀 修正ポイント: カスタムトークンと一緒に名前と写真もフロントへ返す
    res.status(200).json({ 
      customToken: firebaseCustomToken,
      displayName: lineDisplayName,
      pictureUrl: linePictureUrl
    });

  } catch (error) {
    console.error('LINE Auth Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Authentication failed' });
  }
}