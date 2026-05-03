// src/components/Sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

const publicNav = [
  { href: '/', icon: 'bar_chart', label: 'Overview' },
  { href: '/zomboid', icon: 'sports_esports', label: 'Zomboid' },
  { href: '/status', icon: 'monitor_heart', label: 'Status' },
  { href: '/release-notes', icon: 'update', label: 'Release Notes' },
];

const adminNav = [
  { href: '/admin/admin-log', icon: 'dns', label: 'Admin Log' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [visitorCount, setVisitorCount] = useState<number | string>('...');
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    const fetchCounter = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) return;

        // Backend increments on ALL HTTP methods (GET & POST both +1).
        // To prevent inflating views: POST once per session, then use cached value.
        const cachedCount = sessionStorage.getItem('visitor_count');

        if (cachedCount) {
          // Already counted this session — use cached value, zero API calls
          setVisitorCount(Number(cachedCount));
        } else {
          // First page load this session — POST to increment (+1)
          const res = await fetch(`${apiUrl}/visitor`, { method: 'POST' });
          if (res.ok) {
            const json = await res.json();
            const count = json.views ?? json.count ?? '—';
            setVisitorCount(count);
            sessionStorage.setItem('visitor_count', String(count));
          }
        }
      } catch (err) {
        console.error('Counter fetch failed:', err);
        setVisitorCount('—');
      }
    };
    fetchCounter();
  }, []);

  useEffect(() => {
    // Close mobile sidebar on route change
    setIsMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const NavItem = ({ href, icon, label }: { href: string; icon: string; label: string }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        title={!isOpen ? label : undefined}
        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
          ? 'bg-blue-50 text-blue-600'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
      >
        <span className="material-symbols-outlined text-lg shrink-0">{icon}</span>
        {/* On mobile, always show label since sidebar is 64 w. On desktop, respect isOpen */}
        <span className={`whitespace-nowrap block ${isOpen ? 'md:block' : 'md:hidden'}`}>{label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 h-14 px-4 shrink-0">
        <span className="font-semibold text-gray-900 text-sm">Toey Sawatdee</span>
        <button onClick={() => setIsMobileOpen(true)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Actual Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col shrink-0 transition-all duration-300 overflow-x-hidden
        md:relative md:translate-x-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        w-64 ${isOpen ? 'md:w-60' : 'md:w-[60px]'}
      `}>
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-3 border-b border-gray-200">
          {/* Always show title on mobile, check isOpen on desktop */}
          <span className={`font-semibold text-gray-900 text-sm whitespace-nowrap block ${isOpen ? 'md:block' : 'md:hidden'}`}>Toey Sawatdee</span>

          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close sidebar"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          {/* Desktop toggle button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:block p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Toggle sidebar"
          >
            <span className="material-symbols-outlined text-[20px]">{isOpen ? 'menu_open' : 'menu'}</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {publicNav.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}

          {/* Admin zone — Only when authenticated */}
          {isAuthenticated && (
            <>
              <div className="border-t border-gray-200 my-3" />
              <p className={`text-[11px] text-gray-400 uppercase tracking-wider px-3 mb-1 font-medium whitespace-nowrap block ${isOpen ? 'md:block' : 'md:hidden'}`}>
                Admin
              </p>
              {adminNav.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-gray-200">
          {/* Professional Links */}
          <div className={`flex flex-col px-3 py-2 mb-1 ${isOpen ? 'md:flex' : 'md:hidden'}`}>
            <h3 className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mb-3">My Contact</h3>
            <div className="flex items-center gap-4 mb-3">
              <a
                href="https://github.com/ttser123"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-900 transition-colors"
                title="GitHub"
              >
                <FaGithub className="text-[20px]" />
              </a>
              <a
                href="https://www.linkedin.com/in/parinya-sawatdee"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#0a66c2] transition-colors"
                title="LinkedIn"
              >
                <FaLinkedin className="text-[20px]" />
              </a>
            </div>

            <div className="flex items-center gap-2 text-gray-500">
              <FaEnvelope className="text-[13px] shrink-0" />
              <span className="text-[11px] font-medium select-all hover:text-gray-800 transition-colors cursor-text">
                parinya.zawatdee@gmail.com
              </span>
            </div>
          </div>

          <div
            className="group relative flex items-center gap-3 px-3 py-2.5 mb-1 text-gray-500 cursor-default hover:bg-gray-50 rounded-lg transition-colors"
            title={!isOpen ? `Profile Views: ${visitorCount}` : undefined}
          >
            <span className="material-symbols-outlined text-lg shrink-0">visibility</span>
            <span className={`text-xs font-medium whitespace-nowrap block ${isOpen ? 'md:block' : 'md:hidden'}`}>
              Profile Views: {visitorCount}
            </span>
          </div>

          {isLoading ? null : isAuthenticated ? (
            <button
              onClick={handleLogout}
              title={!isOpen ? "Logout" : undefined}
              className="group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <span className="material-symbols-outlined text-lg shrink-0">logout</span>
              <span className={`whitespace-nowrap block ${isOpen ? 'md:block' : 'md:hidden'}`}>Logout</span>
            </button>
          ) : (
            <NavItem href="/login" icon="lock" label="Admin Login" />
          )}
        </div>
      </aside>
    </>
  );
}
