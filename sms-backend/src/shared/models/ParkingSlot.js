import mongoose from "mongoose";

const parkingSlotSchema = new mongoose.Schema(
    {
        // Reference to the associated Society
        societyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Society',
            required: true,
        },
        // Slot number
        slotNumber: {
            type: String,
            required: true,
            trim: true
        },
        // Slot type
        slotType: {
            type: String,
            enum: ['TWO_WHEELER', 'FOUR_WHEELER', 'HEAVY_VEHICLE'],
            required: true,
        },
        // Level
        level: {
            type: String,
            default: 'G'
        },
        // Reference to the associated Unit
        unitId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Unit',
            default: null,
        },
        // Indicates whether allocated is true or false
        isAllocated: {
            type: Boolean,
            default: false
        },
        // Indicates whether visitor slot is true or false
        isVisitorSlot: {
            type: Boolean,
            default: false
        },
    },
    { timestamps: true }
);

parkingSlotSchema.index({ societyId: 1 });
parkingSlotSchema.index({ societyId: 1, slotNumber: 1 }, { unique: true });

export default mongoose.model('ParkingSlot', parkingSlotSchema);
