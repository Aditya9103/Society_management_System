import mongoose from "mongoose";

const emergencyContactSchema = new mongoose.Schema(
    {
        // Name
        name: {
            type: String,
            required: true
        },
        // Phone
        phone: {
            type: String,
            required: true
        },
        // Type
        type: {
            type: String,
            enum: ['POLICE', 'FIRE', 'AMBULANCE', 'HOSPITAL', 'SECURITY_AGENCY', 'OTHER'],
            required: true,
        },
    },
    { _id: false }
);

const slaHoursSchema = new mongoose.Schema(
    {
        //  l o w
        LOW: {
            type: Number,
            default: 72
        },
        //  m e d i u m
        MEDIUM: {
            type: Number,
            default: 48
        },
        //  h i g h
        HIGH: {
            type: Number,
            default: 24
        },
        //  u r g e n t
        URGENT: {
            type: Number,
            default: 4
        },
    },
    { _id: false }
);

const societySettingsSchema = new mongoose.Schema(
    {
        // Billing date
        billingDate: {
            type: Number,
            default: 1,
            min: 1,
            max: 28
        },
        // Grace period days
        gracePeriodDays: {
            type: Number,
            default: 10,
            min: 0
        },
        // Late fee percentage
        lateFeePercentage: {
            type: Number,
            default: 2,
            min: 0
        },
        // Late fee type
        lateFeeType: {
            type: String,
            enum: ['PERCENTAGE', 'FIXED'],
            default: 'PERCENTAGE',
        },
        // Late fee fixed amount
        lateFeeFixedAmount: {
            type: Number,
            default: 0
        },
        // Visitor approval mode
        visitorApprovalMode: {
            type: String,
            enum: ['REQUIRED', 'AUTO_ALLOW'],
            default: 'REQUIRED',
        },
        // Visitor approval timeout minutes
        visitorApprovalTimeoutMinutes: {
            type: Number,
            default: 3
        },
        // Sla hours
        slaHours: { type: slaHoursSchema, default: () => ({}) },
        // Allow resident directory view
        allowResidentDirectoryView: {
            type: Boolean,
            default: true
        },
        // Max vehicles per unit
        maxVehiclesPerUnit: {
            type: Number,
            default: 2
        },
        // Maintenance tax percentage
        maintenanceTaxPercentage: {
            type: Number,
            default: 0
        },
        // Currency
        currency: {
            type: String,
            default: 'INR'
        },
        // Timezone
        timezone: {
            type: String,
            default: 'Asia/Kolkata'
        },
        // Reminder days before due
        reminderDaysBeforeDue: {
            type: [Number],
            default: [3,
            1]
        },
        // Reminder days after due
        reminderDaysAfterDue: {
            type: [Number],
            default: [1,
            3,
            7]
        },
    },
    { _id: false }
);

const societySchema = new mongoose.Schema(
    {
        // Reference to the associated Tenant
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tenant',
            required: true,
        },
        // Name
        name: {
            type: String,
            required: true,
            trim: true
        },
        // Registration number
        registrationNumber: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
        },
        // Address line1
        addressLine1: {
            type: String,
            required: true
        },
        // Address line2
        addressLine2: {
            type: String,
            default: ''
        },
        // City
        city: {
            type: String,
            required: true
        },
        // State
        state: {
            type: String,
            required: true
        },
        // Country
        country: {
            type: String,
            default: 'India'
        },
        // Pincode
        pincode: {
            type: String,
            required: true,
            match: [/^\d{6}$/, 'Pincode must be 6 digits'],
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
        // Logo url
        logoUrl: {
            type: String,
            default: null
        },
        // Contact email
        contactEmail: {
            type: String,
            lowercase: true,
            trim: true
        },
        // Contact phone
        contactPhone: {
            type: String,
            trim: true
        },
        // Establishment year
        establishmentYear: {
            type: Number,
            default: null
        },
        // Total units
        totalUnits: {
            type: Number,
            default: 0
        },
        // Occupied units
        occupiedUnits: {
            type: Number,
            default: 0
        },
        // Settings
        settings: { type: societySettingsSchema, default: () => ({}) },
        // Emergency contacts
        emergencyContacts: {
            type: [emergencyContactSchema],
            default: []
        },
        // Indicates whether active is true or false
        isActive: {
            type: Boolean,
            default: true
        },
    },
    { timestamps: true }
);

societySchema.index({ tenantId: 1 });
societySchema.index({ isActive: 1 });

export default mongoose.model('Society', societySchema);
