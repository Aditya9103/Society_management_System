import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
    {
        // Reference to the associated User
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // Token hash
        tokenHash: {
            type: String,
            required: true,
            unique: true
        },
        // Expires at
        expiresAt: {
            type: Date,
            required: true
        },
        // Revoked at
        revokedAt: {
            type: Date,
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
        // Device fingerprint
        deviceFingerprint: {
            type: String,
            default: null
        },
    },
    { timestamps: true }
);

// Auto-delete expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ userId: 1 });

export default mongoose.model('RefreshToken', refreshTokenSchema);
