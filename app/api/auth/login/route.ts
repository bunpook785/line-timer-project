import { NextResponse, type NextRequest } from 'next/server';

export function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const machine = searchParams.get('machine');

  if (!machine) {
    return NextResponse.redirect(new URL('/?error=NoMachineSelected', request.url));
  }

  const lineLoginUrl = "https://access.line.me/oauth2/v2.1/authorize";

  const stateData = {
    machine: machine,
    nonce: "12345abcde" 
  };

  const params = {
    response_type: "code",
    client_id: process.env.NEXT_PUBLIC_LINE_CHANNEL_ID!,
    redirect_uri: process.env.CALLBACK_URL!,
    state: JSON.stringify(stateData),
    scope: "profile openid",
  };

  const queryString = new URLSearchParams(params).toString();

  // บรรทัดนี้คือบรรทัดสำคัญที่แก้ไขให้ถูกต้องแล้ว
  const finalUrl = `${lineLoginUrl}?${queryString}`; 

  // ส่งผู้ใช้ต่อไปยังหน้า LINE Login
  return NextResponse.redirect(finalUrl);
}