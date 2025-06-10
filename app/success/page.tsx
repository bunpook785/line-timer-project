'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const machine = searchParams.get('machine');

  return (
    <div className="container">
      <div className="card" style={{ animation: 'fadeIn 1s ease-out' }}>
        <span style={{ fontSize: '4rem' }}>✅</span>
        <h1>ตั้งค่าสำเร็จ!</h1>
        <p style={{ fontSize: '1.2rem', margin: '20px 0' }}>
          ระบบจะแจ้งเตือนเมื่อเครื่องซักผ้าหมายเลข{' '}
          <strong>{machine || 'ของคุณ'}</strong> ทำงานเสร็จสิ้น
        </p>
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