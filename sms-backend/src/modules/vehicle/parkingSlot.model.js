import mongoose from "mongoose";

const parkingSlotSchema = new mongoose.Schema(
    {
        societyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Society',
            required: true,
        },
        slotNumber: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        },
        floor: {
            type: String,
            trim: true,
            default: 'Ground'
        },
        tower: {
            type: String,
            trim: true,
            default: null
        },
        type: {
            type: String,
            enum: ['RESIDENT', 'VISITOR', 'DISABLED', 'EV_CHARGING'],
            default: 'RESIDENT'
        },
        status: {
            type: String,
            enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED'],
            default: 'AVAILABLE'
        },
        assignedVehicleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vehicle',
            default: null
        },
        assignedResidentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Resident',
            default: null
        },
    },
    { timestamps: true }
);

parkingSlotSchema.index({ societyId: 1, slotNumber: 1 }, { unique: true });
parkingSlotSchema.index({ societyId: 1, status: 1 });

export default mongoose.model('ParkingSlot', parkingSlotSchema);
