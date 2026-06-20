/**
 * notice.service.js — Business logic for the Notice module.
 */

import * as noticeRepo from './notice.repository.js';
import ApiError from '../../utils/ApiError.js';

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

    return noticeRepo.updateById(id, { status: 'PUBLISHED', publishedAt: new Date() });
};

export const archiveNotice = async (id, societyId) => {
    const notice = await noticeRepo.findById(id);
    if (!notice) throw ApiError.notFound('Notice not found.');
    if (notice.societyId?.toString() !== societyId.toString()) {
        throw ApiError.forbidden('Not authorized.');
    }
    return noticeRepo.updateById(id, { status: 'ARCHIVED' });
};
