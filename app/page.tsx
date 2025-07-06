// โค้ดนี้เป็นแบบง่าย ไม่ต้องมี "use client" แล้วครับ
export default function HomePage() {
  // สร้างลิงก์สำหรับเพิ่มเพื่อน LINE Official Account ของคุณ
  const lineAddFriendUrl = "https://line.me/R/ti/p/@898rsjqj";

  return (
    <div className="container">
      <div className="card">
        <h1>🧺 Washing & Drying 🧺</h1>
        <p>ร้านซัก-อบ จบครบที่เดียว หน้าโลตัสอินทร์</p>
      
        <div className="instruction-box">
          <h2>ขั้นตอนรับการแจ้งเตือน</h2>
          <p>
            <span className="emoji">1️⃣</span> กดปุ่ม 'รับการแจ้งเตือนผ่าน LINE' ด้านล่างนี้
          </p>
          <p>
            <span className="emoji">2️⃣</span> เมื่อเข้าสู่หน้าแชทแล้ว ให้{" "}
            <strong>พิมพ์หมายเลขเครื่อง</strong> ของคุณ (เช่น 1, 2, 3) แล้วกดส่ง
          </p>
          <p>
            <span className="emoji">3️⃣</span> ระบบจะเริ่มจับเวลาให้ทันที!
          </p>
        </div>

        {/* ปุ่มนี้จะเปลี่ยนเป็นลิงก์ <a> tag ง่ายๆ */}
        <a 
          href={lineAddFriendUrl}
          target="_blank" // เพื่อให้เปิดในแอป LINE หรือแท็บใหม่
          rel="noopener noreferrer" // เพื่อความปลอดภัย
          className="line-button"
        >
          <img
            src="https://cdn.icon-icons.com/icons2/2429/PNG/512/line_logo_icon_147253.png"
            alt="LINE icon"
            className="line-icon"
          />
          รับการแจ้งเตือนผ่าน LINE
        </a>

      </div>
    </div>
  );
}