import Joi from 'joi';

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('Must be a valid MongoDB ObjectId');

// ── Raise Complaint ───────────────────────────────────────────────────────────

export const raiseComplaintSchema = {
    body: Joi.object({
        title: Joi.string().max(150).required(),
        description: Joi.string().required(),
        category: Joi.string()
            .valid(
                'ELECTRICAL', 'PLUMBING', 'SECURITY', 'HOUSEKEEPING', 'LIFT_ELEVATOR',
                'PARKING', 'GARDEN_LANDSCAPE', 'STRUCTURAL', 'NOISE_NUISANCE', 'AMENITY', 'ADMINISTRATIVE', 'OTHER'
            )
            .required(),
        subcategory: Joi.string().optional().allow(null, ''),
        priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').default('MEDIUM'),
        isCommonArea: Joi.boolean().default(false),
        commonAreaLocation: Joi.string().optional().allow(null, ''),
        images: Joi.array().items(Joi.string().uri()).optional(),
        status: Joi.string().valid('DRAFT', 'OPEN').default('OPEN'),
    }),
};

// ── Assign Complaint ──────────────────────────────────────────────────────────

export const assignComplaintSchema = {
    body: Joi.object({
        assignedTo: objectId.required(),
    }),
};

// ── Change Status ───────────────────────────────────────────────────────────

export const changeStatusSchema = {
    body: Joi.object({
        status: Joi.string().valid(
            'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_RESIDENT',
            'RESOLVED', 'CLOSED', 'REOPENED', 'REJECTED'
        ).required(),
        notes: Joi.string().optional().allow(''),
        assignedTo: objectId.optional(),
    }),
};
