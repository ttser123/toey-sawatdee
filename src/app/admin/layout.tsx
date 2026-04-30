'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Amplify } from 'aws-amplify';

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID as string,
            userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID as string,
        }
    }
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname(); // เอาไว้เช็คว่าตอนนี้อยู่หน้าไหน จะได้ไฮไลท์เมนูถูก
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await getCurrentUser();
                setIsAuthenticated(true);
            } catch (error) {
                router.replace('/login');
            }
        };
        checkAuth();
    }, [router]);

    const handleLogout = async () => {
        await signOut();
        router.replace('/login');
    };

    // ถ้ายังไม่ผ่าน รปภ. จะเห็นแค่จอดำๆ โหลดดิ้ง
    if (!isAuthenticated) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">กำลังตรวจสอบสิทธิ์...</div>;

    return (
        <div className="flex min-h-screen bg-gray-900 text-white font-sans">

            {/* 🟢 แถบด้านซ้าย (Sidebar) คลีนๆ */}
            <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
                <div className="p-6 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-green-400">Toey Admin Hub</h2>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin/dashboard" className={`block p-3 rounded transition-colors ${pathname === '/admin/dashboard' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                        📊 Dashboard
                    </Link>
                    <Link href="/admin/homelab" className={`block p-3 rounded transition-colors ${pathname === '/admin/homelab' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                        🖥️ Homelab Status
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-700">
                    <button onClick={handleLogout} className="w-full text-left p-3 text-red-400 hover:bg-red-500 hover:text-white rounded transition-colors">
                        🚪 ออกจากระบบ
                    </button>
                </div>
            </aside>

            {/* 🟢 พื้นที่ตรงกลาง สำหรับแสดงเนื้อหาของแต่ละหน้า (children) */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>

        </div>
    );
}