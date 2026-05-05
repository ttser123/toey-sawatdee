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

function StatCard({ icon, label, value, iconColor }: StatCardProps) {
    return (
        <div className="card-blueprint p-5 flex items-center gap-4 transition-colors hover:border-indigo-300">
            <span
                className={`material-symbols-outlined text-[22px] ${iconColor} bg-slate-50 p-2.5 rounded-sm`}
            >
                {icon}
            </span>
            <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                    {label}
                </p>
                <p className="text-lg font-bold text-slate-800 font-mono">{value}</p>
            </div>
        </div>
    );
}

function SessionStatRow({
    label,
    value,
    valueColor = "text-slate-800",
    hasBorder = true,
}: {
    label: string;
    value: string;
    valueColor?: string;
    hasBorder?: boolean;
}) {
    return (
        <div
            className={`flex justify-between items-center ${hasBorder ? "pb-3 border-b border-slate-200" : "pt-1"}`}
        >
            <span className="text-sm text-slate-500 font-medium">{label}</span>
            <span className={`text-base font-bold font-mono ${valueColor}`}>{value}</span>
        </div>
    );
}

// ── Helpers ──────────────────────────────────────────────────────────

/** Returns "OFFLINE" if the last update is stale (>threshold) or explicitly offline. */
function deriveStatus(data: ZomboidData): "ONLINE" | "OFFLINE" {
    if (data.status === "OFFLINE" || !data.timestamp) return "OFFLINE";

    const diffMinutes =
        (Date.now() - new Date(data.timestamp).getTime()) / (1000 * 60);
    return diffMinutes > STALE_THRESHOLD_MINUTES ? "OFFLINE" : "ONLINE";
}

