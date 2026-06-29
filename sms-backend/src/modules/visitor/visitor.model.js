import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
    {
        // Reference to the associated Society
        societyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Society',
            required: true,
        },
        // Reference to the associated Host unit
        hostUnitId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Unit',
            default: null,
        },
        // Reference to the associated Host resident
        hostResidentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Resident',
            default: null,
        },
        // Visitor name
        visitorName: {
            type: String,
            required: true,
            trim: true
        },
        // Visitor email
        visitorEmail: {
            type: String,
            trim: true,
            default: null
        },
        // Visitor phone
        visitorPhone: {
            type: String,
            default: null
        },
        // Visitor photo url
        visitorPhotoUrl: {
            type: String,
            default: null
        },
        // Visitor type
        visitorType: {
            type: String,
            enum: ['GUEST', 'DELIVERY', 'SERVICE', 'DOMESTIC_STAFF', 'VENDOR', 'OFFICIAL', 'CONTRACTOR', 'OTHER'],
            required: true,
        },
        // Custom visitor type
        customVisitorType: {
            type: String,
            default: null
        },
        // Purpose
        purpose: {
            type: String,
            default: null
        },
        // Company name
        companyName: {
            type: String,
            default: null
        },
        // Vehicle number
        vehicleNumber: {
            type: String,
            uppercase: true,
            default: null
        },
        // Vehicle type
        vehicleType: {
            type: String,
            enum: ['TWO_WHEELER', 'FOUR_WHEELER', 'AUTO', 'TEMPO', null],
            default: null,
        },
        // Id type
        idType: {
            type: String,
            enum: ['AADHAAR', 'PAN', 'DRIVING_LICENSE', 'VOTER_ID', 'PASSPORT', null],
            default: null,
        },
        // Id number
        idNumber: {
            type: String,
            default: null
        },
        // Items carrying
        itemsCarrying: {
            type: String,
            default: null
        },
        // Qr code
        qrCode: {
            type: String,
            unique: true,
            sparse: true
        },
        // Qr expires at
        qrExpiresAt: {
            type: Date,
            default: null
        },
        // Expected arrival
        expectedArrival: {
            type: Date,
            default: null
        },
        // Status
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'DENIED', 'INSIDE', 'EXITED', 'EXPIRED', 'CANCELLED'],
            default: 'PENDING',
        },
        // Approval method
        approvalMethod: {
            type: String,
            enum: ['QR_SCAN', 'REAL_TIME_APPROVAL', 'DOMESTIC_RECURRING', 'FREQUENT_VISITOR', null],
            default: null,
        },
        // Entry time
        entryTime: {
            type: Date,
            default: null
        },
        // Exit time
        exitTime: {
            type: Date,
            default: null
        },
        // Reference to the associated Entry guard
        entryGuardId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        // Reference to the associated Exit guard
        exitGuardId: {
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
        // Reference to the associated Entry gate
        entryGateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Gate',
            default: null,
        },
        // Notes
        notes: {
            type: String,
            default: null
        },
        // Indicates whether frequent is true or false
        isFrequent: {
            type: Boolean,
            default: false
        },
        // Reference to the associated Domestic staff
        domesticStaffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DomesticStaff',
            default: null,
        },
        // Notification sent at
        notificationSentAt: {
            type: Date,
            default: null
        },
        // Resident response
        residentResponse: {
            type: String,
            enum: ['APPROVED', 'DENIED', 'TIMEOUT', null],
            default: null,
        },
    },
    { timestamps: true }
);

visitorSchema.index({ societyId: 1 });
visitorSchema.index({ hostUnitId: 1 });
visitorSchema.index({ hostResidentId: 1 });
visitorSchema.index({ status: 1 });
visitorSchema.index({ entryTime: -1 });
visitorSchema.index({ societyId: 1, status: 1 });
visitorSchema.index({ societyId: 1, createdAt: -1 });

export default mongoose.model('Visitor', visitorSchema);
