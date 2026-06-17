import mongoose from "mongoose";

const visitorLogSchema = new mongoose.Schema(
    {
        // Reference to the associated Visitor
        visitorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Visitor',
            required: true,
        },
        // Reference to the associated Society
        societyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Society',
            required: true,
        },
        // Event type
        eventType: {
            type: String,
            enum: ['ENTRY', 'EXIT', 'DENIED', 'QR_SCAN', 'APPROVAL_SENT', 'APPROVED_BY_RESIDENT', 'DENIED_BY_RESIDENT', 'TIMEOUT'],
            required: true,
        },
        // Event time
        eventTime: {
            type: Date,
            default: Date.now
        },
        // Reference to the associated Guard
        guardId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        // Reference to the associated Gate
        gateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Gate',
            default: null,
        },
        // Photo url
        photoUrl: {
            type: String,
            default: null
        },
        // Notes
        notes: {
            type: String,
            default: null
        },
    },
    { timestamps: true }
);

visitorLogSchema.index({ visitorId: 1 });
visitorLogSchema.index({ societyId: 1, eventTime: -1 });

export default mongoose.model('VisitorLog', visitorLogSchema);
