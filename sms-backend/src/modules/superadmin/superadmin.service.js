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
import { uploadToCloudinary } from '../../middleware/upload.middleware.js';
import { sendEmail } from '../../services/email.service.js';
import { ROLES, ACCOUNT_SECURITY } from '../../config/constants.js';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination.js';

import * as userRepo from '../auth/user.repository.js';
import * as tenantRepo from '../../shared/repositories/tenant.repository.js';
import * as societyRepo from '../society/society.repository.js';
import AuditLog from '../../shared/models/AuditLog.js';

// ── Audit Logging Helper ──────────────────────────────────────────────────────

const logAudit = async (action, entityType, entityId, performedBy, ipAddress, details = {}) => {
    try {
        await AuditLog.create({
            action,
            entityType,
            entityId,
            performedBy,
            ipAddress,
            details
        });
    } catch (error) {
        console.error('AuditLog Error:', error);
    }
};

// ── Tenant + Society Provisioning ─────────────────────────────────────────────

/**
 * Atomically provision a new Tenant + its first Society.
 *
 * @param {object} data
 * @param {string} adminId
 * @param {string} ipAddress
 * @returns {Promise<{ tenant, society }>}
 */
export const createTenantWithSociety = async (data, adminId, ipAddress) => {
    const {
        tenantName, tenantSlug, contactName, contactEmail, contactPhone, plan,
        societyName, addressLine1, addressLine2, city, state, pincode, country, logoBuffer
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

    let logoUrl = '';
    if (logoBuffer) {
        const uploadResult = await uploadToCloudinary(logoBuffer, 'societies');
        logoUrl = uploadResult.secure_url;
    }

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
        ...(logoUrl && { logoUrl }),
    });

    await logAudit('PROVISION', 'TENANT', tenant._id, adminId, ipAddress, {
        tenantName,
        societyName,
        plan
    });

    return { tenant, society };
};

// ── Create Society Admin ──────────────────────────────────────────────────────

/**
 * Provision a SOCIETY_ADMIN user for an existing society.
 *
 * @param {object} adminData - { firstName, lastName, email, phone, societyId }
 * @param {string} superAdminId
 * @param {string} ipAddress
 * @returns {Promise<UserDocument>}
 */
export const createSocietyAdmin = async ({ firstName, lastName, email, phone, societyId }, superAdminId, ipAddress) => {
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

    await logAudit('PROVISION', 'USER', user._id, superAdminId, ipAddress, {
        societyId,
        adminEmail: email
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
 * @param {string} adminId
 * @param {string} ipAddress
 * @returns {Promise<TenantDocument>}
 */
export const toggleTenantStatus = async (tenantId, adminId, ipAddress) => {
    const tenant = await tenantRepo.findById(tenantId);
    if (!tenant) throw ApiError.notFound('Tenant not found.');

    const updated = await tenantRepo.updateTenant(tenantId, { isActive: !tenant.isActive });

    await logAudit('STATUS_CHANGE', 'TENANT', tenantId, adminId, ipAddress, {
        newStatus: updated.isActive
    });

    return updated;
};

/**
 * Toggle a Society's isActive flag.
 *
 * @param {string} societyId
 * @param {string} adminId
 * @param {string} ipAddress
 * @returns {Promise<SocietyDocument>}
 */
export const toggleSocietyStatus = async (societyId, adminId, ipAddress) => {
    const society = await societyRepo.findById(societyId);
    if (!society) throw ApiError.notFound('Society not found.');

    const updated = await societyRepo.updateSociety(societyId, { isActive: !society.isActive });

    await logAudit('STATUS_CHANGE', 'SOCIETY', societyId, adminId, ipAddress, {
        newStatus: updated.isActive
    });

    return updated;
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

// ── Audit Logs ───────────────────────────────────────────────────────────────

/**
 * List audit logs with pagination and optional filtering
 *
 * @param {object} query - req.query
 * @returns {Promise<{ data, pagination }>}
 */
export const listAuditLogs = async (query) => {
    const { page, limit, skip } = parsePagination(query);
    const { action, entityType } = query;

    const filter = {};
    if (action) filter.action = action;
    if (entityType) filter.entityType = entityType;

    const [data, total] = await Promise.all([
        AuditLog.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('performedBy', 'firstName lastName email role')
            .lean(),
        AuditLog.countDocuments(filter)
    ]);

    return { data, pagination: buildPaginationMeta(page, limit, total) };
};
