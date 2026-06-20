/**
 * payment.routes.js — Express router for Invoice & Payment module.
 *
 * Route prefix: /api/v1/invoices
 *
 * Permissions (from constants.js):
 *   invoice:read:own → RESIDENT
 *   invoice:read:all → SOCIETY_ADMIN, ACCOUNTANT, COMMITTEE_MEMBER
 *   invoice:generate → SOCIETY_ADMIN, ACCOUNTANT
 */

import { Router } from 'express';
import * as paymentController from './payment.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { ROLES } from '../../config/constants.js';

const router = Router();

router.use(authenticate);

const CAN_READ_ALL = [ROLES.SOCIETY_ADMIN, ROLES.ACCOUNTANT, ROLES.COMMITTEE_MEMBER];

/**
 * GET /api/v1/invoices/my
 * List the authenticated resident's own invoices.
 */
router.get('/my', authorize(ROLES.RESIDENT), paymentController.getMyInvoices);

/**
 * GET /api/v1/invoices
 * List all society invoices (admin/accountant/committee).
 */
router.get('/', authorize(...CAN_READ_ALL), paymentController.getAllInvoices);

/**
 * GET /api/v1/invoices/:id
 * Get single invoice — ownership check in service layer.
 */
router.get('/:id', authorize(ROLES.RESIDENT, ...CAN_READ_ALL), paymentController.getInvoiceById);

/**
 * POST /api/v1/invoices/:id/pay/initiate
 * Initiate Razorpay payment (stub).
 */
router.post('/:id/pay/initiate', authorize(ROLES.RESIDENT), paymentController.initiatePayment);

/**
 * POST /api/v1/invoices/:id/pay/verify
 * Verify Razorpay payment (stub).
 */
router.post('/:id/pay/verify', authorize(ROLES.RESIDENT), paymentController.verifyPayment);

export default router;
