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
                "fixed bottom-0 left-0 right-0 flex items-center border-t border-slate-800/60 bg-[#0b0c10]/95 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-2px_10px_rgba(0,0,0,0.5)] backdrop-blur-md lg:hidden",
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
                            isActive ? 'text-purple-500' : 'text-slate-400 hover:text-slate-200'
                        )
                    }
                >
                    {({ isActive }) => (
                        <>
                            <div
                                className="relative flex h-8 w-16 shrink-0 items-center justify-center transition-all duration-200"
                            >
                                <item.Icon className={cn('h-6 w-6 relative z-10 transition-colors', isActive ? 'text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'text-slate-500')} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={cn('text-[11px] leading-tight whitespace-nowrap transition-colors', isActive ? 'font-bold text-purple-400' : 'font-medium text-slate-500')}>
                                {item.label}
                            </span>
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
}
