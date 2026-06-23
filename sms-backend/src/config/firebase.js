import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import env from './env.js';
import logger from '../utils/logger.js';

let messaging = null;

try {
    if (env.firebase.projectId && env.firebase.clientEmail && env.firebase.privateKey) {
        const app = initializeApp({
            credential: cert({
                projectId: env.firebase.projectId,
                clientEmail: env.firebase.clientEmail,
                privateKey: env.firebase.privateKey,
            }),
        });
        messaging = getMessaging(app);
        console.log(`🔥  Firebase Admin SDK initialized:    ${env.firebase.projectId}`);
    } else {
        logger.warn('Firebase Admin SDK not initialized: Missing credentials in environment variables. Push notifications will fail.');
    }
} catch (error) {
    logger.error(`Firebase Admin initialization error: ${error.message}`);
}

export default messaging ? { messaging: () => messaging } : null;
