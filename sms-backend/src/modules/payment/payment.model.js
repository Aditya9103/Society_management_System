import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        // Reference to the associated Society
        societyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Society',
            required: true,
        },
        // Reference to the associated Invoice
        invoiceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Invoice',
            required: true,
        },
        // Reference to the associated Resident
        residentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Resident',
            required: true,
        },
        // Amount
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        // Currency
        currency: {
            type: String,
            default: 'INR'
        },
        // Payment mode
        paymentMode: {
            type: String,
            enum: ['UPI', 'CARD', 'NET_BANKING', 'WALLET', 'NEFT_RTGS', 'CASH', 'CHEQUE'],
            required: true,
        },
        // Payment gateway
        paymentGateway: {
            type: String,
            enum: ['RAZORPAY', 'MANUAL', null],
            default: null,
        },
        // Reference to the associated Razorpay order
        razorpayOrderId: {
            type: String,
            default: null
        },
        // Reference to the associated Razorpay payment
        razorpayPaymentId: {
            type: String,
            unique: true,
            sparse: true
        },
        // Razorpay signature
        razorpaySignature: {
            type: String,
            default: null
        },
        // Status
        status: {
            type: String,
            enum: ['PENDING', 'PROCESSING', 'CAPTURED', 'FAILED', 'REFUNDED', 'CANCELLED'],
            default: 'PENDING',
        },
        // Paid at
        paidAt: {
            type: Date,
            default: null
        },
        // Receipt number
        receiptNumber: {
            type: String,
            unique: true,
            sparse: true
        },
        // Receipt url
        receiptUrl: {
            type: String,
            default: null
        },
        // Reference number
        referenceNumber: {
            type: String,
            default: null
        },
        // Cheque number
        chequeNumber: {
            type: String,
            default: null
        },
        // Cheque date
        chequeDate: {
            type: Date,
            default: null
        },
        // Bank name
        bankName: {
            type: String,
            default: null
        },
        // Notes
        notes: {
            type: String,
            default: null
        },
        // Recorded by
        recordedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    { timestamps: true }
);

paymentSchema.index({ societyId: 1 });
paymentSchema.index({ invoiceId: 1 });
paymentSchema.index({ residentId: 1 });
paymentSchema.index({ status: 1 });

export default mongoose.model('Payment', paymentSchema);
