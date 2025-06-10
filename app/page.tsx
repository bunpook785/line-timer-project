export default function HomePage() {
  return (
    <div className="container">
      <div className="header-section">
        <h1>🧺 Washing & Drying 🧺</h1>
        <p>ร้านซัก-อบ จบครบที่เดียว หน้าโลตัสอินทร์</p>
      </div>

      <p className="intro-message">
        สวัสดีค่ะ 🙏🏻❤️
        <br />
        <span className="emoji">✨</span> ระบบแจ้งเตือนอัตโนมัติ สำหรับผ้าของคุณ{" "}
        <span className="emoji">✨</span>
      </p>

      <div className="instruction-box">
        <h2>ขั้นตอนง่ายๆ!</h2>
        <p>
          <span className="emoji">1️⃣</span> เพียงแค่คุณ{" "}
          <strong>
            <span className="highlight">พิมพ์หมายเลขเครื่อง</span>
          </strong>{" "}
          ที่หน้าเครื่องซักผ้า
        </p>
        <p>
          <span className="emoji">2️⃣</span> คุณ{" "}
          <strong>
            <span className="highlight">ไม่ต้องทำอะไรเพิ่มเติม</span>
          </strong>{" "}
          เลยค่ะ!
        </p>
        <p style={{ marginTop: '15px' }}>เมื่อผ้าของคุณซักเสร็จแล้ว...</p>
        <p>
          <span className="emoji">🔔</span>{" "}
          <strong>เราจะแจ้งให้คุณทราบทันที!</strong>{" "}
          <span className="emoji">😊</span>
        </p>
      </div>

      <div className="line-add-button-section">
        <p>
          เพื่อไม่ให้พลาดการแจ้งเตือนสุดพิเศษ
          <br />
          และโปรโมชั่นดีๆ จากทางร้าน
        </p>

        <a
          href="https://line.me/R/ti/p/@027yxvoh"
          target="_blank"
          className="line-button"
        >
          <img
            src="https://cdn.icon-icons.com/icons2/2429/PNG/512/line_logo_icon_147253.png"
            alt="LINE icon"
            className="line-icon"
          />
          เพิ่มเพื่อนใน LINE รับการแจ้งเตือน
        </a>

        <p className="footer-note">
          (การแจ้งเตือนจะถูกส่งผ่าน LINE Official Account ของเราโดยตรง)
        </p>
      </div>
    </div>
  );
}