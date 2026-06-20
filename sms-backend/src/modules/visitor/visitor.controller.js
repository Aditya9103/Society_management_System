/**
 * visitor.controller.js — HTTP handlers for the Visitor module.
 */

import * as visitorService from './visitor.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

// ── Resident — create visitor pass ────────────────────────────────────────────

export const createVisitorPass = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const societyId = req.user.societyId;
    const visitor = await visitorService.createVisitorPass(userId, societyId, req.body);
    res.status(201).json(new ApiResponse(201, { visitor }, 'Visitor pass created'));
});

// ── Resident — list own visitors ──────────────────────────────────────────────

export const listMyVisitors = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const { data, pagination } = await visitorService.listMyVisitors(userId, req.query);
    res.status(200).json(new ApiResponse(200, data, 'Visitors fetched', pagination));
});

// ── Resident — get single visitor ─────────────────────────────────────────────

export const getVisitorById = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const visitor = await visitorService.getVisitorById(req.params.id, userId);
    res.status(200).json(new ApiResponse(200, { visitor }, 'Visitor fetched'));
});

// ── Resident — cancel visitor pass ────────────────────────────────────────────

export const cancelVisitorPass = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const visitor = await visitorService.cancelVisitorPass(req.params.id, userId);
    res.status(200).json(new ApiResponse(200, { visitor }, 'Visitor pass cancelled'));
});
