/**
 * society.validator.js — Joi validation schemas for the Society module.
 */

import Joi from 'joi';
import { ROLES } from '../../config/constants.js';

// ── Helpers ────────────────────────────────────────────────────────────────────
const mongoId = Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({ 'string.pattern.base': '{{#label}} must be a valid MongoDB ObjectId' });

// ── Staff ─────────────────────────────────────────────────────────────────────

export const createStaffSchema = {
    body: Joi.object({
        firstName: Joi.string().trim().max(50).required(),
        lastName: Joi.string().trim().max(50).required(),
        email: Joi.string().email().lowercase().trim().required(),
        phone: Joi.string().trim().required(),
        role: Joi.string()
            .valid(
                ROLES.COMMITTEE_MEMBER,
                ROLES.ACCOUNTANT,
                ROLES.FACILITY_MANAGER,
                ROLES.HELP_DESK,
                ROLES.SECURITY_GUARD,
            )
            .required(),
    }),
};

// ── Resident Approval / Rejection ─────────────────────────────────────────────

export const approveResidentSchema = {
    params: Joi.object({
        id: mongoId.required(),
    }),
    body: Joi.object({
        adminComments: Joi.string().trim().optional().allow(null, ''),
    }),
};

export const rejectResidentSchema = {
    params: Joi.object({
        id: mongoId.required(),
    }),
    body: Joi.object({
        reason: Joi.string().trim().max(500).required()
            .messages({ 'any.required': 'Rejection reason is required' }),
    }),
};

// ── Society Profile & Settings ─────────────────────────────────────────────────

const emergencyContactSchema = Joi.object({
    name: Joi.string().trim().max(100).required(),
    phone: Joi.string().trim().required(),
    type: Joi.string()
        .valid('POLICE', 'FIRE', 'AMBULANCE', 'HOSPITAL', 'SECURITY_AGENCY', 'OTHER')
        .required(),
});

export const updateSocietySchema = {
    body: Joi.object({
        // Profile fields
        name: Joi.string().trim().max(150),
        addressLine1: Joi.string().trim(),
        addressLine2: Joi.string().trim().allow(''),
        city: Joi.string().trim(),
        state: Joi.string().trim(),
        country: Joi.string().trim(),
        pincode: Joi.string().pattern(/^\d{6}$/).messages({ 'string.pattern.base': 'Pincode must be 6 digits' }),
        contactEmail: Joi.string().email().lowercase().trim(),
        contactPhone: Joi.string().trim(),
        establishmentYear: Joi.number().integer().min(1800).max(new Date().getFullYear()),
        registrationNumber: Joi.string().trim().allow(null, ''),
        latitude: Joi.number().min(-90).max(90).allow(null),
        longitude: Joi.number().min(-180).max(180).allow(null),

        // Settings
        settings: Joi.object({
            billingDate: Joi.number().integer().min(1).max(28),
            gracePeriodDays: Joi.number().integer().min(0),
            lateFeePercentage: Joi.number().min(0),
            lateFeeType: Joi.string().valid('PERCENTAGE', 'FIXED'),
            lateFeeFixedAmount: Joi.number().min(0),
            visitorApprovalMode: Joi.string().valid('REQUIRED', 'AUTO_ALLOW'),
            visitorApprovalTimeoutMinutes: Joi.number().integer().min(1),
            allowResidentDirectoryView: Joi.boolean(),
            maxVehiclesPerUnit: Joi.number().integer().min(0),
            maintenanceTaxPercentage: Joi.number().min(0).max(100),
            currency: Joi.string().trim().uppercase().length(3),
            timezone: Joi.string().trim(),
            reminderDaysBeforeDue: Joi.array().items(Joi.number().integer().min(1)),
            reminderDaysAfterDue: Joi.array().items(Joi.number().integer().min(1)),
            slaHours: Joi.object({
                LOW: Joi.number().integer().min(1),
                MEDIUM: Joi.number().integer().min(1),
                HIGH: Joi.number().integer().min(1),
                URGENT: Joi.number().integer().min(1),
            }),
        }),

        // Emergency Contacts
        emergencyContacts: Joi.array().items(emergencyContactSchema).max(20),
    }).min(1),
};

// ── Tower ──────────────────────────────────────────────────────────────────────

export const createTowerSchema = {
    body: Joi.object({
        name: Joi.string().trim().max(100).required(),
        code: Joi.string().trim().uppercase().max(10).required(),
        totalFloors: Joi.number().integer().min(1).required(),
        hasBasement: Joi.boolean().default(false),
        basementLevels: Joi.number().integer().min(0).default(0),
        amenities: Joi.array().items(Joi.string().trim()).default([]),
        autoCreateFloors: Joi.boolean().default(true),
    }),
};

export const updateTowerSchema = {
    params: Joi.object({ id: mongoId.required() }),
    body: Joi.object({
        name: Joi.string().trim().max(100),
        amenities: Joi.array().items(Joi.string().trim()),
        isActive: Joi.boolean(),
    }).min(1),
};

// ── Floor ──────────────────────────────────────────────────────────────────────

export const createFloorSchema = {
    params: Joi.object({ towerId: mongoId.required() }),
    body: Joi.object({
        floorNumber: Joi.number().integer().required(),
        floorName: Joi.string().trim().max(50).required(),
    }),
};

export const updateFloorSchema = {
    params: Joi.object({ towerId: mongoId.required(), floorId: mongoId.required() }),
    body: Joi.object({
        floorName: Joi.string().trim().max(50).optional(),
        isActive: Joi.boolean().optional()
    })
}

// ── Unit ───────────────────────────────────────────────────────────────────────

export const createUnitSchema = {
    body: Joi.object({
        towerId: mongoId.required(),
        floorId: mongoId.required(),
        unitNumber: Joi.string().trim().max(20).required(),
        unitType: Joi.string().valid('RESIDENTIAL', 'COMMERCIAL', 'SHOP', 'OFFICE').default('RESIDENTIAL'),
        bhkType: Joi.string().valid('1RK', '1BHK', '2BHK', '3BHK', '4BHK', '5BHK', 'VILLA', 'DUPLEX', 'PENTHOUSE').allow(null),
        carpetAreaSqft: Joi.number().min(0).default(0),
        builtUpAreaSqft: Joi.number().min(0).default(0),
        superBuiltUpSqft: Joi.number().min(0).default(0),
        maintenanceAmount: Joi.number().min(0).default(0),
        parkingSlots: Joi.number().integer().min(0).default(0),
    }),
};

export const updateUnitSchema = {
    params: Joi.object({ id: mongoId.required() }),
    body: Joi.object({
        unitType: Joi.string().valid('RESIDENTIAL', 'COMMERCIAL', 'SHOP', 'OFFICE'),
        bhkType: Joi.string().valid('1RK', '1BHK', '2BHK', '3BHK', '4BHK', '5BHK', 'VILLA', 'DUPLEX', 'PENTHOUSE').allow(null),
        carpetAreaSqft: Joi.number().min(0),
        builtUpAreaSqft: Joi.number().min(0),
        superBuiltUpSqft: Joi.number().min(0),
        maintenanceAmount: Joi.number().min(0),
        parkingSlots: Joi.number().integer().min(0),
        ownershipStatus: Joi.string().valid('VACANT', 'OWNER_OCCUPIED', 'RENTED'),
        isActive: Joi.boolean(),
    }).min(1),
};

// ── Query ──────────────────────────────────────────────────────────────────────

export const listQuerySchema = {
    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20),
        search: Joi.string().trim().allow(''),
        status: Joi.string().allow(''),
    }),
};
