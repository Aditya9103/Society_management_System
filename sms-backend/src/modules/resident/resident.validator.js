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
        customRole: Joi.string().optional().allow(null, ''),
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
        customRole: Joi.string().optional().allow(null, ''),
        phone: Joi.string().allow(null, '').optional(),
        aadhaarNumber: Joi.string().allow(null, '').optional(),
        photoUrl: Joi.string().allow(null, '').optional(),
        allowedDays: Joi.array().items(Joi.number().min(0).max(6)).optional(),
        allowedStartTime: Joi.string().optional(),
        allowedEndTime: Joi.string().optional(),
        isActive: Joi.boolean().optional(),
    }),
};

export const addEmergencyContactSchema = {
    body: Joi.object({
        name: Joi.string().trim().required(),
        relation: Joi.string().required(),
        phone: Joi.string().required(),
        email: Joi.string().email().allow(null, '').optional()
    }),
};

export const updateEmergencyContactSchema = {
    body: Joi.object({
        name: Joi.string().trim().optional(),
        relation: Joi.string().optional(),
        phone: Joi.string().optional(),
        email: Joi.string().email().allow(null, '').optional()
    }),
};
