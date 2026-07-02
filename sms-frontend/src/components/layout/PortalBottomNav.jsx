import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../ui/Button';

/**
 * PortalBottomNav
 * A fixed bottom navigation bar for mobile PWA (lg:hidden).
 * Automatically calculates which items to display based on sidebarConfig.bottomNavRoutes.
 */
export default function PortalBottomNav({ config }) {
    const { navItems = [], bottomNavRoutes = [] } = config;

    // Filter navItems to only those specified in bottomNavRoutes, preserving the requested order
    const bottomNavItems = bottomNavRoutes
        .map(route => navItems.find(item => item.to === route))
        .filter(Boolean);

    if (bottomNavItems.length === 0) return null;

    const isScrollable = bottomNavItems.length > 5;

    return (
        <nav className={cn(
            "fixed bottom-0 left-0 right-0 z-50 flex items-center border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] backdrop-blur-md lg:hidden",
            isScrollable ? "justify-start gap-2 overflow-x-auto px-4 scrollbar-hide" : "justify-around px-2"
        )}>
            {bottomNavItems.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                        cn(
                            'flex min-w-[72px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 transition-all active:scale-95',
                            isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                        )
                    }
                >
                    {({ isActive }) => (
                        <>
                            <div
                                className={cn(
                                    'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors',
                                    isActive ? 'bg-indigo-50' : 'bg-transparent'
                                )}
                            >
                                <item.Icon className={cn('h-5 w-5', isActive && 'text-indigo-600')} />
                            </div>
                            <span className={cn('text-[10px] font-medium leading-none whitespace-nowrap', isActive && 'font-semibold')}>
                                {item.label}
                            </span>
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
}
