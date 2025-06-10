import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const stateString = searchParams.get('state');

  try {
    // --- DEBUGGING BLOCK START ---
    console.log("--- STARTING DEBUG LOG ---");
    console.log("This is the special debug version.");
    console.log("1. Received code:", code ? "YES" : "NO, Code is missing!");
    console.log("2. CALLBACK_URL from Vercel env:", process.env.CALLBACK_URL);
    console.log("3. CHANNEL_ID from Vercel env:", process.env.NEXT_PUBLIC_LINE_CHANNEL_ID);
    console.log("4. CHANNEL_SECRET from Vercel env:", process.env.LINE_CHANNEL_SECRET ? "Exists" : "MISSING or empty!");
    console.log("--- ENDING DEBUG LOG ---");
    // --- DEBUGGING BLOCK END ---

    if (!code) {
      throw new Error("No authorization code received from LINE.");
    }

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
      console.error("LINE API Error Response:", tokens);
      throw new Error(tokens.error_description || 'Failed to exchange token');
    }

    const idToken = tokens.id_token;
    const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
    const userId = payload.sub;
    const originalState = JSON.parse(stateString || '{}');
    const machine = originalState.machine;

    console.log('--- Login Success! ---');
    console.log('User ID:', userId);
    console.log('Selected Machine:', machine);

    const successUrl = new URL(`/success?machine=${machine}`, request.url);
    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error("CRITICAL ERROR in callback process:", error);
    const errorUrl = new URL('/?error=CallbackFailed', request.url);
    return NextResponse.redirect(errorUrl);
  }
}