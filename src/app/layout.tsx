// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Toey Sawatdee',
    description: 'Cloud Infrastructure by Toey Sawatdee',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
            </head>
            <body className={`${inter.className} relative min-h-screen bg-slate-50`}>
                {/* 🌌 LAYER 1: Background Dots (อยู่หลังสุด) */}
                <div className="absolute inset-0 z-0 bg-dot-pattern mask-fade-out pointer-events-none"></div>
                
                {/* 📄 LAYER 2: Content (ลอยอยู่เหนือจุด) */}
                <div className="relative z-10">
                    <ClientLayout>{children}</ClientLayout>
                </div>
            </body>
        </html>
    );
}