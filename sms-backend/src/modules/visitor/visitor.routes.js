/**
 * visitor.routes.js — Express router for the Visitor module.
 *
 * Route prefix: /api/v1/visitors
 *
 * Permissions (from constants.js):
 *   visitor:create → RESIDENT
 *   visitor:read   → RESIDENT (own), SECURITY_GUARD, SOCIETY_ADMIN
 */

import { Router } from 'express';
import * as visitorController from './visitor.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { ROLES } from '../../config/constants.js';
import validate from '../../middleware/validate.middleware.js';
import { createVisitorSchema } from './visitor.validator.js';

const router = Router();

router.use(authenticate);

/**
 * POST /api/v1/visitors
 * Create a visitor pass (resident only).
 */
router.post('/', authorize(ROLES.RESIDENT), validate(createVisitorSchema), visitorController.createVisitorPass);

/**
 * GET /api/v1/visitors/my
 * List own visitor history (resident only).
 */
router.get('/my', authorize(ROLES.RESIDENT), visitorController.listMyVisitors);

/**
 * GET /api/v1/visitors/:id
 * Get a single visitor record.
 */
router.get('/:id', authorize(ROLES.RESIDENT, ROLES.SECURITY_GUARD, ROLES.SOCIETY_ADMIN), visitorController.getVisitorById);

/**
 * PATCH /api/v1/visitors/:id/cancel
 * Cancel a visitor pass (resident only).
 */
router.patch('/:id/cancel', authorize(ROLES.RESIDENT), visitorController.cancelVisitorPass);

export default router;
