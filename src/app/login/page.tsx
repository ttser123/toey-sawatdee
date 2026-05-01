// src/app/login/page.tsx
'use client';
import '@/lib/amplify-config';
import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'aws-amplify/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated, isLoading, refreshAuth } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard';

    // If already logged in, redirect directly to the callback or dashboard
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace(callbackUrl);
        }
    }, [isLoading, isAuthenticated, router, callbackUrl]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        console.log("🔥 CHECK ENV:", process.env.NEXT_PUBLIC_USER_POOL_ID);
        setErrorMsg('');

        try {
            const { isSignedIn } = await signIn({ username: email, password });
            if (isSignedIn) {
                await refreshAuth();
                router.replace(callbackUrl);
            }
        } catch (error: any) {
            console.error('Login failed:', error);
            setErrorMsg(error.message || 'Login failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading || isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <span className="material-symbols-outlined animate-spin text-4xl text-blue-600 mb-4">progress_activity</span>
                <p className="text-gray-500 text-sm">Authenticating...</p>
            </div>
        );
    }

    return (
        <main className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-3">
                        <span className="material-symbols-outlined text-red-500 shrink-0">error</span>
                        <p>{errorMsg}</p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="admin@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-4 pr-12 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-700 transition-colors"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    {showPassword ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                                <span>Authenticating...</span>
                            </>
                        ) : (
                            'Sign In to Dashboard'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-gray-100 pt-6">
                    <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 flex items-center justify-center gap-1.5 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Back
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">progress_activity</span>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
