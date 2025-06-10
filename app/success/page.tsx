'use client';

import { Suspense } from 'react'; // << นำเข้า Suspense จาก React
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// สร้างคอมโพเนนต์ย่อยสำหรับแสดงผลส่วนที่ต้องรอข้อมูล
function SuccessContent() {
    const searchParams = useSearchParams();
    const machine = searchParams.get('machine');

    return (
        <p style={{ fontSize: '1.2rem', margin: '20px 0' }}>
          ระบบจะแจ้งเตือนเมื่อเครื่องซักผ้าหมายเลข{' '}
          <strong>{machine || 'ของคุณ'}</strong> ทำงานเสร็จสิ้น
        </p>
    );
}

// นี่คือคอมโพเนนต์หลักของหน้า
export default function SuccessPage() {
  return (
    <div className="container">
      <div className="card" style={{ animation: 'fadeIn 1s ease-out' }}>
        <span style={{ fontSize: '4rem' }}>✅</span>
        <h1>ตั้งค่าสำเร็จ!</h1>

        {/* เราจะใช้ Suspense ห่อคอมโพเนนต์ที่ต้องรอข้อมูล */}
        <Suspense fallback={<p>กำลังโหลดข้อมูล...</p>}>
          <SuccessContent />
        </Suspense>

        <p>(ในอีกประมาณ 25 นาที)</p>
        <p>ตอนนี้คุณสามารถปิดหน้านี้ได้เลยค่ะ</p>
        <Link 
          href="/" 
          className="line-button" 
          style={{ 
            marginTop: '20px', 
            backgroundColor: '#6c757d',
            boxShadow: 'none' 
          }}
        >
          กลับไปหน้าแรก
        </Link>
      </div>
    </div>
  );
}