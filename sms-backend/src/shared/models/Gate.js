import mongoose from 'mongoose';

const gateSchema = new mongoose.Schema(
    {
        // Reference to the associated Society
        societyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Society',
            required: true,
        },
        // Name
        name: {
            type: String,
            required: true,
            trim: true
        },
        // Gate type
        gateType: {
            type: String,
            enum: ['MAIN', 'BACK', 'EMERGENCY', 'SERVICE', 'PEDESTRIAN'],
            default: 'MAIN',
        },
        // Indicates whether active is true or false
        isActive: {
            type: Boolean,
            default: true
        },
    },
    { timestamps: true }
);

gateSchema.index({ societyId: 1 });

export const Gate = mongoose.model('Gate', gateSchema);
