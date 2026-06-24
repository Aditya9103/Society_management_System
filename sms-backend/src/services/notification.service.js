import { sendMulticastPushNotification } from './push.service.js';
import Notification from '../modules/notification/notification.model.js';
import logger from '../utils/logger.js';
import { getIO } from '../socket/socket.server.js';
import { ROOMS } from '../socket/rooms.js';

/**
 * Sends a notification across multiple channels (in-app, push, socket).
 *
 * @param {Object} options
 * @param {Array<Object>} options.users - Array of user objects { _id, fcmTokens }
 * @param {string} options.societyId - The society ID
 * @param {string} options.type - Notification type (e.g. 'NOTICE_PUBLISHED')
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message body
 * @param {string} [options.priority='NORMAL'] - Priority of the notification (LOW, NORMAL, HIGH, URGENT)
 * @param {string} [options.referenceType] - Associated reference type (e.g., 'NOTICE')
 * @param {string} [options.referenceId] - Associated reference ID
 * @returns {Promise<Object>} Results of which channels were successful
 */
export const sendNotification = async ({ 
    users = [], 
    societyId, 
    type, 
    title, 
    message, 
    priority = 'NORMAL',
    referenceType = null,
    referenceId = null
}) => {
    try {
        if (!users.length) return { success: false, reason: 'No target users' };

        const results = { inApp: 0, push: 0, socket: 0 };
        const notificationsToInsert = [];
        const allFcmTokens = [];

        users.forEach(user => {
            // Prepare In-App notification
            notificationsToInsert.push({
                userId: user._id,
                societyId: societyId || '000000000000000000000000',
                type,
                title,
                body: message,
                channel: 'IN_APP',
                status: 'SENT',
                referenceType,
                referenceId,
            });

            // Collect FCM tokens
            if (user.fcmTokens && user.fcmTokens.length > 0) {
                allFcmTokens.push(...user.fcmTokens);
            }
        });

        // 1. In-App Notification (Save to DB in bulk)
        if (notificationsToInsert.length > 0) {
            await Notification.insertMany(notificationsToInsert);
            results.inApp = notificationsToInsert.length;
            logger.info(`[IN-APP] Saved ${notificationsToInsert.length} notifications: ${title}`);
        }

        // 2. Push Notification via FCM
        if (allFcmTokens.length > 0) {
            const pushResult = await sendMulticastPushNotification({
                tokens: allFcmTokens,
                title,
                body: message,
                data: { type, referenceId: referenceId?.toString() || '' }
            });
            results.push = pushResult?.successCount || 0;
        }

        // 3. Socket.io (Real-time updates & Popups)
        try {
            const io = getIO();
            const isPopup = priority === 'HIGH' || priority === 'URGENT';
            const eventName = isPopup ? 'URGENT_NOTICE' : 'NEW_NOTIFICATION';

            users.forEach(user => {
                io.to(ROOMS.USER(user._id.toString())).emit(eventName, {
                    title,
                    message,
                    type,
                    priority,
                    referenceId,
                    timestamp: new Date().toISOString()
                });
            });
            results.socket = users.length;
            logger.info(`[SOCKET] Emitted ${eventName} to ${users.length} users`);
        } catch (socketErr) {
            logger.warn(`Failed to emit socket notification: ${socketErr.message}`);
        }

        return results;
    } catch (error) {
        logger.error(`Error sending notifications: ${error.message}`);
        throw error;
    }
};
