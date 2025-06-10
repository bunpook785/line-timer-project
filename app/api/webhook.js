import LineMessaging from '@line/bot-sdk';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const channelSecret = process.env.LINE_MESSAGING_CHANNEL_SECRET;
    const client = new LineMessaging.Client({
      channelAccessToken: process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN, // เราจะเพิ่มอันนี้ในขั้นตอนถัดไป
      channelSecret: channelSecret,
    });

    try {
      const events = req.body.events;
      await Promise.all(events.map(async (event) => {
        // ตรวจสอบลายเซ็นต์เพื่อยืนยันว่ามาจาก LINE จริงๆ
        const signature = req.headers['x-line-signature'];
        if (!LineMessaging.validateSignature(req.body, channelSecret, signature)) {
          console.error('Invalid signature');
          return res.status(401).send('Invalid signature');
        }

        // ตรงนี้คือส่วนที่เราจะเริ่มประมวลผลข้อความ
        console.log('Received event:', event);

        // ตอบกลับ LINE เพื่อบอกว่ารับสัญญาณแล้ว (สำคัญมาก!)
        // ในเวอร์ชันแรกนี้ เราจะยังไม่ตอบกลับข้อความอะไรกลับไป
        // แต่ถ้า LINE ได้รับ 200 OK ก็จะถือว่าส่งสำเร็จ
        return res.status(200).send('OK');
      }));
    } catch (err) {
      console.error(err);
      res.status(500).end();
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}