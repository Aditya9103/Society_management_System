/**
 * society.service.js — Business logic for the Society Admin module.
 *
 * Covers:
 *   - Society profile & settings management
 *   - Tower, Floor, Unit management
 *   - Staff creation & listing
 *   - Resident approval workflow
 */

import bcrypt from 'bcryptjs';
import ApiError from '../../utils/ApiError.js';
import { sendEmail } from '../../services/email.service.js';
import { generateCode, floorName } from '../../utils/generateCode.js';
import * as userRepo from '../auth/user.repository.js';
import * as residentRepo from '../resident/resident.repository.js';
import * as idCardService from '../idCard/idCard.service.js';
import * as societyRepo from './society.repository.js';
import * as towerRepo from '../../shared/repositories/tower.repository.js';
import * as floorRepo from '../../shared/repositories/floor.repository.js';
import * as unitRepo from '../../shared/repositories/unit.repository.js';
import { ROLES } from '../../config/constants.js';
import User from '../auth/user.model.js';
import Resident from '../resident/resident.model.js';
import { uploadFile } from '../../services/storage.service.js';

// ── Society Profile ───────────────────────────────────────────────────────────

/**
 * Get the full society profile for the given societyId.
 */
export const getSocietyProfile = async (societyId) => {
    const society = await societyRepo.findByIdPopulated(societyId);
    if (!society) throw ApiError.notFound('Society');
    return society;
};

/**
 * Update society profile, settings, or emergency contacts.
 * Uses $set with dot-notation to support partial settings updates.
 */
export const updateSociety = async (societyId, data) => {
    const society = await societyRepo.findById(societyId);
    if (!society) throw ApiError.notFound('Society');

    const { settings, emergencyContacts, ...profileFields } = data;

    // Build the update object
    const update = { ...profileFields };

    // Merge settings fields individually (don't clobber entire settings object)
    if (settings) {
        for (const [key, value] of Object.entries(settings)) {
            if (key === 'slaHours' && typeof value === 'object') {
                for (const [slaKey, slaVal] of Object.entries(value)) {
                    update[`settings.slaHours.${slaKey}`] = slaVal;
                }
            } else {
                update[`settings.${key}`] = value;
            }
        }
    }

    // Replace entire emergencyContacts array if provided 
    if (emergencyContacts !== undefined) {
        update.emergencyContacts = emergencyContacts;
    }

    const updated = await societyRepo.updateSociety(societyId, { $set: update });
    return updated;
};

export const updateSocietyLogo = async (societyId, imageBuffer) => {
    const uploadResult = await uploadFile(imageBuffer, { folder: 'society_logos' });
    const updated = await societyRepo.updateSociety(societyId, { $set: { logoUrl: uploadResult.secure_url } });
    if (!updated) throw ApiError.notFound('Society');
    return updated;
};

// ── Staff ─────────────────────────────────────────────────────────────────────

const ALLOWED_STAFF_ROLES = [
    ROLES.COMMITTEE_MEMBER,
    ROLES.ACCOUNTANT,
    ROLES.FACILITY_MANAGER,
    ROLES.HELP_DESK,
    ROLES.SECURITY_GUARD,
];

/**
 * Create a new staff user for the given society.
 * Generates a random password and emails credentials.
 */
