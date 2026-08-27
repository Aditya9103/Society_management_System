/**
 * PortalLayout.jsx — Global layout shell for all portals.
 *
 * Composes:
 *   - PortalSidebar (with mobile drawer state managed here)
 *   - Mobile top header bar (hamburger + brand + user avatar)
 *   - Main content area with proper lg:ml-64 offset
 *
 * Props:
 *   sidebarConfig  {Object}   — passed directly to PortalSidebar
 *   children       {ReactNode} — page content (Routes)
 *   maxWidth       string      — e.g. 'max-w-7xl' (default)
 *
 * Mobile PWA behaviour:
 *   - Safe-area insets handled via CSS env() vars
 *   - Touch targets ≥ 44px
 *   - No horizontal overflow
 *   - Sticky header prevents layout shift on scroll
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Menu } from 'lucide-react';
import PortalSidebar from './PortalSidebar';
import { cn } from '../ui/Button';
import NotificationDropdown from './NotificationDropdown';
import PortalBottomNav from './PortalBottomNav';

export default function PortalLayout({
  sidebarConfig,
  children,
  maxWidth = 'max-w-7xl',
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { brand, accentFrom = 'from-indigo-600', accentTo = 'to-violet-600', navItems = [] } = sidebarConfig;
  const BrandIcon = brand?.Icon;
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`;
  const profileRoute = sidebarConfig.profilePath || navItems.find(i => i.to.endsWith('/profile'))?.to || 'profile';

  return (
    <div className="flex min-h-[100dvh] w-full overflow-x-hidden bg-[#07080f] text-slate-100 selection:bg-indigo-500/30 relative">
      {/* Reduced Top-Right Skyline Background Masked */}
      <div 
          className="fixed top-0 right-0 w-[600px] h-[400px] bg-cover bg-right-top opacity-30 mix-blend-screen pointer-events-none"
          style={{ 
              backgroundImage: "url('https://images.unsplash.com/photo-1505322022379-7c3353ee6291?q=80&w=1200&auto=format&fit=crop')",
              maskImage: "radial-gradient(ellipse at top right, black 0%, transparent 70%)",
              WebkitMaskImage: "radial-gradient(ellipse at top right, black 0%, transparent 70%)"
          }}
      ></div>

      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <PortalSidebar
        config={sidebarConfig}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* ── Page wrapper ─────────────────────────────────────────── */}
      <div className="flex min-h-[100dvh] min-w-0 flex-1 flex-col lg:ml-64">

        {/* ── Mobile top header ──────────────────────────────────── */}
        <header className="sticky top-0 z-20 flex w-full h-14 items-center justify-between border-b border-slate-800/60 bg-[#0b0c10]/80 px-4 shadow-sm backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-3">
            {/* Hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-800 hover:text-white active:scale-95"
            >
              <Menu className="h-5 w-5" />
            </button>
            {/* Brand */}
            {BrandIcon && (
              <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br', accentFrom, accentTo)}>
                <BrandIcon className="h-4 w-4 text-white" />
              </div>
            )}
            <span className="text-base font-bold text-white truncate max-w-[120px]">{brand?.title}</span>
          </div>

          {/* User avatar & Notifications */}
          <div className="flex items-center gap-3 shrink-0">
            <NotificationDropdown />
            <div
              onClick={() => navigate(profileRoute)}
              className={cn('relative overflow-hidden flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white shadow cursor-pointer ring-2 ring-transparent hover:ring-slate-300 transition-all', accentFrom, accentTo)}
            >
              {user?.profilePhotoUrl ? (
                <img src={user.profilePhotoUrl} alt="User Avatar" className="h-full w-full object-cover" />
              ) : (
                <>{initials}</>
              )}
            </div>
          </div>
        </header>

        {/* ── Main content ───────────────────────────────────────── */}
        {/* pb-28 ensures content isn't hidden behind the bottom navigation bar on mobile */}
        <main className="flex-1 w-full overflow-y-auto overflow-x-hidden pb-28 lg:pb-0 min-w-0">
          <div className={cn('mx-auto px-4 py-6 sm:px-6 lg:px-8 w-full box-border', maxWidth)}>
            {children}
          </div>
        </main>

        {/* ── Mobile Bottom Navigation ─────────────────────────────── */}
        <PortalBottomNav config={sidebarConfig} />
      </div>
    </div>
  );
}
