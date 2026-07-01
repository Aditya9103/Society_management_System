import mongoose from 'mongoose';

const idCardSchema = new mongoose.Schema(
    {
        residentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Resident',
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        societyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Society',
            required: true,
        },
        unitId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Unit',
            required: true,
        },
        idCardUrl: {
            type: String,
            required: false,
            default: null
        },
        storageKey: {
            type: String,
            required: false,
            default: null
        },
        validUntil: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'REVOKED', 'EXPIRED'],
            default: 'ACTIVE',
        },
    },
    { timestamps: true }
);

idCardSchema.index({ residentId: 1 });
idCardSchema.index({ userId: 1 });
idCardSchema.index({ societyId: 1 });

export default mongoose.model('IdCard', idCardSchema);
