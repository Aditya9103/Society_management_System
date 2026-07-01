import Joi from 'joi';

export const verifyIdCardSchema = {
    body: Joi.object({
        qrData: Joi.alternatives().try(
            Joi.string().required(),
            Joi.object().required()
        ).required().messages({
            'any.required': 'QR data is required'
        }),
    }),
};
