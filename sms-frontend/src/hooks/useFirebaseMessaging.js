/**
 * useFirebaseMessaging
 * Requests notification permission, obtains an FCM token, and sends it to the backend.
 * Handles foreground messages (when the app is open).
 */

import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getToken, onMessage } from 'firebase/messaging';
import { getFirebaseMessaging } from '../lib/firebase';
import { toast } from 'react-hot-toast';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;
const API_BASE = import.meta.env.VITE_API_URL;

async function registerFcmToken(token, accessToken) {
    try {
        await fetch(`${API_BASE}/auth/fcm-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ fcmToken: token }),
        });
    } catch (err) {
        console.warn('[FCM] Failed to register token:', err);
    }
}

export function useFirebaseMessaging() {
    const { isAuthenticated, accessToken } = useSelector((s) => s.auth);
    const initialized = useRef(false);

    useEffect(() => {
        if (!isAuthenticated || initialized.current) return;

        // FCM requires HTTPS or localhost
        const isSecure =
            window.location.protocol === 'https:' ||
            window.location.hostname === 'localhost';
        if (!isSecure) return;

        let unsubscribe = null;

        const initMessaging = async () => {
            try {
                const messaging = await getFirebaseMessaging();
                if (!messaging) return;

                // Ask for permission
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    console.info('[FCM] Notification permission denied.');
                    return;
                }

                // Wait for the service worker to be ready
                const registration = await navigator.serviceWorker.ready;

                // Get FCM registration token
                const token = await getToken(messaging, {
                    vapidKey: VAPID_KEY,
                    serviceWorkerRegistration: registration,
                });

                if (token) {
                    console.info('[FCM] Token obtained');
                    await registerFcmToken(token, accessToken);
                    initialized.current = true;
                }

                // Handle foreground messages
                unsubscribe = onMessage(messaging, (payload) => {
                    const title = payload.notification?.title || 'Society MS';
                    const body = payload.notification?.body || '';
                    toast(`🔔 ${title}: ${body}`, { duration: 5000 });
                });

            } catch (err) {
                console.warn('[FCM] Initialization error:', err);
            }
        };

        initMessaging();

        return () => {
            if (typeof unsubscribe === 'function') unsubscribe();
        };
    }, [isAuthenticated, accessToken]);
}
