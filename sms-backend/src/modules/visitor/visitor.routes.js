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
import { auditLog } from '../../middleware/audit.middleware.js';
import { createVisitorSchema, guardWalkInSchema, scanQrSchema } from './visitor.validator.js';

const router = Router();

router.use(authenticate);

// ── Guard Routes (Flow B & C) ────────────────────────────────────────────────

// Active Visitors
router.get('/guard/active', authorize(ROLES.SECURITY_GUARD), visitorController.getActiveVisitors);

// Walk-in
router.post('/guard/walk-in', authorize(ROLES.SECURITY_GUARD), validate(guardWalkInSchema), auditLog('CREATE', 'VISITOR'), visitorController.processWalkIn);

// Scan QR
router.post('/guard/scan-qr', authorize(ROLES.SECURITY_GUARD), validate(scanQrSchema), visitorController.scanQrCode);

// Log Entry
router.put('/guard/:id/entry', authorize(ROLES.SECURITY_GUARD), auditLog('CHECK_IN', 'VISITOR'), visitorController.logEntry);

// Log Exit
router.put('/guard/:id/exit', authorize(ROLES.SECURITY_GUARD), auditLog('CHECK_OUT', 'VISITOR'), visitorController.logExit);


// ── Resident Routes ──────────────────────────────────────────────────────────

// Create Pass
router.post('/', authorize(ROLES.RESIDENT), validate(createVisitorSchema), auditLog('CREATE', 'VISITOR'), visitorController.createVisitorPass);

// List own
router.get('/my', authorize(ROLES.RESIDENT), visitorController.listMyVisitors);

// Approve / Deny real-time walk-ins (Flow B)
router.put('/:id/approve', authorize(ROLES.RESIDENT), auditLog('APPROVE', 'VISITOR'), visitorController.approveWalkIn);
router.put('/:id/deny', authorize(ROLES.RESIDENT), auditLog('REJECT', 'VISITOR'), visitorController.denyWalkIn);

// Get single
router.get('/:id', authorize(ROLES.RESIDENT, ROLES.SECURITY_GUARD, ROLES.SOCIETY_ADMIN), visitorController.getVisitorById);

// Cancel pass
router.patch('/:id/cancel', authorize(ROLES.RESIDENT), auditLog('CANCEL', 'VISITOR'), visitorController.cancelVisitorPass);

export default router;
