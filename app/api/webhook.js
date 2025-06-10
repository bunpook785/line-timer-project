import LineMessaging from '@line/bot-sdk';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const channelSecret = process.env.LINE_MESSAGING_CHANNEL_SECRET;

    // ในกรณีที่ LINE ส่ง POST request มาแต่ไม่มี body หรือ body.events
    // ซึ่งอาจเกิดขึ้นเมื่อกดปุ่ม Verify โดย LINE Platform
    if (!req.body || !req.body.events) {
      console.log("Received POST request with empty or invalid body (likely from LINE Verify). Responding with 200 OK.");
      return res.status(200).send('OK'); // ตอบ 200 OK เพื่อให้ Verify ผ่าน
    }

    const client = new LineMessaging.Client({
      channelAccessToken: process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN,
      channelSecret: channelSecret,
    });

    try {
      const signature = req.headers['x-line-signature'];
      if (!LineMessaging.validateSignature(JSON.stringify(req.body), channelSecret, signature)) {
        console.error('Invalid signature from LINE');
        return res.status(401).send('Invalid signature');
      }

      const events = req.body.events;
      await Promise.all(events.map(async (event) => {
        console.log('Received event:', event);
        // ส่วนประมวลผล event จะอยู่ที่นี่
      }));

      res.status(200).send('OK');

    } catch (err) {
      console.error("Error processing webhook POST request:", err);
      res.status(500).end();
    }
  } else if (req.method === 'GET') {
    console.log("Received GET request (likely from LINE Verify button or direct access). Responding with 200 OK.");
    res.status(200).send('OK');
  } else {
    console.log("Method not allowed:", req.method);
    res.status(405).end();
  }
}