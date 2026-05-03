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
    const [modSearch, setModSearch] = useState("");
    const [showRaw, setShowRaw] = useState(false);

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
        fetchServerData();

        const intervalId = setInterval(fetchServerData, REFRESH_INTERVAL_MS);
        return () => clearInterval(intervalId);
    }, [fetchServerData]);

    const actualStatus = deriveStatus(data);
    const isOnline = actualStatus === "ONLINE";

    return (
        <div className="space-y-6">
            {/* ── Offline Banner ──────────────────────────────────── */}
            {!isOnline && (
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <span className="material-symbols-outlined text-amber-500 text-[22px] shrink-0">
                        notification_important
                    </span>
                    <p className="leading-relaxed font-medium">
                        Server is currently offline. Statistics will update automatically (every 60s) once online.
                    </p>
                </div>
            )}

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

                    <div className="flex items-center gap-3">
                        {/* Raw Payload Button */}
                        <button
                            onClick={() => setShowRaw(true)}
                            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors font-mono text-[11px] font-medium tracking-wide"
                        >
                            <span className="text-gray-800 font-bold">{`{ }`}</span> View Raw Payload
                        </button>

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

                    {/* Search */}
                    <div className="relative mb-4">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                            search
                        </span>
                        <input
                            type="text"
                            placeholder="Search mods..."
                            value={modSearch}
                            onChange={(e) => setModSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-colors"
                        />
                        {modSearch && (
                            <button
                                onClick={() => setModSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                        )}
                    </div>

                    {(() => {
                        const filtered = [...data.modsList]
                            .filter((m) => m.toLowerCase().includes(modSearch.toLowerCase()))
                            .sort((a, b) => a.localeCompare(b));

                        return filtered.length > 0 ? (
                            <ul className="space-y-1.5 max-h-72 overflow-y-auto pr-2">
                                {filtered.map((modName, index) => (
                                    <li
                                        key={modName}
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors group"
                                    >
                                        <span className="text-xs text-gray-300 font-mono w-6 text-right shrink-0 group-hover:text-orange-400">
                                            {index + 1}
                                        </span>
                                        <span className="text-sm text-gray-700 font-medium group-hover:text-orange-700">
                                            {modName}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-6">
                                <span className="material-symbols-outlined text-gray-300 text-[32px] mb-1">
                                    search_off
                                </span>
                                <p className="text-sm text-gray-400">
                                    No mods matching &ldquo;{modSearch}&rdquo;
                                </p>
                            </div>
                        );
                    })()}
                </div>
            )}

            {showRaw && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowRaw(false)}>
                    <div className="bg-white border border-gray-200 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center gap-2.5 text-gray-700 font-mono text-sm tracking-wide">
                                <span className="text-gray-900 font-bold text-lg leading-none mt-[-2px]">{`{ }`}</span>
                                <span>lambda_response.json</span>
                            </div>
                            <button onClick={() => setShowRaw(false)} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors">
                                <span className="material-symbols-outlined text-[20px] block">close</span>
                            </button>
                        </div>
                        <div className="p-5 overflow-auto flex-1 custom-scrollbar bg-white">
                            <pre className="text-gray-800 font-mono text-[13px] leading-relaxed selection:bg-blue-100 selection:text-blue-900">
                                {JSON.stringify(data, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}