/**
 * visitor.controller.js — HTTP handlers for the Visitor module.
 */

import * as visitorService from './visitor.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

// ── Resident — Flow A & Queries ──────────────────────────────────────────────

export const createVisitorPass = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const societyId = req.user.societyId;
    const visitor = await visitorService.createVisitorPass(userId, societyId, req.body);
    res.status(201).json(new ApiResponse(201, { visitor }, 'Visitor pass created'));
});

export const listMyVisitors = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const { data, pagination } = await visitorService.listMyVisitors(userId, req.query);
    res.status(200).json(new ApiResponse(200, data, 'Visitors fetched', pagination));
});

export const getVisitorById = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const visitor = await visitorService.getVisitorById(req.params.id, userId);
    res.status(200).json(new ApiResponse(200, { visitor }, 'Visitor fetched'));
});

export const cancelVisitorPass = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const visitor = await visitorService.cancelVisitorPass(req.params.id, userId);
    res.status(200).json(new ApiResponse(200, { visitor }, 'Visitor pass cancelled'));
});

// ── Resident — Flow B (Real-time Approval) ────────────────────────────────────

export const approveWalkIn = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const visitor = await visitorService.approveWalkIn(req.params.id, userId);
    res.status(200).json(new ApiResponse(200, { visitor }, 'Visitor approved'));
});

export const denyWalkIn = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const visitor = await visitorService.denyWalkIn(req.params.id, userId);
    res.status(200).json(new ApiResponse(200, { visitor }, 'Visitor denied'));
});

// ── Guard — Flows B & C ───────────────────────────────────────────────────────

export const processWalkIn = asyncHandler(async (req, res) => {
    const guardId = req.user.sub;
    const societyId = req.user.societyId;
    const visitor = await visitorService.processWalkIn(guardId, societyId, req.body);
    res.status(201).json(new ApiResponse(201, { visitor }, 'Walk-in visitor registered. Approval requested.'));
});

export const scanQrCode = asyncHandler(async (req, res) => {
    const guardId = req.user.sub;
    const societyId = req.user.societyId;
    const { qrCode } = req.body;
    const visitor = await visitorService.scanQrCode(guardId, societyId, qrCode);
    res.status(200).json(new ApiResponse(200, { visitor }, 'QR Code scanned successfully'));
});

export const logEntry = asyncHandler(async (req, res) => {
    const guardId = req.user.sub;
    const societyId = req.user.societyId;
    const { gateId } = req.body;
    const visitor = await visitorService.logEntry(guardId, societyId, req.params.id, gateId);
    res.status(200).json(new ApiResponse(200, { visitor }, 'Entry logged successfully'));
});

export const logExit = asyncHandler(async (req, res) => {
    const guardId = req.user.sub;
    const societyId = req.user.societyId;
    const { gateId } = req.body;
    const visitor = await visitorService.logExit(guardId, societyId, req.params.id, gateId);
    res.status(200).json(new ApiResponse(200, { visitor }, 'Exit logged successfully'));
});
