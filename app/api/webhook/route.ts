import { NextResponse, type NextRequest } from 'next/server';
import admin from 'firebase-admin';
import crypto from 'crypto';

// --- ส่วนเริ่มต้นการเชื่อมต่อ Firebase ---
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (e) { console.error("Firebase Admin initialization error", e); }
}
const db = admin.firestore();
// --- สิ้นสุดส่วนการเชื่อมต่อ ---

const machineDurations: { [key: number]: number } = {
  1: 5, // ทดสอบ 1 นาที
  2: 25,
  3: 30,
  4: 45,
};

async function replyMessage(replyToken: string, text: string) {
  const replyUrl = 'https://api.line.me/v2/bot/message/reply';
  const accessToken = process.env.LINE_MESSAGING_TOKEN!;
  const message = {
    replyToken: replyToken,
    messages: [{ type: 'text', text: text }],
  };
  const response = await fetch(replyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(message),
  });
  if (!response.ok) {
    console.error("Failed to send reply message:", await response.json());
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-line-signature') || '';
    const channelSecret = process.env.LINE_MESSAGING_CHANNEL_SECRET!;

    if (!channelSecret) {
      throw new Error("LINE_MESSAGING_CHANNEL_SECRET is not set.");
    }

    const hash = crypto.createHmac('sha256', channelSecret).update(body).digest('base64');
    if (hash !== signature) {
      throw new Error("Signature validation failed!");
    }

    const events = JSON.parse(body).events;
    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const userId = event.source.userId;
        const userMessage = event.message.text.trim();
        const replyToken = event.replyToken;
        const machineId = parseInt(userMessage, 10);

        if (userId && !isNaN(machineId) && machineDurations[machineId]) {
          const duration = machineDurations[machineId];
          const endTime = new Date(Date.now() + duration * 60 * 1000);

          // บันทึกข้อมูลลง Firestore
          await db.collection('timers').add({
            user_id: userId,
            machine_id: machineId,
            end_time: endTime,
            status: 'pending',
          });

          await replyMessage(replyToken, `รับทราบค่ะ! ✅\nเริ่มจับเวลา ${duration} นาทีสำหรับเครื่องหมายเลข ${machineId} แล้วค่ะ`);
        } else {
          await replyMessage(replyToken, 'ขออภัยค่ะ ไม่พบหมายเลขเครื่องที่คุณระบุ กรุณาพิมพ์เฉพาะตัวเลข 1, 2, 3 หรือ 4 ค่ะ');
        }
      }
    }
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Error in webhook handler:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}