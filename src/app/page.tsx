'use client'; // บังคับให้ไฟล์นี้ทำงานฝั่ง Client (Browser) เพราะเราต้องใช้ useEffect ดึง API

import { useEffect, useState } from 'react';

export default function ResumePage() {
  // สร้าง State มารับค่าตัวเลข ค่าเริ่มต้นคือ 0 หรือสถานะโหลด
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  useEffect(() => {
    // ฟังก์ชันสำหรับดึงข้อมูลจาก API
    const fetchVisitorCount = async () => {
      try {
        // ดึง URL มาจาก .env 
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) throw new Error("มึงลืมใส่ URL ใน .env!");

        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("API พัง!");

        const data = await response.json();
        setVisitorCount(data.count); // เอาตัวเลขที่ได้ ยัดใส่ State
      } catch (error) {
        console.error("เกิดข้อผิดพลาด:", error);
      }
    };

    fetchVisitorCount(); // สั่งให้ฟังก์ชันทำงาน
  }, []); // Array ว่างๆ [] หมายความว่าให้ทำแค่ "ครั้งเดียว" ตอนที่เปิดเว็บมา

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">

        <h1 className="text-4xl font-extrabold text-blue-400 mb-4">
          Parinya Sawatdee (Toey)
        </h1>
        <h2 className="text-xl text-gray-400 mb-8 border-b border-gray-700 pb-4">
          Cloud Infrastructure & DevSecOps Engineer
        </h2>

        <div className="space-y-4 text-gray-300">
          <p>🔥 ทักษะ: AWS, Serverless, Terraform, Docker, CI/CD</p>
          <p>🎯 เป้าหมาย: System Administrator / DevOps ที่ออสเตรเลีย</p>
        </div>

        {/* ตรงนี้แหละคือที่แสดงตัวเลขคนเข้าเว็บ! */}
        <div className="mt-12 bg-gray-900 rounded-lg p-4 text-center border border-gray-700 shadow-inner">
          <p className="text-sm text-gray-400 uppercase tracking-widest">
            Profile Views
          </p>
          <p className="text-5xl font-black text-green-400 mt-2">
            {visitorCount !== null ? visitorCount : "..."}
          </p>
        </div>

      </div>
    </main>
  );
}