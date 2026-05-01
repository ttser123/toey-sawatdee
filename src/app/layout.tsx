// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';

export const metadata: Metadata = {
    title: 'Parinya Infra Dashboard',
    description: 'Cloud Infrastructure & Homelab Monitor by Parinya Sawatdee',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
            </head>
            <body>
                <ClientLayout>{children}</ClientLayout>
            </body>
        </html>
    );
}