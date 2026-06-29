import mongoose from "mongoose";

const vehicleLogSchema = new mongoose.Schema(
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
            default: null,
        },
        // Vehicle number
        vehicleNumber: {
            type: String,
            required: true,
            uppercase: true
        },
        // Entry type
        entryType: {
            type: String,
            enum: ['REGISTERED_RESIDENT', 'VISITOR', 'DELIVERY', 'UNKNOWN'],
            required: true,
        },
        // Entry time
        entryTime: {
            type: Date,
            default: null
        },
        // Exit time
        exitTime: {
            type: Date,
            default: null
        },
        // Reference to the associated Gate
        gateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Gate',
            default: null,
        },
        // Status of log
        status: {
            type: String,
            enum: ['ENTRY', 'EXIT'],
            default: 'ENTRY',
        },
        // Duration spent inside (in minutes)
        durationMinutes: {
            type: Number,
            default: null
        },
        // Reference to the associated Guard
        guardId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        // Purpose
        purpose: {
            type: String,
            default: null
        },
        // Photo url
        photoUrl: {
            type: String,
            default: null
        },
    },
    { timestamps: true }
);

vehicleLogSchema.index({ societyId: 1, entryTime: -1 });
vehicleLogSchema.index({ vehicleNumber: 1 });

export default mongoose.model('VehicleLog', vehicleLogSchema);
