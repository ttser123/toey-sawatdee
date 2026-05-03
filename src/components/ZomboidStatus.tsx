"use client";

import { useEffect, useState, useCallback } from "react";

// ── Types ────────────────────────────────────────────────────────────

interface Player {
    name: string;
    onlineTimeMinutes: number;
}

interface LastSession {
    uptimeHours: number;
    peakPlayers: number;
    avgPing: number;
    closedAt: string;
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
    lastSession?: LastSession;
    modsList?: string[];
}

interface StatCardProps {
    icon: string;
    label: string;
    value: string | number;
    iconColor: string;
    iconBg: string;
}

// ── Constants ────────────────────────────────────────────────────────

const API_URL =
    process.env.NEXT_PUBLIC_ZOMBOID_API_URL ||
    "https://ptwxvou3i55n47d7bczufqqlia0zmuxy.lambda-url.ap-southeast-2.on.aws/";

const REFRESH_INTERVAL_MS = 60_000;
const STALE_THRESHOLD_MINUTES = 3;

const DEFAULTS: ZomboidData = {
    id: "SERVER_1",
    serverName: "Project Zomboid Server",
    map: "—",
    onlinePlayers: 0,
    maxPlayers: 0,
    ping: 0,
    status: "OFFLINE",
    timestamp: "",
    playersList: [],
};

// ── Sub-components ───────────────────────────────────────────────────

