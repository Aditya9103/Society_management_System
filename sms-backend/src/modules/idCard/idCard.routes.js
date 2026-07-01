import { Router } from 'express';
import * as idCardController from './idCard.controller.js';
import { verifyIdCardSchema } from './idCard.validator.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { uploadSingle } from '../../middleware/upload.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { ROLES } from '../../config/constants.js';

const router = Router();

// Resident routes
router.post(
    '/email',
    authenticate,
    authorize(ROLES.RESIDENT),
    idCardController.emailIdCard
);

// Guard routes
router.post(
    '/verify',
    authenticate,
    authorize(ROLES.SECURITY_GUARD, ROLES.SOCIETY_ADMIN, ROLES.SUPER_ADMIN), // Admins might want to scan too
    validate(verifyIdCardSchema),
    idCardController.verifyIdCard
);

// Admin routes for manual generation and updation
router.post(
    '/:residentId/generate',
    authenticate,
    authorize(ROLES.SOCIETY_ADMIN, ROLES.SUPER_ADMIN),
    idCardController.generateIdCard
);

// Upload generated PDF from frontend
router.post(
    '/:residentId/upload-pdf',
    authenticate,
    uploadSingle('pdf', 'documents'),
    idCardController.uploadIdCardPdf
);

router.patch(
    '/:id/status',
    authenticate,
    authorize(ROLES.SOCIETY_ADMIN, ROLES.SUPER_ADMIN),
    idCardController.updateIdCardStatus
);

export default router;
