import Joi from 'joi';

const mongoId = Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({ 'string.pattern.base': 'Invalid MongoDB ObjectId' });

export const triggerSOSSchema = {
    body: Joi.object({
        emergencyType: Joi.string()
            .valid(
                'MEDICAL',
                'FIRE',
                'SECURITY_BREACH',
                'NATURAL_DISASTER',
                'GAS_LEAK',
                'POWER_FAILURE',
                'WATER_CRISIS',
                'ACCIDENT',
                'THEFT',
                'PANIC',
                'OTHER'
            )
            .default('PANIC'),
        locationDescription: Joi.string().trim().max(500).optional(),
        latitude: Joi.number().min(-90).max(90).optional(),
        longitude: Joi.number().min(-180).max(180).optional(),
    }),
};

export const updateEmergencyStatusSchema = {
    params: Joi.object({
        id: mongoId.required(),
    }),
    body: Joi.object({
        status: Joi.string()
            .valid('ACTIVE', 'RESPONDING', 'RESOLVED', 'FALSE_ALARM')
            .required(),
        resolutionNotes: Joi.string().trim().max(1000).optional().allow('', null),
    }),
};

export const broadcastUpdateSchema = {
    body: Joi.object({
        message: Joi.string().trim().max(1000).required()
            .messages({ 'any.required': 'Broadcast message is required' }),
    }),
};