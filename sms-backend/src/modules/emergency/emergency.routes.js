import { Router } from 'express';
import * as emergencyController from './emergency.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import * as validator from './emergency.validator.js';
import { ROLES } from '../../config/constants.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/v1/emergencies/sos
 * Resident triggers SOS
 */
router.post('/sos', authorize(ROLES.RESIDENT), validate(validator.triggerSOSSchema), emergencyController.triggerSOS);

/**
 * GET /api/v1/emergencies/my-active
 * Resident gets their own active emergency
 */
router.get('/my-active', authorize(ROLES.RESIDENT), emergencyController.getMyActiveEmergency);

/**
 * GET /api/v1/emergencies
 * Get all emergencies (Admin / Staff)
 */
router.get('/', authorize(ROLES.SOCIETY_ADMIN, ROLES.SECURITY_GUARD, ROLES.FACILITY_MANAGER, ROLES.COMMITTEE_MEMBER), emergencyController.getAllEmergencies);

/**
 * GET /api/v1/emergencies/active
 * Get active emergencies (Admin / Staff)
 */
router.get('/active', authorize(ROLES.SOCIETY_ADMIN, ROLES.SECURITY_GUARD, ROLES.FACILITY_MANAGER, ROLES.COMMITTEE_MEMBER), emergencyController.getActiveEmergencies);

/**
 * GET /api/v1/emergencies/:id
 * Get emergency details
 */
router.get('/:id', authorize(ROLES.SOCIETY_ADMIN, ROLES.SECURITY_GUARD, ROLES.FACILITY_MANAGER, ROLES.COMMITTEE_MEMBER), emergencyController.getEmergencyById);

/**
 * PATCH /api/v1/emergencies/:id/status
 * Update emergency status (Admin / Staff responding)
 */
router.patch('/:id/status', authorize(ROLES.SOCIETY_ADMIN, ROLES.SECURITY_GUARD, ROLES.FACILITY_MANAGER, ROLES.COMMITTEE_MEMBER), validate(validator.updateEmergencyStatusSchema), emergencyController.updateEmergencyStatus);

/**
 * PATCH /api/v1/emergencies/:id/assign
 * Assign staff to an emergency
 */
router.patch('/:id/assign', authorize(ROLES.SOCIETY_ADMIN), emergencyController.assignEmergencyStaff);

/**
 * POST /api/v1/emergencies/broadcast
 * Send security broadcast to all residents
 */
router.post('/broadcast', authorize(ROLES.SOCIETY_ADMIN, ROLES.SECURITY_GUARD, ROLES.FACILITY_MANAGER), validate(validator.broadcastUpdateSchema), emergencyController.broadcastUpdate);

export default router;
