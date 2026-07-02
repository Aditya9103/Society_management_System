/**
 * SMS PWA Service Worker
 * Strategy:
 *   - Static assets (JS/CSS/fonts/icons)  → CacheFirst
 *   - API GET requests                     → NetworkFirst (5 s timeout, fallback to cache)
 *   - Auth / payments                      → NetworkOnly (never cache)
 *   - Navigation (HTML pages)              → NetworkFirst
 *   - Google Fonts                         → StaleWhileRevalidate
 *   - Background Sync                      → queue failed POST mutations
 *   - Push Notifications                   → display system notification
 */

import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import {
    CacheFirst,
    NetworkFirst,
    StaleWhileRevalidate,
    NetworkOnly,
} from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// ─── Core ────────────────────────────────────────────────────────────────────
clientsClaim();

// Capture the manifest injected by vite-plugin-pwa (MUST only appear once in this file!)
const precacheManifest = self.__WB_MANIFEST || [];

// Precache all assets injected by vite-plugin-pwa at build time
precacheAndRoute(precacheManifest);

// Remove stale precaches from previous versions
cleanupOutdatedCaches();

// ─── Cache names (bump version to force fresh cache on deploy) ───────────────
const STATIC_CACHE   = 'sms-static-v1';
const API_CACHE      = 'sms-api-v1';
const IMAGE_CACHE    = 'sms-images-v1';
const FONTS_CACHE    = 'sms-fonts-v1';

// ─── Network-Only: Auth & Payment (NEVER cache) ───────────────────────────────
registerRoute(
    ({ url }) =>
        url.pathname.includes('/auth/') ||
        url.pathname.includes('/payments/') ||
        url.pathname.includes('/razorpay/') ||
        url.pathname.includes('/id-cards/') ||
        url.pathname.includes('/token/refresh'),
    new NetworkOnly()
);

// ─── NetworkFirst: All API GET requests ───────────────────────────────────────
registerRoute(
    ({ url, request }) =>
        url.pathname.startsWith('/api/') && request.method === 'GET',
    new NetworkFirst({
        cacheName: API_CACHE,
        networkTimeoutSeconds: 5,
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
                purgeOnQuotaError: true,
            }),
        ],
    })
);

// ─── CacheFirst: Google Fonts stylesheets ────────────────────────────────────
registerRoute(
    ({ url }) => url.origin === 'https://fonts.googleapis.com',
    new StaleWhileRevalidate({
        cacheName: FONTS_CACHE,
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }),
        ],
    })
);

// ─── CacheFirst: Google Fonts files ──────────────────────────────────────────
registerRoute(
    ({ url }) => url.origin === 'https://fonts.gstatic.com',
    new CacheFirst({
        cacheName: FONTS_CACHE,
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 }),
        ],
    })
);

// ─── CacheFirst: Images ───────────────────────────────────────────────────────
registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
        cacheName: IMAGE_CACHE,
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                purgeOnQuotaError: true,
            }),
        ],
    })
);

// ─── CacheFirst: Static assets (JS, CSS, fonts, manifests) ───────────────────
registerRoute(
    ({ request }) =>
        request.destination === 'script' ||
        request.destination === 'style'  ||
        request.destination === 'font'   ||
        request.destination === 'manifest',
    new CacheFirst({
        cacheName: STATIC_CACHE,
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 365 }),
        ],
    })
);

// ─── Background Sync: queue failed offline mutations ─────────────────────────
const bgSyncPlugin = new BackgroundSyncPlugin('sms-offline-queue', {
    maxRetentionTime: 24 * 60, // retry for up to 24 hours (minutes)
});

// POST/PATCH/PUT requests (complaints, bookings, etc.) are queued when offline
registerRoute(
    ({ url, request }) =>
        url.pathname.startsWith('/api/') &&
        ['POST', 'PATCH', 'PUT'].includes(request.method) &&
        // exclude auth/payments from bg sync
        !url.pathname.includes('/auth/') &&
        !url.pathname.includes('/payments/') &&
        !url.pathname.includes('/token/'),
    new NetworkOnly({ plugins: [bgSyncPlugin] }),
    'POST'
);

// ─── Navigation: SPA fallback ─────────────────────────────────────────────────
// In production, index.html is precached. In dev, it is not.
const hasIndexHtml = precacheManifest.some(entry => 
    (typeof entry === 'string' ? entry : entry.url).endsWith('index.html')
);

if (hasIndexHtml) {
    registerRoute(
        new NavigationRoute(createHandlerBoundToURL('/index.html'), {
            denylist: [/^\/api\//, /^\/offline\.html$/],
        })
    );
} else {
    registerRoute(
        new NavigationRoute(new NetworkOnly(), {
            denylist: [/^\/api\//, /^\/offline\.html$/],
        })
    );
}

// ─── Offline fallback for uncached pages ─────────────────────────────────────
self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() =>
                caches.match('/offline.html').then((res) => res || new Response('Offline'))
            )
        );
    }
});

// ─── Push Notification Handling ───────────────────────────────────────────────
self.addEventListener('push', (event) => {
    if (!event.data) return;

    let payload;
    try {
        payload = event.data.json();
    } catch {
        payload = { title: 'Society MS', body: event.data.text() };
    }

    const title   = payload.notification?.title || payload.title || 'Society MS';
    const options = {
        body:    payload.notification?.body    || payload.body    || '',
        icon:    '/icons/icon-192x192.png',
        badge:   '/icons/icon-96x96.png',
        data:    payload.data || {},
        tag:     payload.data?.type || 'general',
        renotify: true,
        vibrate: [200, 100, 200],
        actions: [
            { action: 'open',    title: 'Open App' },
            { action: 'dismiss', title: 'Dismiss'  },
        ],
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// ─── Notification click: deep-link into the app ───────────────────────────────
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    const data = event.notification.data || {};
    const targetUrl = data.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Focus existing window if available
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }
            // Otherwise open a new window
            if (clients.openWindow) return clients.openWindow(targetUrl);
        })
    );
});

// ─── Message from app: clear user caches on logout ───────────────────────────
self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data?.type === 'CLEAR_USER_CACHES') {
        event.waitUntil(
            caches.keys().then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key.startsWith('sms-api'))
                        .map((key) => caches.delete(key))
                )
            ).then(() => {
                console.log('[SW] User caches cleared on logout');
            })
        );
    }
});