export const createStaff = async (staffData) => {
    const { firstName, lastName, email, phone, role, societyId } = staffData;

    if (!ALLOWED_STAFF_ROLES.includes(role)) {
        throw ApiError.badRequest(`Role must be one of: ${ALLOWED_STAFF_ROLES.join(', ')}`);
    }

    const existing = await userRepo.findByEmail(email);
    if (existing) throw ApiError.conflict('Email already in use.');

    // Get the society's tenantId for the user record
    const society = await societyRepo.findById(societyId);
    if (!society) throw ApiError.notFound('Society');

    const generatedPassword = Math.random().toString(36).slice(-8) + 'B2@';
    const passwordHash = await bcrypt.hash(generatedPassword, 10);

    const user = await userRepo.createUser({
        firstName,
        lastName,
        email,
        phone,
        societyId,
        tenantId: society.tenantId,
        passwordHash,
        role,
        registrationStatus: 'APPROVED',
        isEmailVerified: true,
    });

    await sendEmail({
        to: email,
        subject: `Welcome to ${society.name} — Your ${role} Credentials`,
        text: `Hello ${firstName},\n\nYou have been added as a ${role} at ${society.name}.\nLogin: ${email}\nPassword: ${generatedPassword}\n\nPlease log in and change your password.`,
        html: `<h3>Hello ${firstName},</h3><p>You have been added as a <strong>${role}</strong> at <strong>${society.name}</strong>.</p><p><b>Login:</b> ${email}<br><b>Password:</b> ${generatedPassword}</p><p>Please log in and change your password immediately.</p>`,
    });

    return user;
};

/**
 * List all staff members for a society (excluding RESIDENT and SOCIETY_ADMIN).
 */
