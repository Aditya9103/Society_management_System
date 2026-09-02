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
import Complaint from '../complaint/complaint.model.js';
import StaffProfile from './staffProfile.model.js';
import Notice from '../notice/notice.model.js';
import VisitorLog from '../visitor/visitorLog.model.js';
import VehicleLog from '../vehicle/vehicleLog.model.js';
import Invoice from '../payment/invoice.model.js';
import { uploadFile } from '../../services/storage.service.js';
import Unit from '../../shared/models/Unit.js';

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
    const { page = 1, limit = 20, search = '', role: roleFilter, status } = query;
    const skip = (page - 1) * limit;

    const filter = {
        societyId,
        role: (roleFilter && ALLOWED_STAFF_ROLES.includes(roleFilter))
            ? roleFilter
            : { $in: ALLOWED_STAFF_ROLES },
        ...(search && {
            $or: [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { role: { $regex: search, $options: 'i' } },
            ],
        }),
        ...(status === 'active' && { isActive: true }),
        ...(status === 'inactive' && { isActive: false }),
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

    // Calculate real stats for the UI
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const baseStaffFilter = { societyId, role: { $in: ALLOWED_STAFF_ROLES } };

    const [totalStaff, activeStaff, departmentsArr, thisMonthJoined] = await Promise.all([
        User.countDocuments(baseStaffFilter),
        User.countDocuments({ ...baseStaffFilter, isActive: true }),
        User.distinct('role', baseStaffFilter),
        User.countDocuments({ ...baseStaffFilter, createdAt: { $gte: startOfMonth } })
    ]);

    const stats = {
        totalStaff,
        activeStaff,
        departments: departmentsArr.length,
        thisMonthJoined
    };

    return {
        data: staff,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
        },
        stats
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

/**
 * Deactivate a staff member (set isActive = false).
 */
export const deleteStaff = async (userId, societyId) => {
    const staff = await userRepo.findById(userId);
    if (!staff) throw ApiError.notFound('Staff member');
    if (staff.societyId?.toString() !== societyId.toString()) {
        throw ApiError.forbidden('Staff does not belong to your society.');
    }
    if (!ALLOWED_STAFF_ROLES.includes(staff.role)) {
        throw ApiError.forbidden('Cannot delete non-staff user via this endpoint.');
    }

    if (staff.isActive) {
        throw ApiError.badRequest('Cannot delete an active staff member. Please deactivate them first.');
    }

    await userRepo.deleteUser(userId);
    return { message: 'Staff member deleted successfully' };
};

/**
 * Reset staff password
 */
export const resetStaffPassword = async (userId, societyId) => {
    const user = await userRepo.findById(userId);
    if (!user) throw ApiError.notFound('Staff member');
    if (user.societyId?.toString() !== societyId.toString()) {
        throw ApiError.forbidden('Staff does not belong to your society.');
    }
    if (!ALLOWED_STAFF_ROLES.includes(user.role)) {
        throw ApiError.forbidden('Cannot reset password for non-staff user via this endpoint.');
    }

    const generatedPassword = Math.random().toString(36).slice(-8) + 'B2@';
    const passwordHash = await bcrypt.hash(generatedPassword, 10);

    await userRepo.updateUser(userId, { passwordHash });

    return { message: 'Password reset successfully', newPassword: generatedPassword };
};

/**
 * Get detailed staff profile
 */
export const getStaffDetails = async (userId, societyId) => {
    const user = await userRepo.findById(userId);
    if (!user) throw ApiError.notFound('Staff member');
    if (user.societyId?.toString() !== societyId.toString()) {
        throw ApiError.forbidden('Staff does not belong to your society.');
    }
    
    let staffProfile = await StaffProfile.findOne({ userId });
    
    // Auto-create an empty profile if one doesn't exist
    if (!staffProfile) {
        staffProfile = await StaffProfile.create({
            userId,
            societyId
        });
    }
    
    return {
        user,
        profile: staffProfile
    };
};

/**
 * Update staff profile
 */
export const updateStaffProfile = async (userId, societyId, data) => {
    const user = await userRepo.findById(userId);
    if (!user) throw ApiError.notFound('Staff member');
    if (user.societyId?.toString() !== societyId.toString()) {
        throw ApiError.forbidden('Staff does not belong to your society.');
    }
    
    const { userUpdates, profileUpdates } = data;
    
    if (userUpdates && Object.keys(userUpdates).length > 0) {
        await userRepo.updateUser(userId, userUpdates);
    }
    
    if (profileUpdates && Object.keys(profileUpdates).length > 0) {
        await StaffProfile.findOneAndUpdate(
            { userId },
            { $set: profileUpdates },
            { new: true, upsert: true }
        );
    }
    
    return { message: 'Staff profile updated successfully' };
};

/**
 * Verify staff document
 */
export const verifyStaffDocument = async (userId, societyId, documentId, adminUserId) => {
    const user = await userRepo.findById(userId);
    if (!user || user.societyId?.toString() !== societyId.toString()) {
        throw ApiError.notFound('Staff member');
    }
    
    const profile = await StaffProfile.findOne({ userId });
    if (!profile) throw ApiError.notFound('Staff profile not found');
    
    const doc = profile.documents.id(documentId);
    if (!doc) throw ApiError.notFound('Document not found');
    
    doc.verified = true;
    doc.verifiedBy = adminUserId;
    doc.verifiedAt = new Date();
    
    await profile.save();
    return { message: 'Document verified successfully', doc };
};

/**
 * Upload staff document
 */
export const uploadStaffDocument = async (userId, societyId, file, type) => {
    const user = await userRepo.findById(userId);
    if (!user || user.societyId?.toString() !== societyId.toString()) {
        throw ApiError.notFound('Staff member');
    }
    
    const profile = await StaffProfile.findOne({ userId });
    if (!profile) throw ApiError.notFound('Staff profile not found');
    
    const newDoc = {
        type,
        url: file.path,
        verified: false,
    };
    
    profile.documents.push(newDoc);
    await profile.save();
    
    return { message: 'Document uploaded successfully', document: profile.documents[profile.documents.length - 1] };
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
    }).catch(err => console.error(`Failed to send approval email to ${user.email}:`, err));

    import('../../services/notification.service.js').then(({ sendNotification }) => {
        sendNotification({
            users: [user],
            societyId: user.societyId,
            type: 'RESIDENT_APPROVED',
            title: 'Registration Approved 🎉',
            message: 'Your registration has been approved! You can now access all resident features.',
            priority: 'HIGH',
            referenceType: 'USER',
            referenceId: user._id,
        }).catch(err => console.error('Failed to notify resident of approval:', err));
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
    const { page = 1, limit = 20, approvalStatus, search = '', towerId, ownershipType } = query;
    const skip = (page - 1) * limit;

    const filter = {
        societyId,
        ...(approvalStatus && { approvalStatus }),
        ...(ownershipType && { ownershipType }),
    };

    let [residents, total] = await Promise.all([
        Resident.find(filter)
            .populate('userId', 'firstName lastName email phone profilePhotoUrl registrationStatus')
            .populate('unitId', 'unitNumber unitType bhkType towerId floorId')
            .sort({ createdAt: -1 })
            .lean(),
        Resident.countDocuments(filter),
    ]);

    // Client-side filtering for search and towerId since they are in populated fields
    if (search || towerId) {
        residents = residents.filter(r => {
            let matchSearch = true;
            let matchTower = true;

            if (search) {
                const s = search.toLowerCase();
                const name = `${r.userId?.firstName || ''} ${r.userId?.lastName || ''}`.toLowerCase();
                const email = (r.userId?.email || '').toLowerCase();
                const phone = (r.userId?.phone || '').toLowerCase();
                const unit = (r.unitId?.unitNumber || '').toLowerCase();
                
                matchSearch = name.includes(s) || email.includes(s) || phone.includes(s) || unit.includes(s);
            }

            if (towerId) {
                matchTower = r.unitId?.towerId?.toString() === towerId;
            }

            return matchSearch && matchTower;
        });
        total = residents.length;
    }

    // Apply pagination after filtering
    residents = residents.slice(skip, skip + Number(limit));

    const mongoose = (await import('mongoose')).default;
    
    // Aggregate stats for Resident profiles
    const statsAgg = await Resident.aggregate([
        { $match: { societyId: new mongoose.Types.ObjectId(societyId) } },
        { 
            $group: { 
                _id: "$approvalStatus", 
                count: { $sum: 1 },
                familyMembers: { $sum: { $size: "$familyMembers" } }
            } 
        }
    ]);

    const stats = {
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        familyMembers: 0
    };

    statsAgg.forEach(s => {
        if (s._id === 'APPROVED') stats.approved = s.count;
        if (s._id === 'PENDING') stats.pending = s.count;
        if (s._id === 'REJECTED') stats.rejected = s.count;
        stats.total += s.count;
        stats.familyMembers += s.familyMembers;
    });

    return {
        data: residents,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
        },
        stats
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

    // Aggregate stats dynamically
    const mongoose = (await import('mongoose')).default;
    const statsAgg = await Unit.aggregate([
        { $match: { societyId: new mongoose.Types.ObjectId(filter.societyId) } },
        { 
            $group: { 
                _id: "$ownershipStatus", 
                count: { $sum: 1 } 
            } 
        }
    ]);

    const stats = {
        total,
        ownerOccupied: 0,
        rented: 0,
        vacant: 0,
        maintenance: 0 // Mocked since it's not in enum
    };

    statsAgg.forEach(s => {
        if (s._id === 'OWNER_OCCUPIED') stats.ownerOccupied = s.count;
        if (s._id === 'RENTED') stats.rented = s.count;
        if (s._id === 'VACANT') stats.vacant = s.count;
    });

    return {
        data,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
        },
        stats
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);

    const [
        society,
        towerCount,
        unitStats,
        pendingResidents,
        totalResidents,
        lastMonthResidents,
        staffCount,
        openComplaints,
        inProgressComplaints,
        resolvedComplaints,
        closedComplaints,
        escalatedComplaints,
        recentNotices,
        pendingApprovalsList,
        visitorsToday,
        vehiclesToday,
        unpaidInvoices,
        collectedThisMonth,
        expectedThisMonth
    ] = await Promise.all([
        societyRepo.findById(societyId),
        towerRepo.findBySociety(societyId).then((t) => t.length),
        unitRepo.countDocuments({ societyId }),
        
        // Residents & Staff
        User.countDocuments({ societyId, role: ROLES.RESIDENT, registrationStatus: 'PENDING_APPROVAL' }),
        User.countDocuments({ societyId, role: ROLES.RESIDENT, registrationStatus: 'APPROVED' }),
        User.countDocuments({ societyId, role: ROLES.RESIDENT, registrationStatus: 'APPROVED', createdAt: { $lte: endOfLastMonth } }),
        User.countDocuments({ societyId, role: { $in: ALLOWED_STAFF_ROLES }, isActive: true }),
        
        // Complaints
        Complaint.countDocuments({ societyId, status: 'OPEN' }),
        Complaint.countDocuments({ societyId, status: 'IN_PROGRESS' }),
        Complaint.countDocuments({ societyId, status: 'RESOLVED' }),
        Complaint.countDocuments({ societyId, status: 'CLOSED' }),
        Complaint.countDocuments({ societyId, status: { $in: ['OPEN', 'IN_PROGRESS'] }, priority: 'HIGH' }), // escalated mock
        
        // Lists
        Notice.find({ societyId }).sort({ createdAt: -1 }).limit(3).lean(),
        Resident.find({ societyId, approvalStatus: 'PENDING' }).populate('userId', 'firstName lastName profilePhotoUrl').populate('unitId', 'unitNumber').limit(3).lean(),
        
        // Snapshot
        VisitorLog.countDocuments({ societyId, entryTime: { $gte: today } }),
        VehicleLog.countDocuments({ societyId, entryTime: { $gte: today } }),
        Invoice.countDocuments({ societyId, status: 'PENDING' }),
        
        // Payments
        Invoice.aggregate([
            { $match: { societyId, status: 'PAID', createdAt: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).then(res => res[0]?.total || 0),
        
        Invoice.aggregate([
            { $match: { societyId, createdAt: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).then(res => res[0]?.total || 0)
    ]);

    return {
        societyName: society?.name,
        totalTowers: towerCount,
        totalUnits: society?.totalUnits ?? 0,
        occupiedUnits: society?.occupiedUnits ?? 0,
        vacantUnits: (society?.totalUnits ?? 0) - (society?.occupiedUnits ?? 0),
        pendingResidents,
        totalResidents,
        residentsLastMonth: lastMonthResidents,
        totalStaff: staffCount,
        complaints: {
            open: openComplaints,
            inProgress: inProgressComplaints,
            resolved: resolvedComplaints,
            closed: closedComplaints,
            escalated: escalatedComplaints
        },
        recentNotices,
        pendingApprovalsList,
        snapshot: {
            visitorsToday,
            vehiclesToday,
            unpaidInvoices,
            serviceRequests: openComplaints + inProgressComplaints
        },
        payment: {
            collectedThisMonth,
            expectedThisMonth
        }
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
        .populate({
            path: 'unitId',
            populate: [
                { path: 'towerId', select: 'name' },
                { path: 'floorId', select: 'floorNumber floorName' }
            ]
        })
        .lean();

    return {
        user,
        residentDetails: residentDoc,
    };
};

/**
 * Update resident profile (User + Resident details)
 */
export const updateResidentProfile = async (residentUserId, societyId, data) => {
    const user = await userRepo.findById(residentUserId);
    if (!user || user.societyId.toString() !== societyId.toString()) {
        throw ApiError.notFound('Resident not found in this society');
    }

    const residentDoc = await Resident.findOne({ userId: residentUserId, societyId });
    if (!residentDoc) {
        throw ApiError.notFound('Resident details not found');
    }

    // Update User Info
    const userUpdates = {};
    if (data.firstName !== undefined) userUpdates.firstName = data.firstName;
    if (data.lastName !== undefined) userUpdates.lastName = data.lastName;
    if (data.phone !== undefined) userUpdates.phone = data.phone;
    if (data.dateOfBirth !== undefined) userUpdates.dateOfBirth = data.dateOfBirth;
    if (data.gender !== undefined) userUpdates.gender = data.gender;
    if (data.nationality !== undefined) userUpdates.nationality = data.nationality;

    if (Object.keys(userUpdates).length > 0) {
        await userRepo.updateUser(residentUserId, userUpdates);
    }

    // Update Resident Info
    const residentUpdates = {};
    if (data.occupation !== undefined) residentUpdates.occupation = data.occupation;
    if (data.bloodGroup !== undefined) residentUpdates.bloodGroup = data.bloodGroup;
    if (data.panNumber !== undefined) residentUpdates.panNumber = data.panNumber;
    if (data.aadhaarNumber !== undefined) residentUpdates.aadhaarNumber = data.aadhaarNumber;
    if (data.maritalStatus !== undefined) residentUpdates.maritalStatus = data.maritalStatus;

    if (Object.keys(residentUpdates).length > 0) {
        await residentRepo.updateResident(residentDoc._id, residentUpdates);
    }

    return true;
};

/**
 * Reset Resident Password
 */
export const resetResidentPassword = async (residentUserId, societyId, newPassword) => {
    const user = await userRepo.findById(residentUserId);
    if (!user || user.societyId.toString() !== societyId.toString()) {
        throw ApiError.notFound('Resident not found in this society');
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await userRepo.updateUser(residentUserId, { passwordHash: hashedPassword });
    return true;
};
