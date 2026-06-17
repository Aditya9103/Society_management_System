import * as societyService from './society.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { ROLES } from '../../config/constants.js';
import ApiError from '../../utils/ApiError.js';

export const createStaff = asyncHandler(async (req, res) => {
    const { role } = req.body;

    const allowedStaffRoles = [
        ROLES.COMMITTEE_MEMBER,
        ROLES.ACCOUNTANT,
        ROLES.FACILITY_MANAGER,
        ROLES.SECURITY_GUARD
    ];

    if (!allowedStaffRoles.includes(role)) {
        throw ApiError.badRequest(`Role must be one of: ${allowedStaffRoles.join(', ')}`);
    }

    const societyId = req.user.societyId;
    if (!societyId) {
        throw ApiError.forbidden('You are not associated with any society.');
    }

    const staffData = { ...req.body, societyId };
    const staff = await societyService.createStaff(staffData);

    res.status(201).json(
        new ApiResponse(201, { user: staff }, 'Staff account created successfully'),
    );
});

export const approveResident = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { adminComments } = req.body;
    const adminUserId = req.user.sub;

    const resident = await societyService.approveResident(id, adminUserId, adminComments);

    res.status(200).json(
        new ApiResponse(200, { user: resident }, 'Resident approved successfully'),
    );
});

export const createTower = asyncHandler(async (req, res) => {
    const { role } = req.body;


})

