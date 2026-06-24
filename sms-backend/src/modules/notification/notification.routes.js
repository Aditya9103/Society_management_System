import express from 'express';
import * as notificationController from './notification.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

// Get user notifications
router.get('/', notificationController.getUserNotifications);

// Mark all as read
router.patch('/read-all', notificationController.markAllAsRead);

// Mark specific notification as read
router.patch('/:id/read', notificationController.markAsRead);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

export default router;
