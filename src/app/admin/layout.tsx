// src/app/admin/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, isLoading, openLoginModal } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/');
            setTimeout(() => {
                openLoginModal();
            }, 100);
        }
    }, [isLoading, isAuthenticated, router, openLoginModal]);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <p className="text-gray-400 text-sm animate-pulse">Checking permissions...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <p className="text-gray-400 text-sm animate-pulse">Redirecting to login...</p>
            </div>
        );
    }

    return <>{children}</>;
}