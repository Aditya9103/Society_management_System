import logger from '../../utils/logger.js';
import { ROOMS } from '../rooms.js';

export default (io, socket) => {
    // Most notifications are emitted from the backend services (using getIO()).
    // However, clients can emit events to acknowledge reading a notification.

    socket.on('notification:read', (payload) => {
        // payload: { notificationId }
        const userId = socket.user.id || socket.user._id;
        logger.info(`[Socket] Notification ${payload.notificationId} read by user ${userId}`);
        
        // Broadcast back to the user's specific room to sync state across multiple devices
        io.to(ROOMS.USER(userId)).emit('notification:synced', {
            notificationId: payload.notificationId,
            read: true,
            timestamp: new Date()
        });
    });
};
