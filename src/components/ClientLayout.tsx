'use client';

import { usePathname } from 'next/navigation';
import AuthProvider from '@/components/AuthProvider';
import Sidebar from '@/components/Sidebar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Isolated Layout for Login
    if (pathname === '/login') {
        return <AuthProvider>{children}</AuthProvider>;
    }

    return (
        <AuthProvider>
            <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden relative">
                <Sidebar />
                {children}
            </div>
        </AuthProvider>
    );
}