function StatCard({ icon, label, value, iconColor, iconBg }: StatCardProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <span
                className={`material-symbols-outlined text-[22px] ${iconColor} ${iconBg} p-2.5 rounded-lg`}
            >
                {icon}
            </span>
            <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    {label}
                </p>
                <p className="text-lg font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}

function SessionStatRow({
    label,
    value,
    valueColor = "text-gray-900",
    hasBorder = true,
}: {
    label: string;
    value: string;
    valueColor?: string;
    hasBorder?: boolean;
}) {
    return (
        <div
            className={`flex justify-between items-center ${hasBorder ? "pb-3 border-b border-gray-100" : "pt-1"}`}
        >
            <span className="text-sm text-gray-500 font-medium">{label}</span>
            <span className={`text-base font-bold ${valueColor}`}>{value}</span>
        </div>
    );
}

// ── Helpers ──────────────────────────────────────────────────────────

/** Returns "OFFLINE" if the last update is stale (> threshold) or explicitly offline. */
function deriveStatus(data: ZomboidData): "ONLINE" | "OFFLINE" {
    if (data.status === "OFFLINE" || !data.timestamp) return "OFFLINE";

    const diffMinutes =
        (Date.now() - new Date(data.timestamp).getTime()) / (1000 * 60);
    return diffMinutes > STALE_THRESHOLD_MINUTES ? "OFFLINE" : "ONLINE";
}

// ── Main Component ───────────────────────────────────────────────────

export default function ZomboidStatus() {
    const [data, setData] = useState<ZomboidData>(DEFAULTS);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    const fetchServerData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(API_URL);
            const result = await response.json();

            if (result.success && result.data) {
                setData(result.data);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            console.error("[ZomboidStatus] Fetch error:", message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setMounted(true);
        fetchServerData();

        const intervalId = setInterval(fetchServerData, REFRESH_INTERVAL_MS);
        return () => clearInterval(intervalId);
    }, [fetchServerData]);

    // Avoid hydration mismatch — render nothing on server
    if (!mounted) return null;

    const actualStatus = deriveStatus(data);
    const isOnline = actualStatus === "ONLINE";

    return (
        <div className="space-y-6">
            {/* ── Server Header ─────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-blue-600 bg-blue-50 p-2.5 rounded-lg">
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

                    {/* Status badge */}
                    <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${isOnline
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                            }`}
                    >
                        <span
                            className={`inline-block w-2 h-2 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"
                                }`}
                        />
                        {actualStatus}
                    </span>
                </div>

                {loading && (
                    <p className="text-xs text-gray-400 mt-3 animate-pulse">
                        Refreshing server data…
                    </p>
                )}
            </div>

            {/* ── Stats Grid ────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon="map"
                    label="Map"
                    value={isOnline ? (data.map || "—") : "—"}
                    iconColor="text-blue-600"
                    iconBg="bg-blue-50"
                />
                <StatCard
                    icon="group"
                    label="Players"
                    value={isOnline ? `${data.onlinePlayers ?? 0} / ${data.maxPlayers ?? 0}` : "0 / 0"}
                    iconColor="text-emerald-600"
                    iconBg="bg-emerald-50"
                />
                <StatCard
                    icon="network_ping"
                    label="Ping"
                    value={isOnline ? `${data.ping ?? 0} ms` : "0 ms"}
                    iconColor="text-amber-600"
                    iconBg="bg-amber-50"
                />
                <StatCard
                    icon="schedule"
                    label="Last Update"
                    value={
                        data.timestamp
                            ? new Date(data.timestamp).toLocaleString("en-US", {
                                dateStyle: "medium",
                                timeStyle: "short",
                            })
                            : "—"
                    }
                    iconColor="text-purple-600"
                    iconBg="bg-purple-50"
                />
            </div>

            {/* ── Dynamic Content: Online vs Offline View ───────── */}
            {isOnline ? (
                /* 🟢 ONLINE: Active Players */
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow">
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
                            {data.playersList.map((player) => (
                                <li
                                    key={player.name}
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
                                No players are currently connected.
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                /* 🔴 OFFLINE: Last Session Stats */
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-5">
                        <span className="material-symbols-outlined text-purple-600 bg-purple-50 p-2.5 rounded-lg">
                            history
                        </span>
                        <h3 className="text-lg font-bold text-gray-900">
                            Last Session Stats
                        </h3>
                    </div>

                    {data.lastSession ? (
                        <div className="space-y-4">
                            <SessionStatRow
                                label="Session Uptime"
                                value={`${data.lastSession.uptimeHours} Hours`}
                            />
                            <SessionStatRow
                                label="Peak Players"
                                value={`${data.lastSession.peakPlayers} Players`}
                                valueColor="text-emerald-600"
                            />
                            <SessionStatRow
                                label="Average Ping"
                                value={`${data.lastSession.avgPing} ms`}
                                valueColor="text-amber-600"
                            />
                            <SessionStatRow
                                label="Offline Since"
                                value={new Date(
                                    data.lastSession.closedAt
                                ).toLocaleString("en-US", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                })}
                                hasBorder={false}
                            />
                        </div>
                    ) : (
                        <div className="text-center py-8 flex flex-col justify-center items-center">
                            <span className="material-symbols-outlined text-gray-300 text-[40px] mb-2">
                                hourglass_empty
                            </span>
                            <p className="text-sm text-gray-400">
                                Historical data is currently unavailable.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* ── Active Mods (always visible) ────────────────────── */}
            {data.modsList && data.modsList.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-orange-600 bg-orange-50 p-2.5 rounded-lg">
                                extension
                            </span>
                            <h3 className="text-lg font-bold text-gray-900">
                                Active Mods ({data.modsList.length})
                            </h3>
                        </div>
                        {!isOnline && data.timestamp && (
                            <span className="text-xs text-gray-400 font-medium">
                                Last updated:{" "}
                                {new Date(data.timestamp).toLocaleString("en-US", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                })}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-2">
                        {data.modsList.map((modName, index) => (
                            <span
                                key={index}
                                className="px-3 py-1.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-md border border-gray-200 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 transition-colors"
                            >
                                {modName}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Offline Banner ──────────────────────────────────── */}
            {!isOnline && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                    <span className="material-symbols-outlined text-amber-500 text-[20px] mt-0.5 shrink-0">
                        info
                    </span>
                    <p className="leading-relaxed">
                        The server is currently offline or undergoing maintenance.
                        All statistics above will update automatically once the
                        server comes back online. Data refreshes every 60 seconds.
                    </p>
                </div>
            )}
        </div>
    );
}