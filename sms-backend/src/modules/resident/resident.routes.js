import { Router } from 'express';
import * as residentController from './resident.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { ROLES } from '../../config/constants.js';
import validate from '../../middleware/validate.middleware.js';
import { completeProfileSchema } from './resident.validator.js';

const router = Router();

// Ensure user is authenticated and is a resident
router.use(authenticate, authorize(ROLES.RESIDENT));

/**
 * POST /api/v1/residents/profile
 * Step 3: Complete the resident profile with flat and ownership details.
 */
router.post(
    '/profile',
    validate(completeProfileSchema),
    residentController.completeProfile
);

/**
 * GET /api/v1/residents/profile/me
 * Get the authenticated resident's own profile (populated).
 */
router.get('/profile/me', residentController.getMyProfile);

/**
 * PUT /api/v1/residents/profile/me
 * Update own profile (name, phone).
 */
router.put('/profile/me', residentController.updateMyProfile);

/**
 * POST /api/v1/residents/family-members
 * Add a family member to the resident's profile.
 */
router.post('/family-members', residentController.addFamilyMember);

/**
 * PUT /api/v1/residents/family-members/:memberId
 * Update a specific family member.
 */
router.put('/family-members/:memberId', residentController.updateFamilyMember);

/**
 * DELETE /api/v1/residents/family-members/:memberId
 * Remove a specific family member.
 */
router.delete('/family-members/:memberId', residentController.removeFamilyMember);

export default router;
