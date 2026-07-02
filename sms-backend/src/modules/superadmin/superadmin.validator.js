/**
 * superadmin.validator.js — Joi validation schemas for SuperAdmin routes.
 */

import Joi from 'joi';

const mongoId = Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({ 'string.pattern.base': 'Must be a valid MongoDB ObjectId' });

// ── Create Society Admin ──────────────────────────────────────────────────────

export const createSocietyAdminSchema = {
    body: Joi.object({
        firstName: Joi.string().trim().max(50).required(),
        lastName: Joi.string().trim().max(50).required(),
        email: Joi.string().email().lowercase().trim().required(),
        phone: Joi.string().trim().required(),
        societyId: mongoId.required(),
    }),
};

// ── Create Tenant + Society (atomic provisioning) ─────────────────────────────

export const createTenantWithSocietySchema = {
    body: Joi.object({
        // Tenant fields
        tenantName: Joi.string().trim().max(100).required(),
        tenantSlug: Joi.string()
            .trim()
            .lowercase()
            .max(50)
            .regex(/^[a-z0-9-]+$/)
            .required()
            .messages({ 'string.pattern.base': 'Slug must be lowercase letters, numbers, or hyphens' }),
        contactName: Joi.string().trim().required(),
        contactEmail: Joi.string().email().lowercase().trim().required(),
        contactPhone: Joi.string().trim().required(),
        plan: Joi.string().valid('BASIC', 'STANDARD', 'ENTERPRISE').default('BASIC'),

        // Society fields
        societyName: Joi.string().trim().required(),
        addressLine1: Joi.string().trim().required(),
        addressLine2: Joi.string().trim().allow('').default(''),
        city: Joi.string().trim().required(),
        state: Joi.string().trim().required(),
        pincode: Joi.string().regex(/^\d{6}$/).required().messages({
            'string.pattern.base': 'Pincode must be exactly 6 digits',
        }),
        country: Joi.string().trim().default('India'),
    }),
};

// ── List query (shared by tenants + societies) ────────────────────────────────

export const listQuerySchema = {
    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20),
        search: Joi.string().trim().allow('').default(''),
        isActive: Joi.boolean().optional(),
        action: Joi.string().optional(),
    }),

};
