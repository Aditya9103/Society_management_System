import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema(
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
        // Email
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        // Phone
        phone: {
            type: String,
            trim: true,
        },
        // Password hash
        passwordHash: {
            type: String,
            default: null,
            select: false
        },
        // First name
        firstName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50
        },
        // Last name
        lastName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50
        },
        // Display name
        displayName: {
            type: String,
            trim: true,
            default: null
        },
        // Profile photo url
        profilePhotoUrl: {
            type: String,
            default: null
        },
        // Date of birth
        dateOfBirth: {
            type: Date,
            default: null
        },
        // Gender
        gender: {
            type: String,
            enum: ['MALE', 'FEMALE', 'OTHER', null],
            default: null,
        },
        // Nationality
        nationality: {
            type: String,
            default: 'Indian'
        },
        // Role
        role: {
            type: String,
            enum: [
                'SUPER_ADMIN',
                'SOCIETY_ADMIN',
                'COMMITTEE_MEMBER',
                'ACCOUNTANT',
                'FACILITY_MANAGER',
                'HELP_DESK',
                'SECURITY_GUARD',
                'RESIDENT',
            ],
            required: true,
        },
        // Indicates whether email verified is true or false
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        // Indicates whether phone verified is true or false
        isPhoneVerified: {
            type: Boolean,
            default: false
        },
        // Registration Status for multi-step onboarding
        registrationStatus: {
            type: String,
            enum: ['UNVERIFIED', 'INCOMPLETE_PROFILE', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'],
            default: 'UNVERIFIED'
        },
        // Indicates whether active is true or false
        isActive: {
            type: Boolean,
            default: true
        },
        // Last login at
        lastLoginAt: {
            type: Date,
            default: null
        },
        // Failed login count
        failedLoginCount: {
            type: Number,
            default: 0
        },
        // Locked until
        lockedUntil: {
            type: Date,
            default: null
        },
        // Password history
        passwordHistory: {
            type: [String],
            select: false,
            default: []
        },
        // Fcm tokens
        fcmTokens: {
            type: [String],
            default: []
        },
        // Metadata
        metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);


userSchema.index({ societyId: 1 });
userSchema.index({ role: 1 });

userSchema.methods.comparePassword = async function (plainPassword) {
    return bcrypt.compare(plainPassword, this.passwordHash);
};

userSchema.methods.isAccountLocked = function () {
    return this.lockedUntil && this.lockedUntil > new Date();
};

export default mongoose.model('User', userSchema);
