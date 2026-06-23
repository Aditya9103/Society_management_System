import admin from '../config/firebase.js';
import logger from '../utils/logger.js';

/**
 * Send a push notification to a specific device token.
 *
 * @param {Object} options
 * @param {string} options.token - The FCM device token
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification body
 * @param {Object} [options.data] - Optional custom data payload
 * @returns {Promise<string|null>} Message ID on success, null on failure
 */
export const sendPushNotification = async ({ token, title, body, data = {} }) => {
    try {
        if (!admin) {
            logger.warn('Firebase Admin not initialized, skipping push notification');
            return null;
        }

        const message = {
            notification: {
                title,
                body,
            },
            data,
            token,
        };

        const response = await admin.messaging().send(message);
        logger.info(`Successfully sent push notification to ${token}`);
        return response;
    } catch (error) {
        logger.error(`Failed to send push notification to ${token}: ${error.message}`);
        throw error;
    }
};

/**
 * Send a push notification to multiple device tokens.
 *
 * @param {Object} options
 * @param {string[]} options.tokens - Array of FCM device tokens
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification body
 * @param {Object} [options.data] - Optional custom data payload
 * @returns {Promise<Object|null>} Response object containing success/failure counts
 */
export const sendMulticastPushNotification = async ({ tokens, title, body, data = {} }) => {
    try {
        if (!admin) {
            logger.warn('Firebase Admin not initialized, skipping multicast push notification');
            return null;
        }

        if (!tokens || tokens.length === 0) {
            logger.warn('No tokens provided for multicast push notification');
            return null;
        }

        const message = {
            notification: {
                title,
                body,
            },
            data,
            tokens,
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        logger.info(`Successfully sent multicast push notification. Success: ${response.successCount}, Failure: ${response.failureCount}`);
        return response;
    } catch (error) {
        logger.error(`Failed to send multicast push notification: ${error.message}`);
        throw error;
    }
};
