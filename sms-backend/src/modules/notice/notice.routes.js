/**
 * notice.routes.js — Express router for the Notice module.
 *
 * Route prefix: /api/v1/notices
 *
 * Permissions (from constants.js):
 *   notice:publish → SOCIETY_ADMIN, COMMITTEE_MEMBER
 *   notice:read    → SOCIETY_ADMIN, COMMITTEE_MEMBER, HELP_DESK, RESIDENT
 */

import { Router } from 'express';
import * as noticeController from './notice.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { ROLES } from '../../config/constants.js';
import validate from '../../middleware/validate.middleware.js';
import { createNoticeSchema } from './notice.validator.js';

const router = Router();

router.use(authenticate);

const CAN_PUBLISH = [ROLES.SOCIETY_ADMIN, ROLES.COMMITTEE_MEMBER];
const CAN_READ = [ROLES.SOCIETY_ADMIN, ROLES.COMMITTEE_MEMBER, ROLES.HELP_DESK, ROLES.RESIDENT];

/**
 * POST /api/v1/notices
 * Create a new notice.
 */
router.post('/', authorize(...CAN_PUBLISH), validate(createNoticeSchema), noticeController.createNotice);

/**
 * GET /api/v1/notices
 * List notices — RESIDENT/HELP_DESK see PUBLISHED only; others see all.
 */
router.get('/', authorize(...CAN_READ), noticeController.listNotices);

/**
 * GET /api/v1/notices/:id
 * Get a single notice.
 */
router.get('/:id', authorize(...CAN_READ), noticeController.getNoticeById);

/**
 * PATCH /api/v1/notices/:id/publish
 * Publish a DRAFT notice.
 */
router.patch('/:id/publish', authorize(...CAN_PUBLISH), noticeController.publishNotice);

/**
 * PATCH /api/v1/notices/:id/archive
 * Archive a notice.
 */
router.patch('/:id/archive', authorize(...CAN_PUBLISH), noticeController.archiveNotice);

export default router;
