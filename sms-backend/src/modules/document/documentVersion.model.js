import mongoose from 'mongoose';

const documentVersionSchema = new mongoose.Schema(
    {
        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Document',
            required: true,
        },
        version: {
            type: Number,
            required: true,
        },
        fileUrl: {
            type: String,
            required: true,
        },
        storageKey: {
            type: String,
            default: null,
        },
        fileSize: {
            type: Number,
            default: null,
        },
        mimeType: {
            type: String,
            default: null,
        },
        checksum: {
            type: String,
            default: null,
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        changeLog: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

documentVersionSchema.index({ documentId: 1, version: 1 }, { unique: true });

export default mongoose.model('DocumentVersion', documentVersionSchema);
