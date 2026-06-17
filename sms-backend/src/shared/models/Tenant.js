import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
    {
        // Name
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        // Slug
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 50,
        },
        // Contact name
        contactName: {
            type: String,
            required: true,
            trim: true
        },
        // Contact email
        contactEmail: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        // Contact phone
        contactPhone: {
            type: String,
            required: true,
            trim: true
        },
        // Plan
        plan: {
            type: String,
            enum: ['BASIC', 'STANDARD', 'ENTERPRISE'],
            default: 'BASIC',
        },
        // Max societies
        maxSocieties: {
            type: Number,
            default: 1,
            min: 1
        },
        // Indicates whether active is true or false
        isActive: {
            type: Boolean,
            default: true
        },
        // Trial ends at
        trialEndsAt: {
            type: Date,
            default: null
        },
        // Billing cycle
        billingCycle: {
            type: String,
            enum: ['MONTHLY', 'ANNUAL'],
            default: 'MONTHLY',
        },
        // Metadata
        metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

export default mongoose.model('Tenant', tenantSchema);
