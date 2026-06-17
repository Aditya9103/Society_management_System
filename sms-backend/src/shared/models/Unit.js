import mongoose from "mongoose";

const unitSchema = new mongoose.Schema(
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
        // Reference to the associated Floor
        floorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Floor',
            required: true,
        },
        // Unit number
        unitNumber: {
            type: String,
            required: true,
            trim: true
        },
        // Unit type
        unitType: {
            type: String,
            enum: ['RESIDENTIAL', 'COMMERCIAL', 'SHOP', 'OFFICE'],
            default: 'RESIDENTIAL',
        },
        // Bhk type
        bhkType: {
            type: String,
            enum: ['1RK', '1BHK', '2BHK', '3BHK', '4BHK', '5BHK', 'VILLA', 'DUPLEX', 'PENTHOUSE', null],
            default: null,
        },
        // Carpet area sqft
        carpetAreaSqft: {
            type: Number,
            default: 0
        },
        // Built up area sqft
        builtUpAreaSqft: {
            type: Number,
            default: 0
        },
        // Super built up sqft
        superBuiltUpSqft: {
            type: Number,
            default: 0
        },
        // Parking slots
        parkingSlots: {
            type: Number,
            default: 0
        },
        // Indicates whether occupied is true or false
        isOccupied: {
            type: Boolean,
            default: false
        },
        // Indicates whether for rent is true or false
        isForRent: {
            type: Boolean,
            default: false
        },
        // Ownership status
        ownershipStatus: {
            type: String,
            enum: ['VACANT', 'OWNER_OCCUPIED', 'RENTED'],
            default: 'VACANT',
        },
        // Maintenance amount
        maintenanceAmount: {
            type: Number,
            default: 0
        },
        // Indicates whether active is true or false
        isActive: {
            type: Boolean,
            default: true
        },
    },
    { timestamps: true }
);

unitSchema.index({ societyId: 1 });
unitSchema.index({ towerId: 1 });
unitSchema.index({ floorId: 1 });
unitSchema.index({ towerId: 1, unitNumber: 1 }, { unique: true });

export default mongoose.model('Unit', unitSchema);
