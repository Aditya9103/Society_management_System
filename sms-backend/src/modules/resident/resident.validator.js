import Joi from 'joi';

export const completeProfileSchema = {
    body: Joi.object({
        unitId: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'unitId must be a valid MongoDB ObjectId',
                'any.required': 'unitId is required',
            }),
            
        ownershipType: Joi.string()
            .valid('OWNER', 'TENANT')
            .required(),
            
        aadhaarUrl: Joi.string().uri().optional().allow(null, ''),
        agreementUrl: Joi.string().uri().optional().allow(null, ''),
    }),
};

export const addDomesticStaffSchema = {
    body: Joi.object({
        name: Joi.string().trim().required(),
        role: Joi.string().valid('MAID', 'COOK', 'DRIVER', 'GARDENER', 'NANNY', 'OTHER').required(),
        phone: Joi.string().allow(null, '').optional(),
        aadhaarNumber: Joi.string().allow(null, '').optional(),
        photoUrl: Joi.string().allow(null, '').optional(),
        allowedDays: Joi.array().items(Joi.number().min(0).max(6)).optional(),
        allowedStartTime: Joi.string().optional(),
        allowedEndTime: Joi.string().optional(),
    }),
};

export const updateDomesticStaffSchema = {
    body: Joi.object({
        name: Joi.string().trim().optional(),
        role: Joi.string().valid('MAID', 'COOK', 'DRIVER', 'GARDENER', 'NANNY', 'OTHER').optional(),
        phone: Joi.string().allow(null, '').optional(),
        aadhaarNumber: Joi.string().allow(null, '').optional(),
        photoUrl: Joi.string().allow(null, '').optional(),
        allowedDays: Joi.array().items(Joi.number().min(0).max(6)).optional(),
        allowedStartTime: Joi.string().optional(),
        allowedEndTime: Joi.string().optional(),
        isActive: Joi.boolean().optional(),
    }),
};
