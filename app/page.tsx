"use client";

import { useState } from 'react';

export default function HomePage() {
  const [selectedMachine, setSelectedMachine] = useState<number | null>(null);

  const handleLogin = () => {
    if (!selectedMachine) {
      alert("กรุณาเลือกเครื่องซักผ้าก่อนค่ะ");
      return;
    }

    const lineLoginUrl = "https://access.line.me/oauth2/v2.1/authorize";
    
    const stateData = {
      machine: selectedMachine,
      nonce: "12345abcde" 
    };
    
    const params = {
      response_type: "code",
      client_id: process.env.NEXT_PUBLIC_LINE_CHANNEL_ID!,
      redirect_uri: `https://line-timer-project.vercel.app/api/auth/callback`,
      state: JSON.stringify(stateData),
      scope: "profile openid",
    };

    const queryString = new URLSearchParams(params).toString();
    
    window.location.href = `${lineLoginUrl}?${queryString}`;
  };

  const machines = [1, 2, 3, 4];

  return (
    <div className="container">
      <div className="header-section">
        <h1>🧺 Washing & Drying 🧺</h1>
        <p>ร้านซัก-อบ จบครบที่เดียว หน้าโลตัสอินทร์</p>
      </div>
      
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
        เริ่มจับเวลา 25 นาที (ด้วย LINE)
      </button>

      <p className="footer-note">
        (ระบบจะขออนุญาตเข้าถึงโปรไฟล์ LINE ของคุณเพื่อใช้ในการส่งข้อความ)
      </p>
    </div>
  );
}