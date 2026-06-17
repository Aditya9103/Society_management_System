import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
    {
        // Reference to the associated Society
        societyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Society',
            required: true,
        },
        // Reference to the associated Resident
        residentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Resident',
            required: true,
        },
        // Reference to the associated Unit
        unitId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Unit',
            required: true,
        },
        // Vehicle number
        vehicleNumber: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },
        // Vehicle type
        vehicleType: {
            type: String,
            enum: ['TWO_WHEELER', 'FOUR_WHEELER', 'HEAVY_VEHICLE'],
            required: true,
        },
        // Vehicle category
        vehicleCategory: {
            type: String,
            enum: ['PERSONAL', 'COMMERCIAL'],
            default: 'PERSONAL',
        },
        // Make
        make: {
            type: String,
            trim: true,
            default: null
        },
        // Model
        model: {
            type: String,
            trim: true,
            default: null
        },
        // Color
        color: {
            type: String,
            trim: true,
            default: null
        },
        // Year of manufacture
        yearOfManufacture: {
            type: Number,
            default: null
        },
        // Registration state
        registrationState: {
            type: String,
            default: null
        },
        // Rc photo url
        rcPhotoUrl: {
            type: String,
            default: null
        },
        // Insurance expiry
        insuranceExpiry: {
            type: Date,
            default: null
        },
        // Reference to the associated Parking slot
        parkingSlotId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ParkingSlot',
            default: null,
        },
        // Indicates whether primary is true or false
        isPrimary: {
            type: Boolean,
            default: false
        },
        // Rfid tag
        rfidTag: {
            type: String,
            unique: true,
            sparse: true
        },
        // Indicates whether active is true or false
        isActive: {
            type: Boolean,
            default: true
        },
    },
    { timestamps: true }
);

vehicleSchema.index({ societyId: 1 });
vehicleSchema.index({ residentId: 1 });
vehicleSchema.index({ societyId: 1, vehicleNumber: 1 }, { unique: true });

export default mongoose.model('Vehicle', vehicleSchema);
