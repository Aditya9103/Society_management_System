/**
 * notice.controller.js — HTTP handlers for the Notice module.
 */

import * as noticeService from './notice.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

// ── Admin/Committee — create notice ──────────────────────────────────────────

export const createNotice = asyncHandler(async (req, res) => {
    const createdBy = req.user.sub;
    const societyId = req.user.societyId;
    const notice = await noticeService.createNotice(createdBy, societyId, req.body);
    res.status(201).json(new ApiResponse(201, { notice }, 'Notice created'));
});

// ── All permitted roles — list notices ────────────────────────────────────────

export const listNotices = asyncHandler(async (req, res) => {
    const societyId = req.user.societyId;
    const role = req.user.role;

    // Residents and Help Desk see only PUBLISHED; others see all
    const isRestricted = role === 'RESIDENT' || role === 'HELP_DESK';
    const result = isRestricted
        ? await noticeService.listPublishedNotices(societyId, req.query)
        : await noticeService.listAllNotices(societyId, req.query);

    res.status(200).json(new ApiResponse(200, result.data, 'Notices fetched', result.pagination));
});

// ── Get single notice ─────────────────────────────────────────────────────────

export const getNoticeById = asyncHandler(async (req, res) => {
    const societyId = req.user.societyId;
    const notice = await noticeService.getNoticeById(req.params.id, societyId);
    res.status(200).json(new ApiResponse(200, { notice }, 'Notice fetched'));
});

// ── Admin/Committee — publish notice ─────────────────────────────────────────

export const publishNotice = asyncHandler(async (req, res) => {
    const societyId = req.user.societyId;
    const notice = await noticeService.publishNotice(req.params.id, societyId);
    res.status(200).json(new ApiResponse(200, { notice }, 'Notice published'));
});

// ── Admin/Committee — archive notice ─────────────────────────────────────────

export const archiveNotice = asyncHandler(async (req, res) => {
    const societyId = req.user.societyId;
    const notice = await noticeService.archiveNotice(req.params.id, societyId);
    res.status(200).json(new ApiResponse(200, { notice }, 'Notice archived'));
});

// ── Acknowledgements ────────────────────────────────────────────────────────────

export const acknowledgeNotice = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const ack = await noticeService.acknowledgeNotice(req.params.id, userId);
    res.status(200).json(new ApiResponse(200, { acknowledgement: ack }, 'Notice acknowledged'));
});

export const getNoticeAcknowledgements = asyncHandler(async (req, res) => {
    const societyId = req.user.societyId;
    const acknowledgements = await noticeService.getNoticeAcknowledgements(req.params.id, societyId);
    res.status(200).json(new ApiResponse(200, { acknowledgements }, 'Acknowledgements fetched'));
});

// ── Admin/Committee — delete notice ──────────────────────────────────────────

export const deleteNotice = asyncHandler(async (req, res) => {
    const societyId = req.user.societyId;
    await noticeService.deleteNotice(req.params.id, societyId);
    res.status(200).json(new ApiResponse(200, null, 'Notice deleted'));
});
