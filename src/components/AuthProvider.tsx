// src/components/AuthProvider.tsx
// Context Provider แชร์สถานะ login ไปทั้งแอป
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import '@/lib/amplify-config';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    userEmail: string;
    logout: () => Promise<void>;
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    isLoading: true,
    userEmail: '',
    logout: async () => {},
    refreshAuth: async () => {},
});

export function useAuth() {
    return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userEmail, setUserEmail] = useState('');

    const refreshAuth = useCallback(async () => {
        try {
            const user = await getCurrentUser();
            setIsAuthenticated(true);
            setUserEmail(user.signInDetails?.loginId || 'Admin');
        } catch {
            setIsAuthenticated(false);
            setUserEmail('');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshAuth();
    }, [refreshAuth]);

    const logout = async () => {
        await signOut();
        setIsAuthenticated(false);
        setUserEmail('');
    };

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, isLoading, userEmail, 
            logout, refreshAuth 
        }}>
            {children}
        </AuthContext.Provider>
    );
}
