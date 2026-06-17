import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
    {
        // Reference to the associated Society
        societyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Society',
            required: true,
        },
        // Category
        category: {
            type: String,
            enum: [
                'MAINTENANCE',
                'SALARY',
                'UTILITIES',
                'REPAIRS',
                'CLEANING',
                'SECURITY',
                'INSURANCE',
                'EVENTS',
                'ADMIN',
                'LEGAL',
                'OTHER',
            ],
            required: true,
        },
        // Amount
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        // Vendor name
        vendorName: {
            type: String,
            default: null
        },
        // Vendor phone
        vendorPhone: {
            type: String,
            default: null
        },
        // Description
        description: {
            type: String,
            required: true
        },
        // Expense date
        expenseDate: {
            type: Date,
            required: true
        },
        // Receipt url
        receiptUrl: {
            type: String,
            default: null
        },
        // Approved by
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        // Payment mode
        paymentMode: {
            type: String,
            enum: ['CASH', 'CHEQUE', 'NEFT_RTGS', 'UPI', 'CARD'],
            default: 'CASH',
        },
        // Reference number
        referenceNumber: {
            type: String,
            default: null
        },
        // Status
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED', 'PAID'],
            default: 'PENDING',
        },
        // Created by
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

expenseSchema.index({ societyId: 1, expenseDate: -1 });
expenseSchema.index({ societyId: 1, category: 1 });

export default mongoose.model('Expense', expenseSchema);
