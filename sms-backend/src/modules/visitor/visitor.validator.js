import Joi from 'joi';

// ── Create Visitor Pass ───────────────────────────────────────────────────────

export const createVisitorSchema = {
    body: Joi.object({
        visitorName: Joi.string().trim().required(),
        visitorEmail: Joi.string().email().optional().allow(null, ''),
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

// ── Guard Walk-In ────────────────────────────────────────────────────────────

export const guardWalkInSchema = {
    body: Joi.object({
        hostUnitId: Joi.string().required(),
        hostResidentId: Joi.string().optional().allow(null, ''),
        visitorName: Joi.string().trim().required(),
        visitorPhone: Joi.string().optional().allow(null, ''),
        visitorType: Joi.string()
            .valid('GUEST', 'DELIVERY', 'SERVICE', 'DOMESTIC_STAFF', 'VENDOR', 'OFFICIAL', 'CONTRACTOR')
            .required(),
        purpose: Joi.string().optional().allow(null, ''),
        vehicleNumber: Joi.string().optional().allow(null, ''),
    }),
};

// ── Scan QR ──────────────────────────────────────────────────────────────────

export const scanQrSchema = {
    body: Joi.object({
        qrCode: Joi.string().required()
    })
};
