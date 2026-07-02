import { Router } from 'express';
import * as docController from './document.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { injectSociety } from '../../middleware/society.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { uploadSingle } from '../../middleware/upload.middleware.js';
import { ROLES } from '../../config/constants.js';
import { uploadDocumentSchema, updateDocumentSchema, approveDocumentSchema } from './document.validator.js';

const router = Router();

router.use(authenticate);
router.use(injectSociety);

// Upload document
router.post(
    '/',
    uploadSingle('file', 'documents'),
    validate({ body: uploadDocumentSchema }),
    docController.uploadDocument
);

// Get documents
router.get('/', docController.getDocuments);

// Get specific document
router.get('/:id', docController.getDocumentById);

// Update document / add new version
router.patch(
    '/:id',
    uploadSingle('file', 'documents'),
    validate({ body: updateDocumentSchema }),
    docController.updateDocument
);

// Download document
router.get('/:id/download', docController.downloadDocument);

// Soft delete
router.delete('/:id', docController.softDeleteDocument);

// Restore deleted document (Admin only)
router.post(
    '/:id/restore',
    authorize(ROLES.SOCIETY_ADMIN, ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT),
    docController.restoreDocument
);

// Approve/Reject document (Admin/Committee)
router.post(
    '/:id/approve',
    authorize(ROLES.SOCIETY_ADMIN, ROLES.COMMITTEE_MEMBER, ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT),
    validate({ body: approveDocumentSchema }),
    docController.approveDocument
);

// Get versions
router.get('/:id/versions', docController.getDocumentVersions);

// Get audit logs (Admin only)
router.get(
    '/:id/logs',
    authorize(ROLES.SOCIETY_ADMIN, ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT),
    docController.getDocumentAuditLogs
);

export default router;
