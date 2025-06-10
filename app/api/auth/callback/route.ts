import { NextResponse, type NextRequest } from 'next/server';
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

// ===================================================================
// === ส่วนใหม่: กำหนดค่าเวลาของแต่ละเครื่องซักผ้า (นาที) ===
// ===================================================================
const machineDurations: { [key: number]: number } = {
  1: 25, // เครื่องที่ 1 ใช้เวลา 1 นาที
  2: 25, // เครื่องที่ 2 ใช้เวลา 25 นาที
  3: 30, // เครื่องที่ 3 ใช้เวลา 30 นาที
  4: 45, // เครื่องที่ 4 ใช้เวลา 45 นาที
};
// ===================================================================

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const stateString = searchParams.get('state');

  if (!code) {
    return NextResponse.redirect(new URL('/?error=NoCode', request.url));
  }

  try {
    // ... (ส่วนแลก Token และดึง User ID เหมือนเดิม) ...
    const tokenUrl = 'https://api.line.me/oauth2/v2.1/token';
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.CALLBACK_URL!,
      client_id: process.env.NEXT_PUBLIC_LINE_CHANNEL_ID!,
      client_secret: process.env.LINE_CHANNEL_SECRET!,
    });
    const response = await fetch(tokenUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params });
    const tokens = await response.json();
    if (!response.ok) throw new Error(tokens.error_description || 'Failed to exchange token');

    const idToken = tokens.id_token;
    const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
    const userId = payload.sub;

    const originalState = JSON.parse(stateString || '{}');
    const machine = originalState.machine;

    // --- ส่วนที่แก้ไข: การคำนวณเวลาสิ้นสุด ---
    // ดึงเวลาของเครื่องที่เลือกจากรายการที่เราตั้งไว้ ถ้าไม่เจอก็ใช้ 25 นาทีเป็นค่าเริ่มต้น
    const washDurationMinutes = machineDurations[machine] || 25; 
    const endTime = new Date(Date.now() + washDurationMinutes * 60 * 1000);
    // --- สิ้นสุดส่วนที่แก้ไข ---

    // --- ส่วนการบันทึกลงฐานข้อมูล (เหมือนเดิม) ---
    await db.collection('timers').add({
      user_id: userId,
      machine_id: machine,
      end_time: endTime,
      status: 'pending'
    });

    const successUrl = new URL(`/success?machine=${machine}`, request.url);
    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error("CRITICAL ERROR in callback process:", error);
    const errorUrl = new URL('/?error=CallbackFailed', request.url);
    return NextResponse.redirect(errorUrl);
  }
}