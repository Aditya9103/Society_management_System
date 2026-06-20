import Joi from 'joi';

// ── Create Notice ─────────────────────────────────────────────────────────────

export const createNoticeSchema = {
    body: Joi.object({
        title: Joi.string().max(150).required(),
        content: Joi.string().required(),
        noticeType: Joi.string()
            .valid('GENERAL', 'MAINTENANCE', 'FINANCIAL', 'EMERGENCY', 'EVENT', 'LEGAL', 'PARKING', 'MEETING')
            .required(),
        priority: Joi.string().valid('LOW', 'NORMAL', 'HIGH', 'URGENT').default('NORMAL'),
        isPinned: Joi.boolean().default(false),
        scheduledAt: Joi.date().iso().optional().allow(null),
        expiresAt: Joi.date().iso().optional().allow(null),
        attachmentUrls: Joi.array().items(Joi.string().uri()).optional(),
        requiresAcknowledgement: Joi.boolean().default(false),
    }),
};
