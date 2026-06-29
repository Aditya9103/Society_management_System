import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
    {
        // Reference to the associated Society
        societyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Society',
            required: true,
        },
        // Document name
        documentName: {
            type: String,
            required: true,
            trim: true
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
        // Reference to the associated Cloudinary public
        cloudinaryPublicId: {
            type: String,
            default: null
        },
        // File size bytes
        fileSizeBytes: {
            type: Number,
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
            required: true,
            refPath: 'ownerType',
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
        // Access level
        accessLevel: {
            type: String,
            enum: ['PRIVATE', 'RESIDENT_ONLY', 'ADMIN_ONLY', 'PUBLIC'],
            default: 'PRIVATE',
        },
        // Indicates whether archived is true or false
        isArchived: {
            type: Boolean,
            default: false
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
