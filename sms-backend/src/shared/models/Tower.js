import mongoose from "mongoose";

const towerSchema = new mongoose.Schema(
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
        // Code
        code: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        },
        // Total floors
        totalFloors: {
            type: Number,
            required: true,
            min: 1
        },
        // Indicates if it has basement
        hasBasement: {
            type: Boolean,
            default: false
        },
        // Basement levels
        basementLevels: {
            type: Number,
            default: 0
        },
        // Total units
        totalUnits: {
            type: Number,
            default: 0
        },
        // Amenities
        amenities: {
            type: [String],
            default: []
        },
        // Indicates whether active is true or false
        isActive: {
            type: Boolean,
            default: true
        },
    },
    { timestamps: true }
);

towerSchema.index({ societyId: 1 });
towerSchema.index({ societyId: 1, code: 1 }, { unique: true });

export default mongoose.model('Tower', towerSchema);
