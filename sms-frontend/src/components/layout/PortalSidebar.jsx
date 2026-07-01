/**
 * PortalSidebar.jsx — Unified sidebar used by ALL portals.
 *
 * Design matches the AdminSidebar: dark slate-900 background,
 * gradient active items, user card at the bottom.
 *
 * Props:
 *   config {Object}:
 *     brand      { title, subtitle, Icon }
 *     navItems   [{ to, label, Icon, end? }]  — absolute paths
 *     accentFrom  string  — Tailwind gradient from-* class (e.g. 'from-violet-600')
 *     accentTo    string  — Tailwind gradient to-* class   (e.g. 'to-indigo-600')
 *   isOpen   bool    — mobile drawer open state
 *   onClose  fn      — close mobile drawer
 *
 * Behavior:
 *   - Desktop: fixed left 64 (w-64), always visible
 *   - Mobile: off-canvas drawer, animated slide-in
 *   - Overflow nav scrolls independently
 *   - Bottom: user avatar card + sign-out button
 */
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { disconnectSocket } from '../../socket/socketClient';
import { LogOut, ChevronRight, X } from 'lucide-react';
import { cn } from '../ui/Button';
import NotificationDropdown from './NotificationDropdown';

export default function PortalSidebar({ config, isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const { brand, navItems = [], accentFrom = 'from-indigo-600', accentTo = 'to-violet-600' } = config;
  const BrandIcon = brand?.Icon;
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`;
  const profileRoute = config.profilePath || navItems.find(i => i.to.endsWith('/profile'))?.to || 'profile';

  const handleLogout = () => {
    dispatch(logout());
    disconnectSocket();
    navigate('/auth/login', { replace: true });
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Sidebar"
      >
        <div className="flex h-full flex-col bg-slate-900 text-white">
          {/* ── Brand header ──────────────────────────────────────────── */}
          <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-700/60 px-5">
            <div className="flex items-center gap-3">
              {BrandIcon && (
                <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg', accentFrom, accentTo)}>
                  <BrandIcon className="h-5 w-5 text-white" />
                </div>
              )}
              <div>
                <p className="text-sm font-bold leading-tight text-white">{brand?.title}</p>
                <p className="text-xs text-slate-300">{brand?.subtitle}</p>
              </div>
            </div>
            {/* Close button — mobile only */}
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ── Navigation ────────────────────────────────────────────── */}
          <nav className="flex-1 overflow-y-auto px-3 py-5">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Navigation
            </p>
            <ul className="space-y-0.5">
              {navItems.map(({ to, label, Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-all duration-150',
                        isActive
                          ? cn('bg-gradient-to-r text-white shadow-lg', accentFrom, accentTo)
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      )
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{label}</span>
                    <ChevronRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-40" />
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── User card + Logout ─────────────────────────────────────── */}
          <div className="shrink-0 border-t border-slate-700/60 p-4">
            <div 
              onClick={() => { navigate(profileRoute); onClose?.(); }}
              className="mb-2 flex items-center gap-3 rounded-xl bg-slate-800/60 p-3 cursor-pointer hover:bg-slate-700/60 transition-colors"
            >
              <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold shadow', accentFrom, accentTo)}>
                {initials}
              </div>
              <div className="min-w-0 flex-1 pr-2">
                <p className="truncate text-sm font-semibold text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="truncate text-xs text-slate-300">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[15px] text-slate-300 transition-colors hover:bg-slate-800 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:w-64 lg:flex-col" aria-label="Sidebar">
        <div className="flex h-full flex-col bg-slate-900 text-white">
          {/* ── Brand header ──────────────────────────────────────────── */}
          <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-700/60 px-5">
            <div className="flex items-center gap-3">
              {BrandIcon && (
                <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg', accentFrom, accentTo)}>
                  <BrandIcon className="h-5 w-5 text-white" />
                </div>
              )}
              <div>
                <p className="text-sm font-bold leading-tight text-white">{brand?.title}</p>
                <p className="text-xs text-slate-300">{brand?.subtitle}</p>
              </div>
            </div>
            <NotificationDropdown align="left" />
          </div>

          {/* ── Navigation ────────────────────────────────────────────── */}
          <nav className="flex-1 overflow-y-auto px-3 py-5">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Navigation
            </p>
            <ul className="space-y-0.5">
              {navItems.map(({ to, label, Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-all duration-150',
                        isActive
                          ? cn('bg-gradient-to-r text-white shadow-lg', accentFrom, accentTo)
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      )
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{label}</span>
                    <ChevronRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-40" />
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── User card + Logout ─────────────────────────────────────── */}
          <div className="shrink-0 border-t border-slate-700/60 p-4">
            <div 
              onClick={() => { navigate(profileRoute); }}
              className="mb-2 flex items-center gap-3 rounded-xl bg-slate-800/60 p-3 cursor-pointer hover:bg-slate-700/60 transition-colors"
            >
              <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold shadow', accentFrom, accentTo)}>
                {initials}
              </div>
              <div className="min-w-0 flex-1 pr-2">
                <p className="truncate text-sm font-semibold text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="truncate text-xs text-slate-300">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[15px] text-slate-300 transition-colors hover:bg-slate-800 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
} 
