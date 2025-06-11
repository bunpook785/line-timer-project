import { NextResponse, type NextRequest } from 'next/server';
import admin from 'firebase-admin';
import crypto from 'crypto';

// --- ส่วนเริ่มต้นการเชื่อมต่อ Firebase ---
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();
// --- สิ้นสุดส่วนการเชื่อมต่อ ---

// --- ส่วนกำหนดค่าเวลาของแต่ละเครื่อง (นาที) ---
const machineDurations: { [key: number]: number } = {
  1: 25, 2: 25, 3: 30, 4: 45,
};

// ฟังก์ชันสำหรับส่งข้อความตอบกลับไปหาผู้ใช้
async function replyMessage(replyToken: string, text: string) {
  const replyUrl = 'https://api.line.me/v2/bot/message/reply';
  const accessToken = process.env.LINE_MESSAGING_TOKEN!;

  const message = {
    replyToken: replyToken,
    messages: [{ type: 'text', text: text }],
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

// Webhook จะรับคำขอแบบ POST จาก LINE
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-line-signature') || '';

  // 1. ตรวจสอบลายเซ็นเพื่อให้แน่ใจว่าคำขอมาจาก LINE จริงๆ
  const channelSecret = process.env.LINE_MESSAGING_CHANNEL_SECRET!;
  const hash = crypto.createHmac('sha256', channelSecret).update(body).digest('base64');

  if (hash !== signature) {
    console.error("Signature validation failed!");
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const events = JSON.parse(body).events;

  // 2. ประมวลผลแต่ละ Event ที่ LINE ส่งมา
  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const userId = event.source.userId;
      const userMessage = event.message.text.trim();
      const replyToken = event.replyToken;

      // 3. แปลงข้อความเป็นหมายเลขเครื่อง
      const machineId = parseInt(userMessage, 10);

      if (userId && !isNaN(machineId) && machineDurations[machineId]) {
        // ถ้าข้อความเป็นตัวเลขและมีอยู่ในรายการเครื่องของเรา
        const duration = machineDurations[machineId];
        const endTime = new Date(Date.now() + duration * 60 * 1000);

        // 4. บันทึกข้อมูลลง Firestore
        await db.collection('timers').add({
          user_id: userId,
          machine_id: machineId,
          end_time: endTime,
          status: 'pending',
        });

        // 5. ส่งข้อความตอบกลับเพื่อยืนยัน
        await replyMessage(replyToken, `รับทราบค่ะ! ✅\nเริ่มจับเวลา ${duration} นาทีสำหรับเครื่องหมายเลข ${machineId} แล้วค่ะ`);

      } else {
        // ถ้าข้อความที่พิมพ์มาไม่ถูกต้อง
        await replyMessage(replyToken, 'ขออภัยค่ะ ไม่พบหมายเลขเครื่องที่คุณระบุ กรุณาพิมพ์เฉพาะตัวเลข 1, 2, 3 หรือ 4 ค่ะ');
      }
    }
  }

  return NextResponse.json({ status: "ok" });
}