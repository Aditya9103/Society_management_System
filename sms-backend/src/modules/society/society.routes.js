import { Router } from 'express';
import * as societyController from './society.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { ROLES } from '../../config/constants.js';
import validate from '../../middleware/validate.middleware.js';
import { createStaffSchema, approveResidentSchema } from './society.validator.js';

const router = Router();

router.use(authenticate, authorize(ROLES.SOCIETY_ADMIN));

/**
 * POST /api/v1/societies/staff
 * Create staff accounts
 */
router.post(
    '/staff',
    validate(createStaffSchema),
    societyController.createStaff
);

/**
 * PATCH /api/v1/societies/resident/:id/approve
 * Approve a resident registration
 */
router.patch(
    '/resident/:id/approve',
    validate(approveResidentSchema),
    societyController.approveResident
);

export default router;
