// src/app/admin/games-server/zomboid/page.tsx — Project Zomboid Server Status (admin)
import ZomboidStatus from '@/components/ZomboidStatus';

export default function ZomboidPage() {
    return (
        <div className="space-y-8">
            <ZomboidStatus />
        </div>
    );
}
