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

    // 1. Get primary items in the exact order specified by bottomNavRoutes
    const primaryItems = bottomNavRoutes
        .map(route => navItems.find(item => item.to === route))
        .filter(Boolean);

    // 2. Get the rest of the nav items that weren't in bottomNavRoutes
    const secondaryItems = navItems.filter(item => !bottomNavRoutes.includes(item.to));

    // 3. Combine them: initial items first, then the rest
    const allBottomNavItems = [...primaryItems, ...secondaryItems];

    if (allBottomNavItems.length === 0) return null;

    const isScrollable = allBottomNavItems.length > 5;

    return (
        <nav 
            className={cn(
                "fixed bottom-0 left-0 right-0 flex items-center border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] backdrop-blur-md lg:hidden",
                isScrollable ? "justify-start overflow-x-auto snap-x snap-mandatory scrollbar-hide" : "justify-around"
            )}
            style={{ zIndex: 40 }}
        >
            {allBottomNavItems.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                        cn(
                            'group flex w-[25vw] shrink-0 snap-start flex-col items-center justify-center gap-1 py-1.5 transition-colors',
                            isActive ? 'text-indigo-700' : 'text-slate-700 hover:text-slate-900'
                        )
                    }
                >
                    {({ isActive }) => (
                        <>
                            <div
                                className={cn(
                                    'relative flex h-8 w-16 shrink-0 items-center justify-center rounded-full transition-all duration-200',
                                    isActive ? 'bg-indigo-100' : 'bg-transparent'
                                )}
                            >
                                <item.Icon className={cn('h-6 w-6', isActive ? 'text-indigo-700' : 'text-slate-500')} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={cn('text-[11px] leading-tight whitespace-nowrap', isActive ? 'font-bold' : 'font-medium')}>
                                {item.label}
                            </span>
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
}
