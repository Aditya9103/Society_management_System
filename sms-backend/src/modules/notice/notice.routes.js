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
import { auditLog } from '../../middleware/audit.middleware.js';
import { createNoticeSchema, updateNoticeScheduleSchema } from './notice.validator.js';

const router = Router();

router.use(authenticate);

const CAN_PUBLISH = [ROLES.SOCIETY_ADMIN, ROLES.COMMITTEE_MEMBER];
const CAN_READ = [ROLES.SOCIETY_ADMIN, ROLES.COMMITTEE_MEMBER, ROLES.HELP_DESK, ROLES.RESIDENT];

/**
 * POST /api/v1/notices
 * Create a new notice.
 */
router.post('/', authorize(...CAN_PUBLISH), validate(createNoticeSchema), auditLog('CREATE', 'NOTICE'), noticeController.createNotice);

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
router.patch('/:id/publish', authorize(...CAN_PUBLISH), auditLog('PUBLISH', 'NOTICE'), noticeController.publishNotice);

/**
 * PATCH /api/v1/notices/:id/schedule
 * Update schedule for a DRAFT or SCHEDULED notice.
 */
router.patch('/:id/schedule', authorize(...CAN_PUBLISH), validate(updateNoticeScheduleSchema), auditLog('UPDATE_SCHEDULE', 'NOTICE'), noticeController.updateNoticeSchedule);

/**
 * PATCH /api/v1/notices/:id/archive
 * Archive a notice.
 */
router.patch('/:id/archive', authorize(...CAN_PUBLISH), auditLog('ARCHIVE', 'NOTICE'), noticeController.archiveNotice);

/**
 * DELETE /api/v1/notices/:id
 * Delete a notice.
 */
router.delete('/:id', authorize(...CAN_PUBLISH), auditLog('DELETE', 'NOTICE'), noticeController.deleteNotice);

/**
 * POST /api/v1/notices/:id/acknowledge
 * Acknowledge a notice (RESIDENT only).
 */
router.post('/:id/acknowledge', authorize(ROLES.RESIDENT), auditLog('ACKNOWLEDGE', 'NOTICE'), noticeController.acknowledgeNotice);

/**
 * GET /api/v1/notices/:id/acknowledgements
 * Get acknowledgement stats for a notice (Admin/Committee).
 */
router.get('/:id/acknowledgements', authorize(...CAN_PUBLISH), noticeController.getNoticeAcknowledgements);

export default router;
