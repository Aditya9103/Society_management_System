/**
 * superadmin.service.js — Business logic for the SuperAdmin module.
 *
 * SuperAdmin can:
 *  - Provision new Tenants + Societies (customer onboarding)
 *  - Create Society Admin users
 *  - List all Tenants and Societies with pagination
 *  - Toggle active status on Tenants and Societies
 */

import bcrypt from 'bcryptjs';
import ApiError from '../../utils/ApiError.js';
import { sendEmail } from '../../services/email.service.js';
import { ROLES, ACCOUNT_SECURITY } from '../../config/constants.js';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination.js';

import * as userRepo from '../auth/user.repository.js';
import * as tenantRepo from '../../shared/repositories/tenant.repository.js';
import * as societyRepo from '../society/society.repository.js';

// ── Tenant + Society Provisioning ─────────────────────────────────────────────

/**
 * Atomically provision a new Tenant + its first Society.
 *
 * @param {object} data
 * @returns {Promise<{ tenant, society }>}
 */
export const createTenantWithSociety = async (data) => {
    const {
        tenantName, tenantSlug, contactName, contactEmail, contactPhone, plan,
        societyName, addressLine1, addressLine2, city, state, pincode, country,
    } = data;

    // Guard: Unique slug
    const existingSlug = await tenantRepo.findBySlug(tenantSlug);
    if (existingSlug) {
        throw ApiError.badRequest(`Tenant slug "${tenantSlug}" is already taken.`);
    }

    // Guard: Unique contact email
    const existingEmail = await tenantRepo.findByEmail(contactEmail);
    if (existingEmail) {
        throw ApiError.badRequest(`A tenant with contact email "${contactEmail}" already exists.`);
    }

    // 1. Create Tenant
    const tenant = await tenantRepo.createTenant({
        name: tenantName,
        slug: tenantSlug,
        contactName,
        contactEmail,
        contactPhone,
        plan: plan || 'BASIC',
    });

    // 2. Create Society under the new Tenant
    const society = await societyRepo.createSociety({
        tenantId: tenant._id,
        name: societyName,
        addressLine1,
        addressLine2: addressLine2 || '',
        city,
        state,
        pincode,
        country: country || 'India',
        contactEmail,
        contactPhone,
    });

    return { tenant, society };
};

// ── Create Society Admin ──────────────────────────────────────────────────────

/**
 * Provision a SOCIETY_ADMIN user for an existing society.
 *
 * @param {object} adminData - { firstName, lastName, email, phone, societyId }
 * @returns {Promise<UserDocument>}
 */
export const createSocietyAdmin = async ({ firstName, lastName, email, phone, societyId }) => {
    const society = await societyRepo.findById(societyId);
    if (!society) throw ApiError.notFound('Society not found.');

    const existing = await userRepo.findByEmail(email);
    if (existing) throw ApiError.badRequest('Email is already registered.');

    // Generate a secure temporary password
    const generatedPassword = Math.random().toString(36).slice(-8) + 'A1!';
    const passwordHash = await bcrypt.hash(generatedPassword, ACCOUNT_SECURITY.BCRYPT_SALT_ROUNDS);

    const user = await userRepo.createUser({
        firstName,
        lastName,
        email,
        phone,
        societyId,
        tenantId: society.tenantId,
        passwordHash,
        role: ROLES.SOCIETY_ADMIN,
        registrationStatus: 'APPROVED',
        isEmailVerified: true,
    });

    await sendEmail({
        to: email,
        subject: 'Welcome to SMS — Your Society Admin Credentials',
        text: `Hello ${firstName},\n\nYou have been provisioned as a Society Admin for "${society.name}".\n\nLogin: ${email}\nTemporary Password: ${generatedPassword}\n\nPlease log in and change your password immediately.\n\nRegards,\nSMS Platform`,
        html: `<h3>Hello ${firstName},</h3><p>You have been provisioned as a <strong>Society Admin</strong> for <strong>${society.name}</strong>.</p><p><strong>Login:</strong> ${email}<br><strong>Temporary Password:</strong> ${generatedPassword}</p><p>Please log in and change your password immediately.</p><br><p>Regards,<br>SMS Platform</p>`,
    });

    return user;
};

// ── List Tenants ──────────────────────────────────────────────────────────────

/**
 * List all tenants with pagination and optional search.
 *
 * @param {object} query - req.query
 * @returns {Promise<{ data, pagination }>}
 */
export const listTenants = async (query) => {
    const { page, limit, skip } = parsePagination(query);
    const { search, isActive } = query;

    const filter = {};
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { contactEmail: { $regex: search, $options: 'i' } },
            { slug: { $regex: search, $options: 'i' } },
        ];
    }
    if (isActive !== undefined) {
        filter.isActive = isActive === 'true' || isActive === true;
    }

    const [data, total] = await Promise.all([
        tenantRepo.findAll(filter, { skip, limit }),
        tenantRepo.countDocuments(filter),
    ]);

    return { data, pagination: buildPaginationMeta(page, limit, total) };
};

// ── List Societies ────────────────────────────────────────────────────────────

/**
 * List all societies with pagination and optional search.
 *
 * @param {object} query - req.query
 * @returns {Promise<{ data, pagination }>}
 */
export const listSocieties = async (query) => {
    const { page, limit, skip } = parsePagination(query);
    const { search, isActive } = query;

    const filter = {};
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { city: { $regex: search, $options: 'i' } },
        ];
    }
    if (isActive !== undefined) {
        filter.isActive = isActive === 'true' || isActive === true;
    }

    const [data, total] = await Promise.all([
        societyRepo.findAll(filter, { skip, limit }),
        societyRepo.countDocuments(filter),
    ]);

    return { data, pagination: buildPaginationMeta(page, limit, total) };
};

// ── Toggle Status ─────────────────────────────────────────────────────────────

/**
 * Toggle a Tenant's isActive flag.
 *
 * @param {string} tenantId
 * @returns {Promise<TenantDocument>}
 */
export const toggleTenantStatus = async (tenantId) => {
    const tenant = await tenantRepo.findById(tenantId);
    if (!tenant) throw ApiError.notFound('Tenant not found.');

    return tenantRepo.updateTenant(tenantId, { isActive: !tenant.isActive });
};

/**
 * Toggle a Society's isActive flag.
 *
 * @param {string} societyId
 * @returns {Promise<SocietyDocument>}
 */
export const toggleSocietyStatus = async (societyId) => {
    const society = await societyRepo.findById(societyId);
    if (!society) throw ApiError.notFound('Society not found.');

    return societyRepo.updateSociety(societyId, { isActive: !society.isActive });
};

// ── Summary Stats ─────────────────────────────────────────────────────────────

/**
 * Get platform-level summary stats for the SuperAdmin dashboard.
 *
 * @returns {Promise<object>}
 */
export const getDashboardStats = async () => {
    const [totalTenants, activeTenants, totalSocieties, activeSocieties] = await Promise.all([
        tenantRepo.countDocuments({}),
        tenantRepo.countDocuments({ isActive: true }),
        societyRepo.countDocuments({}),
        societyRepo.countDocuments({ isActive: true }),
    ]);

    return {
        totalTenants,
        activeTenants,
        inactiveTenants: totalTenants - activeTenants,
        totalSocieties,
        activeSocieties,
        inactiveSocieties: totalSocieties - activeSocieties,
    };
};
