/**
 * facility.repository.js — Data access layer for Amenity & Booking module.
 */

import Amenity from './amenity.model.js';
import Booking from './booking.model.js';

// ── Amenity ───────────────────────────────────────────────────────────────────

export const findAmenityById = (id) =>
    Amenity.findById(id).lean();

export const findAmenitiesBySociety = async (societyId, { page = 1, limit = 20, facilityType, isActive } = {}) => {
    const filter = { societyId };
    if (facilityType) filter.facilityType = facilityType;
    if (isActive !== undefined) filter.isActive = isActive;

    const [data, total] = await Promise.all([
        Amenity.find(filter)
            .sort({ name: 1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean(),
        Amenity.countDocuments(filter),
    ]);
    return { data, total };
};

export const createAmenity = (data) => Amenity.create(data);

export const updateAmenity = (id, update) =>
    Amenity.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();

export const deleteAmenity = (id) => Amenity.findByIdAndDelete(id);

// ── Booking ───────────────────────────────────────────────────────────────────

export const findBookingById = (id) =>
    Booking.findById(id)
        .populate('amenityId', 'name facilityType autoApproval cancellationDeadlineHours isPaid hourlyRate fullDayRate halfDayRate refundableDeposit')
        .populate('residentId', 'residentCode ownershipType unitId')
        .populate('unitId', 'unitNumber')
        .lean();

export const findBookingsByResident = async (residentId, { page = 1, limit = 20, status } = {}) => {
    const filter = { residentId };
    if (status) filter.status = status;

    const [data, total] = await Promise.all([
        Booking.find(filter)
            .populate('amenityId', 'name facilityType')
            .populate('unitId', 'unitNumber')
            .sort({ bookingDate: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean(),
        Booking.countDocuments(filter),
    ]);
    return { data, total };
};

export const findBookingsBySociety = async (societyId, { page = 1, limit = 20, status, amenityId, date } = {}) => {
    const filter = { societyId };
    if (status) filter.status = status;
    if (amenityId) filter.amenityId = amenityId;
    if (date) {
        const start = new Date(date);
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setUTCHours(23, 59, 59, 999);
        filter.bookingDate = { $gte: start, $lte: end };
    }

    const [data, total] = await Promise.all([
        Booking.find(filter)
            .populate('amenityId', 'name facilityType')
            .populate('residentId', 'residentCode')
            .populate('unitId', 'unitNumber')
            .sort({ bookingDate: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean(),
        Booking.countDocuments(filter),
    ]);
    return { data, total };
};

/**
 * Find all CONFIRMED/PENDING bookings for an amenity on a given date (for clash detection).
 */
export const findBookingsForSlot = (amenityId, bookingDate, startTime, endTime) => {
    const start = new Date(bookingDate);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(bookingDate);
    end.setUTCHours(23, 59, 59, 999);

    return Booking.find({
        amenityId,
        bookingDate: { $gte: start, $lte: end },
        status: { $in: ['PENDING_APPROVAL', 'CONFIRMED'] },
        // Overlap condition: existing.start < req.end AND existing.end > req.start
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
    }).lean();
};

export const createBooking = (data) => Booking.create(data);

export const updateBooking = (id, update) =>
    Booking.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();

/**
 * Count bookings for an amenity on a given date+slot (for maxBookings enforcement).
 */
export const countActiveBookingsForSlot = (amenityId, bookingDate, startTime) => {
    const start = new Date(bookingDate);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(bookingDate);
    end.setUTCHours(23, 59, 59, 999);

    return Booking.countDocuments({
        amenityId,
        bookingDate: { $gte: start, $lte: end },
        startTime,
        status: { $in: ['PENDING_APPROVAL', 'CONFIRMED'] },
    });
};