export const listStaff = async (societyId, query = {}) => {
    const { page = 1, limit = 20, search = '', role: roleFilter } = query;
    const skip = (page - 1) * limit;

    const filter = {
        societyId,
        role: { $in: ALLOWED_STAFF_ROLES },
        ...(roleFilter && ALLOWED_STAFF_ROLES.includes(roleFilter) && { role: roleFilter }),
        ...(search && {
            $or: [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ],
        }),
    };

    const [staff, total] = await Promise.all([
        User.find(filter)
            .select('-passwordHash -passwordHistory -fcmTokens')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .lean(),
        User.countDocuments(filter),
    ]);

    return {
        data: staff,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Deactivate a staff member (set isActive = false).
 */
export const deactivateStaff = async (userId, societyId) => {
    const user = await userRepo.findById(userId);
    if (!user) throw ApiError.notFound('User');
    if (user.societyId?.toString() !== societyId.toString()) {
        throw ApiError.forbidden('User does not belong to your society.');
    }
    if (!ALLOWED_STAFF_ROLES.includes(user.role)) {
        throw ApiError.badRequest('User is not a staff member.');
    }
    return userRepo.updateUser(userId, { isActive: false });
};

// ── Resident Approval ─────────────────────────────────────────────────────────

/**
 * Approve a pending resident registration.
 */
export const approveResident = async (residentUserId, adminUserId, adminComments) => {
    const user = await userRepo.findById(residentUserId);
    if (!user) throw ApiError.notFound('Resident user');

    if (user.role !== ROLES.RESIDENT) throw ApiError.badRequest('User is not a resident.');
    if (user.registrationStatus !== 'PENDING_APPROVAL' && user.registrationStatus !== 'REJECTED') {
        throw ApiError.badRequest(`Resident status is ${user.registrationStatus}, cannot approve.`);
    }

    const residentDoc = await residentRepo.findByUserId(residentUserId);
    if (!residentDoc) throw ApiError.notFound('Resident profile');

    await userRepo.updateUser(residentUserId, { registrationStatus: 'APPROVED' });
    await residentRepo.updateResident(residentDoc._id, {
        approvalStatus: 'APPROVED',
        approvedBy: adminUserId,
        approvedAt: new Date(),
        ...(adminComments && { rejectionReason: adminComments }),
    });

    // Mark unit as occupied
    if (residentDoc.unitId) {
        await unitRepo.updateUnit(residentDoc.unitId, {
            isOccupied: true,
            ownershipStatus: residentDoc.ownershipType === 'OWNER' ? 'OWNER_OCCUPIED' : 'RENTED',
        });
    }

    // Generate ID Card asynchronously
    idCardService.generateAndUploadIdCard(residentDoc._id)
        .then(() => console.log(`ID Card generated for resident ${residentDoc._id}`))
        .catch(err => console.error(`Failed to generate ID Card for resident ${residentDoc._id}:`, err));

    await sendEmail({
        to: user.email,
        subject: 'Your Registration Has Been Approved',
        html: `<h3>Hello ${user.firstName},</h3><p>Your resident registration has been <strong>approved</strong>!</p><p>You can now log into the portal. Your Digital ID Card is being generated and will be available in your profile shortly.</p>`,
    });

    return user;
};

/**
 * Reject a pending resident registration with a reason.
 */
export const rejectResident = async (residentUserId, adminUserId, reason) => {
    const user = await userRepo.findById(residentUserId);
    if (!user) throw ApiError.notFound('Resident user');

    if (user.role !== ROLES.RESIDENT) throw ApiError.badRequest('User is not a resident.');
    if (user.registrationStatus !== 'PENDING_APPROVAL') {
        throw ApiError.badRequest(`Resident status is ${user.registrationStatus}, cannot reject.`);
    }

    const residentDoc = await residentRepo.findByUserId(residentUserId);
    if (!residentDoc) throw ApiError.notFound('Resident profile');

    await userRepo.updateUser(residentUserId, { registrationStatus: 'REJECTED' });
    await residentRepo.updateResident(residentDoc._id, {
        approvalStatus: 'REJECTED',
        approvedBy: adminUserId,
        approvedAt: new Date(),
        rejectionReason: reason,
    });

    await sendEmail({
        to: user.email,
        subject: 'Your Registration Has Been Declined',
        html: `<h3>Hello ${user.firstName},</h3><p>Unfortunately, your resident registration has been <strong>declined</strong>.</p><p><b>Reason:</b> ${reason}</p><p>Please contact your society admin for more information.</p>`,
    });

    return user;
};

/**
 * List all residents (approved, pending, or by status filter).
 */
export const listResidents = async (societyId, query = {}) => {
    const { page = 1, limit = 20, search = '', status } = query;
    const skip = (page - 1) * limit;

    const userFilter = {
        societyId,
        role: ROLES.RESIDENT,
        ...(status && { registrationStatus: status }),
        ...(search && {
            $or: [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ],
        }),
    };

    const [users, total] = await Promise.all([
        User.find(userFilter)
            .select('-passwordHash -passwordHistory -fcmTokens')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .lean(),
        User.countDocuments(userFilter),
    ]);

    return {
        data: users,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get detailed resident profiles with unit + family info.
 */
export const listResidentProfiles = async (societyId, query = {}) => {
    const { page = 1, limit = 20, approvalStatus } = query;
    const skip = (page - 1) * limit;

    const filter = {
        societyId,
        ...(approvalStatus && { approvalStatus }),
    };

    const [residents, total] = await Promise.all([
        Resident.find(filter)
            .populate('userId', 'firstName lastName email phone profilePhotoUrl registrationStatus')
            .populate('unitId', 'unitNumber unitType bhkType')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .lean(),
        Resident.countDocuments(filter),
    ]);

    return {
        data: residents,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// ── Tower Management ──────────────────────────────────────────────────────────

/**
 * List all towers for a society.
 */
export const listTowers = async (societyId) => {
    const towers = await towerRepo.findBySociety(societyId);
    // Attach floor count per tower
    const towersWithFloors = await Promise.all(
        towers.map(async (t) => {
            const floors = await floorRepo.findByTower(t._id.toString());
            return { ...t, floors, floorCount: floors.length };
        }),
    );
    return towersWithFloors;
};

/**
 * Create a new tower and optionally auto-generate floors.
 */
export const createTower = async (societyId, data) => {
    const { name, code, totalFloors, hasBasement, basementLevels, amenities, autoCreateFloors } = data;

    const society = await societyRepo.findById(societyId);
    if (!society) throw ApiError.notFound('Society');

    // Check code uniqueness within society
    const codeExists = await towerRepo.existsByCode(societyId, code);
    if (codeExists) throw ApiError.conflict(`Tower code "${code.toUpperCase()}" already exists in this society.`);

    const tower = await towerRepo.createTower({
        societyId,
        name,
        code: code.toUpperCase(),
        totalFloors,
        hasBasement: hasBasement ?? false,
        basementLevels: basementLevels ?? 0,
        amenities: amenities ?? [],
    });

    // Auto-generate floors if requested
    if (autoCreateFloors !== false) {
        const floorsToCreate = [];

        // Basement floors (negative numbers)
        if (hasBasement && basementLevels > 0) {
            for (let i = -basementLevels; i < 0; i++) {
                floorsToCreate.push({
                    societyId,
                    towerId: tower._id,
                    floorNumber: i,
                    floorName: floorName(i),
                    totalUnits: 0,
                });
            }
        }

        // Ground + upper floors
        for (let i = 0; i <= totalFloors; i++) {
            floorsToCreate.push({
                societyId,
                towerId: tower._id,
                floorNumber: i,
                floorName: floorName(i),
                totalUnits: 0,
            });
        }

        await floorRepo.createManyFloors(floorsToCreate);
    }

    // Update society total units count (towers are a structural element)
    return tower;
};

/**
 * Update a tower's metadata.
 */
export const updateTower = async (towerId, societyId, data) => {
    const tower = await towerRepo.findById(towerId);
    if (!tower) throw ApiError.notFound('Tower');
    if (tower.societyId.toString() !== societyId.toString()) {
        throw ApiError.forbidden('Tower does not belong to your society.');
    }
    return towerRepo.updateTower(towerId, data);
};

/**
 * Delete a tower, its floors, and its units (if none are occupied).
 */
export const deleteTower = async (towerId, societyId) => {
    const tower = await towerRepo.findById(towerId);
    if (!tower) throw ApiError.notFound('Tower');
    if (tower.societyId.toString() !== societyId.toString()) {
        throw ApiError.forbidden('Tower does not belong to your society.');
    }

    // Check if any occupied units exist
    const occupiedUnitsCount = await unitRepo.countDocuments({ towerId, isOccupied: true });
    if (occupiedUnitsCount > 0) {
        throw ApiError.badRequest('Cannot delete tower: It contains occupied units.');
    }

    // Adjust society counters: we need to subtract the number of units in this tower
    const towerUnitsCount = await unitRepo.countDocuments({ towerId });
    if (towerUnitsCount > 0) {
        await societyRepo.incrementTotalUnits(societyId, -towerUnitsCount);
    }

    // Delete units, floors, and the tower itself
    await unitRepo.deleteByTower(towerId);
    await floorRepo.deleteByTower(towerId);
    await towerRepo.deleteTower(towerId);

    return { message: 'Tower deleted successfully' };
};

// ── Floor Management ──────────────────────────────────────────────────────────

/**
 * List all floors for a specific tower.
 */
export const listFloors = async (towerId, societyId) => {
    const tower = await towerRepo.findById(towerId);
    if (!tower) throw ApiError.notFound('Tower');
    if (tower.societyId.toString() !== societyId.toString()) {
        throw ApiError.forbidden('Tower does not belong to your society.');
    }
    return floorRepo.findByTower(towerId);
};

/**
 * Create a single floor in a tower.
 */
export const createFloor = async (towerId, societyId, data) => {
    const tower = await towerRepo.findById(towerId);
    if (!tower) throw ApiError.notFound('Tower');
    if (tower.societyId.toString() !== societyId.toString()) {
        throw ApiError.forbidden('Tower does not belong to your society.');
    }

    const exists = await floorRepo.existsByFloorNumber(towerId, data.floorNumber);
    if (exists) throw ApiError.conflict(`Floor ${data.floorNumber} already exists in this tower.`);

    return floorRepo.createFloor({
        societyId,
        towerId,
        floorNumber: data.floorNumber,
        floorName: data.floorName,
        totalUnits: 0,
    });
};

/**
 * Update floor metadata.
 */
export const updateFloor = async (towerId, societyId, floorId, data) => {
    // 1. Look up the floor in the database
    const floor = await floorRepo.findById(floorId);
    if (!floor) {
        throw ApiError.notFound('Floor not found');
    }

    // 2. Security Check: Make sure this floor belongs to the logged-in admin's society
    if (floor.societyId.toString() !== societyId.toString()) {
        throw ApiError.forbidden('Floor does not belong to your society.');
    }

    // 3. Send the updates to the repository layer to save in the database
    return await floorRepo.updateFloor(floorId, data);
};

/**
 * Delete a floor and its units (if none are occupied).
 */
export const deleteFloor = async (towerId, societyId, floorId) => {
    const floor = await floorRepo.findById(floorId);
    if (!floor) throw ApiError.notFound('Floor');
    if (floor.societyId.toString() !== societyId.toString()) {
        throw ApiError.forbidden('Floor does not belong to your society.');
    }
    if (floor.towerId.toString() !== towerId.toString()) {
        throw ApiError.badRequest('Floor does not belong to the specified tower.');
    }

    // Check if any occupied units exist on this floor
    const occupiedUnitsCount = await unitRepo.countDocuments({ floorId, isOccupied: true });
    if (occupiedUnitsCount > 0) {
        throw ApiError.badRequest('Cannot delete floor: It contains occupied units.');
    }

    // Adjust counters
    const floorUnitsCount = await unitRepo.countDocuments({ floorId });
    if (floorUnitsCount > 0) {
        await societyRepo.incrementTotalUnits(societyId, -floorUnitsCount);
        await towerRepo.incrementUnitCount(towerId, -floorUnitsCount);
    }

    // Delete units and the floor
    await unitRepo.deleteByFloor(floorId);
    await floorRepo.deleteFloor(floorId);

    return { message: 'Floor deleted successfully' };
};

// ── Unit Management ───────────────────────────────────────────────────────────

/**
 * List units for a society with optional tower/floor filter.
 */
export const listUnits = async (societyId, query = {}) => {
    const { page = 1, limit = 50, towerId, floorId, isOccupied } = query;
    const skip = (page - 1) * Number(limit);

    const filter = { societyId };
    if (towerId) filter.towerId = towerId;
    if (floorId) filter.floorId = floorId;
    if (isOccupied !== undefined) filter.isOccupied = isOccupied === 'true';

    const [data, total] = await Promise.all([
        unitRepo.findBySociety(filter, { skip, limit: Number(limit) }),
        unitRepo.countDocuments(filter),
    ]);

    return {
        data,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
        },
    };
};

/**
 * Create a new unit in a floor.
 */
export const createUnit = async (societyId, data) => {
    const { towerId, floorId, unitNumber } = data;

    // Verify tower belongs to society
    const tower = await towerRepo.findById(towerId);
    if (!tower || tower.societyId.toString() !== societyId.toString()) {
        throw ApiError.badRequest('Invalid tower for this society.');
    }

    // Verify floor belongs to tower
    const floor = await floorRepo.findById(floorId);
    if (!floor || floor.towerId.toString() !== towerId.toString()) {
        throw ApiError.badRequest('Invalid floor for this tower.');
    }

    // Check unit number uniqueness within tower
    const exists = await unitRepo.existsByUnitNumber(towerId, unitNumber);
    if (exists) throw ApiError.conflict(`Unit number "${unitNumber}" already exists in this tower.`);

    const unit = await unitRepo.createUnit({ ...data, societyId });

    // Update counters
    await Promise.all([
        towerRepo.incrementUnitCount(towerId, 1),
        floorRepo.incrementUnitCount(floorId, 1),
        societyRepo.incrementTotalUnits(societyId, 1),
    ]);

    return unit;
};

/**
 * Update a unit's details.
 */
export const updateUnit = async (unitId, societyId, data) => {
    const unit = await unitRepo.findById(unitId);
    if (!unit) throw ApiError.notFound('Unit');
    if (unit.societyId.toString() !== societyId.toString()) {
        throw ApiError.forbidden('Unit does not belong to your society.');
    }
    return unitRepo.updateUnit(unitId, data);
};

/**
 * Delete a unit.
 */
export const deleteUnit = async (unitId, societyId) => {
    const unit = await unitRepo.findById(unitId);
    if (!unit) throw ApiError.notFound('Unit');
    if (unit.societyId.toString() !== societyId.toString()) {
        throw ApiError.forbidden('Unit does not belong to your society.');
    }

    if (unit.isOccupied) {
        throw ApiError.badRequest('Cannot delete unit: It is currently occupied.');
    }

    await unitRepo.deleteUnit(unitId);

    // Update counters
    await Promise.all([
        towerRepo.incrementUnitCount(unit.towerId, -1),
        floorRepo.incrementUnitCount(unit.floorId, -1),
        societyRepo.incrementTotalUnits(societyId, -1),
    ]);

    return { message: 'Unit deleted successfully' };
};


// ── Dashboard Stats ───────────────────────────────────────────────────────────

/**
 * Get summary stats for the society admin dashboard.
 */
export const getDashboardStats = async (societyId) => {
    const [
        society,
        towerCount,
        unitStats,
        pendingResidents,
        totalResidents,
        staffCount,
    ] = await Promise.all([
        societyRepo.findById(societyId),
        towerRepo.findBySociety(societyId).then((t) => t.length),
        unitRepo.countDocuments({ societyId }),
        User.countDocuments({ societyId, role: ROLES.RESIDENT, registrationStatus: 'PENDING_APPROVAL' }),
        User.countDocuments({ societyId, role: ROLES.RESIDENT, registrationStatus: 'APPROVED' }),
        User.countDocuments({ societyId, role: { $in: ALLOWED_STAFF_ROLES }, isActive: true }),
    ]);

    return {
        societyName: society?.name,
        totalTowers: towerCount,
        totalUnits: society?.totalUnits ?? 0,
        occupiedUnits: society?.occupiedUnits ?? 0,
        vacantUnits: (society?.totalUnits ?? 0) - (society?.occupiedUnits ?? 0),
        pendingResidents,
        totalResidents,
        totalStaff: staffCount,
    };
};

// ── Additional Resident Actions ────────────────────────────────────────────────

export const revokeResident = async (residentUserId, adminUserId, reason) => {
    const user = await userRepo.findById(residentUserId);
    if (!user) throw ApiError.notFound('Resident user');

    if (user.role !== ROLES.RESIDENT) throw ApiError.badRequest('User is not a resident.');
    // We only revoke if they are currently APPROVED
    if (user.registrationStatus !== 'APPROVED') {
        throw ApiError.badRequest(`Resident status is ${user.registrationStatus}, cannot revoke.`);
    }

    const residentDoc = await residentRepo.findByUserId(residentUserId);
    if (!residentDoc) throw ApiError.notFound('Resident profile');

    // Change status to REJECTED to revoke login access
    await userRepo.updateUser(residentUserId, { registrationStatus: 'REJECTED' });
    await residentRepo.updateResident(residentDoc._id, {
        approvalStatus: 'REJECTED',
        approvedBy: adminUserId,
        approvedAt: new Date(),
        rejectionReason: reason || 'Access Revoked',
    });

    await sendEmail({
        to: user.email,
        subject: 'Your Portal Access Has Been Revoked',
        html: `<h3>Hello ${user.firstName},</h3><p>Your access to the resident portal has been <strong>revoked</strong>.</p><p><b>Reason:</b> ${reason || 'Administrative action'}</p><p>Please contact your society admin for more information.</p>`,
    });

    return user;
};

export const getResidentProfile = async (residentUserId, societyId) => {
    const user = await userRepo.findById(residentUserId);
    if (!user || user.societyId.toString() !== societyId.toString()) {
        throw ApiError.notFound('Resident not found in this society');
    }

    const residentDoc = await Resident.findOne({ userId: residentUserId, societyId })
        .populate('unitId')
        .lean();

    return {
        user,
        residentDetails: residentDoc,
    };
};
