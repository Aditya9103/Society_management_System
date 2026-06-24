import * as notificationService from './notification.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const getUserNotifications = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const result = await notificationService.getUserNotifications(userId, req.query);
    
    res.status(200).json(new ApiResponse(200, result, 'Notifications retrieved successfully'));
});

export const markAsRead = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    
    const notification = await notificationService.markNotificationAsRead(id, userId);
    
    res.status(200).json(new ApiResponse(200, notification, 'Notification marked as read'));
});

export const markAllAsRead = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    await notificationService.markAllNotificationsAsRead(userId);
    
    res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read'));
});

export const deleteNotification = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    
    await notificationService.deleteUserNotification(id, userId);
    
    res.status(200).json(new ApiResponse(200, null, 'Notification deleted successfully'));
});
