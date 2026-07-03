import { Router } from 'express';
import * as residentController from './resident.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { ROLES } from '../../config/constants.js';
import validate from '../../middleware/validate.middleware.js';
import { completeProfileSchema } from './resident.validator.js';
import { uploadSingle } from '../../middleware/upload.middleware.js';
import { auditLog } from '../../middleware/audit.middleware.js';

const router = Router();

// Ensure user is authenticated and is a resident
router.use(authenticate, authorize(ROLES.RESIDENT));

/**
 * POST /api/v1/residents/profile
 * Step 3: Complete the resident profile with flat and ownership details.
 */
router.post(
    '/profile',
    uploadSingle('profilePhoto', 'avatars', 'image'),
    validate(completeProfileSchema),
    auditLog('COMPLETE_PROFILE', 'RESIDENT'),
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
router.put('/profile/me', auditLog('UPDATE_PROFILE', 'RESIDENT'), residentController.updateMyProfile);

/**
 * PATCH /api/v1/residents/profile/me/avatar
 * Update resident profile avatar/photo.
 */
router.patch('/profile/me/avatar', ...uploadSingle('avatar', 'avatars', 'image'), residentController.updateMyAvatar);

// ── Family Members ────────────────────────────────────────────────────────────

router.post('/family-members', auditLog('ADD_FAMILY', 'RESIDENT'), residentController.addFamilyMember);
router.put('/family-members/:memberId', auditLog('UPDATE_FAMILY', 'RESIDENT'), residentController.updateFamilyMember);
router.delete('/family-members/:memberId', auditLog('REMOVE_FAMILY', 'RESIDENT'), residentController.removeFamilyMember);

// ── Emergency Contacts ────────────────────────────────────────────────────────
import { addEmergencyContactSchema, updateEmergencyContactSchema } from './resident.validator.js';

router.post(
    '/emergency-contacts',
    validate(addEmergencyContactSchema),
    auditLog('ADD_EMERGENCY_CONTACT', 'RESIDENT'),
    residentController.addEmergencyContact
);

router.put(
    '/emergency-contacts/:contactId',
    validate(updateEmergencyContactSchema),
    auditLog('UPDATE_EMERGENCY_CONTACT', 'RESIDENT'),
    residentController.updateEmergencyContact
);

router.delete(
    '/emergency-contacts/:contactId',
    auditLog('REMOVE_EMERGENCY_CONTACT', 'RESIDENT'),
    residentController.removeEmergencyContact
);

// ── Domestic Staff ────────────────────────────────────────────────────────────

import * as dsController from './domesticStaff.controller.js';
import { addDomesticStaffSchema, updateDomesticStaffSchema } from './resident.validator.js';

router.post(
    '/domestic-staff', 
    uploadSingle('photo', 'domestic-staff', 'image'),
    (req, res, next) => {
        // Parse allowedDays if it's sent as a stringified array in form-data
        if (typeof req.body.allowedDays === 'string') {
            try { req.body.allowedDays = JSON.parse(req.body.allowedDays); } catch(e) {}
        }
        next();
    },
    validate(addDomesticStaffSchema), 
    auditLog('ADD_DOMESTIC_STAFF', 'RESIDENT'),
    dsController.addDomesticStaff
);

router.get('/domestic-staff', dsController.getMyDomesticStaff);

router.put(
    '/domestic-staff/:id', 
    uploadSingle('photo', 'domestic-staff', 'image'),
    (req, res, next) => {
        if (typeof req.body.allowedDays === 'string') {
            try { req.body.allowedDays = JSON.parse(req.body.allowedDays); } catch(e) {}
        }
        // Also handle isActive if sent as string
        if (req.body.isActive === 'true') req.body.isActive = true;
        if (req.body.isActive === 'false') req.body.isActive = false;
        next();
    },
    validate(updateDomesticStaffSchema), 
    auditLog('UPDATE_DOMESTIC_STAFF', 'RESIDENT'),
    dsController.updateDomesticStaff
);

router.delete('/domestic-staff/:id', auditLog('REMOVE_DOMESTIC_STAFF', 'RESIDENT'), dsController.removeDomesticStaff);

export default router;
