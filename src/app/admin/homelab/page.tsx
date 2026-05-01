// src/app/admin/homelab/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import '@/lib/amplify-config'; // BUG #4 FIX: Import Amplify config so fetchAuthSession works reliably!

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

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');

            const session = await fetchAuthSession();
            const token = session.tokens?.accessToken?.toString();

            if (!token) throw new Error("No Token available. Unauthorized.");

            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            if (!apiUrl) throw new Error('API URL not configured');

            const res = await fetch(`${apiUrl}/homelab/status`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error(`API Error: ${res.status}`);

            const json = await res.json();
            setServerData(json.data || []);
        } catch (err: any) {
            console.error('Fetch homelab status failed:', err);
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <main className="flex-1 overflow-auto bg-gray-50 p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Homelab Status</h1>
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors disabled:opacity-50 shadow-sm"
                    >
                        {loading ? 'Loading...' : 'Refresh'}
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {loading ? (
                    <p className="text-gray-400 text-sm animate-pulse">Fetching data from DynamoDB...</p>
                ) : serverData.length === 0 ? (
                    <p className="text-gray-400 text-sm">No server data found.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {serverData.map((server) => {
                            const name = server.sort_key.replace('SERVER#', '');
                            const isOnline = server.status === 'Online';
                            return (
                                <div key={server.sort_key} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 relative overflow-hidden">
                                    <div className={`absolute top-0 left-0 w-full h-1 ${isOnline ? 'bg-green-500' : 'bg-red-400'}`} />
                                    <div className="flex items-center justify-between mb-4 pt-1">
                                        <h3 className="font-semibold text-gray-900">{name}</h3>
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                            isOnline ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                        }`}>
                                            {server.status}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between py-1.5 border-b border-gray-100">
                                            <span className="text-gray-500">Ping</span>
                                            <span className="font-medium text-gray-900">{server.ping}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-gray-100">
                                            <span className="text-gray-500">Players</span>
                                            <span className="font-medium text-gray-900">{server.players}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-3 text-right">Updated: {server.last_updated}</p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}