import mongoose from "mongoose";

const otpStoreSchema = new mongoose.Schema(
    {
        // Email
        email: {
            type: String,
            required: true,
            trim: true
        },
        // Otp hash
        otpHash: {
            type: String,
            required: true
        },
        // Purpose
        purpose: {
            type: String,
            enum: ['LOGIN', 'REGISTER', 'FORGOT_PASSWORD', 'CHANGE_EMAIL'],
            required: true,
        },
        // Attempts
        attempts: {
            type: Number,
            default: 0
        },
        // Resend count
        resendCount: {
            type: Number,
            default: 0
        },
        // Last resend at
        lastResendAt: {
            type: Date,
            default: null
        },
        // Expires at
        expiresAt: {
            type: Date,
            required: true
        },
        // Indicates whether used is true or false
        isUsed: {
            type: Boolean,
            default: false
        },
    },
    { timestamps: true }
);

// Auto-delete expired OTPs
otpStoreSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpStoreSchema.index({ email: 1, purpose: 1 });

export default mongoose.model('OtpStore', otpStoreSchema);
