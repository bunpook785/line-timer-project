import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const stateString = searchParams.get('state');

  // ถ้า LINE ไม่ได้ส่ง code กลับมา ให้ไปหน้าแรก
  if (!code) {
    console.error("Authorization code not found.");
    return NextResponse.redirect(new URL('/?error=NoCode', request.url));
  }

  try {
    // 1. นำ code ไปแลกเป็น Access Token
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
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const tokens = await response.json();

    if (!response.ok) {
      console.error("Failed to get access token:", tokens);
      throw new Error(tokens.error_description || 'Failed to fetch access token');
    }

    // 2. ถอดรหัส id_token เพื่อเอา User ID
    const idToken = tokens.id_token;
    const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
    const userId = payload.sub; // 'sub' คือ User ID

    // 3. ดึงหมายเลขเครื่องที่เลือกลับมาจาก state
    const originalState = JSON.parse(stateString || '{}');
    const machine = originalState.machine;

    console.log('--- Success! ---');
    console.log('User ID:', userId);
    console.log('Selected Machine:', machine);

    // *** ในอนาคต เราจะบันทึก userId, machine และเวลา ลงฐานข้อมูลตรงนี้ ***

    // 4. ส่งต่อไปหน้า "สำเร็จ" พร้อมบอกหมายเลขเครื่อง
    const successUrl = new URL(`/success?machine=${machine}`, request.url);
    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('Error in LINE callback process:', error);
    const errorUrl = new URL('/?error=CallbackFailed', request.url);
    return NextResponse.redirect(errorUrl);
  }
}