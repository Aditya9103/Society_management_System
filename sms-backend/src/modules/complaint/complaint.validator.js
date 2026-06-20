import Joi from 'joi';

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('Must be a valid MongoDB ObjectId');

// ── Raise Complaint ───────────────────────────────────────────────────────────

export const raiseComplaintSchema = {
    body: Joi.object({
        title: Joi.string().max(150).required(),
        description: Joi.string().required(),
        category: Joi.string()
            .valid('PLUMBING', 'ELECTRICAL', 'CIVIL', 'SECURITY', 'CLEANING', 'LIFT',
                'PARKING', 'NOISE', 'PEST_CONTROL', 'LANDSCAPING', 'INTERNET', 'GAS', 'ADMIN', 'OTHER')
            .required(),
        subcategory: Joi.string().optional().allow(null, ''),
        priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').default('MEDIUM'),
        isCommonArea: Joi.boolean().default(false),
        commonAreaLocation: Joi.string().optional().allow(null, ''),
        images: Joi.array().items(Joi.string().uri()).optional(),
    }),
};

// ── Assign Complaint ──────────────────────────────────────────────────────────

export const assignComplaintSchema = {
    body: Joi.object({
        assignedTo: objectId.required(),
    }),
};

// ── Close Complaint ───────────────────────────────────────────────────────────

export const closeComplaintSchema = {
    body: Joi.object({
        resolutionNotes: Joi.string().optional().allow(''),
    }),
};
