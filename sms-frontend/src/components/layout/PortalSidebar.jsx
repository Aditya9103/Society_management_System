import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { disconnectSocket } from '../../socket/socketClient';
import { LogOut, ChevronRight, ChevronDown, X } from 'lucide-react';
import { cn } from '../ui/Button';

export default function PortalSidebar({ config, isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const { brand, navItems = [], accentFrom = 'from-indigo-600', accentTo = 'to-violet-600', bottomContent, userSubtitle } = config;
  const BrandIcon = brand?.Icon;
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`;
  const profileRoute = config.profilePath || navItems.find(i => i.to.endsWith('/profile'))?.to || 'profile';

  const handleLogout = () => {
    dispatch(logout());
    disconnectSocket();
    navigate('/auth/login', { replace: true });
  };

  const mainItems = navItems.filter(i => !i.isEmergency);
  const quickItems = navItems.filter(i => i.isEmergency);

  const renderNavGroup = (items) => (
    <ul className="space-y-1">
      {items.map(({ to, label, Icon, end, badge, isEmergency }) => (
        <li key={to}>
          <NavLink
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-xl px-3.5 py-3 text-[14px] font-semibold transition-all duration-300',
                isActive
                  ? cn('bg-gradient-to-r text-white shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-white/10', accentFrom, accentTo)
                  : 'text-slate-300 hover:bg-white/5 hover:text-white hover:translate-x-1'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isEmergency ? (
                    <div className="flex h-5 w-8 items-center justify-center rounded-full bg-red-500/20 border border-red-500/50 text-red-400 text-[9px] font-bold shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                      SOS
                    </div>
                ) : (
                    <Icon
                        className={cn('h-[18px] w-[18px] shrink-0 transition-colors duration-300', isActive ? 'text-white' : 'text-slate-400 group-hover:text-white')}
                        strokeWidth={isActive ? 2.5 : 2}
                    />
                )}
                <span className="truncate flex-1">{label}</span>
                {isActive && (
                  <span className="flex h-4 w-4 items-center justify-center">
                    <ChevronRight size={14} />
                  </span>
                )}
                {!isActive && badge && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm shadow-red-500/50">
                    {badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  );

  const sidebarContent = (
    <div className="flex h-full flex-col bg-gradient-to-br from-[#1a1147] to-[#36132e] text-white">
      {/* ── Brand header ──────────────────────────────────────────── */}
      <div className="flex h-[80px] shrink-0 items-center justify-between gap-3 px-6">
        <div className="flex items-center gap-3.5">
          {BrandIcon && (
            <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg shadow-purple-900/20 border border-white/10', accentFrom, accentTo)}>
              <BrandIcon className="h-[22px] w-[22px] text-white" />
            </div>
          )}
          <div>
            <p className="text-[16px] font-extrabold leading-tight text-white tracking-wide">{brand?.title}</p>
            <p className="text-[12px] font-medium text-slate-400 mt-0.5">{brand?.subtitle}</p>
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
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
        <p className="mb-3 px-3.5 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">Main Menu</p>
        {renderNavGroup(mainItems)}
        
        {quickItems.length > 0 && (
          <>
            <p className="mt-8 mb-3 px-3.5 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">Quick Services</p>
            {renderNavGroup(quickItems)}
          </>
        )}
      </nav>

      {/* ── User card + Logout ─────────────────────────────────────── */}
      <div className="shrink-0 px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] lg:pb-6">
        {bottomContent && <div className="mb-4">{bottomContent}</div>}
        <div 
          onClick={() => { navigate(profileRoute); onClose?.(); }}
          className="mb-3 flex items-center gap-3.5 rounded-2xl border border-white/10 bg-black/20 p-3 cursor-pointer hover:bg-black/30 transition-colors shadow-sm"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-sm font-bold text-white shadow-md overflow-hidden ring-1 ring-white/10">
            {user?.profilePhotoUrl ? (
                <img src={user.profilePhotoUrl} alt="User" className="h-full w-full object-cover" />
            ) : (
                initials
            )}
          </div>
          <div className="min-w-0 flex-1 pr-1">
            <p className="truncate text-[14px] font-bold text-white">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate text-[11px] font-semibold text-slate-400 mt-0.5">{userSubtitle || user?.email}</p>
          </div>
          <ChevronDown size={16} className="text-slate-500 shrink-0" />
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-semibold text-purple-200/80 transition-all hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden"
          style={{ zIndex: 90 }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 w-72 transform transition-transform duration-300 ease-in-out lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ zIndex: 100 }}
        aria-label="Sidebar"
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:w-64 lg:flex-col border-r border-slate-800/40" aria-label="Sidebar">
        {sidebarContent}
      </aside>
    </>
  );
}
