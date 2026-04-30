
'use client';

import { useState } from 'react';
import { signIn } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import { useRouter } from 'next/navigation';

// 1. ผูก Amplify เข้ากับ Cognito ของมึง (บอกทะเบียนบ้าน)
Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID as string,
            userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID as string,
        }
    }
});

export default function LoginPage() {
    const router = useRouter();

    // State สำหรับเก็บค่าที่พิมพ์และแจ้งเตือน Error
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 2. ฟังก์ชันจับการกดปุ่ม Submit
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); // ป้องกันหน้าเว็บรีเฟรชโง่ๆ
        setIsLoading(true);
        setErrorMsg('');

        try {
            // โยนให้ Amplify ไปคุยกับ Cognito
            const { isSignedIn } = await signIn({
                username: email,
                password
            });

            if (isSignedIn) {
                console.log("✅ ล็อกอินผ่าน! ได้ตั๋ว JWT มาแล้ว");
                // TODO: สั่งเปลี่ยนหน้าไป Dashboard
                router.replace('/admin/dashboard');
            }
        } catch (error: any) {
            console.error("❌ ล็อกอินพัง:", error);
            setErrorMsg(error.message || "รหัสผ่านผิด หรือบัญชีมึงไม่มีอยู่จริง!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
                <h1 className="text-3xl font-bold text-white mb-6 text-center">เข้าสู่ระบบ Admin</h1>

                {/* โชว์ Error สีแดงถ้าล็อกอินพัง */}
                {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">อีเมล (Username)</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-900 text-white border border-gray-600 rounded p-2 focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-1">รหัสผ่าน</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-900 text-white border border-gray-600 rounded p-2 focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
                    </button>
                </form>
            </div>
        </main>
    );
}