// src/app/admin/admin-log/page.tsx
'use client';

import { useAuth } from '@/components/AuthProvider';

export default function ServerStatusPage() {
    const { userEmail } = useAuth();

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center card-blueprint p-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Session Activity</h2>
                    <p className="text-sm text-slate-500 mt-1">Authenticated as <span className="font-mono text-indigo-600">{userEmail}</span></p>
                </div>
            </div>
        </div>
    );
}