"use client"; // ยังคงต้องมีคำสั่งนี้

import { useState } from 'react'; // << นำเข้าเครื่องมือสำหรับ "จดจำ"

export default function HomePage() {
  // สร้าง state เพื่อ "จำ" หมายเลขเครื่องที่ถูกเลือก, เริ่มต้นยังไม่เลือก (null)
  const [selectedMachine, setSelectedMachine] = useState<number | null>(null);

  const handleLogin = () => {
    // ถ้ายังไม่ได้เลือกเครื่อง ก็ไม่ต้องทำอะไร
    if (!selectedMachine) {
      alert("กรุณาเลือกเครื่องซักผ้าก่อนค่ะ");
      return;
    }

    const lineLoginUrl = "https://access.line.me/oauth2/v2.1/authorize";
    
    // เราจะเพิ่มหมายเลขเครื่องเข้าไปใน state เพื่อส่งต่อไปด้วย
    const stateData = {
      machine: selectedMachine,
      nonce: "12345abcde" // ค่าสุ่มสำหรับป้องกันการโจมตี
    };
    
    const params = {
      response_type: "code",
      client_id: process.env.NEXT_PUBLIC_LINE_CHANNEL_ID!,
      redirect_uri: `https://line-timer-project.vercel.app/api/auth/callback`,
      state: JSON.stringify(stateData), // แปลง object เป็นข้อความ
      scope: "profile openid",
    };

    const queryString = new URLSearchParams(params).toString();
    
    window.location.href = `${lineLoginUrl}?${queryString}`;
  };

  const machines = [1, 2, 3, 4]; // รายการเครื่องซักผ้า

  return (
    <div className="container">
      <div className="card">
        <h1>🧺 Washing & Drying 🧺</h1>
        <p>ร้านซัก-อบ จบครบที่เดียว หน้าโลตัสอินทร์</p>
        
        <div className="machine-selection">
          <h2>กรุณาเลือกเครื่องซักผ้าของคุณ</h2>
          <div className="machine-buttons">
            {machines.map((num) => (
              <button
                key={num}
                className={`machine-button ${selectedMachine === num ? 'selected' : ''}`}
                onClick={() => setSelectedMachine(num)}
              >
                เครื่องที่ {num}
              </button>
            ))}
          </div>
          {selectedMachine && (
            <p className="selection-info">คุณเลือก: **เครื่องที่ {selectedMachine}**</p>
          )}
        </div>

        <button 
          onClick={handleLogin} 
          className="line-button"
          disabled={!selectedMachine} // ปุ่มจะกดไม่ได้ถ้ายังไม่เลือกเครื่อง
        >
          <img
            src="https://cdn.icon-icons.com/icons2/2429/PNG/512/line_logo_icon_147253.png"
            alt="LINE icon"
            className="line-icon"
          />
          เริ่มจับเวลา 25 นาที (ด้วย LINE)
        </button>

        <p className="footer-note">
          (ระบบจะขออนุญาตเข้าถึงโปรไฟล์ LINE ของคุณเพื่อใช้ในการส่งข้อความ)
        </p>
      </div>
    </div>
  );
}