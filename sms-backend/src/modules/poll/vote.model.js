import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
    {
        // Reference to the associated Poll
        pollId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Poll',
            required: true,
        },
        // Reference to the associated Voter
        voterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Resident',
            required: true,
        },
        // Option ids
        optionIds: {
            type: [String],
            required: true
        },
        // Voted at
        votedAt: {
            type: Date,
            default: Date.now
        },
    },
    { timestamps: false }
);

voteSchema.index({ pollId: 1, voterId: 1 }, { unique: true });
voteSchema.index({ pollId: 1 });

export default mongoose.model('Vote', voteSchema);
