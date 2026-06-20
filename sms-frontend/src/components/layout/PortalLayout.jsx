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
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Menu } from 'lucide-react';
import PortalSidebar from './PortalSidebar';
import { cn } from '../ui/Button';

export default function PortalLayout({
  sidebarConfig,
  children,
  maxWidth = 'max-w-7xl',
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useSelector((s) => s.auth);
  const { brand, accentFrom = 'from-indigo-600', accentTo = 'to-violet-600' } = sidebarConfig;
  const BrandIcon = brand?.Icon;
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`;

  return (
    <div className="flex min-h-[100dvh]" style={{ backgroundColor: '#f4f5f7' }}>

      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <PortalSidebar
        config={sidebarConfig}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* ── Page wrapper ─────────────────────────────────────────── */}
      <div className="flex min-h-[100dvh] flex-1 flex-col lg:ml-64">

        {/* ── Mobile top header ──────────────────────────────────── */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-3">
            {/* Hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 active:scale-95"
            >
              <Menu className="h-5 w-5" />
            </button>
            {/* Brand */}
            {BrandIcon && (
              <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br', accentFrom, accentTo)}>
                <BrandIcon className="h-4 w-4 text-white" />
              </div>
            )}
            <span className="text-sm font-bold text-slate-800">{brand?.title}</span>
          </div>

          {/* User avatar */}
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white shadow', accentFrom, accentTo)}>
            {initials}
          </div>
        </header>

        {/* ── Main content ───────────────────────────────────────── */}
        <main className="flex-1 overflow-x-hidden">
          <div className={cn('mx-auto px-4 py-6 sm:px-6 lg:px-8', maxWidth)}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
