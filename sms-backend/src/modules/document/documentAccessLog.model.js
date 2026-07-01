import mongoose from 'mongoose';

const documentAccessLogSchema = new mongoose.Schema(
    {
        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Document',
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        action: {
            type: String,
            enum: ['VIEWED', 'DOWNLOADED', 'SHARED', 'PRINTED', 'DELETED', 'RESTORED'],
            required: true,
        },
        ipAddress: {
            type: String,
            default: null,
        },
        deviceInfo: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

documentAccessLogSchema.index({ documentId: 1, action: 1 });
documentAccessLogSchema.index({ userId: 1 });

export default mongoose.model('DocumentAccessLog', documentAccessLogSchema);
