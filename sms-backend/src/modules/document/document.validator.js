import Joi from 'joi';

export const uploadDocumentSchema = Joi.object({
    title: Joi.string().required().trim(),
    description: Joi.string().allow('', null).optional(),
    category: Joi.string().valid('IDENTITY', 'RESIDENTIAL', 'VEHICLE', 'SOCIETY', 'MAINTENANCE', 'LEGAL', 'OTHER').required(),
    documentType: Joi.string().valid(
        'AADHAAR', 'PAN', 'PASSPORT', 'DRIVING_LICENSE', 'VOTER_ID',
        'RENT_AGREEMENT', 'SALE_DEED', 'NOC', 'SOCIETY_BYLAW', 'MEETING_MINUTES',
        'AUDIT_REPORT', 'MAINTENANCE_NOTICE', 'INSURANCE', 'RC_BOOK', 'EMISSION_CERTIFICATE',
        'VENDOR_CONTRACT', 'VENDOR_INVOICE', 'AMC', 'SERVICE_REPORT', 'WARRANTY_CARD',
        'COURT_ORDER', 'LEGAL_NOTICE', 'DISPUTE_RESOLUTION', 'OTHER'
    ).required(),
    customDocumentType: Joi.string().when('documentType', {
        is: 'OTHER',
        then: Joi.required(),
        otherwise: Joi.allow(null, '').optional()
    }),
    ownerType: Joi.string().valid('RESIDENT', 'SOCIETY', 'UNIT', 'STAFF').required(),
    ownerId: Joi.string().hex().length(24).allow(null).optional(), // Can be null for society level
    unitId: Joi.string().hex().length(24).allow(null).optional(),
    vehicleId: Joi.string().hex().length(24).allow(null).optional(),
    expiryDate: Joi.date().iso().allow(null).optional(),
    visibility: Joi.string().valid('PRIVATE', 'UNIT_SHARED', 'SOCIETY', 'MANAGEMENT', 'DEPARTMENT', 'PUBLIC').default('PRIVATE'),
    tags: Joi.array().items(Joi.string()).default([]),
});

export const updateDocumentSchema = Joi.object({
    title: Joi.string().trim().optional(),
    description: Joi.string().allow('', null).optional(),
    expiryDate: Joi.date().iso().allow(null).optional(),
    visibility: Joi.string().valid('PRIVATE', 'UNIT_SHARED', 'SOCIETY', 'MANAGEMENT', 'DEPARTMENT', 'PUBLIC').optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    changeLog: Joi.string().allow('', null).optional(), // for version bumps
});

export const approveDocumentSchema = Joi.object({
    status: Joi.string().valid('APPROVED', 'REJECTED', 'REQUEST_CHANGES').required(),
    remarks: Joi.string().allow('', null).optional(),
});
