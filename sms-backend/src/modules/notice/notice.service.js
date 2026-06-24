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

/**
 * Dispatches notifications to the resolved target audience for a published notice.
 */
const dispatchNoticeNotifications = async (notice) => {
    try {
        const users = await resolveTargetAudience(notice.societyId, notice.targetAudience);
        if (users.length === 0) return;

        await sendNotification({
            users,
            societyId: notice.societyId,
            type: 'NOTICE_PUBLISHED',
            title: notice.title,
            message: notice.content.length > 200 ? notice.content.substring(0, 197) + '...' : notice.content,
            priority: notice.priority,
            referenceType: 'NOTICE',
            referenceId: notice._id
        });

        // Update the sentToCount
        await noticeRepo.updateById(notice._id, { sentToCount: users.length });
    } catch (error) {
        logger.error(`Failed to dispatch notice notifications: ${error.message}`);
    }
};

// ── Admin / Committee — create notice ─────────────────────────────────────────

export const createNotice = async (createdBy, societyId, data) => {
    const { scheduledAt, ...rest } = data;

    const status = scheduledAt ? 'SCHEDULED' : 'PUBLISHED';
    const publishedAt = scheduledAt ? null : new Date();

    const notice = await noticeRepo.create({
        ...rest,
        societyId,
        createdBy,
        status,
        publishedAt,
        scheduledAt: scheduledAt ?? null,
    });

    if (status === 'PUBLISHED') {
        dispatchNoticeNotifications(notice);
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
    dispatchNoticeNotifications(updatedNotice);
    return updatedNotice;
};

export const archiveNotice = async (id, societyId) => {
    const notice = await noticeRepo.findById(id);
    if (!notice) throw ApiError.notFound('Notice not found.');
    if (notice.societyId?.toString() !== societyId.toString()) {
        throw ApiError.forbidden('Not authorized.');
    }
    return noticeRepo.updateById(id, { status: 'ARCHIVED' });
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
        .populate({ path: 'residentId', select: 'userId residentCode unitId', populate: { path: 'userId', select: 'firstName lastName email phone' }})
        .lean();

    return acknowledgements;
};

export const deleteNotice = async (id, societyId) => {
    const notice = await noticeRepo.findById(id);
    if (!notice) throw ApiError.notFound('Notice not found.');
    if (notice.societyId?.toString() !== societyId.toString()) {
        throw ApiError.forbidden('Not authorized.');
    }
    return noticeRepo.deleteById(id);
};
