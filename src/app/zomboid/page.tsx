// src/app/zomboid/page.tsx — Zomboid Server Status (public)
import ZomboidStatus from '@/components/ZomboidStatus';

export default function ZomboidPage() {
    return (
        <main className="flex-1 overflow-auto bg-gray-50 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Zomboid Nodes</h1>
            </div>

            <ZomboidStatus />
        </main>
    );
}
