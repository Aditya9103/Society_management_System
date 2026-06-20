import Joi from 'joi';

// ── Create Visitor Pass ───────────────────────────────────────────────────────

export const createVisitorSchema = {
    body: Joi.object({
        visitorName: Joi.string().trim().required(),
        visitorPhone: Joi.string().optional().allow(null, ''),
        visitorType: Joi.string()
            .valid('GUEST', 'DELIVERY', 'SERVICE', 'DOMESTIC_STAFF', 'VENDOR', 'OFFICIAL', 'CONTRACTOR')
            .required(),
        purpose: Joi.string().optional().allow(null, ''),
        expectedArrival: Joi.date().iso().optional().allow(null),
        vehicleNumber: Joi.string().optional().allow(null, ''),
        vehicleType: Joi.string().valid('TWO_WHEELER', 'FOUR_WHEELER', 'AUTO', 'TEMPO').optional().allow(null),
        itemsCarrying: Joi.string().optional().allow(null, ''),
        notes: Joi.string().optional().allow(null, ''),
    }),
};
