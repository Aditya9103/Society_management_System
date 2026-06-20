/**
 * staff.controller.js — HTTP handlers for the Staff portal endpoints.
 *
 * Accessible by: COMMITTEE_MEMBER | ACCOUNTANT | FACILITY_MANAGER | SECURITY_GUARD
 *
 * Controllers are thin — extract, call service, return ApiResponse.
 */

import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import * as staffService from './staff.service.js';

// ── Dashboard ─────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/staff/dashboard
 * Role-aware dashboard stats.
 */
export const getDashboard = asyncHandler(async (req, res) => {
    const { sub: userId, societyId, role } = req.user;
    const stats = await staffService.getDashboardStats({ userId, societyId, role });
    res.status(200).json(new ApiResponse(200, stats, 'Dashboard loaded'));
});

// ── Society Profile (read-only) ───────────────────────────────────────────────

/**
 * GET /api/v1/staff/society/profile
 * Staff can view (but not modify) their society's profile.
 */
export const getSocietyProfile = asyncHandler(async (req, res) => {
    const { societyId } = req.user;
    const profile = await staffService.getSocietyProfile(societyId);
    res.status(200).json(new ApiResponse(200, { profile }, 'Society profile fetched'));
});

// ── Residents directory (COMMITTEE_MEMBER) ────────────────────────────────────

/**
 * GET /api/v1/staff/residents
 * Read-only resident directory for committee members.
 */
export const getResidents = asyncHandler(async (req, res) => {
    const { societyId } = req.user;
    const { page = 1, limit = 20, search = '' } = req.query;
    const result = await staffService.listResidents({ societyId, page: Number(page), limit: Number(limit), search });
    res.status(200).json(new ApiResponse(200, result.data, 'Residents fetched', result.pagination));
});

// ── Units directory ───────────────────────────────────────────────────────────

/**
 * GET /api/v1/staff/units
 * Unit list for committee members and facility managers.
 */
export const getUnits = asyncHandler(async (req, res) => {
    const { societyId } = req.user;
    const { page = 1, limit = 20, towerId = '' } = req.query;
    const result = await staffService.listUnits({ societyId, page: Number(page), limit: Number(limit), towerId });
    res.status(200).json(new ApiResponse(200, result.data, 'Units fetched', result.pagination));
});
