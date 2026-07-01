/**
 * facility.service.js — Business logic for Amenity & Booking module.
 *
 * Handles:
 *   - Amenity CRUD (Admin)
 *   - Availability checking
 *   - Booking creation with slot conflict detection
 *   - Auto-approval vs. manual approval flow
 *   - Cancellation (resident & admin)
 *   - Approval / rejection (admin)
 *   - Feedback
 */

import * as facilityRepo from './facility.repository.js';
import * as residentRepo from '../resident/resident.repository.js';
import ApiError from '../../utils/ApiError.js';
import { ROLES } from '../../config/constants.js';
import { sendNotification } from '../../services/notification.service.js';
import * as userRepo from '../auth/user.repository.js';
import logger from '../../utils/logger.js';
import { getIO } from '../../socket/socket.server.js';
import { ROOMS } from '../../socket/rooms.js';

const ADMIN_ROLES = [ROLES.SOCIETY_ADMIN, ROLES.FACILITY_MANAGER, ROLES.COMMITTEE_MEMBER];

const emitAmenityUpdate = (societyId) => {
    try {
        getIO().to(ROOMS.SOCIETY(societyId.toString())).emit('AMENITY_UPDATED');
    } catch (e) {
        logger.warn(`[FACILITY] Failed to emit AMENITY_UPDATED: ${e.message}`);
    }
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Generate a unique booking number: BKG-YYYYMMDD-XXXX
 */
const generateBookingNumber = () => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BKG-${dateStr}-${rand}`;
};

/**
 * Parse a "HH:MM" time string to total minutes since midnight.
 */
const timeToMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
};

/**
 * Calculate booking duration in hours between two "HH:MM" strings.
 */
const calcDurationHours = (startTime, endTime) => {
    return (timeToMinutes(endTime) - timeToMinutes(startTime)) / 60;
};

// ── Amenity Management (Admin / Facility Manager) ─────────────────────────────

/**
 * List amenities for a society.
 * Public-ish: residents can see active ones; admin sees all.
 */
export const listAmenities = async (societyId, query = {}, role) => {
    const { page = 1, limit = 20, facilityType, isActive } = query;

    // Residents only see active amenities
    const activeFilter = ADMIN_ROLES.includes(role) ? isActive : true;

    const { data, total } = await facilityRepo.findAmenitiesBySociety(societyId, {
        page,
        limit,
        facilityType,
        isActive: activeFilter,
    });

    return {
        data,
        pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
    };
};

/**
 * Get a single amenity by ID (with society scope check).
 */
export const getAmenityById = async (amenityId, societyId) => {
    const amenity = await facilityRepo.findAmenityById(amenityId);
    if (!amenity) throw ApiError.notFound('Amenity');
    if (amenity.societyId.toString() !== societyId.toString()) throw ApiError.forbidden('Access denied.');
    return amenity;
};

/**
 * Create a new amenity (Admin / Facility Manager only).
 */
export const createAmenity = async (societyId, data) => {
    const amenity = await facilityRepo.createAmenity({ ...data, societyId });
    return amenity;
};

/**
 * Update an amenity (Admin / Facility Manager only).
 */
export const updateAmenity = async (amenityId, societyId, data) => {
    const amenity = await facilityRepo.findAmenityById(amenityId);
    if (!amenity) throw ApiError.notFound('Amenity');
    if (amenity.societyId.toString() !== societyId.toString()) throw ApiError.forbidden('Access denied.');

    const updated = await facilityRepo.updateAmenity(amenityId, data);
    return updated;
};

/**
 * Soft-delete (deactivate) or permanently delete an amenity.
 */
export const deleteAmenity = async (amenityId, societyId) => {
    const amenity = await facilityRepo.findAmenityById(amenityId);
    if (!amenity) throw ApiError.notFound('Amenity');
    if (amenity.societyId.toString() !== societyId.toString()) throw ApiError.forbidden('Access denied.');
    await facilityRepo.deleteAmenity(amenityId);
};

// ── Availability ──────────────────────────────────────────────────────────────

/**
 * Get available slots for an amenity on a specific date.
 * Returns the amenity's configured slots minus already-booked ones.
 */
export const getAvailableSlots = async (amenityId, societyId, date) => {
    const amenity = await facilityRepo.findAmenityById(amenityId);
    if (!amenity) throw ApiError.notFound('Amenity');
    if (amenity.societyId.toString() !== societyId.toString()) throw ApiError.forbidden('Access denied.');
    if (!amenity.isActive) throw ApiError.badRequest('This amenity is not currently available.');

    const requestedDate = new Date(date);

    // Check if date is blocked / maintenance
    const isBlocked = amenity.blockedDates?.some(
        (d) => new Date(d).toDateString() === requestedDate.toDateString()
    );
    const isMaintenance = amenity.maintenanceDates?.some(
        (d) => new Date(d).toDateString() === requestedDate.toDateString()
    );
    if (isBlocked) return { available: false, reason: 'This date is blocked.', slots: [] };
    if (isMaintenance) return { available: false, reason: 'Maintenance scheduled on this date.', slots: [] };

    // Check advance booking window
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + (amenity.advanceBookingDays ?? 30));
    if (requestedDate > maxDate)
        return { available: false, reason: `Advance booking allowed up to ${amenity.advanceBookingDays} days only.`, slots: [] };
    if (requestedDate < today)
        return { available: false, reason: 'Cannot book past dates.', slots: [] };

    // Get slots configured for this day of week (0=Sunday)
    const dayOfWeek = requestedDate.getDay().toString();
    const configuredSlots = amenity.availableSlots?.[dayOfWeek] ?? [];

    // Fetch existing bookings that day
    const existingBookings = await facilityRepo.findBookingsForSlot(amenityId, date, '00:00', '24:00');

    // Compute available slots
    const slots = configuredSlots.map((slot) => {
        const bookedCount = existingBookings.filter(
            (b) => b.startTime === slot.startTime && b.endTime === slot.endTime
        ).length;
        return {
            startTime: slot.startTime,
            endTime: slot.endTime,
            maxBookings: slot.maxBookings ?? 1,
            bookedCount,
            available: bookedCount < (slot.maxBookings ?? 1),
        };
    });

    return { available: true, slots };
};

// ── Booking Workflow ──────────────────────────────────────────────────────────

/**
 * Create a new booking (Resident only).
 *
 * Validation:
 *  - Amenity is active & belongs to society
 *  - Date is within advance booking window & not blocked
 *  - Start < End time
 *  - Slot not full (conflict check)
 *  - Resident has no duplicate booking for same slot
 */
export const createBooking = async (userId, societyId, payload) => {
    const { amenityId, bookingDate, startTime, endTime, purpose, expectedGuests } = payload;

    // Resolve resident
    const resident = await residentRepo.findByUserId(userId);
    if (!resident) throw ApiError.notFound('Resident profile not found.');
    if (resident.societyId.toString() !== societyId.toString())
        throw ApiError.forbidden('You do not belong to this society.');

    // Resolve amenity
    const amenity = await facilityRepo.findAmenityById(amenityId);
    if (!amenity) throw ApiError.notFound('Amenity');
    if (!amenity.isActive) throw ApiError.badRequest('This amenity is currently unavailable.');
    if (amenity.societyId.toString() !== societyId.toString()) throw ApiError.forbidden('Access denied.');

    // Validate capacity
    if (expectedGuests !== undefined && expectedGuests !== null) {
        if (expectedGuests < 0) throw ApiError.badRequest('Expected guests cannot be negative.');
        if (amenity.capacity && expectedGuests > amenity.capacity) {
            throw ApiError.badRequest(`Expected guests (${expectedGuests}) exceeds the maximum capacity of ${amenity.capacity}.`);
        }
    }

    // Validate date & time
    const requestedDate = new Date(bookingDate);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (requestedDate < today) throw ApiError.badRequest('Cannot book past dates.');

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + (amenity.advanceBookingDays ?? 30));
    if (requestedDate > maxDate)
        throw ApiError.badRequest(`Advance booking allowed up to ${amenity.advanceBookingDays} days.`);

    if (timeToMinutes(startTime) >= timeToMinutes(endTime))
        throw ApiError.badRequest('Start time must be before end time.');

    const durationHours = calcDurationHours(startTime, endTime);
    if (amenity.minDurationHours && durationHours < amenity.minDurationHours)
        throw ApiError.badRequest(`Minimum booking duration is ${amenity.minDurationHours} hour(s).`);
    if (amenity.maxDurationHours && durationHours > amenity.maxDurationHours)
        throw ApiError.badRequest(`Maximum booking duration is ${amenity.maxDurationHours} hour(s).`);

    // Check blocked / maintenance dates
    const isBlocked = amenity.blockedDates?.some(
        (d) => new Date(d).toDateString() === requestedDate.toDateString()
    );
    if (isBlocked) throw ApiError.badRequest('This date is blocked for bookings.');
    const isMaintenance = amenity.maintenanceDates?.some(
        (d) => new Date(d).toDateString() === requestedDate.toDateString()
    );
    if (isMaintenance) throw ApiError.badRequest('Amenity is under maintenance on this date.');

    // Slot conflict check
    const conflicts = await facilityRepo.findBookingsForSlot(amenityId, bookingDate, startTime, endTime);
    if (conflicts.length >= (amenity.availableSlots ? 1 : 999)) {
        // More sophisticated: check maxBookings per slot
    }

    // Check if slot is configured
    const dayOfWeek = requestedDate.getDay().toString();
    const daySlots = amenity.availableSlots?.[dayOfWeek] ?? [];
    if (daySlots.length > 0) {
        const matchingSlot = daySlots.find(
            (s) => s.startTime === startTime && s.endTime === endTime
        );
        if (!matchingSlot) throw ApiError.badRequest('Selected time slot is not available for this amenity.');
        // Check maxBookings for this specific slot
        const bookedCount = conflicts.filter(
            (b) => b.startTime === startTime && b.endTime === endTime
        ).length;
        if (bookedCount >= (matchingSlot.maxBookings ?? 1))
            throw ApiError.badRequest('This slot is fully booked. Please choose another slot.');
    } else if (conflicts.length > 0) {
        throw ApiError.badRequest('Time slot conflicts with an existing booking. Please choose a different time.');
    }

    // Prevent duplicate booking (same resident, amenity, date, time)
    const duplicate = conflicts.find(
        (b) => b.residentId?.toString() === resident._id.toString()
    );
    if (duplicate) throw ApiError.badRequest('You already have a booking for this slot.');

    // Calculate fee fields (for future payment integration — not enforced now)
    const bookingFee = amenity.isPaid ? (durationHours * (amenity.hourlyRate ?? 0)) : 0;
    const securityDeposit = amenity.refundableDeposit ?? 0;

    // Determine status
    const status = amenity.autoApproval ? 'CONFIRMED' : 'PENDING_APPROVAL';

    const bookingNumber = generateBookingNumber();

    const booking = await facilityRepo.createBooking({
        societyId,
        bookingNumber,
        amenityId,
        residentId: resident._id,
        unitId: resident.unitId,
        bookingDate: requestedDate,
        startTime,
        endTime,
        durationHours,
        purpose: purpose ?? null,
        expectedGuests: expectedGuests ?? 0,
        status,
        // Payment fields (not enforced now, but stored for future)
        totalAmount: bookingFee,
        depositAmount: securityDeposit,
        paymentRequired: amenity.isPaid,
        paymentStatus: amenity.isPaid ? 'PENDING' : 'NOT_REQUIRED',
    });

    // Send notification to resident
    try {
        const userDoc = await userRepo.findById(userId);
        if (userDoc) {
            await sendNotification({
                users: [userDoc],
                societyId,
                type: 'BOOKING_CREATED',
                title: `Booking ${status === 'CONFIRMED' ? 'Confirmed' : 'Submitted'}`,
                message: status === 'CONFIRMED'
                    ? `Your booking for ${amenity.name} on ${requestedDate.toDateString()} from ${startTime} to ${endTime} is confirmed.`
                    : `Your booking request for ${amenity.name} is pending approval.`,
                priority: 'NORMAL',
                referenceType: 'BOOKING',
                referenceId: booking._id.toString(),
            });
        }
        const admins = await userRepo.findByRoleInSociety(societyId, ADMIN_ROLES);
        if (admins.length > 0) {
            await sendNotification({
                users: admins,
                societyId,
                type: 'BOOKING_CREATED_ADMIN',
                title: `New Amenity Booking`,
                message: `${resident.residentCode} booked ${amenity.name} for ${requestedDate.toDateString()}. Status: ${status}.`,
                priority: 'NORMAL',
                referenceType: 'BOOKING',
                referenceId: booking._id.toString(),
            });
        }
    } catch (err) {
        logger.warn(`[FACILITY] Failed to send booking notification: ${err.message}`);
    }

    emitAmenityUpdate(societyId);

    return booking;
};

/**
 * Get a booking (resident sees own; admin sees all in society).
 */
export const getBookingById = async (bookingId, userId, role, societyId) => {
    const booking = await facilityRepo.findBookingById(bookingId);
    if (!booking) throw ApiError.notFound('Booking');
    if (booking.societyId.toString() !== societyId.toString()) throw ApiError.forbidden('Access denied.');

    if (ADMIN_ROLES.includes(role)) return booking;

    // Resident can only see own bookings
    const resident = await residentRepo.findByUserId(userId);
    if (!resident || booking.residentId?._id?.toString() !== resident._id.toString())
        throw ApiError.forbidden('You do not have access to this booking.');

    return booking;
};

/**
 * List bookings — resident sees own; admin/FM sees all society bookings.
 */
export const listBookings = async (userId, role, societyId, query = {}) => {
    const { page = 1, limit = 20, status, amenityId, date } = query;

    if (ADMIN_ROLES.includes(role)) {
        const { data, total } = await facilityRepo.findBookingsBySociety(societyId, { page, limit, status, amenityId, date });
        return { data, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } };
    }

    // Resident: own bookings only
    const resident = await residentRepo.findByUserId(userId);
    if (!resident) throw ApiError.notFound('Resident profile not found.');
    const { data, total } = await facilityRepo.findBookingsByResident(resident._id, { page, limit, status });
    return { data, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } };
};

// ── Approval / Rejection (Admin / Facility Manager) ───────────────────────────

/**
 * Approve a pending booking.
 */
export const approveBooking = async (bookingId, adminUserId, societyId, adminNotes) => {
    const booking = await facilityRepo.findBookingById(bookingId);
    if (!booking) throw ApiError.notFound('Booking');
    if (booking.societyId.toString() !== societyId.toString()) throw ApiError.forbidden('Access denied.');
    if (booking.status !== 'PENDING_APPROVAL')
        throw ApiError.badRequest('Only PENDING_APPROVAL bookings can be approved.');

    const updated = await facilityRepo.updateBooking(bookingId, {
        status: 'CONFIRMED',
        adminNotes: adminNotes ?? null,
    });

    // Notify resident
    try {
        const residentUser = await userRepo.findById(
            (await residentRepo.findById(booking.residentId?._id ?? booking.residentId))?.userId
        );
        if (residentUser) {
            await sendNotification({
                users: [residentUser],
                societyId,
                type: 'BOOKING_APPROVED',
                title: 'Booking Approved',
                message: `Your booking for ${booking.amenityId?.name} on ${new Date(booking.bookingDate).toDateString()} has been approved.`,
                priority: 'NORMAL',
                referenceType: 'BOOKING',
                referenceId: bookingId.toString(),
            });
        }
    } catch (err) {
        logger.warn(`[FACILITY] Failed to send approval notification: ${err.message}`);
    }

    emitAmenityUpdate(societyId);

    return updated;
};

/**
 * Reject a pending booking.
 */
export const rejectBooking = async (bookingId, adminUserId, societyId, reason) => {
    const booking = await facilityRepo.findBookingById(bookingId);
    if (!booking) throw ApiError.notFound('Booking');
    if (booking.societyId.toString() !== societyId.toString()) throw ApiError.forbidden('Access denied.');
    if (booking.status !== 'PENDING_APPROVAL')
        throw ApiError.badRequest('Only PENDING_APPROVAL bookings can be rejected.');

    const updated = await facilityRepo.updateBooking(bookingId, {
        status: 'CANCELLED',
        cancellationReason: reason,
        cancelledAt: new Date(),
    });

    // Notify resident
    try {
        const residentUser = await userRepo.findById(
            (await residentRepo.findById(booking.residentId?._id ?? booking.residentId))?.userId
        );
        if (residentUser) {
            await sendNotification({
                users: [residentUser],
                societyId,
                type: 'BOOKING_REJECTED',
                title: 'Booking Rejected',
                message: `Your booking request for ${booking.amenityId?.name} on ${new Date(booking.bookingDate).toDateString()} was rejected. Reason: ${reason}`,
                priority: 'NORMAL',
                referenceType: 'BOOKING',
                referenceId: bookingId.toString(),
            });
        }
    } catch (err) {
        logger.warn(`[FACILITY] Failed to send rejection notification: ${err.message}`);
    }

    emitAmenityUpdate(societyId);

    return updated;
};

// ── Cancellation ──────────────────────────────────────────────────────────────

/**
 * Cancel a booking.
 * - Resident can cancel own booking (subject to cancellation deadline).
 * - Admin can cancel any booking at any time.
 */
export const cancelBooking = async (bookingId, userId, role, societyId, reason) => {
    const booking = await facilityRepo.findBookingById(bookingId);
    if (!booking) throw ApiError.notFound('Booking');
    if (booking.societyId.toString() !== societyId.toString()) throw ApiError.forbidden('Access denied.');

    if (['CANCELLED', 'COMPLETED'].includes(booking.status))
        throw ApiError.badRequest(`Booking is already ${booking.status.toLowerCase()}.`);

    if (!ADMIN_ROLES.includes(role)) {
        // Resident can only cancel own booking
        const resident = await residentRepo.findByUserId(userId);
        if (!resident || booking.residentId?._id?.toString() !== resident._id.toString())
            throw ApiError.forbidden('You can only cancel your own bookings.');

        // Check cancellation deadline
        const amenity = booking.amenityId;
        if (amenity?.cancellationDeadlineHours) {
            const bookingStart = new Date(booking.bookingDate);
            const [h, m] = booking.startTime.split(':').map(Number);
            bookingStart.setHours(h, m, 0, 0);
            const deadlineMs = amenity.cancellationDeadlineHours * 60 * 60 * 1000;
            const timeUntilBooking = bookingStart.getTime() - Date.now();
            if (timeUntilBooking < deadlineMs)
                throw ApiError.badRequest(
                    `Cancellation must be done at least ${amenity.cancellationDeadlineHours} hours before the booking.`
                );
        }
    }

    const updated = await facilityRepo.updateBooking(bookingId, {
        status: 'CANCELLED',
        cancellationReason: reason ?? 'Cancelled by user',
        cancelledBy: userId,
        cancelledAt: new Date(),
    });

    // Notify relevant parties
    try {
        const residentDoc = await residentRepo.findById(booking.residentId?._id ?? booking.residentId);
        if (residentDoc) {
            const residentUser = await userRepo.findById(residentDoc.userId);
            if (residentUser) {
                await sendNotification({
                    users: [residentUser],
                    societyId,
                    type: 'BOOKING_CANCELLED',
                    title: 'Booking Cancelled',
                    message: `Your booking for ${booking.amenityId?.name} on ${new Date(booking.bookingDate).toDateString()} has been cancelled.`,
                    priority: 'NORMAL',
                    referenceType: 'BOOKING',
                    referenceId: bookingId.toString(),
                });
            }
        }
        if (!ADMIN_ROLES.includes(role)) {
            const admins = await userRepo.findByRoleInSociety(societyId, ADMIN_ROLES);
            if (admins.length > 0) {
                await sendNotification({
                    users: admins,
                    societyId,
                    type: 'BOOKING_CANCELLED_ADMIN',
                    title: `Booking Cancelled by Resident`,
                    message: `Booking for ${booking.amenityId?.name} on ${new Date(booking.bookingDate).toDateString()} was cancelled by resident.`,
                    priority: 'NORMAL',
                    referenceType: 'BOOKING',
                    referenceId: bookingId.toString(),
                });
            }
        }
    } catch (err) {
        logger.warn(`[FACILITY] Failed to send cancellation notification: ${err.message}`);
    }

    emitAmenityUpdate(societyId);

    return updated;
};

// ── Mark Completed / No-Show (Admin) ─────────────────────────────────────────

export const markBookingCompleted = async (bookingId, societyId) => {
    const booking = await facilityRepo.findBookingById(bookingId);
    if (!booking) throw ApiError.notFound('Booking');
    if (booking.societyId.toString() !== societyId.toString()) throw ApiError.forbidden('Access denied.');
    if (booking.status !== 'CONFIRMED')
        throw ApiError.badRequest('Only CONFIRMED bookings can be marked completed.');

    const updated = await facilityRepo.updateBooking(bookingId, { status: 'COMPLETED' });

    try {
        const residentUser = await userRepo.findById(
            (await residentRepo.findById(booking.residentId?._id ?? booking.residentId))?.userId
        );
        if (residentUser) {
            await sendNotification({
                users: [residentUser],
                societyId,
                type: 'BOOKING_COMPLETED',
                title: 'Booking Completed',
                message: `Your booking for ${booking.amenityId?.name} has been marked as completed. Please leave a rating!`,
                priority: 'NORMAL',
                referenceType: 'BOOKING',
                referenceId: bookingId.toString(),
            });
        }
    } catch (err) {
        logger.warn(`[FACILITY] Failed to send completion notification: ${err.message}`);
    }

    emitAmenityUpdate(societyId);

    return updated;
};

export const markBookingNoShow = async (bookingId, societyId) => {
    const booking = await facilityRepo.findBookingById(bookingId);
    if (!booking) throw ApiError.notFound('Booking');
    if (booking.societyId.toString() !== societyId.toString()) throw ApiError.forbidden('Access denied.');
    if (booking.status !== 'CONFIRMED')
        throw ApiError.badRequest('Only CONFIRMED bookings can be marked no-show.');

    const updated = await facilityRepo.updateBooking(bookingId, { status: 'NO_SHOW' });

    try {
        const residentUser = await userRepo.findById(
            (await residentRepo.findById(booking.residentId?._id ?? booking.residentId))?.userId
        );
        if (residentUser) {
            await sendNotification({
                users: [residentUser],
                societyId,
                type: 'BOOKING_NO_SHOW',
                title: 'Booking Marked as No Show',
                message: `Your booking for ${booking.amenityId?.name} was marked as No Show. Repeated no shows may affect future bookings.`,
                priority: 'NORMAL',
                referenceType: 'BOOKING',
                referenceId: bookingId.toString(),
            });
        }
    } catch (err) {
        logger.warn(`[FACILITY] Failed to send no-show notification: ${err.message}`);
    }

    emitAmenityUpdate(societyId);

    return updated;
};

// ── Feedback (Resident) ───────────────────────────────────────────────────────

export const submitFeedback = async (bookingId, userId, societyId, { rating, feedback }) => {
    const booking = await facilityRepo.findBookingById(bookingId);
    if (!booking) throw ApiError.notFound('Booking');
    if (booking.societyId.toString() !== societyId.toString()) throw ApiError.forbidden('Access denied.');

    const resident = await residentRepo.findByUserId(userId);
    if (!resident || booking.residentId?._id?.toString() !== resident._id.toString())
        throw ApiError.forbidden('You can only review your own bookings.');

    if (booking.status !== 'COMPLETED')
        throw ApiError.badRequest('Feedback can only be submitted for completed bookings.');

    return facilityRepo.updateBooking(bookingId, {
        residentRating: rating,
        residentFeedback: feedback,
    });
};
