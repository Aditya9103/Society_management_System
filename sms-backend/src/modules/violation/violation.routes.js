import express from 'express';
import * as violationController from './violation.controller.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../config/constants.js';

const router = express.Router();
router.use(authenticate);

const CAN_MANAGE = [ROLES.SOCIETY_ADMIN, ROLES.COMMITTEE_MEMBER, ROLES.SECURITY_GUARD];

/**
 * GET /api/v1/violations/stats
 * Get violation stats. Admin only.
 */
router.get('/stats', authorize(...CAN_MANAGE), violationController.getViolationStats);

/**
 * GET /api/v1/violations/me
 * Get my violations. Resident only.
 */
router.get('/me', authorize(ROLES.RESIDENT), violationController.getMyViolations);

/**
 * GET /api/v1/violations
 * Get all violations. Admin only.
 */
router.get('/', authorize(...CAN_MANAGE), violationController.getViolations);

/**
 * POST /api/v1/violations
 * Create a new violation. Admin/Guard only.
 */
router.post('/', authorize(...CAN_MANAGE), violationController.createViolation);

/**
 * PATCH /api/v1/violations/:id/status
 * Update violation status. Admin/Guard only.
 */
router.patch('/:id/status', authorize(...CAN_MANAGE), violationController.updateViolationStatus);

export default router;
