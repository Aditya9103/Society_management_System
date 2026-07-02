/**
 * Firebase Web SDK initialization for the SMS PWA.
 * Only initializes Firebase Messaging (for push notifications).
 * The heavy Admin SDK lives exclusively on the backend.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Singleton — don't re-initialize if HMR triggers re-execution
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

/**
 * Returns the Firebase Messaging instance, or null if the browser doesn't support it.
 * FCM requires a modern browser with service worker support.
 */
export const getFirebaseMessaging = async () => {
    try {
        const supported = await isSupported();
        if (!supported) return null;
        return getMessaging(app);
    } catch (err) {
        console.warn('[Firebase] Messaging not supported in this environment:', err);
        return null;
    }
};

export default app;
