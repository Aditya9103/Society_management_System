/**
 * notice.service.js — Business logic for the Notice module.
 */

import * as noticeRepo from './notice.repository.js';
import ApiError from '../../utils/ApiError.js';
import { resolveTargetAudience } from './targetAudience.service.js';
import { sendNotification } from '../../services/notification.service.js';
import logger from '../../utils/logger.js';
import NoticeAcknowledgement from './noticeAcknowledgement.model.js';
import Resident from '../resident/resident.model.js';
import User from '../auth/user.model.js';
import { scheduleNoticePublish, cancelScheduledNotice } from '../../jobs/noticeSender.job.js';

/**
 * Dispatches notifications to the resolved target audience for a published notice.
 */
const dispatchNoticeNotifications = async (notice) => {
    try {
        let users = await resolveTargetAudience(notice.societyId, notice.targetAudience);

        if (users.length === 0) return;

        const creatorId = notice.createdBy ? notice.createdBy.toString() : null;
        const targetUsers = users.filter(u => u._id.toString() !== creatorId);
        let creatorUser = users.find(u => u._id.toString() === creatorId);

        // If the admin wasn't part of the target audience, fetch them manually
        if (!creatorUser && creatorId) {
            creatorUser = await User.findById(creatorId).select('_id fcmTokens').lean();
        }

        // 1. Send the actual notice notification to the targeted audience
        if (targetUsers.length > 0) {
            await sendNotification({
                users: targetUsers,
                societyId: notice.societyId,
                type: 'NOTICE_PUBLISHED',
                title: notice.title,
                message: notice.content.length > 200 ? notice.content.substring(0, 197) + '...' : notice.content,
                priority: notice.priority,
                referenceType: 'NOTICE',
                referenceId: notice._id
            });
        }

        // 2. Send a quiet confirmation to the admin who created it (no urgent popups)
        if (creatorUser) {
            await sendNotification({
                users: [creatorUser],
                societyId: notice.societyId,
                type: 'NOTICE_PUBLISHED_CONFIRMATION',
                title: 'Notice Published Successfully',
                message: `Your notice "${notice.title}" has been dispatched.`,
                priority: 'NORMAL', // Always normal so the admin doesn't get an urgent popup for their own action
                referenceType: 'NOTICE',
                referenceId: notice._id
            });
        }

        // Update the sentToCount
        await noticeRepo.updateById(notice._id, { sentToCount: targetUsers.length });
    } catch (error) {
        logger.error(`Failed to dispatch notice notifications: ${error.message}`);
    }
};

// ── Admin / Committee — create notice ─────────────────────────────────────────

export const createNotice = async (createdBy, societyId, data) => {
    const { scheduledAt, status: requestedStatus, ...rest } = data;

    // Determine final status based on frontend request and scheduledAt
    let finalStatus = requestedStatus || 'PUBLISHED';
    let publishedAt = null;

    if (scheduledAt) {
        finalStatus = 'SCHEDULED';
    } else if (finalStatus === 'PUBLISHED') {
        publishedAt = new Date();
    }

    const notice = await noticeRepo.create({
        ...rest,
        societyId,
        createdBy,
        status: finalStatus,
        publishedAt,
        scheduledAt: scheduledAt ?? null,
    });

    if (finalStatus === 'PUBLISHED') {
        dispatchNoticeNotifications(notice);
    } else if (finalStatus === 'SCHEDULED' && scheduledAt) {
        scheduleNoticePublish(notice._id, scheduledAt);
    }

    return notice;
};

// ── Resident / Help Desk — list published notices ─────────────────────────────

