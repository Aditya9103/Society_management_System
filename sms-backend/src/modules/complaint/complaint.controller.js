/**
 * complaint.controller.js — HTTP handlers for the Complaint module.
 */

import * as complaintService from './complaint.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

// ── Resident — raise a complaint ──────────────────────────────────────────────

export const raiseComplaint = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const societyId = req.user.societyId;
    const complaint = await complaintService.raiseComplaint(userId, societyId, req.body);
    res.status(201).json(new ApiResponse(201, { complaint }, 'Complaint raised successfully'));
});

// ── Resident — list own complaints ────────────────────────────────────────────

export const listMyComplaints = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const { data, pagination } = await complaintService.listMyComplaints(userId, req.query);
    res.status(200).json(new ApiResponse(200, data, 'Complaints fetched', pagination));
});

// ── Any authorised user — get single complaint ────────────────────────────────

export const getComplaintById = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const role = req.user.role;
    const complaint = await complaintService.getComplaintById(req.params.id, userId, role);
    res.status(200).json(new ApiResponse(200, { complaint }, 'Complaint fetched'));
});

// ── Admin/Staff — list all society complaints ─────────────────────────────────

export const listAllComplaints = asyncHandler(async (req, res) => {
    const societyId = req.user.societyId;
    const { data, pagination } = await complaintService.listAllComplaints(societyId, req.query);
    res.status(200).json(new ApiResponse(200, data, 'All complaints fetched', pagination));
});

// ── Admin/FM — assign complaint ───────────────────────────────────────────────

export const assignComplaint = asyncHandler(async (req, res) => {
    const societyId = req.user.societyId;
    const { assignedTo } = req.body;
    const complaint = await complaintService.assignComplaint(req.params.id, societyId, assignedTo);
    res.status(200).json(new ApiResponse(200, { complaint }, 'Complaint assigned'));
});

// ── Admin — close/resolve complaint ───────────────────────────────────────────

export const closeComplaint = asyncHandler(async (req, res) => {
    const societyId = req.user.societyId;
    const complaint = await complaintService.closeComplaint(req.params.id, societyId, req.body);
    res.status(200).json(new ApiResponse(200, { complaint }, 'Complaint resolved'));
});
