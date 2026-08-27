import mongoose from "mongoose";

const violationSchema = new mongoose.Schema(
    {
        // Reference to the associated Society
        societyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Society',
            required: true,
        },
        // Reference to the associated Vehicle
        vehicleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vehicle',
            required: true,
        },
        // Reference to the associated Resident
        residentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Resident',
            required: true,
        },
        // Violation type
        type: {
            type: String,
            enum: ['WRONG_PARKING', 'SPEEDING', 'OVERNIGHT_PARKING', 'NO_STICKER', 'OTHER'],
            required: true,
        },
        description: {
            type: String,
            default: null
        },
        fineAmount: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            enum: ['PENDING', 'PAID', 'APPEALED', 'DISMISSED'],
            default: 'PENDING'
        },
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        photoUrl: {
            type: String,
            default: null
        },
    },
    { timestamps: true }
);

violationSchema.index({ societyId: 1, residentId: 1 });
violationSchema.index({ vehicleId: 1 });

export default mongoose.model('Violation', violationSchema);
