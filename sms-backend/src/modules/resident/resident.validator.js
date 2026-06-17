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
