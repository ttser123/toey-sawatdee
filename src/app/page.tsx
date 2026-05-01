// src/app/page.tsx — Overview (หน้าแรก)
'use client';

import { useState, useEffect } from 'react';

export default function Home() {
    const [visitorCount, setVisitorCount] = useState<number | string>('...');

    useEffect(() => {
        const fetchCounter = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                if (!apiUrl) return;
                const res = await fetch(`${apiUrl}/visitor`, { method: 'POST' });
                if (res.ok) {
                    const json = await res.json();
                    setVisitorCount(json.views ?? json.count ?? '—');
                }
            } catch (err) {
                console.error('Counter fetch failed:', err);
                setVisitorCount('—');
            }
        };
        fetchCounter();
    }, []);

    return (
        <main className="flex-1 overflow-auto bg-gray-50 p-6 md:p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Profile Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Admin Contact</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Name</span>
                            <span className="text-sm font-medium text-gray-900">Parinya Sawatdee (Toey)</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Role</span>
                            <span className="text-sm font-medium text-gray-900">Cloud & Network Engineer</span>
                        </div>
                    </div>
                </div>

                {/* Visitor Counter Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Profile Views</h2>
                    <p className="text-4xl font-bold text-blue-600">{visitorCount}</p>
                </div>
            </div>
        </main>
    );
}