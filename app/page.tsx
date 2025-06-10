"use client";

import { useState } from 'react';

export default function HomePage() {
  const [selectedMachine, setSelectedMachine] = useState<number | null>(null);

  // ฟังก์ชัน handleLogin จะง่ายลงมาก แค่ส่งไปที่หลังบ้านของเรา
  const handleLogin = () => {
    if (!selectedMachine) {
      alert("กรุณาเลือกเครื่องซักผ้าก่อนค่ะ");
      return;
    }
    // เปลี่ยนจากการสร้าง URL เอง เป็นการเรียก API ของเราแทน
    window.location.href = `/api/auth/login?machine=${selectedMachine}`;
  };

  const machines = [1, 2, 3, 4];

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
          <p className="selection-info">คุณเลือก: <strong>เครื่องที่ {selectedMachine}</strong></p>
        )}
      </div>

      <button 
        onClick={handleLogin} 
        className="line-button"
        disabled={!selectedMachine}
      >
        <img
          src="https://cdn.icon-icons.com/icons2/2429/PNG/512/line_logo_icon_147253.png"
          alt="LINE icon"
          className="line-icon"
        />
        รับการแจ้งเตือนหลังซักผ้าเสร็จ
      </button>

      <p className="footer-note">
        (ระบบจะขออนุญาตเข้าถึงโปรไฟล์ LINE ของคุณเพื่อใช้ในการส่งข้อความ)
      </p>
    </div>
  </div>
  );
}