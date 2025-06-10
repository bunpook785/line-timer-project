import { NextResponse, type NextRequest } from 'next/server';
import admin from 'firebase-admin';

// --- ส่วนเริ่มต้นการเชื่อมต่อ Firebase ---
// ตรวจสอบว่าเคยเชื่อมต่อแล้วหรือยัง ถ้ายังไม่เคย ให้เชื่อมต่อใหม่
if (!admin.apps.length) {
  // นำข้อมูล Service Account จาก Environment Variable มาใช้งาน
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();
// --- สิ้นสุดส่วนการเชื่อมต่อ ---

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const stateString = searchParams.get('state');

  if (!code) {
    console.error("Authorization code not found.");
    return NextResponse.redirect(new URL('/?error=NoCode', request.url));
  }

  try {
    // 1. แลก code เป็น Access Token
    const tokenUrl = 'https://api.line.me/oauth2/v2.1/token';
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.CALLBACK_URL!,
      client_id: process.env.NEXT_PUBLIC_LINE_CHANNEL_ID!,
      client_secret: process.env.LINE_CHANNEL_SECRET!,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    const tokens = await response.json();
    if (!response.ok) throw new Error(tokens.error_description || 'Failed to exchange token');

    // 2. ถอดรหัส id_token เพื่อเอา User ID
    const idToken = tokens.id_token;
    const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
    const userId = payload.sub;

    // 3. ดึงหมายเลขเครื่องที่เลือก
    const originalState = JSON.parse(stateString || '{}');
    const machine = originalState.machine;

    // --- ส่วนใหม่: บันทึกข้อมูลลง Firestore ---
    console.log('Saving timer to Firestore...');
    const washDurationMinutes = 25;
    const endTime = new Date(Date.now() + washDurationMinutes * 60 * 1000);

    await db.collection('timers').add({
      user_id: userId,
      machine_id: machine,
      end_time: endTime,
      status: 'pending' // สถานะเริ่มต้นคือ 'รอดำเนินการ'
    });
    console.log('Successfully saved timer for user:', userId);
    // --- สิ้นสุดส่วนใหม่ ---

    // 4. ส่งต่อไปหน้า "สำเร็จ"
    const successUrl = new URL(`/success?machine=${machine}`, request.url);
    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error("CRITICAL ERROR in callback process:", error);
    const errorUrl = new URL('/?error=CallbackFailed', request.url);
    return NextResponse.redirect(errorUrl);
  }
}