// src/app/admin/admin-log/page.tsx
'use client';

import { useAuth } from '@/components/AuthProvider';

export default function ServerStatusPage() {
    const { userEmail } = useAuth();

    return (
        <main className="flex-1 overflow-auto bg-blueprint p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center card-blueprint p-6 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Admin Log</h1>
                        <p className="text-sm text-slate-500 mt-1">Welcome back, <span className="font-mono text-indigo-600">{userEmail}</span></p>
                    </div>
                </div>
            </div>
        </main>
    );
}