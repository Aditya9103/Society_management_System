import mongoose from "mongoose";

const targetAudienceSchema = new mongoose.Schema(
    {
        // Type
        type: {
            type: String,
            enum: ['ALL', 'TOWER', 'FLOOR', 'UNIT_TYPE', 'OWNERS', 'TENANTS', 'CUSTOM', 'DEFAULTERS'],
            default: 'ALL',
        },
        // Tower ids
        towerIds: {
            type: [mongoose.Schema.Types.ObjectId],
            default: []
        },
        // Floor ids
        floorIds: {
            type: [mongoose.Schema.Types.ObjectId],
            default: []
        },
        // Resident ids
        residentIds: {
            type: [mongoose.Schema.Types.ObjectId],
            default: []
        },
        // Unit type
        unitType: {
            type: String,
            enum: ['RESIDENTIAL', 'COMMERCIAL', null],
            default: null,
        },
    },
    { _id: false }
);

const noticeSchema = new mongoose.Schema(
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
            trim: true,
            maxlength: 150
        },
        // Content
        content: {
            type: String,
            required: true
        },
        // Notice type
        noticeType: {
            type: String,
            enum: ['GENERAL', 'MAINTENANCE', 'FINANCIAL', 'EMERGENCY', 'EVENT', 'LEGAL', 'PARKING', 'MEETING'],
            required: true,
        },
        // Priority
        priority: {
            type: String,
            enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
            default: 'NORMAL',
        },
        // Target audience
        targetAudience: { type: targetAudienceSchema, default: () => ({ type: 'ALL' }) },
        // Attachment urls
        attachmentUrls: {
            type: [String],
            default: []
        },
        // Scheduled at
        scheduledAt: {
            type: Date,
            default: null
        },
        // Published at
        publishedAt: {
            type: Date,
            default: null
        },
        // Expires at
        expiresAt: {
            type: Date,
            default: null
        },
        // Indicates whether pinned is true or false
        isPinned: {
            type: Boolean,
            default: false
        },
        // Requires acknowledgement
        requiresAcknowledgement: {
            type: Boolean,
            default: false
        },
        // Delivery channels
        deliveryChannels: {
            type: [String],
            enum: ['PUSH', 'EMAIL', 'SMS', 'WHATSAPP', 'IN_APP'],
            default: ['PUSH', 'IN_APP'],
        },
        // Sent to count
        sentToCount: {
            type: Number,
            default: 0
        },
        // Acknowledged count
        acknowledgedCount: {
            type: Number,
            default: 0
        },
        // Status
        status: {
            type: String,
            enum: ['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'],
            default: 'DRAFT',
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

noticeSchema.index({ societyId: 1 });
noticeSchema.index({ societyId: 1, status: 1 });
noticeSchema.index({ publishedAt: -1 });
noticeSchema.index({ scheduledAt: 1, status: 1 });

export default mongoose.model('Notice', noticeSchema);
