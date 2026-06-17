import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        // Reference to the associated Society
        societyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Society',
            required: true,
        },
        // Reference to the associated User
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // Title
        title: {
            type: String,
            required: true,
            maxlength: 150
        },
        // Body
        body: {
            type: String,
            required: true
        },
        // Type
        type: {
            type: String,
            enum: [
                'VISITOR_APPROVAL_REQUEST',
                'VISITOR_ENTRY',
                'VISITOR_EXIT',
                'VISITOR_DENIED',
                'COMPLAINT_CREATED',
                'COMPLAINT_ASSIGNED',
                'COMPLAINT_UPDATED',
                'COMPLAINT_RESOLVED',
                'COMPLAINT_SLA_BREACH',
                'INVOICE_GENERATED',
                'INVOICE_DUE',
                'INVOICE_OVERDUE',
                'PAYMENT_RECEIVED',
                'PAYMENT_FAILED',
                'NOTICE_PUBLISHED',
                'BOOKING_CONFIRMED',
                'BOOKING_CANCELLED',
                'BOOKING_REMINDER',
                'EMERGENCY_ALERT',
                'POLL_STARTED',
                'RESIDENT_APPROVED',
                'RESIDENT_REJECTED',
                'GENERAL',
            ],
            required: true,
        },
        // Reference type
        referenceType: {
            type: String,
            enum: [
                'VISITOR', 'COMPLAINT', 'INVOICE', 'PAYMENT',
                'NOTICE', 'BOOKING', 'EMERGENCY', 'POLL', 'RESIDENT', null,
            ],
            default: null,
        },
        // Reference to the associated Reference
        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
        // Channel
        channel: {
            type: String,
            enum: ['PUSH', 'EMAIL', 'SMS', 'WHATSAPP', 'IN_APP'],
            required: true,
        },
        // Status
        status: {
            type: String,
            enum: ['PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED'],
            default: 'PENDING',
        },
        // Sent at
        sentAt: {
            type: Date,
            default: null
        },
        // Read at
        readAt: {
            type: Date,
            default: null
        },
        // Failure reason
        failureReason: {
            type: String,
            default: null
        },
        // Metadata
        metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, readAt: 1 });
notificationSchema.index({ societyId: 1 });
notificationSchema.index(
    { userId: 1, readAt: 1 },
    { partialFilterExpression: {
            readAt: null
        } }
);

export default mongoose.model('Notification', notificationSchema);
