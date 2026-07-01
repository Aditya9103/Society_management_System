import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
    {
        // Reference to the associated Society
        societyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Society',
            required: true,
        },
        // Document title/name
        title: {
            type: String,
            required: true,
            trim: true
        },
        // Description
        description: {
            type: String,
            trim: true,
            default: null
        },
        // Category
        category: {
            type: String,
            enum: ['IDENTITY', 'RESIDENTIAL', 'VEHICLE', 'SOCIETY', 'MAINTENANCE', 'LEGAL', 'OTHER'],
            required: true,
        },
        // Document type
        documentType: {
            type: String,
            enum: [
                'AADHAAR',
                'PAN',
                'PASSPORT',
                'DRIVING_LICENSE',
                'VOTER_ID',
                'RENT_AGREEMENT',
                'SALE_DEED',
                'NOC',
                'SOCIETY_BYLAW',
                'MEETING_MINUTES',
                'AUDIT_REPORT',
                'MAINTENANCE_NOTICE',
                'INSURANCE',
                'RC_BOOK',
                'EMISSION_CERTIFICATE',
                'VENDOR_CONTRACT',
                'VENDOR_INVOICE',
                'AMC',
                'SERVICE_REPORT',
                'WARRANTY_CARD',
                'COURT_ORDER',
                'LEGAL_NOTICE',
                'DISPUTE_RESOLUTION',
                'OTHER',
            ],
            required: true,
        },
        // Custom Document Type
        customDocumentType: {
            type: String,
            default: null
        },
        // File url
        fileUrl: {
            type: String,
            required: true
        },
        // Storage key for generic cloud storage
        storageKey: {
            type: String,
            default: null
        },
        // File size bytes
        fileSize: {
            type: Number,
            default: null
        },
        // Checksum for duplicate detection
        checksum: {
            type: String,
            default: null
        },
        // Mime type
        mimeType: {
            type: String,
            default: null
        },
        // Owner type
        ownerType: {
            type: String,
            enum: ['RESIDENT', 'SOCIETY', 'UNIT', 'STAFF'],
            required: true,
        },
        // Reference to the associated Owner
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null, // Allow null for society level documents
            refPath: 'ownerType',
        },
        // Related unit (optional)
        unitId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Unit',
            default: null,
        },
        // Related vehicle (optional)
        vehicleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vehicle',
            default: null,
        },
        // Uploaded by
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // Expiry date
        expiryDate: {
            type: Date,
            default: null
        },
        // Indicates whether verified is true or false
        isVerified: {
            type: Boolean,
            default: false
        },
        // Verified by
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        // Verified at
        verifiedAt: {
            type: Date,
            default: null
        },
        // Access level / visibility
        visibility: {
            type: String,
            enum: ['PRIVATE', 'UNIT_SHARED', 'SOCIETY', 'MANAGEMENT', 'DEPARTMENT', 'PUBLIC'],
            default: 'PRIVATE',
        },
        // Status
        status: {
            type: String,
            enum: ['PENDING', 'ACTIVE', 'REJECTED', 'ARCHIVED'],
            default: 'ACTIVE'
        },
        // Current Version
        currentVersion: {
            type: Number,
            default: 1
        },
        // Soft delete timestamp
        deletedAt: {
            type: Date,
            default: null
        },
        // Tags
        tags: {
            type: [String],
            default: []
        },
    },
    { timestamps: true }
);

documentSchema.index({ societyId: 1 });
documentSchema.index({ ownerId: 1, ownerType: 1 });
documentSchema.index({ documentType: 1 });

export default mongoose.model('Document', documentSchema);
