import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema(
    {
        // Start time
        startTime: {
            type: String,
            required: true
        },
        // End time
        endTime: {
            type: String,
            required: true
        },
        // Max bookings
        maxBookings: {
            type: Number,
            default: 1
        },
    },
    { _id: false }
);

const amenitySchema = new mongoose.Schema(
    {
        // Reference to the associated Society
        societyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Society',
            required: true,
        },
        // Name
        name: {
            type: String,
            required: true,
            trim: true
        },
        // Facility type
        facilityType: {
            type: String,
            enum: [
                'CLUBHOUSE',
                'SWIMMING_POOL',
                'GYM',
                'TENNIS_COURT',
                'BADMINTON_COURT',
                'CRICKET_NET',
                'PARTY_HALL',
                'TERRACE',
                'LIBRARY',
                'KIDS_PLAY_AREA',
                'MEDITATION_ROOM',
                'CONFERENCE_ROOM',
                'BBQ_AREA',
                'OTHER',
            ],
            required: true,
        },
        // Custom Amenity Type
        customAmenityType: {
            type: String,
            default: null
        },
        // Description
        description: {
            type: String,
            default: null
        },
        // Capacity
        capacity: {
            type: Number,
            default: null
        },
        // Photos
        photos: {
            type: [String],
            default: []
        },
        // Amenities included
        amenitiesIncluded: {
            type: [String],
            default: []
        },
        // Booking unit
        bookingUnit: {
            type: String,
            enum: ['HOURLY', 'HALF_DAY', 'FULL_DAY', 'SLOT'],
            default: 'HOURLY',
        },
        // Advance booking days
        advanceBookingDays: {
            type: Number,
            default: 30
        },
        // Max duration hours
        maxDurationHours: {
            type: Number,
            default: null
        },
        // Min duration hours
        minDurationHours: {
            type: Number,
            default: 1
        },
        // Indicates whether paid is true or false
        isPaid: {
            type: Boolean,
            default: false
        },
        // Hourly rate
        hourlyRate: {
            type: Number,
            default: 0
        },
        // Half day rate
        halfDayRate: {
            type: Number,
            default: 0
        },
        // Full day rate
        fullDayRate: {
            type: Number,
            default: 0
        },
        // Refundable deposit
        refundableDeposit: {
            type: Number,
            default: 0
        },
        // Cancellation policy
        cancellationPolicy: {
            type: String,
            default: null
        },
        // Cancellation deadline hours
        cancellationDeadlineHours: {
            type: Number,
            default: 24
        },
        // Auto approval
        autoApproval: {
            type: Boolean,
            default: true
        },
        // Available slots
        availableSlots: {
            // { "0": [slots], "1": [slots], ..., "6": [slots] } — 0=Sunday
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        // Blocked dates
        blockedDates: {
            type: [Date],
            default: []
        },
        // Maintenance dates
        maintenanceDates: {
            type: [Date],
            default: []
        },
        // Indicates whether active is true or false
        isActive: {
            type: Boolean,
            default: true
        },
    },
    { timestamps: true }
);

amenitySchema.index({ societyId: 1 });

export default mongoose.model('Amenity', amenitySchema);
