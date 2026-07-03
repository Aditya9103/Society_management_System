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
import User from '../auth/user.model.js';
import * as tenantRepo from '../../shared/repositories/tenant.repository.js';
import * as societyRepo from '../society/society.repository.js';
import AuditLog from '../../shared/models/AuditLog.js';

// ── Audit Logging Helper ──────────────────────────────────────────────────────

const logAudit = async (action, entityType, entityId, entityName, performedBy, ipAddress, userAgent, details = {}) => {
    try {
        await AuditLog.create({
            action,
            resourceType: entityType,
            resourceId: entityId,
            resourceName: entityName,
            actorId: performedBy,
            ipAddress,
            userAgent,
            afterState: details // Mongoose schema uses afterState/beforeState instead of details
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
 * @param {string} userAgent
 * @returns {Promise<{ tenant, society }>}
 */
export const createTenantWithSociety = async (data, adminId, ipAddress, userAgent) => {
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

    await logAudit('PROVISION', 'TENANT', tenant._id, tenantName, adminId, ipAddress, userAgent, {
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
export const createSocietyAdmin = async ({ firstName, lastName, email, phone, societyId }, superAdminId, ipAddress, userAgent) => {
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

    const userName = `${user.firstName} ${user.lastName}`;
    await logAudit('PROVISION', 'USER', user._id, userName, superAdminId, ipAddress, userAgent, {
        role: user.role,
        societyId: society._id,
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
export const toggleTenantStatus = async (tenantId, adminId, ipAddress, userAgent) => {
    const tenant = await tenantRepo.findById(tenantId);
    if (!tenant) throw ApiError.notFound('Tenant not found.');

    const updated = await tenantRepo.updateTenant(tenantId, { isActive: !tenant.isActive });

    await logAudit('STATUS_CHANGE', 'TENANT', tenantId, tenant.name, adminId, ipAddress, userAgent, {
        newStatus: updated.isActive,
        previousStatus: tenant.isActive
    });

    // Notify the tenant contact
    const action = updated.isActive ? 'activated' : 'deactivated';
    sendEmail({
        to: tenant.contactEmail,
        subject: `Tenant Account ${action === 'activated' ? 'Activated' : 'Deactivated'}`,
        html: `<h3>Hello ${tenant.contactName || 'Tenant'},</h3><p>Your tenant account <strong>${tenant.name}</strong> has been <strong>${action}</strong> by the Super Admin.</p>`,
    }).catch(err => console.error(`Failed to email tenant ${tenant.contactEmail}:`, err));

    // Instantly lock out all connected clients for this tenant if deactivated
    if (!updated.isActive) {
        import('../../socket/socket.server.js').then(async ({ getIO }) => {
            try {
                const io = getIO();
                const societies = await societyRepo.findAll({ tenantId }, { limit: 1000 });
                societies.forEach(soc => {
                    io.to(`society_${soc._id.toString()}`).emit('ACCOUNT_SUSPENDED');
                });
            } catch (err) {
                console.error('Failed to emit ACCOUNT_SUSPENDED socket event for tenant', err);
            }
        });
    }

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
export const toggleSocietyStatus = async (societyId, adminId, ipAddress, userAgent) => {
    const society = await societyRepo.findById(societyId);
    if (!society) throw ApiError.notFound('Society not found.');

    const updated = await societyRepo.updateSociety(societyId, { isActive: !society.isActive });

    await logAudit('STATUS_CHANGE', 'SOCIETY', societyId, society.name, adminId, ipAddress, userAgent, {
        newStatus: updated.isActive,
        previousStatus: society.isActive
    });

    // Notify all SOCIETY_ADMIN users of this society
    const admins = await userRepo.findByRoleInSociety(societyId, ['SOCIETY_ADMIN']);
    if (admins.length > 0) {
        const action = updated.isActive ? 'activated' : 'deactivated';

        // Send emails
        for (const admin of admins) {
            sendEmail({
                to: admin.email,
                subject: `Society ${action === 'activated' ? 'Activated' : 'Deactivated'}`,
                html: `<h3>Hello ${admin.firstName},</h3><p>Your society <strong>${society.name}</strong> has been <strong>${action}</strong> by the Super Admin.</p>`,
            }).catch(err => console.error(`Failed to email admin ${admin.email}:`, err));
        }

        // Send push notifications
        import('../../services/notification.service.js').then(({ sendNotification }) => {
            sendNotification({
                users: admins,
                societyId: societyId,
                type: 'GENERAL',
                title: `Society ${action === 'activated' ? 'Activated' : 'Deactivated'}`,
                message: `Your society has been ${action} by the Super Admin.`,
                priority: 'HIGH'
            }).catch(err => console.error('Failed to send push notification:', err));
        });
    }

    // Instantly lock out all connected clients if deactivated
    if (!updated.isActive) {
        import('../../socket/socket.server.js').then(({ getIO }) => {
            try {
                const io = getIO();
                // Assumes ROOMS.SOCIETY(id) matches `society_${id}`
                io.to(`society_${societyId}`).emit('ACCOUNT_SUSPENDED');
            } catch (err) {
                console.error('Failed to emit ACCOUNT_SUSPENDED socket event', err);
            }
        });
    }

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
    const { search, entityType } = query;

    const filter = {};
    if (search) {
        // Find matching actors to allow searching by Performed By (Name, Email, Role)
        const matchingUsers = await User.find({
            $or: [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { role: { $regex: search, $options: 'i' } }
            ]
        }).select('_id').lean();
        
        const actorIds = matchingUsers.map(u => u._id);

        filter.$or = [
            { action: { $regex: search, $options: 'i' } },
            { resourceType: { $regex: search, $options: 'i' } },
            { resourceName: { $regex: search, $options: 'i' } },
            { ipAddress: { $regex: search, $options: 'i' } },
            { userAgent: { $regex: search, $options: 'i' } }
        ];

        if (actorIds.length > 0) {
            filter.$or.push({ actorId: { $in: actorIds } });
        }
    }
    if (entityType) filter.resourceType = entityType;

    const [data, total] = await Promise.all([
        AuditLog.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('actorId', 'firstName lastName email role')
            .lean(),
        AuditLog.countDocuments(filter)
    ]);

    return { data, pagination: buildPaginationMeta(page, limit, total) };
};
