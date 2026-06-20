/**
 * society.controller.js — HTTP handlers for the Society Admin module.
 *
 * All handlers use asyncHandler for clean error propagation and
 * return standardized ApiResponse envelopes.
 */

import * as societyService from './society.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';

// ── Society Profile ───────────────────────────────────────────────────────────

/**
 * GET /api/v1/societies/profile
 * Get the current society's profile (for the logged-in SOCIETY_ADMIN).
 */
export const getSocietyProfile = asyncHandler(async (req, res) => {
    const societyId = req.user.societyId;
    const society = await societyService.getSocietyProfile(societyId);
    res.status(200).json(new ApiResponse(200, { society }, 'Society profile fetched successfully'));
});

/**
 * PATCH /api/v1/societies/profile
 * Update society profile, settings, or emergency contacts.
 */
export const updateSociety = asyncHandler(async (req, res) => {
    const societyId = req.user.societyId;
    const society = await societyService.updateSociety(societyId, req.body);
    res.status(200).json(new ApiResponse(200, { society }, 'Society updated successfully'));
});

// ── Dashboard ─────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/societies/dashboard
 * Get dashboard stats for the society admin.
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
    const societyId = req.user.societyId;
    const stats = await societyService.getDashboardStats(societyId);
    res.status(200).json(new ApiResponse(200, stats, 'Dashboard stats fetched successfully'));
});

// ── Staff ─────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/societies/staff
 * Create a new staff account (COMMITTEE_MEMBER | ACCOUNTANT | FACILITY_MANAGER | SECURITY_GUARD).
 */
export const createStaff = asyncHandler(async (req, res) => {
    const societyId = req.user.societyId;
    if (!societyId) throw ApiError.forbidden('You are not associated with any society.');

    const staffData = { ...req.body, societyId };
    const staff = await societyService.createStaff(staffData);

    res.status(201).json(new ApiResponse(201, { user: staff }, 'Staff account created successfully'));
});

/**
 * GET /api/v1/societies/staff
 * List all staff members of the society.
 */
export const listStaff = asyncHandler(async (req, res) => {
    const societyId = req.user.societyId;
    const { data, pagination } = await societyService.listStaff(societyId, req.query);
    res.status(200).json(new ApiResponse(200, data, 'Staff fetched successfully', pagination));
});

/**
 * PATCH /api/v1/societies/staff/:id/deactivate
 * Deactivate a staff member account.
 */
export const deactivateStaff = asyncHandler(async (req, res) => {
    const societyId = req.user.societyId;
    await societyService.deactivateStaff(req.params.id, societyId);
    res.status(200).json(new ApiResponse(200, null, 'Staff member deactivated successfully'));
});

// ── Residents ─────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/societies/residents
 * List residents (all or filtered by registrationStatus).
 */
export const listResidents = asyncHandler(async (req, res) => {
    const societyId = req.user.societyId;
    const { data, pagination } = await societyService.listResidents(societyId, req.query);
    res.status(200).json(new ApiResponse(200, data, 'Residents fetched successfully', pagination));
});

/**
 * GET /api/v1/societies/residents/profiles
 * List detailed resident profiles (with unit and family info).
 */
export const listResidentProfiles = asyncHandler(async (req, res) => {
    const societyId = req.user.societyId;
    const { data, pagination } = await societyService.listResidentProfiles(societyId, req.query);
    res.status(200).json(new ApiResponse(200, data, 'Resident profiles fetched successfully', pagination));
});

/**
 * PATCH /api/v1/societies/resident/:id/approve
 * Approve a pending resident registration.
 */
export const approveResident = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { adminComments } = req.body;
    const adminUserId = req.user.sub;

    const resident = await societyService.approveResident(id, adminUserId, adminComments);
    res.status(200).json(new ApiResponse(200, { user: resident }, 'Resident approved successfully'));
});

/**
 * PATCH /api/v1/societies/resident/:id/reject
 * Reject a pending resident registration with a reason.
 */
export const rejectResident = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const adminUserId = req.user.sub;

    const resident = await societyService.rejectResident(id, adminUserId, reason);
    res.status(200).json(new ApiResponse(200, { user: resident }, 'Resident rejected successfully'));
});

// ── Tower Management ──────────────────────────────────────────────────────────

/**
 * GET /api/v1/societies/towers
 * List all towers for the society (includes floors).
 */
export const listTowers = asyncHandler(async (req, res) => {
    const societyId = req.user.societyId;
    const towers = await societyService.listTowers(societyId);
    res.status(200).json(new ApiResponse(200, towers, 'Towers fetched successfully'));
});

