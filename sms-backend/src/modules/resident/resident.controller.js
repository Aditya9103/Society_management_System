import * as residentService from './resident.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

/**
 * POST /api/v1/residents/profile
 * Completes the resident's profile (Step 3).
 * Requires authentication (restricted token).
 */
export const completeProfile = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    
    // Note: Request validation via Joi middleware will ensure these fields exist
    const profileData = {
        unitId: req.body.unitId,
        ownershipType: req.body.ownershipType,
        aadhaarUrl: req.body.aadhaarUrl,
        agreementUrl: req.body.agreementUrl,
    };

    const profile = await residentService.completeResidentProfile(userId, profileData);

    res.status(201).json(
        new ApiResponse(201, { profile }, 'Profile completed successfully. Pending admin approval.'),
    );
});
