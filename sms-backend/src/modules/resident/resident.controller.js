import * as residentService from './resident.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

/**
 * POST /api/v1/residents/profile
 * Completes the resident's profile (Step 3).
 */
export const completeProfile = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    
    const profileData = {
        unitId: req.body.unitId,
        ownershipType: req.body.ownershipType,
        aadhaarUrl: req.body.aadhaarUrl,
        agreementUrl: req.body.agreementUrl,
        profilePhotoBuffer: req.file?.buffer, // Add the image buffer if uploaded
    };

    const { profile, user: updatedUser } = await residentService.completeResidentProfile(userId, profileData);

    res.status(201).json(
        new ApiResponse(201, { profile, user: updatedUser }, 'Profile completed successfully. Pending admin approval.'),
    );
});

/**
 * GET /api/v1/residents/profile/me
 * Returns the authenticated resident's own profile + unit + society details.
 */
export const getMyProfile = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const profile = await residentService.getMyResidentProfile(userId);
    res.status(200).json(
        new ApiResponse(200, { profile }, 'Profile fetched successfully'),
    );
});

/**
 * PUT /api/v1/residents/profile/me
 * Update own profile (name, phone).
 */
export const updateMyProfile = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const user = await residentService.updateMyProfile(userId, req.body);
    res.status(200).json(new ApiResponse(200, { user }, 'Profile updated'));
});

/**
 * PATCH /api/v1/residents/profile/me/avatar
 * Update resident profile avatar/photo.
 */
export const updateMyAvatar = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    if (!req.file) throw ApiError.badRequest('Avatar image is required');
    const { profile, user: updatedUser } = await residentService.updateMyAvatar(userId, req.file.buffer);
    res.status(200).json(new ApiResponse(200, { profile, user: updatedUser }, 'Avatar updated successfully'));
});

/**
 * POST /api/v1/residents/family-members
 * Add a family member.
 */
export const addFamilyMember = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const resident = await residentService.addFamilyMember(userId, req.body);
    res.status(201).json(new ApiResponse(201, { resident }, 'Family member added'));
});

/**
 * PUT /api/v1/residents/family-members/:memberId
 * Update a family member.
 */
export const updateFamilyMember = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const resident = await residentService.updateFamilyMember(userId, req.params.memberId, req.body);
    res.status(200).json(new ApiResponse(200, { resident }, 'Family member updated'));
});

/**
 * DELETE /api/v1/residents/family-members/:memberId
 * Remove a family member.
 */
export const removeFamilyMember = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const resident = await residentService.removeFamilyMember(userId, req.params.memberId);
    res.status(200).json(new ApiResponse(200, { resident }, 'Family member removed'));
});

// ── Emergency Contacts ────────────────────────────────────────────────────────

export const addEmergencyContact = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const resident = await residentService.addEmergencyContact(userId, req.body);
    res.status(201).json(new ApiResponse(201, { resident }, 'Emergency contact added'));
});

export const updateEmergencyContact = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const resident = await residentService.updateEmergencyContact(userId, req.params.contactId, req.body);
    res.status(200).json(new ApiResponse(200, { resident }, 'Emergency contact updated'));
});

export const removeEmergencyContact = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const resident = await residentService.removeEmergencyContact(userId, req.params.contactId);
    res.status(200).json(new ApiResponse(200, { resident }, 'Emergency contact removed'));
});
