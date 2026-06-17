import mongoose from "mongoose";

const complaintCommentSchema = new mongoose.Schema(
    {
        // Reference to the associated Complaint
        complaintId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Complaint',
            required: true,
        },
        // Reference to the associated Author
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // Comment text
        commentText: {
            type: String,
            required: true
        },
        // Attachments
        attachments: {
            type: [String],
            default: []
        },
        // Indicates whether internal is true or false
        isInternal: {
            type: Boolean,
            default: false
        },
        // Status changed from
        statusChangedFrom: {
            type: String,
            enum: [
                'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED',
                'CLOSED', 'ESCALATED', 'REJECTED', 'REOPENED', null,
            ],
            default: null,
        },
        // Status changed to
        statusChangedTo: {
            type: String,
            enum: [
                'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED',
                'CLOSED', 'ESCALATED', 'REJECTED', 'REOPENED', null,
            ],
            default: null,
        },
    },
    { timestamps: true }
);

complaintCommentSchema.index({ complaintId: 1 });
complaintCommentSchema.index({ complaintId: 1, createdAt: -1 });

export default mongoose.model('ComplaintComment', complaintCommentSchema);
