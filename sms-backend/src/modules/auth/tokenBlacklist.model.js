import mongoose from "mongoose";

// Replaces Redis for JWT blacklisting — uses MongoDB TTL
const tokenBlacklistSchema = new mongoose.Schema(
    {
        // JWT ID
        jti: {
            type: String,
            required: true,
            unique: true
        },
        // Reference to the associated User
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        // Expires at
        expiresAt: {
            type: Date,
            required: true
        },
    },
    { timestamps: true }
);

// Auto-delete when JWT expires
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('TokenBlacklist', tokenBlacklistSchema);