/**
 * POST /api/v1/societies/towers
 * Create a new tower (optionally auto-generates floors).
 */
export const createTower = asyncHandler(async (req, res) => {
    const societyId = req.user.societyId;
    const tower = await societyService.createTower(societyId, req.body);
    res.status(201).json(new ApiResponse(201, { tower }, 'Tower created successfully'));
});

/**
 * PATCH /api/v1/societies/towers/:id
 * Update tower metadata.
 */
export const updateTower = asyncHandler(async (req, res) => {
    const societyId = req.user.societyId;
    const tower = await societyService.updateTower(req.params.id, societyId, req.body);
    res.status(200).json(new ApiResponse(200, { tower }, 'Tower updated successfully'));
});

/**
 * DELETE /api/v1/societies/towers/:id
 * Delete a tower, its floors, and units (if none are occupied).
 */
export const deleteTower = asyncHandler(async (req, res) => {
    const societyId = req.user.societyId;
    await societyService.deleteTower(req.params.id, societyId);
    res.status(200).json(new ApiResponse(200, null, 'Tower deleted successfully'));
});

// ── Floor Management ──────────────────────────────────────────────────────────

/**
 * GET /api/v1/societies/towers/:towerId/floors
 * List all floors in a tower.
 */
export const listFloors = asyncHandler(async (req, res) => {
    const societyId = req.user.societyId;
    const floors = await societyService.listFloors(req.params.towerId, societyId);
    res.status(200).json(new ApiResponse(200, floors, 'Floors fetched successfully'));
});

/**
 * POST /api/v1/societies/towers/:towerId/floors
 * Add a single floor to a tower.
 */
export const createFloor = asyncHandler(async (req, res) => {
    const societyId = req.user.societyId;
    const floor = await societyService.createFloor(req.params.towerId, societyId, req.body);
    res.status(201).json(new ApiResponse(201, { floor }, 'Floor created successfully'));
});

/**
 * PATCH /api/v1/societies/towers/:towerId/floors/:floorId
 * Update a floor.
 */
export const updateFloor = asyncHandler(async (req, res) => {
    // 1. Extract towerId and floorId from the URL path parameters
    const { towerId, floorId } = req.params;

    // 2. Get the logged-in admin's societyId (injected by your auth middleware)
    const societyId = req.user.societyId;

    // 3. Call the service with all 4 arguments in the correct order
    const floor = await societyService.updateFloor(
        towerId,
        societyId,
        floorId,
        req.body
    );

    // 4. Send the successful response back to Postman
    res.status(200).json(
        new ApiResponse(200, { floor }, 'Floor updated successfully')
    );
});

/**
 * DELETE /api/v1/societies/towers/:towerId/floors/:floorId
 * Delete a floor.
 */
export const deleteFloor = asyncHandler(async (req, res) => {
    const { towerId, floorId } = req.params;
    const societyId = req.user.societyId;
    await societyService.deleteFloor(towerId, societyId, floorId);
    res.status(200).json(new ApiResponse(200, null, 'Floor deleted successfully'));
});


// ── Unit Management ───────────────────────────────────────────────────────────

/**
 * GET /api/v1/societies/units
 * List units with optional tower/floor/occupancy filter.
 */
export const listUnits = asyncHandler(async (req, res) => {
    const societyId = req.user.societyId;
    const { data, pagination } = await societyService.listUnits(societyId, req.query);
    res.status(200).json(new ApiResponse(200, data, 'Units fetched successfully', pagination));
});

/**
 * POST /api/v1/societies/units
 * Create a new unit in a floor.
 */
export const createUnit = asyncHandler(async (req, res) => {
    const societyId = req.user.societyId;
    const unit = await societyService.createUnit(societyId, req.body);
    res.status(201).json(new ApiResponse(201, { unit }, 'Unit created successfully'));
});

/**
 * PATCH /api/v1/societies/units/:id
 * Update a unit's details.
 */
export const updateUnit = asyncHandler(async (req, res) => {
    const societyId = req.user.societyId;
    const unit = await societyService.updateUnit(req.params.id, societyId, req.body);
    res.status(200).json(new ApiResponse(200, { unit }, 'Unit updated successfully'));
});

/**
 * DELETE /api/v1/societies/units/:id
 * Delete a unit.
 */
export const deleteUnit = asyncHandler(async (req, res) => {
    const societyId = req.user.societyId;
    await societyService.deleteUnit(req.params.id, societyId);
    res.status(200).json(new ApiResponse(200, null, 'Unit deleted successfully'));
});
