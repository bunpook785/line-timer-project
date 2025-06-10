import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// --- ส่วนเริ่มต้นการเชื่อมต่อ Firebase ---
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();
// --- สิ้นสุดส่วนการเชื่อมต่อ ---

export async function GET() {
  console.log("Cron job started...");
  try {
    const now = new Date();

    // 1. ค้นหา Timers ทั้งหมดที่ครบกำหนดเวลาแล้ว และยังไม่ได้ส่งข้อความ
    const querySnapshot = await db.collection('timers')
      .where('status', '==', 'pending')
      .where('end_time', '<=', now)
      .get();

    if (querySnapshot.empty) {
      console.log("No pending timers found.");
      return NextResponse.json({ message: "No pending timers found." });
    }

    const pushMessageUrl = 'https://api.line.me/v2/bot/message/push';
    const accessToken = process.env.LINE_MESSAGING_TOKEN;

    // 2. วนลูปส่งข้อความสำหรับทุกรายการที่เจอ
    for (const doc of querySnapshot.docs) {
      const timer = doc.data();
      const userId = timer.user_id;
      const machineId = timer.machine_id;

      const message = {
        to: userId,
        messages: [
          {
            type: 'text',
            text: `🔔 แจ้งเตือน! 🔔\nเครื่องซักผ้าหมายเลข ${machineId} ของคุณซักเสร็จเรียบร้อยแล้วค่ะ สามารถมารับผ้าได้เลยค่ะ 😊`,
          },
        ],
      };

      // 3. ส่ง Push Message ผ่าน Messaging API
      const response = await fetch(pushMessageUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(message),
      });

      if (response.ok) {
        console.log(`Successfully sent notification to user ${userId} for machine ${machineId}`);
        // 4. อัปเดตสถานะในฐานข้อมูลเป็น 'sent' เพื่อไม่ให้ส่งซ้ำ
        await doc.ref.update({ status: 'sent' });
      } else {
        const errorResult = await response.json();
        console.error(`Failed to send notification to user ${userId}:`, errorResult);
      }
    }

    return NextResponse.json({ message: "Cron job executed successfully." });

  } catch (error) {
    console.error("Error executing cron job:", error);
    return NextResponse.json({ message: "Error executing cron job." }, { status: 500 });
  }
}