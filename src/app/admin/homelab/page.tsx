'use client';

import { useState, useEffect } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

// ⚠️ ใส่ URL จริงของ API มึงตรงนี้!
const API_URL = "https://z6nzmodjph.execute-api.ap-southeast-2.amazonaws.com/homelab/status";

interface ServerStatus {
    sort_key: string;
    status: string;
    ping: string;
    players: string;
    last_updated: string;
}

export default function HomelabPage() {
    const [serverData, setServerData] = useState<ServerStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // ฟังก์ชันดึงข้อมูลจาก API พร้อมแนบ Token
    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. ไปฉก JWT Token ที่ Amplify ซ่อนไว้ใน LocalStorage ออกมา!
            const session = await fetchAuthSession();
            const token = session.tokens?.accessToken?.toString();

            if (!token) throw new Error("No Token! มึงแอบเข้ามาได้ไงเนี่ย!");

            // 2. ยิง API พร้อมแนบ Token ไปใน Header ให้ รปภ. Cognito ดู
            const res = await fetch(API_URL, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error(`API พัง! รหัส: ${res.status}`);

            // 3. แกะกล่องข้อมูล
            const json = await res.json();
            setServerData(json.data || []);

        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ให้มันดึงข้อมูลทันทีที่เปิดหน้านี้ขึ้นมา
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                <h1 className="text-3xl font-bold">Homelab Status</h1>
                {/* ปุ่ม Refresh ข้อมูล */}
                <button
                    onClick={fetchData}
                    className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-bold transition-colors"
                >
                    {loading ? 'กำลังโหลด...' : 'รีเฟรช'}
                </button>
            </div>

            {error && <p className="text-red-500 mb-4 bg-red-500/10 p-4 border border-red-500 rounded">Error: {error}</p>}

            {loading ? (
                <p className="text-gray-400">กำลังดูดข้อมูลจาก DynamoDB...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {serverData.length === 0 ? (
                        <p className="text-gray-400 col-span-full">ไม่พบข้อมูลเซิร์ฟเวอร์!</p>
                    ) : (
                        serverData.map((server) => {
                            // ตัดคำว่า 'SERVER#' ออกจากชื่อ
                            const name = server.sort_key.replace('SERVER#', '');
                            return (
                                <div key={server.sort_key} className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-md relative overflow-hidden">

                                    {/* แถบสีด้านบนโง่ๆ ให้ดูสวย */}
                                    <div className={`absolute top-0 left-0 w-full h-1 ${server.status === 'Online' ? 'bg-green-500' : 'bg-red-500'}`}></div>

                                    <h3 className="text-xl font-semibold mb-2">{name}</h3>

                                    <div className="flex items-center mb-4">
                                        <span className={`w-3 h-3 rounded-full mr-2 ${server.status === 'Online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                        <span className={server.status === 'Online' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                                            {server.status}
                                        </span>
                                    </div>

                                    <div className="text-sm text-gray-300 space-y-2 bg-gray-900/50 p-3 rounded">
                                        <p className="flex justify-between"><span>Ping:</span> <span>{server.ping}</span></p>
                                        <p className="flex justify-between"><span>Players:</span> <span>{server.players}</span></p>
                                    </div>

                                    <p className="text-xs text-gray-500 mt-4 text-right">อัปเดตล่าสุด: {server.last_updated}</p>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}