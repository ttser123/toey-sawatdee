"use client";

import { useEffect, useState } from "react";

// กำหนด Type Hints ให้เป๊ะปัง อย่าเขียน TypeScript ให้เป็น AnyScript!
interface ZomboidData {
    id: string;
    serverName?: string;
    map?: string;
    onlinePlayers?: number;
    maxPlayers?: number;
    ping?: number;
    status: "ONLINE" | "OFFLINE";
    timestamp: string;
}

export default function ZomboidStatus() {
    const [data, setData] = useState<ZomboidData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchServerData = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/zomboid");
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || "เกิดข้อผิดพลาดในการดึงข้อมูล API");
            }

            setData(result.data);
            setError(null);
        } catch (err: any) {
            console.error("❌ UI Fetch Error:", err.message);
            setError("ไม่สามารถเชื่อมต่อกับระบบฐานข้อมูลได้");
        } finally {
            setLoading(false);
        }
    };

    // ลอจิก Senior: เช็ค Heartbeat ว่าข้อมูลเก่าเกิน 3 นาทีหรือไม่
    const getActualStatus = (): "ONLINE" | "OFFLINE" => {
        if (!data) return "OFFLINE";
        if (data.status === "OFFLINE") return "OFFLINE";

        const now = new Date().getTime();
        const lastUpdate = new Date(data.timestamp).getTime();
        const diffMinutes = (now - lastUpdate) / (1000 * 60);

        // ถ้าบอกว่าออนไลน์ แต่เวลาเก่าเกิน 3 นาที แปลว่าสปายตาย! บังคับออฟไลน์!
        if (diffMinutes > 3) return "OFFLINE";

        return "ONLINE";
    };

    useEffect(() => {
        // โหลดครั้งแรกทันทีที่ Component Render
        fetchServerData();

        // ลอจิก Polling: ตั้งเวลาให้มันแอบดึงข้อมูลใหม่ทุกๆ 60 วินาที
        const intervalId = setInterval(fetchServerData, 60000);

        // Cleanup function: เคลียร์ Interval ทิ้งเมื่อ Component ถูกทำลาย (กัน Memory Leak!)
        return () => clearInterval(intervalId);
    }, []);

    if (loading && !data) return <div className="animate-pulse flex space-x-4 p-4">กำลังโหลดข้อมูลเซิร์ฟเวอร์...</div>;
    if (error) return <div className="text-red-500 p-4 border border-red-500 rounded bg-red-50">{error}</div>;
    if (!data) return null;

    const actualStatus = getActualStatus();
    const isOnline = actualStatus === "ONLINE";

    return (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl border border-gray-200">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                        {data.serverName || "Project Zomboid Server"}
                    </h2>
                    {/* ป้าย Status ที่เปลี่ยนสีตามสถานะจริง (Heartbeat Validated) */}
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                    >
                        {actualStatus}
                    </span>
                </div>

                {isOnline ? (
                    <div className="space-y-2 text-sm text-gray-600">
                        <p>🌍 <span className="font-semibold">Map:</span> {data.map}</p>
                        <p>👥 <span className="font-semibold">Players:</span> {data.onlinePlayers} / {data.maxPlayers}</p>
                        <p>📶 <span className="font-semibold">Ping:</span> {data.ping} ms</p>
                    </div>
                ) : (
                    <div className="p-4 bg-gray-50 rounded text-center text-sm text-gray-500">
                        เซิร์ฟเวอร์อยู่ในสถานะปิดปรับปรุง หรือกำลังโหลด Mod
                    </div>
                )}

                <div className="mt-6 text-xs text-gray-400 border-t pt-4">
                    อัปเดตล่าสุด: {new Date(data.timestamp).toLocaleString("th-TH")}
                </div>
            </div>
        </div>
    );
}