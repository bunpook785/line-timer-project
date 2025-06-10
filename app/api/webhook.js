import LineMessaging from '@line/bot-sdk';

export default async function handler(req, res) {
  // ตรวจสอบว่า request เป็น POST หรือไม่ (สำหรับ Webhook ของ LINE)
  if (req.method === 'POST') {
    const channelSecret = process.env.LINE_MESSAGING_CHANNEL_SECRET;
    // channelAccessToken จะถูกนำมาใช้ในขั้นตอนต่อไป เมื่อเราต้องการตอบกลับข้อความ
    // สำหรับตอนนี้แค่ channelSecret ก็พอสำหรับการตรวจสอบ
    const client = new LineMessaging.Client({
      channelAccessToken: process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN, // เราจะเพิ่มค่านี้ในขั้นตอนถัดไป
      channelSecret: channelSecret,
    });

    try {
      // ตรวจสอบลายเซ็นต์เพื่อยืนยันว่ามาจาก LINE จริงๆ
      const signature = req.headers['x-line-signature'];
      // สำคัญ: validateSignature ต้องการ body ที่เป็น JSON string
      if (!LineMessaging.validateSignature(JSON.stringify(req.body), channelSecret, signature)) {
        console.error('Invalid signature from LINE');
        return res.status(401).send('Invalid signature'); // ส่ง 401 ถ้าลายเซ็นไม่ถูกต้อง
      }

      const events = req.body.events;

      await Promise.all(events.map(async (event) => {
        console.log('Received event:', event);
        // ในอนาคตจะมีการประมวลผล event ที่นี่ (เช่น การตอบกลับข้อความ)
      }));

      // สำคัญ: ส่ง 200 OK กลับไปหา LINE หลังจากประมวลผล event ทั้งหมด
      // เพื่อบอกว่าเราได้รับและประมวลผลคำขอเรียบร้อยแล้ว
      res.status(200).send('OK');

    } catch (err) {
      console.error("Error processing webhook POST request:", err);
      // ในกรณีที่เกิดข้อผิดพลาดในการประมวลผล ให้ส่ง status 500 กลับไป
      res.status(500).end();
    }
  } else if (req.method === 'GET') {
    // เพิ่มส่วนนี้สำหรับจัดการ GET request ที่อาจมาจากปุ่ม "Verify" ใน LINE Developers Console
    // หรือการเข้าถึง URL โดยตรง
    console.log("Received GET request (likely from LINE Verify button or direct access). Responding with 200 OK.");
    res.status(200).send('OK'); // ตอบกลับ 200 OK สำหรับ GET request เพื่อให้ LINE Verify สำเร็จ
  }
  else {
    // ถ้าเป็น method อื่นๆ ที่ไม่ใช่ POST หรือ GET
    console.log("Method not allowed:", req.method);
    res.status(405).end(); // Method Not Allowed
  }
}