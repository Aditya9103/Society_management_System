import { Router } from 'express';
import * as pollController from './poll.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { createPollSchema, submitVoteSchema } from './poll.validator.js';
import { ROLES } from '../../config/constants.js';

const router = Router();

router.use(authenticate);

// --- ADMIN ROUTES ---
router.post(
    '/',
    authorize(ROLES.SUPER_ADMIN, ROLES.SOCIETY_ADMIN, ROLES.COMMITTEE_MEMBER),
    validate(createPollSchema),
    pollController.createPoll
);

router.get(
    '/admin/all',
    authorize(ROLES.SUPER_ADMIN, ROLES.SOCIETY_ADMIN, ROLES.COMMITTEE_MEMBER),
    pollController.getAdminPolls
);

router.get(
    '/admin/:id',
    authorize(ROLES.SUPER_ADMIN, ROLES.SOCIETY_ADMIN, ROLES.COMMITTEE_MEMBER),
    pollController.getAdminPollById
);

router.post(
    '/admin/:id/publish',
    authorize(ROLES.SUPER_ADMIN, ROLES.SOCIETY_ADMIN, ROLES.COMMITTEE_MEMBER),
    pollController.publishPoll
);

router.post(
    '/admin/:id/close',
    authorize(ROLES.SUPER_ADMIN, ROLES.SOCIETY_ADMIN, ROLES.COMMITTEE_MEMBER),
    pollController.closePoll
);

router.delete(
    '/admin/:id',
    authorize(ROLES.SUPER_ADMIN, ROLES.SOCIETY_ADMIN, ROLES.COMMITTEE_MEMBER),
    pollController.deletePoll
);

// --- RESIDENT ROUTES ---
router.get(
    '/resident/active',
    authorize(ROLES.RESIDENT),
    pollController.getResidentActivePolls
);

router.get(
    '/resident/my',
    authorize(ROLES.RESIDENT),
    pollController.getResidentVotedPolls
);

router.get(
    '/resident/:id',
    authorize(ROLES.RESIDENT),
    pollController.getResidentPollById
);

router.post(
    '/resident/:id/vote',
    authorize(ROLES.RESIDENT),
    validate(submitVoteSchema),
    pollController.submitVote
);

export default router;
