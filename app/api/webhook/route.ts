import { NextResponse, type NextRequest } from 'next/server';
import admin from 'firebase-admin';
import crypto from 'crypto';

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

export async function POST(request: NextRequest) {
  try {
    // --- DEBUGGING BLOCK START ---
    console.log("--- STARTING WEBHOOK DEBUG LOG ---");
    console.log("Checking for LINE_MESSAGING_CHANNEL_SECRET...");
    const channelSecret = process.env.LINE_MESSAGING_CHANNEL_SECRET;

    if (channelSecret) {
      console.log("SUCCESS: Found LINE_MESSAGING_CHANNEL_SECRET.");
    } else {
      console.error("CRITICAL_ERROR: 'LINE_MESSAGING_CHANNEL_SECRET' is UNDEFINED or empty!");
    }
    console.log("--- ENDING WEBHOOK DEBUG LOG ---");
    // --- DEBUGGING BLOCK END ---

    const body = await request.text();
    const signature = request.headers.get('x-line-signature') || '';

    // Verify signature
    const hash = crypto.createHmac('sha256', channelSecret!).update(body).digest('base64');
    if (hash !== signature) {
      throw new Error("Signature validation failed!");
    }

    const events = JSON.parse(body).events;

    // Process events... (โค้ดส่วนที่เหลือเหมือนเดิม)
    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        // ... (ส่วนการประมวลผลข้อความและบันทึกลง database)
      }
    }

    return NextResponse.json({ status: "ok" });

  } catch (error) {
    console.error("ERROR in webhook handler:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}