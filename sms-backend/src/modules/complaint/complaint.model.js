import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
    {
        // Reference to the associated Society
        societyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Society',
            required: true,
        },
        // Complaint number
        complaintNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        // Title
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },
        // Description
        description: {
            type: String,
            required: true
        },
        // Category
        category: {
            type: String,
            enum: [
                'ELECTRICAL',
                'PLUMBING',
                'SECURITY',
                'HOUSEKEEPING',
                'LIFT_ELEVATOR',
                'PARKING',
                'GARDEN_LANDSCAPE',
                'STRUCTURAL',
                'NOISE_NUISANCE',
                'AMENITY',
                'ADMINISTRATIVE',
                'OTHER'
            ],
            required: true,
        },
        // Custom Category
        customCategory: {
            type: String,
            default: null
        },
        // Subcategory
        subcategory: {
            type: String,
            default: null
        },
        // Priority
        priority: {
            type: String,
            enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
            default: 'MEDIUM',
        },
        // Reference to the associated Unit
        unitId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Unit',
            default: null,
        },
        // Indicates whether common area is true or false
        isCommonArea: {
            type: Boolean,
            default: false
        },
        // Common area location
        commonAreaLocation: {
            type: String,
            default: null
        },
        // Raised by
        raisedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Resident',
            required: true,
        },
        // Assigned to
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        // Reference to the associated Vendor
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        // Status
        status: {
            type: String,
            enum: [
                'DRAFT',
                'OPEN',
                'ASSIGNED',
                'IN_PROGRESS',
                'PENDING_RESIDENT',
                'RESOLVED',
                'CLOSED',
                'ESCALATED',
                'REJECTED',
                'REOPENED',
            ],
            default: 'OPEN',
        },
        // Images
        images: {
            type: [String],
            default: []
        },
        // Video url
        videoUrl: {
            type: String,
            default: null
        },
        // Expected resolution date
        expectedResolutionDate: {
            type: Date,
            default: null
        },
        // Resolved at (for SLA tracking and auto-close)
        resolvedAt: {
            type: Date,
            default: null
        },
        // Actual resolution date
        actualResolutionDate: {
            type: Date,
            default: null
        },
        // Resolution notes
        resolutionNotes: {
            type: String,
            default: null
        },
        // Latest note/comment
        latestNote: {
            type: String,
            default: null
        },
        // Resident rating
        residentRating: {
            type: Number,
            min: 1,
            max: 5,
            default: null
        },
        // Resident feedback
        residentFeedback: {
            type: String,
            default: null
        },
        // Rated at
        ratedAt: {
            type: Date,
            default: null
        },
        // Estimated cost
        estimatedCost: {
            type: Number,
            default: null
        },
        // Actual cost
        actualCost: {
            type: Number,
            default: null
        },
        // Indicates whether escalated is true or false
        isEscalated: {
            type: Boolean,
            default: false
        },
        // Escalation reason
        escalationReason: {
            type: String,
            default: null
        },
        // Escalated at
        escalatedAt: {
            type: Date,
            default: null
        },
        // Sla breached
        slaBreached: {
            type: Boolean,
            default: false
        },
        // Sla breached at
        slaBreachedAt: {
            type: Date,
            default: null
        },
        // First response at
        firstResponseAt: {
            type: Date,
            default: null
        },
    },
    { timestamps: true }
);

complaintSchema.index({ societyId: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ raisedBy: 1 });
complaintSchema.index({ assignedTo: 1 });
complaintSchema.index({ societyId: 1, status: 1 });
complaintSchema.index({ societyId: 1, createdAt: -1 });
complaintSchema.index({ slaBreached: 1, status: 1 });

export default mongoose.model('Complaint', complaintSchema);
