import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // ดึงค่า code และ state จาก URL ที่ LINE ส่งมา
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  // แสดงผลใน Log ของ Vercel เพื่อให้เราตรวจสอบได้ (จะใช้ในอนาคต)
  console.log("LINE Callback Received!");
  console.log("Authorization Code:", code);
  console.log("State:", state);

  if (code) {
    // *** ในอนาคต เราจะเอา code ไปแลกเป็น token ที่ตรงนี้ ***

    // ตอนนี้ให้ส่งลูกค้ากลับไปที่หน้าแสดงความสำเร็จก่อน
    // (เราจะสร้างหน้านี้ในขั้นตอนต่อไป)
    const successUrl = new URL('/success', request.url);
    return NextResponse.redirect(successUrl);

  } else {
    // ถ้าไม่สำเร็จ ให้ส่งกลับไปหน้าแรกพร้อม error
    const errorUrl = new URL('/?error=LoginFailed', request.url);
    return NextResponse.redirect(errorUrl);
  }
}