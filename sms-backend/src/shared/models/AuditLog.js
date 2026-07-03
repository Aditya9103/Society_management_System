import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        // Reference to the associated Tenant
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tenant',
            default: null,
        },
        // Reference to the associated Society
        societyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Society',
            default: null,
        },
        // Reference to the associated Actor
        actorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        // Actor role
        actorRole: {
            type: String,
            default: null
        },
        // Action
        action: {
            type: String,
            enum: [
                'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT',
                'LOGIN', 'LOGOUT', 'EXPORT', 'VIEW', 'UPLOAD', 'DOWNLOAD',
                'PAYMENT', 'REFUND', 'STATUS_CHANGE', 'PROVISION',
            ],
            required: true,
        },
        // Resource type
        resourceType: {
            type: String,
            enum: [
                'USER', 'RESIDENT', 'VISITOR', 'VEHICLE', 'INVOICE',
                'PAYMENT', 'COMPLAINT', 'NOTICE', 'BOOKING', 'EMERGENCY',
                'POLL', 'DOCUMENT', 'SOCIETY', 'UNIT', 'TOWER', 'EXPENSE', 'TENANT'
            ],
            required: true,
        },
        // Reference to the associated Resource
        resourceId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
        // Human-readable resource name (snapshot at the time of log)
        resourceName: {
            type: String,
            default: null,
        },
        // Before state
        beforeState: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        // After state
        afterState: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        // Ip address
        ipAddress: {
            type: String,
            default: null
        },
        // User agent
        userAgent: {
            type: String,
            default: null
        },
        // Reference to the associated Session
        sessionId: {
            type: String,
            default: null
        },
    },
    { timestamps: true }
);

// Auto-delete audit logs after 1 years
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });
auditLogSchema.index({ societyId: 1, createdAt: -1 });
auditLogSchema.index({ actorId: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });

export default mongoose.model('AuditLog', auditLogSchema);
