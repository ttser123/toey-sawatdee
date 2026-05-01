'use client';

import AuthProvider from '@/components/AuthProvider';
import Sidebar from '@/components/Sidebar';
import LoginModal from '@/components/LoginModal';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    {children}
                </div>
            </div>
            <LoginModal />
        </AuthProvider>
    );
}
