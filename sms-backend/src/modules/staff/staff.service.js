/**
 * staff.service.js — Business logic for Staff portal endpoints.
 *
 * Provides role-aware data aggregation for:
 *  - COMMITTEE_MEMBER: society overview, resident count, pending approvals
 *  - ACCOUNTANT: unit count, occupancy stats
 *  - FACILITY_MANAGER: tower/unit count, occupancy breakdown
 *  - SECURITY_GUARD: resident count, units occupied, basic society info
 */

import Society from '../society/society.model.js';
import User from '../auth/user.model.js';
import Resident from '../resident/resident.model.js';
import * as unitRepo from '../../shared/repositories/unit.repository.js';
import * as towerRepo from '../../shared/repositories/tower.repository.js';
import ApiError from '../../utils/ApiError.js';
import { ROLES } from '../../config/constants.js';

// ── Society Profile ───────────────────────────────────────────────────────────

/**
 * Read-only society profile for any staff member.
 */
export const getSocietyProfile = async (societyId) => {
    if (!societyId) throw ApiError.forbidden('You are not associated with a society.');
    const society = await Society
        .findById(societyId)
        .select('name address city state zipCode phone email logo description emergencyContacts settings.maintenanceDueDay totalTowers totalUnits isActive')
        .lean();
    if (!society) throw ApiError.notFound('Society');
    return society;
};

// ── Residents list (read-only) ────────────────────────────────────────────────

/**
 * Paginated resident directory.
 */
export const listResidents = async ({ societyId, page = 1, limit = 20, search = '' }) => {
    const filter = { societyId, registrationStatus: 'APPROVED' };

    if (search) {
        const regex = new RegExp(search, 'i');
        filter.$or = [{ firstName: regex }, { lastName: regex }, { email: regex }];
    }

    const [data, total] = await Promise.all([
        User.find(filter)
            .select('firstName lastName email phone registrationStatus createdAt')
            .sort({ firstName: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        User.countDocuments(filter),
    ]);

    return {
        data,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
};

// ── Units list ────────────────────────────────────────────────────────────────

/**
 * Paginated unit list.
 */
export const listUnits = async ({ societyId, page = 1, limit = 20, towerId = '' }) => {
    const filter = { societyId, isActive: true };
    if (towerId) filter.towerId = towerId;

    const total = await unitRepo.countUnits(filter);
    const data = await unitRepo.findMany({
        filter,
        page,
        limit,
        sort: { unitNumber: 1 },
        populate: [
            { path: 'towerId', select: 'name code' },
            { path: 'floorId', select: 'floorName' },
        ],
    });

    return {
        data,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
};

// ── Role-aware Dashboard ──────────────────────────────────────────────────────

/**
 * Aggregates dashboard statistics based on the staff member's role.
 */
export const getDashboardStats = async ({ userId, societyId, role }) => {
    if (!societyId) {
        return { societyName: 'Unknown Society', role, stats: [] };
    }

    const society = await Society.findById(societyId).select('name totalTowers totalUnits').lean();
    const societyName = society?.name ?? 'Your Society';

    // ── Base stats everyone gets ──────────────────────────────────────────────
    const [approvedResidents, pendingResidents] = await Promise.all([
        User.countDocuments({ societyId, role: ROLES.RESIDENT, registrationStatus: 'APPROVED' }),
        User.countDocuments({ societyId, role: ROLES.RESIDENT, registrationStatus: 'PENDING_APPROVAL' }),
    ]);

    const [totalUnits, vacantUnits, occupiedUnits] = await Promise.all([
        unitRepo.countUnits({ societyId }),
        unitRepo.countUnits({ societyId, ownershipStatus: 'VACANT' }),
        unitRepo.countUnits({ societyId, ownershipStatus: { $ne: 'VACANT' } }),
    ]);

    const towers = await towerRepo.findBySociety(societyId);
    const totalTowers = towers.length;

    // ── Compose role-specific dashboard ──────────────────────────────────────
    switch (role) {
        case ROLES.COMMITTEE_MEMBER:
            return {
                societyName, role,
                cards: [
                    { label: 'Approved Residents', value: approvedResidents, color: 'emerald', icon: 'Users' },
                    { label: 'Pending Approvals', value: pendingResidents, color: 'amber', icon: 'Clock' },
                    { label: 'Total Units', value: totalUnits, color: 'blue', icon: 'Grid3X3' },
                    { label: 'Vacant Units', value: vacantUnits, color: 'violet', icon: 'Home' },
                ],
                quickLinks: ['residents', 'units', 'society'],
            };

        case ROLES.ACCOUNTANT:
            return {
                societyName, role,
                cards: [
                    { label: 'Total Units', value: totalUnits, color: 'blue', icon: 'Grid3X3' },
                    { label: 'Occupied Units', value: occupiedUnits, color: 'emerald', icon: 'Home' },
                    { label: 'Vacant Units', value: vacantUnits, color: 'amber', icon: 'HomeIcon' },
                    { label: 'Total Residents', value: approvedResidents, color: 'violet', icon: 'Users' },
                ],
                quickLinks: ['units', 'society'],
            };

        case ROLES.FACILITY_MANAGER:
            return {
                societyName, role,
                cards: [
                    { label: 'Total Towers', value: totalTowers, color: 'violet', icon: 'Building2' },
                    { label: 'Total Units', value: totalUnits, color: 'blue', icon: 'Grid3X3' },
                    { label: 'Occupied Units', value: occupiedUnits, color: 'emerald', icon: 'Home' },
                    { label: 'Vacant Units', value: vacantUnits, color: 'amber', icon: 'HomeIcon' },
                ],
                quickLinks: ['units', 'society'],
            };

        case ROLES.HELP_DESK:
            return {
                societyName, role,
                cards: [
                    { label: 'Total Residents', value: approvedResidents, color: 'emerald', icon: 'Users' },
                    { label: 'Pending Approvals', value: pendingResidents, color: 'amber', icon: 'Clock' },
                    { label: 'Total Units', value: totalUnits, color: 'blue', icon: 'Grid3X3' },
                    { label: 'Towers', value: totalTowers, color: 'violet', icon: 'Building2' },
                ],
                quickLinks: ['residents', 'society'],
            };

        case ROLES.SECURITY_GUARD:
            return {
                societyName, role,
                cards: [
                    { label: 'Total Residents', value: approvedResidents, color: 'emerald', icon: 'Users' },
                    { label: 'Total Units', value: totalUnits, color: 'blue', icon: 'Grid3X3' },
                    { label: 'Occupied Units', value: occupiedUnits, color: 'violet', icon: 'Home' },
                    { label: 'Towers', value: totalTowers, color: 'amber', icon: 'Building2' },
                ],
                quickLinks: ['residents', 'society'],
            };

        default:
            return { societyName, role, cards: [], quickLinks: [] };
    }
};
