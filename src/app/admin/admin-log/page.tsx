// src/app/admin/admin-log/page.tsx
'use client';

import { useAuth } from '@/components/AuthProvider';

export default function ServerStatusPage() {
    const { userEmail } = useAuth();

    return (
        <main className="flex-1 overflow-auto bg-gray-50 p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Log</h1>
                        <p className="text-sm text-gray-500 mt-1">Welcome back, {userEmail}</p>
                    </div>
                </div>
            </div>
        </main>
    );
}