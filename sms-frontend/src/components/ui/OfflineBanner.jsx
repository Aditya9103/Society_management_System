import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

/**
 * OfflineBanner — renders a sticky top banner when the device is offline.
 * Slides in from the top when offline, slides out when back online.
 */
export default function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [visible, setVisible]    = useState(!navigator.onLine);

    useEffect(() => {
        const goOffline = () => {
            setIsOffline(true);
            setVisible(true);
        };

        const goOnline = () => {
            setIsOffline(false);
            // Keep banner mounted briefly to show "back online" state, then hide
            setTimeout(() => setVisible(false), 2500);
        };

        window.addEventListener('offline', goOffline);
        window.addEventListener('online',  goOnline);

        return () => {
            window.removeEventListener('offline', goOffline);
            window.removeEventListener('online',  goOnline);
        };
    }, []);

    if (!visible) return null;

    return (
        <div
            role="status"
            aria-live="polite"
            className={`
                fixed top-0 inset-x-0 z-[9999]
                flex items-center justify-center gap-2
                px-4 py-2.5
                text-xs font-semibold tracking-wide
                transition-all duration-500
                ${isOffline
                    ? 'bg-red-600/95 text-white shadow-lg shadow-red-900/30 translate-y-0'
                    : 'bg-emerald-600/95 text-white translate-y-0'
                }
            `}
            style={{
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
            }}
        >
            {isOffline ? (
                <>
                    <WifiOff className="w-3.5 h-3.5 shrink-0" aria-hidden />
                    <span>You're offline — Some features are unavailable</span>
                    <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-red-300 animate-ping" />
                </>
            ) : (
                <>
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Back online! Syncing your data…</span>
                </>
            )}
        </div>
    );
}
