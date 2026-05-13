'use client';

import { usePathname } from 'next/navigation';
import AuthProvider from '@/components/AuthProvider';
import Sidebar from '@/components/Sidebar';
import HudHeader from '@/components/HudHeader';

const getPageTitle = (pathname: string) => {
    if (pathname === '/') return 'OVERVIEW';
    if (pathname === '/finance') return 'FINANCE';
    if (pathname === '/status') return 'SYSTEM STATUS';
    if (pathname === '/release-notes') return 'UPDATE LOGS';
    if (pathname.includes('/admin/admin-log')) return 'ADMIN LOG';

    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return 'OVERVIEW';
    return `${segments[segments.length - 1].toUpperCase()}`;
};

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Isolated Layout for Login
    if (pathname === '/login') {
        return <AuthProvider>{children}</AuthProvider>;
    }

    const title = getPageTitle(pathname);

    return (
        <AuthProvider>
            <div className="flex flex-col md:flex-row h-screen overflow-hidden relative">
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 pb-24">
                        <HudHeader title={title} />
                        {children}
                    </div>
                </main>
            </div>
        </AuthProvider>
    );
}
