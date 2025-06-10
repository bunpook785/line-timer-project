import LineMessaging from '@line/bot-sdk';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // กรณี LINE ส่ง POST มาเพื่อ Verify (body อาจว่าง หรือ events เป็น array ว่าง)
    if (!req.body || !req.body.events) {
      console.log("Received POST request with empty or invalid body (likely from LINE Verify). Responding with 200 OK.");
      return res.status(200).send('OK');
    }

    const channelSecret = process.env.LINE_MESSAGING_CHANNEL_SECRET;
    const signature = req.headers['x-line-signature'];

    // ตรวจสอบว่า body มี events จริง และตรวจสอบ signature เฉพาะกรณีที่มี event
    try {
      if (!LineMessaging.validateSignature(JSON.stringify(req.body), channelSecret, signature)) {
        console.error('Invalid signature from LINE');
        return res.status(401).send('Invalid signature');
      }

      const client = new LineMessaging.Client({
        channelAccessToken: process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN,
        channelSecret: channelSecret,
      });

      const events = req.body.events;
      await Promise.all(events.map(async (event) => {
        // ใส่ logic ประมวลผล event ที่นี่
      }));

      res.status(200).send('OK');
    } catch (err) {
      console.error("Error processing webhook POST request:", err);
      res.status(500).end();
    }
  } else if (req.method === 'GET') {
    // รองรับการ Verify แบบ GET
    res.status(200).send('OK');
  } else {
    res.status(405).end();
  }
}
