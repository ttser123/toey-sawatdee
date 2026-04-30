'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import { Amplify } from 'aws-amplify';

// 1. ผูก Amplify อีกรอบ (เพราะเป็น Client Component แยกกัน)
Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID as string,
            userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID as string,
        }
    }
});

export default function DashboardPage() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        // ฟังก์ชัน รปภ. ตรวจบัตรฝั่งหน้าบ้าน
        const checkAuth = async () => {
            try {
                // ลองดึงข้อมูลคนที่ล็อกอินอยู่
                const user = await getCurrentUser();
                setIsAuthenticated(true);
                setUserEmail(user.signInDetails?.loginId || 'Admin');
            } catch (error) {
                console.error("❌ มึงยังไม่ได้ล็อกอิน เตะกลับไปหน้า Login!");
                router.replace('/login'); // เตะก้านคอกลับไปหน้า Login ทันที
            }
        };

        checkAuth();
    }, [router]);

    // ฟังก์ชันเตะตัวเองออกจากระบบ
    const handleLogout = async () => {
        try {
            await signOut(); // ฉีกตั๋ว JWT ทิ้ง
            router.replace('/login');
        } catch (error) {
            console.error("❌ Logout พัง:", error);
        }
    };

    // ถ้ากำลังเช็คบัตรอยู่ ให้โชว์หน้าจอโหลด (อย่าเพิ่งให้เห็น UI)
    if (!isAuthenticated) {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white text-xl font-bold">กำลังตรวจสอบสิทธิ์...</div>;
    }

    // ถ้าเช็คผ่านแล้ว ถึงจะโชว์ข้อมูลความลับ
    return (
        <main className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-green-400">Admin Dashboard</h1>
                        <p className="text-gray-400 mt-1">ยินดีต้อนรับ, {userEmail}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-bold transition-colors shadow-lg"
                    >
                        ออกจากระบบ
                    </button>
                </div>

                {/* โซนโชว์ข้อมูล */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h2 className="text-xl font-bold text-blue-400 mb-4">สรุปรายจ่ายเซิร์ฟเวอร์</h2>
                        <p className="text-gray-300">... รอต่อ API ดึงข้อมูลจาก DynamoDB ...</p>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h2 className="text-xl font-bold text-yellow-400 mb-4">สถานะ Home Lab</h2>
                        <p className="text-gray-300">... รอต่อ API ดึงสถานะ Docker ...</p>
                    </div>
                </div>
            </div>
        </main>
    );
}