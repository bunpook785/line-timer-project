import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const stateString = searchParams.get('state');

  if (!code) {
    return NextResponse.redirect(new URL('/?error=NoCode', request.url));
  }

  try {
    // --- DEBUGGING BLOCK START ---
    // บล็อกนี้จะพิมพ์ทุกอย่างที่เราใช้ ออกมาใน Log ของ Vercel
    console.log("--- STARTING DEBUG LOG ---");
    console.log("Attempting to exchange token with these values:");
    console.log("1. grant_type:", 'authorization_code');
    console.log("2. code:", code ? "Exists (รหัสลับมีอยู่จริง)" : "MISSING!");
    console.log("3. redirect_uri (from env):", process.env.CALLBACK_URL);
    console.log("4. client_id (from env):", process.env.NEXT_PUBLIC_LINE_CHANNEL_ID);
    // เราจะไม่พิมพ์ client_secret ออกมาเพื่อความปลอดภัย
    console.log("5. client_secret (from env):", process.env.LINE_CHANNEL_SECRET ? "Exists and is set" : "MISSING or empty!");
    console.log("--- ENDING DEBUG LOG ---");
    // --- DEBUGGING BLOCK END ---

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

    if (!response.ok) {
      // ถ้าล้มเหลว ให้พิมพ์ error ที่ได้รับจาก LINE ออกมาด้วย
      console.error("Failed to get access token from LINE:", tokens);
      throw new Error(tokens.error_description || 'Failed to fetch access token');
    }

    const idToken = tokens.id_token;
    const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
    const userId = payload.sub;
    const originalState = JSON.parse(stateString || '{}');
    const machine = originalState.machine;

    console.log('--- Success! ---');
    console.log('User ID:', userId);
    console.log('Selected Machine:', machine);

    const successUrl = new URL(`/success?machine=${machine}`, request.url);
    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('CRITICAL ERROR in callback process:', error);
    const errorUrl = new URL('/?error=CallbackFailed', request.url);
    return NextResponse.redirect(errorUrl);
  }
}