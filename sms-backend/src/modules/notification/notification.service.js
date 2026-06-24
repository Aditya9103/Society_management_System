import * as notificationRepo from './notification.repository.js';
import ApiError from '../../utils/ApiError.js';

export const getUserNotifications = async (userId, query = {}) => {
    const { page = 1, limit = 20, unreadOnly } = query;
    const isUnreadOnly = unreadOnly === 'true' || unreadOnly === true;

    const { data, total } = await notificationRepo.findUserNotifications(userId, {
        page: Number(page),
        limit: Number(limit),
        unreadOnly: isUnreadOnly
    });

    const unreadCount = await notificationRepo.countUnread(userId);

    return {
        data,
        unreadCount,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const markNotificationAsRead = async (id, userId) => {
    const notification = await notificationRepo.markAsRead(id, userId);
    if (!notification) {
        throw ApiError.notFound('Notification not found or unauthorized.');
    }
    return notification;
};

export const markAllNotificationsAsRead = async (userId) => {
    const result = await notificationRepo.markAllAsRead(userId);
    return result;
};

export const deleteUserNotification = async (id, userId) => {
    const notification = await notificationRepo.deleteNotification(id, userId);
    if (!notification) {
        throw ApiError.notFound('Notification not found or unauthorized.');
    }
    return notification;
};
