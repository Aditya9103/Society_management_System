import Notification from './notification.model.js';

/**
 * Insert multiple notifications in bulk
 * @param {Array<Object>} notifications 
 * @returns {Promise<any>}
 */
export const insertMany = (notifications) => {
    return Notification.insertMany(notifications);
};

/**
 * Fetch paginated notifications for a specific user
 * @param {string} userId 
 * @param {Object} query 
 * @returns {Promise<Object>}
 */
export const findUserNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false }) => {
    const skip = (page - 1) * limit;
    
    const filter = { userId };
    if (unreadOnly) {
        filter.readAt = null;
    }

    const [data, total] = await Promise.all([
        Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Notification.countDocuments(filter)
    ]);

    return { data, total };
};

/**
 * Get unread notification count for a user
 * @param {string} userId 
 * @returns {Promise<number>}
 */
export const countUnread = (userId) => {
    return Notification.countDocuments({ userId, readAt: null });
};

/**
 * Mark a specific notification as read
 * @param {string} id 
 * @param {string} userId 
 * @returns {Promise<Object|null>}
 */
export const markAsRead = (id, userId) => {
    return Notification.findOneAndUpdate(
        { _id: id, userId },
        { readAt: new Date(), status: 'READ' },
        { new: true }
    ).lean();
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId 
 * @returns {Promise<any>}
 */
export const markAllAsRead = (userId) => {
    return Notification.updateMany(
        { userId, readAt: null },
        { readAt: new Date(), status: 'READ' }
    );
};

/**
 * Delete a notification
 * @param {string} id 
 * @param {string} userId 
 * @returns {Promise<any>}
 */
export const deleteNotification = (id, userId) => {
    return Notification.findOneAndDelete({ _id: id, userId });
};
