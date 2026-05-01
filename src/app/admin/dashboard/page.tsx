// src/app/admin/dashboard/page.tsx
'use client';

import { useAuth } from '@/components/AuthProvider';

export default function DashboardPage() {
    const { userEmail } = useAuth();

    return (
        <main className="flex-1 overflow-auto bg-gray-50 p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-sm text-gray-500 mt-1">Welcome back, {userEmail}</p>
                    </div>
                </div>

                {/* โซนโชว์ข้อมูล */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Server Expenses</h2>
                        <p className="text-gray-400 text-sm">... Waiting for DynamoDB API ...</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Home Lab Status</h2>
                        <p className="text-gray-400 text-sm">... Waiting for Docker API ...</p>
                    </div>
                </div>
            </div>
        </main>
    );
}