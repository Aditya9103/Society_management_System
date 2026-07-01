import Joi from 'joi';

// ── Amenity ───────────────────────────────────────────────────────────────────

const timeSlotItem = Joi.object({
    startTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
    endTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
    maxBookings: Joi.number().integer().min(1).default(1),
});

export const createAmenitySchema = Joi.object({
    name: Joi.string().trim().required(),
    facilityType: Joi.string().valid(
        'CLUBHOUSE', 'SWIMMING_POOL', 'GYM', 'TENNIS_COURT', 'BADMINTON_COURT',
        'CRICKET_NET', 'PARTY_HALL', 'TERRACE', 'LIBRARY', 'KIDS_PLAY_AREA',
        'MEDITATION_ROOM', 'CONFERENCE_ROOM', 'BBQ_AREA', 'OTHER'
    ).required(),
    customAmenityType: Joi.string().allow(null, '').optional(),
    description: Joi.string().allow(null, '').optional(),
    capacity: Joi.number().integer().min(1).allow(null).optional(),
    amenitiesIncluded: Joi.array().items(Joi.string()).optional(),
    bookingUnit: Joi.string().valid('HOURLY', 'HALF_DAY', 'FULL_DAY', 'SLOT').optional(),
    advanceBookingDays: Joi.number().integer().min(1).max(365).optional(),
    maxDurationHours: Joi.number().min(0.5).allow(null).optional(),
    minDurationHours: Joi.number().min(0.5).optional(),
    isPaid: Joi.boolean().optional(),
    hourlyRate: Joi.number().min(0).optional(),
    halfDayRate: Joi.number().min(0).optional(),
    fullDayRate: Joi.number().min(0).optional(),
    refundableDeposit: Joi.number().min(0).optional(),
    cancellationPolicy: Joi.string().allow(null, '').optional(),
    cancellationDeadlineHours: Joi.number().min(0).optional(),
    autoApproval: Joi.boolean().optional(),
    availableSlots: Joi.object().pattern(
        Joi.string().valid('0', '1', '2', '3', '4', '5', '6'),
        Joi.array().items(timeSlotItem)
    ).optional(),
    blockedDates: Joi.array().items(Joi.date()).optional(),
    maintenanceDates: Joi.array().items(Joi.date()).optional(),
    isActive: Joi.boolean().optional(),
});

export const updateAmenitySchema = createAmenitySchema.fork(
    ['name', 'facilityType'],
    (schema) => schema.optional()
);

// ── Booking ───────────────────────────────────────────────────────────────────

export const createBookingSchema = Joi.object({
    amenityId: Joi.string().hex().length(24).required(),
    bookingDate: Joi.date().required(),
    startTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required()
        .messages({ 'string.pattern.base': 'startTime must be in HH:MM format' }),
    endTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required()
        .messages({ 'string.pattern.base': 'endTime must be in HH:MM format' }),
    purpose: Joi.string().allow(null, '').optional(),
    expectedGuests: Joi.number().integer().min(0).optional(),
});

export const cancelBookingSchema = Joi.object({
    reason: Joi.string().min(3).optional(),
});

export const rejectBookingSchema = Joi.object({
    reason: Joi.string().min(3).required(),
});

export const approveBookingSchema = Joi.object({
    adminNotes: Joi.string().allow(null, '').optional(),
});

export const feedbackSchema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    feedback: Joi.string().allow(null, '').optional(),
});
