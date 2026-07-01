import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        // Reference to the associated Society
        societyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Society',
            required: true,
        },
        // Booking number
        bookingNumber: {
            type: String,
            required: true,
            unique: true,
        },
        // Reference to the associated Amenity
        amenityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Amenity',
            required: true,
        },
        // Reference to the associated Resident
        residentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Resident',
            required: true,
        },
        // Reference to the associated Unit
        unitId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Unit',
            required: true,
        },
        // Booking date
        bookingDate: {
            type: Date,
            required: true
        },
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
        // Duration hours
        durationHours: {
            type: Number,
            default: null
        },
        // Purpose
        purpose: {
            type: String,
            default: null
        },
        // Expected guests
        expectedGuests: {
            type: Number,
            default: 0
        },
        // Status
        status: {
            type: String,
            enum: [
                'PENDING_APPROVAL',
                'APPROVED',
                'PENDING_PAYMENT',
                'CONFIRMED',
                'CANCELLED',
                'COMPLETED',
                'NO_SHOW',
            ],
            default: 'PENDING_APPROVAL',
        },
        // Total amount
        totalAmount: {
            type: Number,
            default: 0
        },
        // Deposit amount
        depositAmount: {
            type: Number,
            default: 0
        },
        // Reference to the associated Payment
        paymentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Payment',
            default: null,
        },
        // Deposit refunded
        depositRefunded: {
            type: Boolean,
            default: false
        },
        // Deposit refunded at
        depositRefundedAt: {
            type: Date,
            default: null
        },
        // Admin notes
        adminNotes: {
            type: String,
            default: null
        },
        // Resident rating
        residentRating: {
            type: Number,
            min: 1,
            max: 5,
            default: null
        },
        // Resident feedback
        residentFeedback: {
            type: String,
            default: null
        },
        // Cancellation reason
        cancellationReason: {
            type: String,
            default: null
        },
        // Cancelled by
        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        // Cancelled at
        cancelledAt: {
            type: Date,
            default: null
        },
        // Reminder sent
        reminderSent: {
            type: Boolean,
            default: false
        },
        // ── Payment placeholder fields (not enforced now, reserved for future) ──
        // Whether this booking requires payment
        paymentRequired: {
            type: Boolean,
            default: false,
        },
        // Payment status (NOT_REQUIRED / PENDING / PAID)
        paymentStatus: {
            type: String,
            enum: ['NOT_REQUIRED', 'PENDING', 'PAID'],
            default: 'NOT_REQUIRED',
        },
    },
    { timestamps: true }
);

bookingSchema.index({ societyId: 1 });
bookingSchema.index({ amenityId: 1, bookingDate: 1 });
bookingSchema.index({ residentId: 1 });
bookingSchema.index({ status: 1 });

export default mongoose.model('Booking', bookingSchema);
