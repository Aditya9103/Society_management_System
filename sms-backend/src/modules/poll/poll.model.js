import mongoose from "mongoose";

const pollOptionSchema = new mongoose.Schema(
    {
        // Reference to the associated Option
        optionId: {
            type: String,
            required: true
        },
        // Text
        text: {
            type: String,
            required: true
        },
        // Vote count
        voteCount: {
            type: Number,
            default: 0
        },
        // Photo url
        photoUrl: {
            type: String,
            default: null
        },
        // Reference to the associated Nominee user
        nomineeUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        // Nominee statement
        nomineeStatement: {
            type: String,
            default: null
        },
    },
    { _id: false }
);

const pollSchema = new mongoose.Schema(
    {
        // Reference to the associated Society
        societyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Society',
            required: true,
        },
        // Title
        title: {
            type: String,
            required: true,
            trim: true
        },
        // Description
        description: {
            type: String,
            default: null
        },
        // Poll type
        pollType: {
            type: String,
            enum: [
                'GENERAL_SURVEY',
                'COMMITTEE_ELECTION',
                'BUDGET_APPROVAL',
                'RULE_CHANGE',
                'FACILITY_DECISION',
                'EVENT_PLANNING',
                'OTHER',
            ],
            required: true,
        },
        // Custom Poll type if OTHER
        customPollType: {
            type: String,
            default: null
        },
        // Voting method
        votingMethod: {
            type: String,
            enum: ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'RANKED_CHOICE'],
            default: 'SINGLE_CHOICE',
        },
        // Options
        options: {
            type: [pollOptionSchema],
            required: true
        },
        // Max choices
        maxChoices: {
            type: Number,
            default: 1
        },
        // Eligible voters
        eligibleVoters: {
            type: String,
            enum: ['ALL', 'OWNERS_ONLY', 'TENANTS_ONLY', 'COMMITTEE'],
            default: 'ALL',
        },
        // Start date
        startDate: {
            type: Date,
            required: true
        },
        // End date
        endDate: {
            type: Date,
            required: true
        },
        // Nomination start date
        nominationStartDate: {
            type: Date,
            default: null
        },
        // Nomination end date
        nominationEndDate: {
            type: Date,
            default: null
        },
        // Result visibility
        resultVisibility: {
            type: String,
            enum: ['REAL_TIME', 'AFTER_CLOSE', 'ADMIN_ONLY'],
            default: 'AFTER_CLOSE',
        },
        // Indicates whether anonymous is true or false
        isAnonymous: {
            type: Boolean,
            default: false
        },
        // Quorum percentage
        quorumPercentage: {
            type: Number,
            default: 0
        },
        // Status
        status: {
            type: String,
            enum: ['DRAFT', 'NOMINATION', 'ACTIVE', 'CLOSED', 'CANCELLED', 'RESULTS_PUBLISHED'],
            default: 'DRAFT',
        },
        // Total eligible
        totalEligible: {
            type: Number,
            default: 0
        },
        // Total votes
        totalVotes: {
            type: Number,
            default: 0
        },
        // Results
        results: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        // Reference to the associated Winner
        winnerId: {
            type: String,
            default: null
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

pollSchema.index({ societyId: 1 });
pollSchema.index({ societyId: 1, status: 1 });
pollSchema.index({ endDate: 1, status: 1 });

export default mongoose.model('Poll', pollSchema);
