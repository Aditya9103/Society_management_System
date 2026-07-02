/**
 * usePWA — manages PWA install prompt and service worker update lifecycle
 *
 * Returns:
 *   canInstall  — true when browser has an install prompt ready
 *   isOffline   — true when navigator.onLine is false
 *   hasUpdate   — true when a new SW version is waiting to activate
 *   installApp  — triggers the native install prompt
 *   updateApp   — sends SKIP_WAITING to activate the new SW and reloads
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export function usePWA() {
    const [canInstall, setCanInstall]  = useState(false);
    const [isOffline, setIsOffline]    = useState(!navigator.onLine);
    const [hasUpdate, setHasUpdate]    = useState(false);
    const deferredPrompt               = useRef(null);
    const wb                           = useRef(null);

    // ── Online / offline detection ────────────────────────────────────────
    useEffect(() => {
        const handleOnline  = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online',  handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online',  handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // ── Install prompt ────────────────────────────────────────────────────
    useEffect(() => {
        const handleBeforeInstall = (e) => {
            e.preventDefault();
            deferredPrompt.current = e;
            setCanInstall(true);
        };

        const handleAppInstalled = () => {
            deferredPrompt.current = null;
            setCanInstall(false);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);
        window.addEventListener('appinstalled',        handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
            window.removeEventListener('appinstalled',        handleAppInstalled);
        };
    }, []);

    // ── Service Worker update detection ───────────────────────────────────
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        let registration;

        const checkForUpdate = async () => {
            try {
                registration = await navigator.serviceWorker.getRegistration();
                if (!registration) return;

                // Poll for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (!newWorker) return;

                    newWorker.addEventListener('statechange', () => {
                        if (
                            newWorker.state === 'installed' &&
                            navigator.serviceWorker.controller
                        ) {
                            // New SW installed but waiting — notify user
                            setHasUpdate(true);
                            wb.current = newWorker;
                        }
                    });
                });

                // Also listen to controllerchange to reload after skipWaiting
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    window.location.reload();
                });

            } catch (err) {
                console.warn('[usePWA] SW check failed:', err);
            }
        };

        checkForUpdate();
    }, []);

    // ── Actions ───────────────────────────────────────────────────────────
    const installApp = useCallback(async () => {
        if (!deferredPrompt.current) return;
        deferredPrompt.current.prompt();
        const { outcome } = await deferredPrompt.current.userChoice;
        if (outcome === 'accepted') {
            deferredPrompt.current = null;
            setCanInstall(false);
        }
    }, []);

    const updateApp = useCallback(() => {
        if (wb.current) {
            wb.current.postMessage({ type: 'SKIP_WAITING' });
        } else if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
        }
        // controllerchange event will reload the page
    }, []);

    return { canInstall, isOffline, hasUpdate, installApp, updateApp };
}
