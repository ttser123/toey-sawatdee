// src/app/zomboid/page.tsx — Project Zomboid Server Status (public)
import ZomboidStatus from '@/components/ZomboidStatus';

export default function ZomboidPage() {
    return (
        <main className="flex-1 overflow-auto bg-gray-50 p-6 md:p-8 lg:p-10">
            {/* Page heading */}
            <div className="mb-6 flex items-center gap-3 px-1">
                <span className="material-symbols-outlined text-gray-400 text-[28px]">
                    sports_esports
                </span>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">
                        Zomboid Server Monitor
                    </h1>
                </div>
            </div>

            <ZomboidStatus />
        </main>
    );
}
