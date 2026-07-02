/**
 * Firebase Messaging Service Worker
 * This file MUST be named firebase-messaging-sw.js and served from the root.
 * It handles background push messages when the app is not in the foreground.
 */

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Firebase config (hardcoded here — this file is not processed by Vite)
firebase.initializeApp({
    apiKey:            'AIzaSyC0182olT7LnB9ExNSMml9tNhnq9Ax8smY',
    authDomain:        'society-management-1dc44.firebaseapp.com',
    projectId:         'society-management-1dc44',
    storageBucket:     'society-management-1dc44.firebasestorage.app',
    messagingSenderId: '550266328156',
    appId:             '1:550266328156:web:4cb95fdde47ff5dcd0c299',
});

const messaging = firebase.messaging();

// Handle background messages (when app is closed or in background)
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw] Background message:', payload);

    const title   = payload.notification?.title || 'Society MS';
    const options = {
        body:    payload.notification?.body || '',
        icon:    '/icons/icon-192x192.png',
        badge:   '/icons/icon-96x96.png',
        data:    payload.data || {},
        tag:     payload.data?.type || 'general',
        renotify: true,
        vibrate: [200, 100, 200],
    };

    return self.registration.showNotification(title, options);
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const data     = event.notification.data || {};
    const targetUrl = data.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }
            if (clients.openWindow) return clients.openWindow(targetUrl);
        })
    );
});
