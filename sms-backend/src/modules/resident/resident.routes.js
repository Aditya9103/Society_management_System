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

export default router;
