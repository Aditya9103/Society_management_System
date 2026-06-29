import mongoose from "mongoose";

const domesticStaffSchema = new mongoose.Schema(
    {
        // Reference to the associated Society
        societyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Society',
            required: true,
        },
        // Registered by
        registeredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Resident',
            required: true,
        },
        // Name
        name: {
            type: String,
            required: true,
            trim: true
        },
        // Role
        role: {
            type: String,
            enum: ['MAID', 'COOK', 'DRIVER', 'GARDENER', 'NANNY', 'OTHER'],
            required: true,
        },
        // Custom Role
        customRole: {
            type: String,
            default: null
        },
        // Phone
        phone: {
            type: String,
            default: null
        },
        // Aadhaar number
        aadhaarNumber: {
            type: String,
            default: null
        },
        // Photo url
        photoUrl: {
            type: String,
            default: null
        },
        // Qr code
        qrCode: {
            type: String,
            unique: true,
            sparse: true
        },
        // 0=Sunday, 1=Monday, ..., 6=Saturday
        allowedDays: {
            type: [Number],
            default: [0, 1, 2, 3, 4, 5, 6],
            validate: {
                validator: (arr) => arr.every((d) => d >= 0 && d <= 6),
                message: 'Allowed days must be 0–6',
            },
        },
        // Allowed start time
        allowedStartTime: {
            type: String,
            default: '06:00'
        },
        // Allowed end time
        allowedEndTime: {
            type: String,
            default: '20:00'
        },
        // Background verified
        backgroundVerified: {
            type: Boolean,
            default: false
        },
        // Id verified
        idVerified: {
            type: Boolean,
            default: false
        },
        // Indicates whether active is true or false
        isActive: {
            type: Boolean,
            default: true
        },
    },
    { timestamps: true }
);

domesticStaffSchema.index({ societyId: 1 });
domesticStaffSchema.index({ registeredBy: 1 });
domesticStaffSchema.index({ isActive: 1 });
domesticStaffSchema.index({ role: 1 });

export default mongoose.model('DomesticStaff', domesticStaffSchema);