/** Format a date string for display */
function formatDate(dateStr: string): string {
    try {
        return new Date(dateStr).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    } catch {
        return "—";
    }
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

    // ── Derive "last known snapshot" when offline ────────────────────
    // The backend doesn't always push a lastSession object, but the
    // main payload still holds the last-known state (players, ping, etc.).
    // We expose this as a "Last Known Snapshot" when the server is offline.
    const hasBackendSession = !!data.lastSession;
    const hasSnapshotData = !!data.timestamp;

    return (
        <div className="space-y-6">
            {/* ── Offline Banner ──────────────────────────────────── */}
            {!isOnline && (
                <div className="flex items-center gap-3 border-2 border-dashed border-slate-300 bg-white/60 backdrop-blur-sm rounded-sm p-4 text-sm text-slate-600 animate-in fade-in slide-in-from-top-2 duration-300">
                    <span className="material-symbols-outlined text-slate-400 text-[22px] shrink-0">
                        notification_important
                    </span>
                    <p className="leading-relaxed font-medium">
                        Server is currently offline. Statistics will update automatically (every <span className="font-mono text-indigo-600">60s</span>) once online.
                    </p>
                </div>
            )}

            {/* ── Server Header ─────────────────────────────────── */}
            <div className="card-blueprint p-6 md:p-8 transition-colors hover:border-indigo-300">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
                    <div className="flex items-center gap-3 min-w-0">
                        <span className="material-symbols-outlined text-indigo-600 bg-indigo-50 p-2.5 rounded-sm shrink-0">
                            dns
                        </span>
                        <div className="min-w-0">
                            <h2 className="text-lg font-bold text-slate-800 truncate">
                                {data.serverName || "Project Zomboid Server"}
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5 font-mono">
                                ID: {data.id}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {/* Raw Payload Button — full text on sm+, icon-only on mobile */}
                        <button
                            onClick={() => setShowRaw(true)}
                            className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 rounded-sm bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-600 hover:text-slate-900 transition-colors font-mono text-[11px] font-medium tracking-wide"
                        >
                            <span className="text-slate-800 font-bold">{`{ }`}</span>
                            <span className="hidden sm:inline">View Raw Payload</span>
                        </button>

                        {/* Status badge */}
                        <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-semibold tracking-wide font-mono ${isOnline
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-500 border border-slate-300"
                                }`}
                        >
                            {/* 6. Radar ping for ONLINE status dot */}
                            <span className="relative inline-flex h-2 w-2">
                                {isOnline && (
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-radar-ping" />
                                )}
                                <span
                                    className={`relative inline-flex h-2 w-2 rounded-full ${isOnline ? "bg-emerald-500" : "bg-slate-400"
                                        }`}
                                />
                            </span>
                            {actualStatus}
                        </span>
                    </div>
                </div>

                {loading && (
                    <p className="text-xs text-slate-400 mt-3 animate-pulse font-mono">
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
                    iconColor="text-indigo-600"
                />
                <StatCard
                    icon="group"
                    label="Players"
                    value={isOnline ? `${data.onlinePlayers ?? 0} / ${data.maxPlayers ?? 0}` : "0 / 0"}
                    iconColor="text-emerald-600"
                />
                <StatCard
                    icon="network_ping"
                    label="Ping"
                    value={isOnline ? `${data.ping ?? 0} ms` : "0 ms"}
                    iconColor="text-indigo-600"
                />
                <StatCard
                    icon="schedule"
                    label="Last Update"
                    value={data.timestamp ? formatDate(data.timestamp) : "—"}
                    iconColor="text-slate-500"
                />
            </div>

            {/* ── Dynamic Content: Online vs Offline View ───────── */}
            {isOnline ? (
                /* 🟢 ONLINE: Active Players */
                <div className="card-blueprint p-6 md:p-8 transition-colors hover:border-indigo-300">
                    <div className="flex items-center gap-3 mb-5">
                        <span className="material-symbols-outlined text-indigo-600 bg-indigo-50 p-2.5 rounded-sm">
                            person
                        </span>
                        <h3 className="text-lg font-bold text-slate-800">
                            Online Players
                        </h3>
                    </div>

                    {data.playersList && data.playersList.length > 0 ? (
                        <ul className="space-y-2">
                            {data.playersList.map((player) => (
                                <li
                                    key={player.name}
                                    className="flex items-center justify-between bg-slate-50/60 rounded-sm px-4 py-3 border border-slate-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-slate-400 text-[18px]">
                                            person
                                        </span>
                                        <span className="text-sm font-medium text-slate-800 font-mono">
                                            {player.name}
                                        </span>
                                    </div>
                                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-sm font-mono font-medium border border-indigo-200">
                                        {player.onlineTimeMinutes} min
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-sm">
                            <span className="material-symbols-outlined text-slate-300 text-[40px] mb-2">
                                group_off
                            </span>
                            <p className="text-sm text-slate-400 font-mono">
                                No players are currently connected.
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                /* 🔴 OFFLINE: Last Session / Last Known Snapshot */
                <div className="space-y-6">
                    {/* ── Last Session Stats (from Guardian Agent or derived snapshot) ── */}
                    <div className="card-blueprint p-6 md:p-8 transition-colors hover:border-indigo-300">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-indigo-600 bg-indigo-50 p-2.5 rounded-sm">
                                    history
                                </span>
                                <h3 className="text-lg font-bold text-slate-800">
                                    Last Session Snapshot
                                </h3>
                            </div>
                            {data.timestamp && (
                                <span className="text-xs text-slate-400 font-mono font-medium">
                                    Data from: {formatDate(data.timestamp)}
                                </span>
                            )}
                        </div>

                        {hasBackendSession ? (
                            /* Guardian Agent pushed full session data */
                            <div className="space-y-4">
                                <SessionStatRow
                                    label="Session Uptime"
                                    value={`${data.lastSession!.uptimeHours} Hours`}
                                />
                                <SessionStatRow
                                    label="Peak Players"
                                    value={`${data.lastSession!.peakPlayers} Players`}
                                    valueColor="text-emerald-600"
                                />
                                <SessionStatRow
                                    label="Average Ping"
                                    value={`${data.lastSession!.avgPing} ms`}
                                    valueColor="text-indigo-600"
                                />
                                <SessionStatRow
                                    label="Offline Since"
                                    value={formatDate(data.lastSession!.closedAt)}
                                    hasBorder={false}
                                />
                            </div>
                        ) : hasSnapshotData ? (
                            /* No Guardian session, but we have the last-known payload data */
                            <div className="space-y-4">
                                <SessionStatRow
                                    label="Server Name"
                                    value={data.serverName || "—"}
                                />
                                <SessionStatRow
                                    label="Map"
                                    value={data.map || "—"}
                                />
                                <SessionStatRow
                                    label="Players at Last Check"
                                    value={`${data.onlinePlayers ?? 0} / ${data.maxPlayers ?? 0}`}
                                    valueColor="text-emerald-600"
                                />
                                <SessionStatRow
                                    label="Last Known Ping"
                                    value={`${data.ping ?? 0} ms`}
                                    valueColor="text-indigo-600"
                                />
                                <SessionStatRow
                                    label="Last Seen Online"
                                    value={formatDate(data.timestamp)}
                                    hasBorder={false}
                                />
                            </div>
                        ) : (
                            <div className="text-center py-8 flex flex-col justify-center items-center border-2 border-dashed border-slate-300 rounded-sm">
                                <span className="material-symbols-outlined text-slate-300 text-[40px] mb-2">
                                    hourglass_empty
                                </span>
                                <p className="text-sm text-slate-400 font-mono">
                                    No session data available yet.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ── Last Known Players ──────────────────────────── */}
                    {data.playersList && data.playersList.length > 0 && (
                        <div className="card-blueprint p-6 md:p-8 transition-colors hover:border-indigo-300">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-indigo-600 bg-indigo-50 p-2.5 rounded-sm">
                                        group
                                    </span>
                                    <h3 className="text-lg font-bold text-slate-800">
                                        Last Known Players
                                    </h3>
                                </div>
                                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-sm font-mono font-medium border border-slate-300">
                                    {data.playersList.length} player{data.playersList.length !== 1 ? "s" : ""}
                                </span>
                            </div>

                            <ul className="space-y-2">
                                {data.playersList.map((player) => (
                                    <li
                                        key={player.name}
                                        className="flex items-center justify-between bg-slate-50/60 rounded-sm px-4 py-3 border border-slate-200"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-slate-400 text-[18px]">
                                                person
                                            </span>
                                            <span className="text-sm font-medium text-slate-800 font-mono">
                                                {player.name}
                                            </span>
                                        </div>
                                        <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-sm font-mono font-medium border border-slate-200">
                                            {player.onlineTimeMinutes} min
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <p className="text-xs text-slate-400 mt-3 font-mono">
                                Snapshot from last online session — {formatDate(data.timestamp)}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* ── Active Mods (always visible) ────────────────────── */}
            {data.modsList && data.modsList.length > 0 && (
                <div className="card-blueprint p-6 md:p-8 transition-colors hover:border-indigo-300">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-indigo-600 bg-indigo-50 p-2.5 rounded-sm">
                                extension
                            </span>
                            <h3 className="text-lg font-bold text-slate-800">
                                Active Mods (<span className="font-mono">{data.modsList.length}</span>)
                            </h3>
                        </div>
                        {!isOnline && data.timestamp && (
                            <span className="text-xs text-slate-400 font-mono font-medium">
                                Last updated:{" "}
                                {formatDate(data.timestamp)}
                            </span>
                        )}
                    </div>

                    {/* Search */}
                    <div className="relative mb-4">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                            search
                        </span>
                        <input
                            type="text"
                            placeholder="Search mods..."
                            value={modSearch}
                            onChange={(e) => setModSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-sm bg-white/60 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors font-mono"
                        />
                        {modSearch && (
                            <button
                                onClick={() => setModSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                                        className="flex items-center gap-3 px-3 py-2 rounded-sm hover:bg-indigo-50 transition-colors group border border-transparent hover:border-indigo-200"
                                    >
                                        <span className="text-xs text-slate-300 font-mono w-6 text-right shrink-0 group-hover:text-indigo-400">
                                            {index + 1}
                                        </span>
                                        <span className="text-sm text-slate-700 font-medium font-mono group-hover:text-indigo-700">
                                            {modName}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-6 border-2 border-dashed border-slate-300 rounded-sm">
                                <span className="material-symbols-outlined text-slate-300 text-[32px] mb-1">
                                    search_off
                                </span>
                                <p className="text-sm text-slate-400 font-mono">
                                    No mods matching &ldquo;{modSearch}&rdquo;
                                </p>
                            </div>
                        );
                    })()}
                </div>
            )}

            {showRaw && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowRaw(false)}>
                    <div className="bg-white/95 backdrop-blur-md border border-slate-300 rounded-sm w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-300">
                            <div className="flex items-center gap-2.5 text-slate-700 font-mono text-sm tracking-wide">
                                <span className="text-slate-900 font-bold text-lg leading-none mt-[-2px]">{`{ }`}</span>
                                <span>lambda_response.json</span>
                            </div>
                            <button onClick={() => setShowRaw(false)} className="p-1.5 rounded-sm hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined text-[20px] block">close</span>
                            </button>
                        </div>
                        <div className="p-5 overflow-auto flex-1 custom-scrollbar bg-white/90">
                            <pre className="text-slate-800 font-mono text-[13px] leading-relaxed selection:bg-indigo-100 selection:text-indigo-900">
                                {JSON.stringify(data, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}