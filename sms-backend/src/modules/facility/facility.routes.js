/**
 * facility.routes.js — Express router for Amenity & Booking module.
 *
 * Route prefix (mounted in routes/index.js): /api/v1/facilities
 *
 * Role access:
 *   Amenity Management  → SOCIETY_ADMIN, FACILITY_MANAGER
 *   Amenity Viewing     → All authenticated users in the society
 *   Booking             → RESIDENT
 *   Approval/Rejection  → SOCIETY_ADMIN, FACILITY_MANAGER, COMMITTEE_MEMBER
 *   Cancel              → RESIDENT (own) | SOCIETY_ADMIN, FACILITY_MANAGER (any)
 */

import { Router } from 'express';
import * as facilityController from './facility.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { ROLES } from '../../config/constants.js';
import validate from '../../middleware/validate.middleware.js';
import {
    createAmenitySchema,
    updateAmenitySchema,
    createBookingSchema,
    cancelBookingSchema,
    rejectBookingSchema,
    approveBookingSchema,
    feedbackSchema,
} from './facility.validator.js';

const router = Router();

router.use(authenticate);

const CAN_MANAGE = [ROLES.SOCIETY_ADMIN, ROLES.FACILITY_MANAGER];
const CAN_APPROVE = [ROLES.SOCIETY_ADMIN, ROLES.FACILITY_MANAGER, ROLES.COMMITTEE_MEMBER];
const CAN_CANCEL_ADMIN = [ROLES.SOCIETY_ADMIN, ROLES.FACILITY_MANAGER];
const ALL_STAFF = [
    ROLES.SOCIETY_ADMIN, ROLES.FACILITY_MANAGER, ROLES.COMMITTEE_MEMBER,
    ROLES.ACCOUNTANT, ROLES.HELP_DESK, ROLES.SECURITY_GUARD,
];

// ── Amenity ───────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/facilities/amenities
 * List amenities in the society.
 * Residents see active only; admins see all.
 */
router.get('/amenities', authorize(ROLES.RESIDENT, ...ALL_STAFF), facilityController.listAmenities);

/**
 * POST /api/v1/facilities/amenities
 * Create a new amenity (Admin / Facility Manager).
 */
router.post(
    '/amenities',
    authorize(...CAN_MANAGE),
    validate(createAmenitySchema),
    facilityController.createAmenity,
);

/**
 * GET /api/v1/facilities/amenities/:id
 * Get a single amenity (anyone in society).
 */
router.get('/amenities/:id', authorize(ROLES.RESIDENT, ...ALL_STAFF), facilityController.getAmenity);

/**
 * PATCH /api/v1/facilities/amenities/:id
 * Update an amenity (Admin / Facility Manager).
 */
router.patch(
    '/amenities/:id',
    authorize(...CAN_MANAGE),
    validate(updateAmenitySchema),
    facilityController.updateAmenity,
);

/**
 * DELETE /api/v1/facilities/amenities/:id
 * Delete an amenity (Admin only).
 */
router.delete('/amenities/:id', authorize(...CAN_MANAGE), facilityController.deleteAmenity);

// ── Availability ──────────────────────────────────────────────────────────────

/**
 * GET /api/v1/facilities/amenities/:id/availability?date=YYYY-MM-DD
 * Get available slots for an amenity on a given date.
 */
router.get(
    '/amenities/:id/availability',
    authorize(ROLES.RESIDENT, ...ALL_STAFF),
    facilityController.getAvailability,
);

// ── Bookings ──────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/facilities/bookings
 * Resident: own bookings. Admin/FM/Committee: all society bookings.
 * Supports: ?status=&amenityId=&date=YYYY-MM-DD&page=&limit=
 */
router.get('/bookings', authorize(ROLES.RESIDENT, ...CAN_APPROVE), facilityController.listBookings);

/**
 * POST /api/v1/facilities/bookings
 * Create a booking (Resident only).
 */
router.post(
    '/bookings',
    authorize(ROLES.RESIDENT),
    validate(createBookingSchema),
    facilityController.createBooking,
);

/**
 * GET /api/v1/facilities/bookings/:id
 * Get a single booking.
 */
router.get('/bookings/:id', authorize(ROLES.RESIDENT, ...CAN_APPROVE), facilityController.getBooking);

/**
 * PATCH /api/v1/facilities/bookings/:id/approve
 * Approve a pending booking (Admin / FM / Committee).
 */
router.patch(
    '/bookings/:id/approve',
    authorize(...CAN_APPROVE),
    validate(approveBookingSchema),
    facilityController.approveBooking,
);

/**
 * PATCH /api/v1/facilities/bookings/:id/reject
 * Reject a pending booking (Admin / FM / Committee).
 */
router.patch(
    '/bookings/:id/reject',
    authorize(...CAN_APPROVE),
    validate(rejectBookingSchema),
    facilityController.rejectBooking,
);

/**
 * PATCH /api/v1/facilities/bookings/:id/cancel
 * Cancel a booking.
 * - Resident can cancel own booking (subject to cancellation deadline).
 * - Admin can cancel any booking.
 */
router.patch(
    '/bookings/:id/cancel',
    authorize(ROLES.RESIDENT, ...CAN_CANCEL_ADMIN),
    validate(cancelBookingSchema),
    facilityController.cancelBooking,
);

/**
 * PATCH /api/v1/facilities/bookings/:id/complete
 * Mark a booking as completed (Admin / FM).
 */
router.patch('/bookings/:id/complete', authorize(...CAN_MANAGE), facilityController.markCompleted);

/**
 * PATCH /api/v1/facilities/bookings/:id/no-show
 * Mark a booking as no-show (Admin / FM).
 */
router.patch('/bookings/:id/no-show', authorize(...CAN_MANAGE), facilityController.markNoShow);

/**
 * PATCH /api/v1/facilities/bookings/:id/feedback
 * Submit feedback/rating (Resident, completed bookings only).
 */
router.patch(
    '/bookings/:id/feedback',
    authorize(ROLES.RESIDENT),
    validate(feedbackSchema),
    facilityController.submitFeedback,
);

export default router;
