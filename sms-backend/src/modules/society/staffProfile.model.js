import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['AADHAAR', 'PAN', 'PROFILE_PHOTO', 'ADDRESS_PROOF', 'OTHER'],
        required: true
    },
    url: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    verifiedAt: {
        type: Date,
        default: null
    }
}, { _id: true, timestamps: true });

const staffProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    societyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Society',
        required: true
    },
    employeeId: {
        type: String,
        trim: true,
        default: null
    },
    department: {
        type: String,
        trim: true,
        default: null
    },
    reportingTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    shift: {
        type: String,
        trim: true,
        default: null
    },
    employmentType: {
        type: String,
        enum: ['Full Time', 'Part Time', 'Contract', 'Temporary'],
        default: 'Full Time'
    },
    salary: {
        type: Number,
        default: null
    },
    experience: {
        type: String,
        trim: true,
        default: null
    },
    bloodGroup: {
        type: String,
        trim: true,
        default: null
    },
    maritalStatus: {
        type: String,
        enum: ['Single', 'Married', 'Divorced', 'Widowed', null],
        default: null
    },
    aadhaarNumber: {
        type: String,
        trim: true,
        default: null
    },
    panNumber: {
        type: String,
        trim: true,
        default: null
    },
    alternateNumber: {
        type: String,
        trim: true,
        default: null
    },
    personalEmail: {
        type: String,
        trim: true,
        lowercase: true,
        default: null
    },
    emergencyContactName: {
        type: String,
        trim: true,
        default: null
    },
    emergencyContactRelation: {
        type: String,
        trim: true,
        default: null
    },
    emergencyContactNumber: {
        type: String,
        trim: true,
        default: null
    },
    // Address
    addressLine1: { type: String, trim: true, default: null },
    addressLine2: { type: String, trim: true, default: null },
    landmark: { type: String, trim: true, default: null },
    city: { type: String, trim: true, default: null },
    state: { type: String, trim: true, default: null },
    pincode: { type: String, trim: true, default: null },
    
    bio: { type: String, trim: true, default: null },
    
    documents: [documentSchema],
    notes: [{
        text: String,
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }],
    permissions: [{ type: String }],
    
}, { timestamps: true });

staffProfileSchema.index({ societyId: 1 });
staffProfileSchema.index({ employeeId: 1 });

export default mongoose.model('StaffProfile', staffProfileSchema);
