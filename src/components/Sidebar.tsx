// src/components/Sidebar.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

// ── Navigation Data ──────────────────────────────────────────────────

/** Top-level simple links (no children) */
const topNav = [
  { href: '/', icon: 'bar_chart', label: 'Overview' },
];

/** Games Server dropdown — collapsible with zone sub-items */
interface GameZone {
  href: string;
  icon?: string;
  label: string;
  zone?: string; // optional zone badge
}

const gameServerItems: GameZone[] = [
  { href: '/games-server/zomboid', label: 'Project Zomboid', },
  { href: '/games-server/minecraft', label: 'Minecraft' },
  // ── Add more game servers / zones here ──
  // { href: '/games-server/valheim', icon: 'shield', label: 'Valheim', zone: 'EU-W1' },
];

/** Bottom simple links */
const bottomNav = [
  { href: '/status', icon: 'monitor_heart', label: 'Status' },
  { href: '/release-notes', icon: 'update', label: 'Release Notes' },
];

const adminNav = [
  { href: '/admin/admin-log', icon: 'dns', label: 'Admin Log' },
];

// ── A11y IDs ─────────────────────────────────────────────────────────

const GAMES_DROPDOWN_ID = 'games-server-dropdown';

// ── Component ────────────────────────────────────────────────────────

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [visitorCount, setVisitorCount] = useState<number | string>('...');
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuth();

  // Auto-open dropdown if any child route is active
  const isGameRouteActive = gameServerItems.some((item) => pathname === item.href);
  const [gamesOpen, setGamesOpen] = useState(isGameRouteActive);

  // Sync dropdown open state when navigating to a game route
  useEffect(() => {
    if (isGameRouteActive) setGamesOpen(true);
  }, [isGameRouteActive]);

  // ── Fix #1: AbortController to prevent memory leak on unmount ──────
  useEffect(() => {
    const controller = new AbortController();

    const fetchCounter = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        // ── Fix #5: Warn loudly when ENV is missing instead of silent bail ──
        if (!apiUrl) {
          console.warn(
            '[Sidebar] NEXT_PUBLIC_API_URL is not set — visitor counter disabled. ' +
            'Check your .env.local or deployment environment variables.'
          );
          setVisitorCount('N/A');
          return;
        }

        // Backend increments on ALL HTTP methods (GET & POST both +1).
        // To prevent inflating views: POST once per session, then use cached value.
        const cachedCount = sessionStorage.getItem('visitor_count');

        if (cachedCount) {
          // Already counted this session — use cached value, zero API calls
          setVisitorCount(Number(cachedCount));
        } else {
          // First page load this session — POST to increment (+1)
          const res = await fetch(`${apiUrl}/visitor`, {
            method: 'POST',
            signal: controller.signal,
          });
          if (res.ok) {
            const json = await res.json();
            const count = json.views ?? json.count ?? 'N/A';
            setVisitorCount(count);
            sessionStorage.setItem('visitor_count', String(count));
          }
        }
      } catch (err: unknown) {
        // Ignore abort errors — they're expected on unmount
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.error('[Sidebar] Counter fetch failed:', err);
        setVisitorCount('Error');
      }
    };

    fetchCounter();

    // Cleanup: abort in-flight fetch if component unmounts mid-request
    return () => controller.abort();
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // ── Fix #4: Escape key closes mobile sidebar ──────────────────────
  useEffect(() => {
    if (!isMobileOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen]);

  const handleLogout = useCallback(async () => {
    await logout();
    router.replace('/');
  }, [logout, router]);

  // ── Reusable NavItem ───────────────────────────────────────────────

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

  // ── Games Server Dropdown Item ─────────────────────────────────────

  const GameNavItem = ({ href, icon, label, zone }: GameZone) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        title={!isOpen ? label : undefined}
        className={`group relative flex items-center gap-2.5 pl-9 pr-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${isActive
          ? 'bg-indigo-50 text-indigo-600'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
          }`}
      >
        {icon && (
          <span className={`material-symbols-outlined text-[16px] shrink-0 ${isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-600'}`}>
            {icon}
          </span>
        )}
        <span className={`whitespace-nowrap flex-1 truncate block ${isOpen ? 'md:block' : 'md:hidden'}`}>
          {label}
        </span>
        {zone && (
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider shrink-0 ${isOpen ? 'md:inline-flex' : 'md:hidden'} ${isActive
            ? 'bg-indigo-100 text-indigo-500'
            : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-500'
            }`}>
            {zone}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* ── Fix #7: Semantic <header> for Mobile Topbar ──────────── */}
      <header className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 h-14 px-4 shrink-0">
        <span className="font-semibold text-gray-900 text-sm">Toey Sawatdee</span>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md"
          aria-label="Open navigation menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </header>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Actual Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col shrink-0 transition-all duration-300 overflow-x-hidden
          md:relative md:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          w-64 ${isOpen ? 'md:w-60' : 'md:w-[60px]'}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-3 border-b border-gray-200">
          {/* Always show title on mobile, check isOpen on desktop */}
          <span className={`font-semibold text-gray-900 text-sm whitespace-nowrap block ${isOpen ? 'md:block' : 'md:hidden'}`}>Toey Sawatdee</span>

          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close navigation menu"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          {/* Desktop toggle button — Fix #3: aria-expanded */}
          <button
            onClick={() => {
              if (isOpen && gamesOpen) {
                // Collapse dropdown first, then sidebar after animation finishes
                setGamesOpen(false);
                setTimeout(() => setIsOpen(false), 300);
              } else {
                setIsOpen(!isOpen);
              }
            }}
            className="hidden md:block p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Toggle sidebar"
            aria-expanded={isOpen}
          >
            <span className="material-symbols-outlined text-[20px]">{isOpen ? 'menu_open' : 'menu'}</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto" aria-label="Site pages">
          {/* Top navigation items */}
          {topNav.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}

          {/* ── Games Server Dropdown ─────────────────────────── */}
          <div>
            {/* Fix #3: aria-expanded + aria-controls for A11y */}
            <button
              onClick={() => {
                if (!isOpen) {
                  // Sidebar is collapsed — expand it first, then open dropdown
                  setIsOpen(true);
                  setTimeout(() => setGamesOpen(true), 300);
                } else {
                  setGamesOpen(!gamesOpen);
                }
              }}
              title={!isOpen ? 'Games Server' : undefined}
              aria-expanded={gamesOpen}
              aria-controls={GAMES_DROPDOWN_ID}
              className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isGameRouteActive
                ? 'bg-indigo-50/60 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              <span className={`material-symbols-outlined text-lg shrink-0 ${isGameRouteActive ? 'text-indigo-500' : ''}`}>
                sports_esports
              </span>
              <span className={`whitespace-nowrap flex-1 text-left block ${isOpen ? 'md:block' : 'md:hidden'}`}>
                Games Server
              </span>
              {/* Chevron indicator — hidden when sidebar is collapsed */}
              {isOpen && (
                <span
                  className={`material-symbols-outlined text-[16px] shrink-0 transition-transform duration-300 ${gamesOpen ? 'rotate-180' : 'rotate-0'
                    } ${isGameRouteActive ? 'text-indigo-400' : 'text-gray-400'}`}
                >
                  expand_more
                </span>
              )}
              {/* Active dot badge (visible when sidebar is collapsed) */}
              {isGameRouteActive && (
                <span className={`absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500 ${isOpen ? 'md:hidden' : 'md:block'} hidden`} />
              )}
            </button>

            {/* ── Fix #2: CSS Grid animation instead of hardcoded pixels ── */}
            <div
              id={GAMES_DROPDOWN_ID}
              role="region"
              className="grid transition-all duration-300 ease-in-out"
              style={{
                gridTemplateRows: gamesOpen ? '1fr' : '0fr',
                opacity: gamesOpen ? 1 : 0,
              }}
            >
              <div className="overflow-hidden">
                <div className="pt-1 pb-1 space-y-0.5">
                  {gameServerItems.map((item) => (
                    <GameNavItem key={item.href} {...item} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom navigation items */}
          {bottomNav.map((item) => (
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

        {/* ── Fix #7: Semantic <footer> ──────────────────────────── */}
        <footer className="p-2 border-t border-gray-200">
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

          {/* ── Fix #6: Skeleton loader instead of null during auth check ── */}
          {isLoading ? (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg animate-pulse">
              <div className="w-5 h-5 bg-gray-200 rounded shrink-0" />
              <div className={`h-4 bg-gray-200 rounded w-20 ${isOpen ? 'md:block' : 'md:hidden'}`} />
            </div>
          ) : isAuthenticated ? (
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
        </footer>
      </aside>
    </>
  );
}
