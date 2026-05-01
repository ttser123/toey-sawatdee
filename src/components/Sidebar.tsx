// src/components/Sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

const publicNav = [
  { href: '/', icon: 'bar_chart', label: 'Overview' },
  { href: '/zomboid', icon: 'sports_esports', label: 'Zomboid' },
];

const adminNav = [
  { href: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/admin/homelab', icon: 'dns', label: 'Homelab' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, logout, openLoginModal } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const NavItem = ({ href, icon, label }: { href: string; icon: string; label: string }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
      >
        <span className="material-symbols-outlined text-lg shrink-0">{icon}</span>
        {isOpen && <span>{label}</span>}
        {/* UI #3 FIX: Tooltip ตอน sidebar ยุบ */}
        {!isOpen && (
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            {label}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className={`${isOpen ? 'w-60' : 'w-[60px]'} bg-white border-r border-gray-200 transition-all duration-200 flex flex-col shrink-0`}>
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-3 border-b border-gray-200">
        {isOpen && <span className="font-semibold text-gray-900 text-sm">Parinya Infra</span>}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {publicNav.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}

        {/* Admin zone — เฉพาะเมื่อ login แล้ว */}
        {isAuthenticated && (
          <>
            <div className="border-t border-gray-200 my-3" />
            {isOpen && (
              <p className="text-[11px] text-gray-400 uppercase tracking-wider px-3 mb-1 font-medium">
                Admin
              </p>
            )}
            {adminNav.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-gray-200">
        {isLoading ? null : isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <span className="material-symbols-outlined text-lg shrink-0">logout</span>
            {isOpen && <span>ออกจากระบบ</span>}
            {!isOpen && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                ออกจากระบบ
              </span>
            )}
          </button>
        ) : (
          <button
            onClick={openLoginModal}
            className="group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <span className="material-symbols-outlined text-lg shrink-0">lock</span>
            {isOpen && <span>Admin Login</span>}
            {!isOpen && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                Admin Login
              </span>
            )}
          </button>
        )}
      </div>
    </aside>
  );
}
