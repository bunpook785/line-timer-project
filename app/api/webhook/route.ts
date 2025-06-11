import { NextResponse, type NextRequest } from 'next/server';
import admin from 'firebase-admin';
import crypto from 'crypto';

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (e) {
    console.error("Firebase Admin initialization error", e);
  }
}
const db = admin.firestore();

// --- TEMPORARY DEBUGGING - INSECURE ---
// เราจะใส่ Channel Secret ของคุณตรงนี้เพื่อทดสอบ
const HARDCODED_CHANNEL_SECRET = "39fe05a9b033bc8ffe6e13a99d7a0b4b"; 
// --- END OF TEMPORARY DEBUGGING ---

export async function POST(request: NextRequest) {
  try {
    console.log("--- HARDCODED SECRET TEST START ---");
    const body = await request.text();
    const signature = request.headers.get('x-line-signature') || '';

    const hash = crypto.createHmac('sha256', HARDCODED_CHANNEL_SECRET).update(body).digest('base64');

    if (hash !== signature) {
      console.error("Signature validation FAILED even with hardcoded secret.");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log("SUCCESS: Signature validation PASSED with hardcoded secret!");

    const events = JSON.parse(body).events;
    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const replyToken = event.replyToken;
        // แค่ตอบกลับไปง่ายๆ เพื่อดูว่าทำงานได้หรือไม่
        const replyUrl = 'https://api.line.me/v2/bot/message/reply';
        const accessToken = process.env.LINE_MESSAGING_TOKEN!;
        const message = {
          replyToken: replyToken,
          messages: [{ type: 'text', text: 'ทดสอบสำเร็จ! Webhook ทำงานแล้ว' }],
        };
        await fetch(replyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(message),
        });
      }
    }
    return NextResponse.json({ status: "ok" });

  } catch (error) {
    console.error("ERROR in hardcoded test handler:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}