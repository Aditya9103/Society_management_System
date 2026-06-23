import { sendEmail } from './email.service.js';
import { sendPushNotification } from './push.service.js';
import Notification from '../modules/notification/notification.model.js';
import logger from '../utils/logger.js';

/**
 * Sends a notification across multiple channels (in-app, email, push).
 *
 * @param {Object} options
 * @param {string} options.userId - The ID of the user to notify
 * @param {string} options.type - Notification type (e.g. 'MAINTENANCE', 'VISITOR')
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message body
 * @param {string[]} [options.channels=['in-app']] - Channels to send via ('in-app', 'email', 'push')
 * @param {string} [options.emailAddress] - User's email address (required if channels includes 'email')
 * @param {string} [options.pushToken] - User's FCM device token (required if channels includes 'push')
 * @param {string} [options.html] - HTML email body content
 * @returns {Promise<Object>} Results of which channels were successful
 */
export const sendNotification = async ({ userId, societyId, type, title, message, channels = ['in-app'], emailAddress, pushToken, html }) => {
    try {
        const results = {};

        // In-App Notification (Save to DB)
        if (channels.includes('in-app')) {
            const newNotification = new Notification({
                userId: userId,
                societyId: societyId || '000000000000000000000000', // Fallback if missing
                type,
                title,
                body: message,
                channel: 'IN_APP',
                status: 'SENT'
            });
            await newNotification.save();
            logger.info(`[IN-APP] Notification saved for user ${userId}: ${title}`);
            results.inApp = true;
        }

        // Email Notification
        if (channels.includes('email') && emailAddress) {
            await sendEmail({
                to: emailAddress,
                subject: title,
                text: message,
                html: html,
            });
            results.email = true;
        }

        // Push Notification
        if (channels.includes('push') && pushToken) {
            await sendPushNotification({
                token: pushToken,
                title,
                body: message,
            });
            results.push = true;
        }

        return results;
    } catch (error) {
        logger.error(`Error sending notifications: ${error.message}`);
        throw error;
    }
};
