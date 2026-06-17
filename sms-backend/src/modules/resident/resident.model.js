import mongoose from "mongoose";

const familyMemberSchema = new mongoose.Schema(
    {
        // Name
        name: {
            type: String,
            required: true,
            trim: true
        },
        // Relation
        relation: {
            type: String,
            enum: ['SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'GRANDPARENT', 'OTHER'],
            required: true,
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
        // Phone
        phone: {
            type: String,
            default: null
        },
        // Indicates whether emergency contact is true or false
        isEmergencyContact: {
            type: Boolean,
            default: false
        },
        // Can receive visitors
        canReceiveVisitors: {
            type: Boolean,
            default: true
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
        // Indicates whether active is true or false
        isActive: {
            type: Boolean,
            default: true
        },
    },
    { timestamps: true }
);

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
        // Relation
        relation: {
            type: String,
            required: true
        },
    },
    { _id: false }
);

const residentSchema = new mongoose.Schema(
    {
        // Reference to the associated Society
        societyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Society',
            required: true,
        },
        // Reference to the associated User
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        // Reference to the associated Unit
        unitId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Unit',
            required: true,
        },
        // Resident code
        residentCode: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        // Ownership type
        ownershipType: {
            type: String,
            enum: ['OWNER', 'TENANT'],
            required: true,
        },
        // Move in date
        moveInDate: {
            type: Date,
            default: null
        },
        // Move out date
        moveOutDate: {
            type: Date,
            default: null
        },
        // Lease start date
        leaseStartDate: {
            type: Date,
            default: null
        },
        // Lease end date
        leaseEndDate: {
            type: Date,
            default: null
        },
        // Owner name
        ownerName: {
            type: String,
            default: null
        },
        // Owner phone
        ownerPhone: {
            type: String,
            default: null
        },
        // Owner email
        ownerEmail: {
            type: String,
            default: null
        },
        // Monthly rent
        monthlyRent: {
            type: Number,
            default: null
        },
        // Aadhaar number
        aadhaarNumber: {
            type: String,
            default: null
        },  // encrypted
        // Pan number
        panNumber: {
            type: String,
            default: null
        },       // encrypted
        // Id card url
        idCardUrl: {
            type: String,
            default: null
        },
        // Id card generated at
        idCardGeneratedAt: {
            type: Date,
            default: null
        },
        // Approval status
        approvalStatus: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            default: 'PENDING',
        },
        // Approved by
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        // Approved at
        approvedAt: {
            type: Date,
            default: null
        },
        // Rejection reason
        rejectionReason: {
            type: String,
            default: null
        },
        // Status
        status: {
            type: String,
            enum: ['ACTIVE', 'INACTIVE', 'MOVED_OUT'],
            default: 'ACTIVE',
        },
        // Family members
        familyMembers: {
            type: [familyMemberSchema],
            default: []
        },
        // Emergency contacts
        emergencyContacts: {
            type: [emergencyContactSchema],
            default: []
        },
        // Uploaded documents
        uploadedDocuments: {
            type: [String],
            default: []
        },
    },
    { timestamps: true }
);

residentSchema.index({ societyId: 1 });
residentSchema.index({ unitId: 1 });
residentSchema.index({ approvalStatus: 1 });
residentSchema.index({ status: 1 });

export default mongoose.model('Resident', residentSchema);
