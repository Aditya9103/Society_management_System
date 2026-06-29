import mongoose from "mongoose";

const responderSchema = new mongoose.Schema(
    {
        // Reference to the associated User
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        // Responded at
        respondedAt: {
            type: Date,
            default: Date.now
        },
        // Action
        action: {
            type: String,
            default: null
        },
    },
    { _id: false }
);

const emergencySchema = new mongoose.Schema(
    {
        // Reference to the associated Society
        societyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Society',
            required: true,
        },
        // Emergency type
        emergencyType: {
            type: String,
            enum: [
                'MEDICAL',
                'FIRE',
                'SECURITY_BREACH',
                'NATURAL_DISASTER',
                'GAS_LEAK',
                'POWER_FAILURE',
                'WATER_CRISIS',
                'ACCIDENT',
                'THEFT',
                'PANIC',
                'OTHER',
            ],
            required: true,
        },
        // Custom Emergency Type
        customEmergencyType: {
            type: String,
            default: null
        },
        // Triggered by
        triggeredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // Reference to the associated Location unit
        locationUnitId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Unit',
            default: null,
        },
        // Location description
        locationDescription: {
            type: String,
            default: null
        },
        // Latitude
        latitude: {
            type: Number,
            default: null
        },
        // Longitude
        longitude: {
            type: Number,
            default: null
        },
        // Status
        status: {
            type: String,
            enum: ['ACTIVE', 'RESPONDING', 'UNDER_CONTROL', 'RESOLVED', 'FALSE_ALARM'],
            default: 'ACTIVE',
        },
        // Responders
        responders: {
            type: [responderSchema],
            default: []
        },
        // Resolution notes
        resolutionNotes: {
            type: String,
            default: null
        },
        // Media urls
        mediaUrls: {
            type: [String],
            default: []
        },
        // Notifications sent
        notificationsSent: {
            push: {
                type: Boolean,
                default: false
            },
            sms: {
                type: Boolean,
                default: false
            },
            whatsapp: {
                type: Boolean,
                default: false
            },
        },
        // Notified count
        notifiedCount: {
            type: Number,
            default: 0
        },
        // Resolved at
        resolvedAt: {
            type: Date,
            default: null
        },
        // Resolved by
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    { timestamps: true }
);

emergencySchema.index({ societyId: 1 });
emergencySchema.index({ status: 1 });
emergencySchema.index({ societyId: 1, createdAt: -1 });

export default mongoose.model('Emergency', emergencySchema);
