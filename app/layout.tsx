import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";

const kanit = Kanit({ 
  subsets: ["latin", "thai"], 
  weight: ["300", "400", "600"] 
});

export const metadata: Metadata = {
  title: "Washing & Drying - แจ้งเตือนซักผ้าอัตโนมัติ",
  description: "ระบบแจ้งเตือนอัตโนมัติเมื่อผ้าซักเสร็จ สำหรับร้าน Washing & Drying",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={kanit.className}>{children}</body>
    </html>
  );
}