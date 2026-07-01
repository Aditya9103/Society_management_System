import mongoose from 'mongoose';

const documentApprovalSchema = new mongoose.Schema(
    {
        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Document',
            required: true,
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['APPROVED', 'REJECTED', 'REQUEST_CHANGES'],
            required: true,
        },
        remarks: {
            type: String,
            default: null,
        },
        approvedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

documentApprovalSchema.index({ documentId: 1 });

export default mongoose.model('DocumentApproval', documentApprovalSchema);
