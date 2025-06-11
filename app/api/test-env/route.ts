import { NextResponse } from 'next/server';

export function GET() {
  console.log("--- VERCEL ENVIRONMENT VARIABLES ---");
  // พิมพ์ "ชื่อ" ของตัวแปรทั้งหมดที่เซิร์ฟเวอร์มองเห็น
  console.log(Object.keys(process.env));
  console.log("------------------------------------");

  const envVars = Object.keys(process.env);

  return NextResponse.json({
    message: "Here are the environment variable keys that the server can see.",
    keys: envVars,
  });
}