export const listPublishedNotices = async (societyId, query = {}) => {
    const { page = 1, limit = 20, noticeType } = query;
    const { data, total } = await noticeRepo.findPublished(societyId, { page, limit, noticeType });

    return {
        data,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// ── Admin / Committee — list all notices (all statuses) ───────────────────────

export const listAllNotices = async (societyId, query = {}) => {
    const { page = 1, limit = 20, status, noticeType } = query;
    const { data, total } = await noticeRepo.findBySociety(societyId, { page, limit, status, noticeType });

    return {
        data,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// ── Get single notice ─────────────────────────────────────────────────────────

export const getNoticeById = async (id, societyId) => {
    const notice = await noticeRepo.findById(id);
    if (!notice) throw ApiError.notFound('Notice not found.');
    if (notice.societyId?.toString() !== societyId.toString()) {
        throw ApiError.forbidden('Notice does not belong to your society.');
    }
    return notice;
};

// ── Publish / Archive ──────────────────────────────────────────────────────────

export const publishNotice = async (id, societyId) => {
    const notice = await noticeRepo.findById(id);
    if (!notice) throw ApiError.notFound('Notice not found.');
    if (notice.societyId?.toString() !== societyId.toString()) {
        throw ApiError.forbidden('Not authorized.');
    }
    if (notice.status === 'PUBLISHED') throw ApiError.badRequest('Notice is already published.');

    const updatedNotice = await noticeRepo.updateById(id, { status: 'PUBLISHED', publishedAt: new Date() });

    // Clear scheduled timeout if manually published
    cancelScheduledNotice(id);

    dispatchNoticeNotifications(updatedNotice);
    return updatedNotice;
};

/**
 * Called automatically by the background cron job to publish a scheduled notice.
 * No societyId authorization is needed since it's a system action.
 */
export const publishScheduledNotice = async (id) => {
    const notice = await noticeRepo.findById(id);
    if (!notice) return;
    if (notice.status === 'PUBLISHED') return;

    const updatedNotice = await noticeRepo.updateById(id, { status: 'PUBLISHED', publishedAt: new Date() });
    dispatchNoticeNotifications(updatedNotice);
    logger.info(`System automatically published scheduled notice ${id}`);
    return updatedNotice;
};

/**
 * Updates the scheduled time for a DRAFT or SCHEDULED notice.
 */
export const updateNoticeSchedule = async (id, societyId, scheduledAt) => {
    const notice = await noticeRepo.findById(id);
    if (!notice) throw ApiError.notFound('Notice not found.');
    if (notice.societyId?.toString() !== societyId.toString()) {
        throw ApiError.forbidden('Not authorized.');
    }
    if (notice.status === 'PUBLISHED' || notice.status === 'ARCHIVED') {
        throw ApiError.badRequest('Cannot reschedule a published or archived notice.');
    }

    let status = notice.status;

    if (scheduledAt) {
        status = 'SCHEDULED';
    } else if (notice.status === 'SCHEDULED') {
        status = 'DRAFT'; // If schedule is removed, fallback to DRAFT
    }

    const updatedNotice = await noticeRepo.updateById(id, { status, scheduledAt: scheduledAt || null });

    if (status === 'SCHEDULED' && scheduledAt) {
        scheduleNoticePublish(id, scheduledAt);
    } else {
        cancelScheduledNotice(id);
    }

    return updatedNotice;
};

export const archiveNotice = async (id, societyId) => {
    const notice = await noticeRepo.findById(id);
    if (!notice) throw ApiError.notFound('Notice not found.');
    if (notice.societyId?.toString() !== societyId.toString()) {
        throw ApiError.forbidden('Not authorized.');
    }

    cancelScheduledNotice(id);

    return await noticeRepo.updateById(id, { status: 'ARCHIVED' });
};

// ── Acknowledgements ────────────────────────────────────────────────────────────

export const acknowledgeNotice = async (noticeId, userId) => {
    const resident = await Resident.findOne({ userId });
    if (!resident) throw ApiError.forbidden('Only residents can acknowledge notices.');

    const notice = await noticeRepo.findById(noticeId);
    if (!notice) throw ApiError.notFound('Notice not found.');
    if (!notice.requiresAcknowledgement) throw ApiError.badRequest('Notice does not require acknowledgement.');

    try {
        const ack = await NoticeAcknowledgement.create({ noticeId, residentId: resident._id });
        await noticeRepo.updateById(noticeId, { $inc: { acknowledgedCount: 1 } });
        return ack;
    } catch (error) {
        if (error.code === 11000) {
            throw ApiError.badRequest('Notice already acknowledged.');
        }
        throw error;
    }
};

export const getNoticeAcknowledgements = async (noticeId, societyId) => {
    const notice = await noticeRepo.findById(noticeId);
    if (!notice) throw ApiError.notFound('Notice not found.');
    if (notice.societyId?.toString() !== societyId.toString()) {
        throw ApiError.forbidden('Not authorized.');
    }

    const acknowledgements = await NoticeAcknowledgement.find({ noticeId })
        .populate({ path: 'residentId', select: 'userId residentCode unitId', populate: { path: 'userId', select: 'firstName lastName email phone' } })
        .lean();

    return acknowledgements;
};

export const deleteNotice = async (id, societyId) => {
    const notice = await noticeRepo.findById(id);
    if (!notice) throw ApiError.notFound('Notice not found.');
    if (notice.societyId?.toString() !== societyId.toString()) {
        throw ApiError.forbidden('Not authorized.');
    }

    cancelScheduledNotice(id);

    await noticeRepo.deleteById(id);
    return true;
};
