export function GET() {
  console.log("--- VERCEL ENVIRONMENT VARIABLES ---");
  // พิมพ์ "ชื่อ" ของตัวแปรทั้งหมดที่เซิร์ฟเวอร์มองเห็น
  console.log(Object.keys(process.env));
  console.log("------------------------------------");
  
  return NextResponse.json({
    message: "This endpoint lists the environment variable keys available on the server.",
  });
}
```