//src\components\ZomboidStatus.tsx
"use client";

import { useEffect, useState } from "react";

interface Player {
    name: string;
    onlineTimeMinutes: number;
}

interface ZomboidData {
    id: string;
    serverName?: string;
    map?: string;
    onlinePlayers?: number;
    maxPlayers?: number;
    ping?: number;
    status: "ONLINE" | "OFFLINE";
    timestamp: string;
    playersList?: Player[];
}

// Fallback data shown while loading or when the API is unreachable
const DEFAULTS: ZomboidData = {
    id: "SERVER_1",
    serverName: "Project Zomboid Server",
    map: "—",
    onlinePlayers: 0,
    maxPlayers: 0,
    ping: 0,
    status: "OFFLINE",
    timestamp: "", // ปล่อยว่างไว้ก่อน
    playersList: [],
};

export default function ZomboidStatus() {
    const [data, setData] = useState<ZomboidData>(DEFAULTS);
    const [loading, setLoading] = useState<boolean>(true);

    // 🚨 2. ท่าไม้ตาย Senior: สร้าง State เช็คว่าเว็บโหลดเสร็จหรือยัง
    const [isMounted, setIsMounted] = useState(false);

    const fetchServerData = async () => {
        try {
            setLoading(true);
            const API_URL = process.env.NEXT_PUBLIC_ZOMBOID_API_URL || "https://ptwxvou3i55n47d7bczufqqlia0zmuxy.lambda-url.ap-southeast-2.on.aws/";

            const response = await fetch(API_URL);
            const result = await response.json();

            if (result.success && result.data) {
                setData(result.data);
            }
        } catch (err: any) {
            console.error("[ZomboidStatus] Fetch error:", err.message);
        } finally {
            setLoading(false);
        }
    };

    const getActualStatus = (): "ONLINE" | "OFFLINE" => {
        if (data.status === "OFFLINE" || !data.timestamp) return "OFFLINE";

        const now = Date.now();
        const lastUpdate = new Date(data.timestamp).getTime();
        const diffMinutes = (now - lastUpdate) / (1000 * 60);

        if (diffMinutes > 3) return "OFFLINE";
        return "ONLINE";
    };

    useEffect(() => {
        // 🚨 3. สั่งให้รู้ว่า Client ฝั่งเบราว์เซอร์พร้อมทำงานแล้ว
        setIsMounted(true);
        fetchServerData();
        const intervalId = setInterval(fetchServerData, 60_000);
        return () => clearInterval(intervalId);
    }, []);

    // 🚨 4. ถ้ายังโหลดไม่เสร็จ (กำลัง Hydrate) อย่าเพิ่งพ่น HTML ออกไป ให้โชว์หน้าเปล่าๆ ไปก่อน
    if (!isMounted) {
        return null; // หรือจะใส่ Skeleton Loading หล่อๆ ก็ได้
    }

    const actualStatus = getActualStatus();
    const isOnline = actualStatus === "ONLINE";

    // Stat card helper
    const StatCard = ({
        icon,
        label,
        value,
        iconColor,
        iconBg,
    }: {
        icon: string;
        label: string;
        value: string | number;
        iconColor: string;
        iconBg: string;
    }) => (
        <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4 border border-gray-100">
            <span
                className={`material-symbols-outlined text-[22px] ${iconColor} ${iconBg} p-2 rounded-lg`}
            >
                {icon}
            </span>
            <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    {label}
                </p>
                <p className="text-lg font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Server Header Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-indigo-600 bg-indigo-50 p-2.5 rounded-lg">
                            dns
                        </span>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                {data.serverName || "Project Zomboid Server"}
                            </h2>
                            <p className="text-xs text-gray-400 mt-0.5">
                                ID: {data.id}
                            </p>
                        </div>
                    </div>

                    {/* Animated status badge */}
                    <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${isOnline
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                            }`}
                    >
                        <span
                            className={`inline-block w-2 h-2 rounded-full ${isOnline
                                ? "bg-green-500 animate-pulse"
                                : "bg-gray-400"
                                }`}
                        />
                        {actualStatus}
                    </span>
                </div>

                {/* Loading shimmer overlay */}
                {loading && (
                    <p className="text-xs text-gray-400 mt-3 animate-pulse">
                        Refreshing server data…
                    </p>
                )}
            </div>

            {/* Stats Grid — always visible */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon="map"
                    label="Map"
                    value={data.map || "—"}
                    iconColor="text-blue-600"
                    iconBg="bg-blue-50"
                />
                <StatCard
                    icon="group"
                    label="Players"
                    value={`${data.onlinePlayers ?? 0} / ${data.maxPlayers ?? 0}`}
                    iconColor="text-emerald-600"
                    iconBg="bg-emerald-50"
                />
                <StatCard
                    icon="network_ping"
                    label="Ping"
                    value={`${data.ping ?? 0} ms`}
                    iconColor="text-amber-600"
                    iconBg="bg-amber-50"
                />
                <StatCard
                    icon="schedule"
                    label="Last Update"
                    value={data.timestamp ? new Date(data.timestamp).toLocaleString("th-TH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                    }) : "—"}
                    iconColor="text-purple-600"
                    iconBg="bg-purple-50"
                />
            </div>

            {/* Online Players List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
                <div className="flex items-center gap-3 mb-5">
                    <span className="material-symbols-outlined text-teal-600 bg-teal-50 p-2.5 rounded-lg">
                        person
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">
                        Online Players
                    </h3>
                </div>

                {data.playersList && data.playersList.length > 0 ? (
                    <ul className="space-y-2">
                        {data.playersList.map((player, index) => (
                            <li
                                key={index}
                                className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-100"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-gray-400 text-[18px]">
                                        person
                                    </span>
                                    <span className="text-sm font-medium text-gray-800">
                                        {player.name}
                                    </span>
                                </div>
                                <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                                    {player.onlineTimeMinutes} min
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-8">
                        <span className="material-symbols-outlined text-gray-300 text-[40px] mb-2">
                            group_off
                        </span>
                        <p className="text-sm text-gray-400">
                            {isOnline
                                ? "No players are currently connected."
                                : "The server is offline. Player data will appear here when the server is running."}
                        </p>
                    </div>
                )}
            </div>

            {/* Offline hint banner */}
            {!isOnline && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                    <span className="material-symbols-outlined text-amber-500 text-[20px] mt-0.5 shrink-0">
                        info
                    </span>
                    <p className="leading-relaxed">
                        The server is currently offline or undergoing
                        maintenance. All statistics above will update
                        automatically once the server comes back online. Data
                        refreshes every 60 seconds.
                    </p>
                </div>
            )}
        </div>
    );
}