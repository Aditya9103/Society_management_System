import mongoose from "mongoose";

const floorSchema = new mongoose.Schema(
    {
        // Reference to the associated Society
        societyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Society',
            required: true,
        },
        // Reference to the associated Tower
        towerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tower',
            required: true,
        },
        // Floor number
        floorNumber: {
            type: Number,
            required: true
        },
        // Floor name
        floorName: {
            type: String,
            required: true,
            trim: true
        },
        // Total units
        totalUnits: {
            type: Number,
            default: 0
        },
    },
    { timestamps: true }
);

floorSchema.index({ towerId: 1 });
floorSchema.index({ societyId: 1 });
floorSchema.index({ towerId: 1, floorNumber: 1 }, { unique: true });

export default mongoose.model('Floor', floorSchema);
