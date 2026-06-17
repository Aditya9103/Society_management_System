import mongoose from "mongoose";

const noticeAcknowledgementSchema = new mongoose.Schema(
    {
        // Reference to the associated Notice
        noticeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Notice',
            required: true,
        },
        // Reference to the associated Resident
        residentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Resident',
            required: true,
        },
        // Acknowledged at
        acknowledgedAt: {
            type: Date,
            default: Date.now
        },
    },
    { timestamps: false }
);

noticeAcknowledgementSchema.index(
    { noticeId: 1, residentId: 1 },
    { unique: true }
);
noticeAcknowledgementSchema.index({ noticeId: 1 });

export default mongoose.model('NoticeAcknowledgement', noticeAcknowledgementSchema);
