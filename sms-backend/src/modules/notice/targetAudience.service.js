import User from '../auth/user.model.js';
import Resident from '../resident/resident.model.js';
import Unit from '../../shared/models/Unit.js';
import logger from '../../utils/logger.js';

/**
 * Resolves a target audience payload into a list of users (containing id and fcmTokens).
 * @param {string} societyId 
 * @param {Object} targetAudience 
 * @returns {Promise<Array<Object>>} Array of user documents with _id and fcmTokens
 */
export const resolveTargetAudience = async (societyId, targetAudience) => {
    try {
        const { type, towerIds = [], floorIds = [], residentIds = [], unitType } = targetAudience || {};

        if (!type || type === 'ALL') {
            return User.find({ societyId, isActive: true }).select('_id fcmTokens').lean();
        }

        if (type === 'CUSTOM') {
            return User.find({ _id: { $in: residentIds }, isActive: true }).select('_id fcmTokens').lean();
        }

        // We need to find units that match the criteria
        const unitQuery = { societyId };
        if (towerIds.length > 0) unitQuery.towerId = { $in: towerIds };
        if (floorIds.length > 0) unitQuery.floorId = { $in: floorIds };
        if (unitType) unitQuery.unitType = unitType;

        // If the target is TOWER, FLOOR, or UNIT_TYPE, we find the matching units
        let matchingUnitIds = [];
        if (type === 'TOWER' || type === 'FLOOR' || type === 'UNIT_TYPE' || type === 'OWNERS' || type === 'TENANTS') {
            const units = await Unit.find(unitQuery).select('_id').lean();
            matchingUnitIds = units.map(u => u._id);
        }

        // Now find the residents living in those units
        const residentQuery = { societyId, status: 'ACTIVE' };
        if (matchingUnitIds.length > 0) {
            residentQuery.unitId = { $in: matchingUnitIds };
        }

        if (type === 'OWNERS') residentQuery.ownershipType = 'OWNER';
        if (type === 'TENANTS') residentQuery.ownershipType = 'TENANT';

        const residents = await Resident.find(residentQuery).select('userId').lean();
        const userIds = residents.map(r => r.userId);

        // Final query to User model
        return User.find({ _id: { $in: userIds }, isActive: true }).select('_id fcmTokens').lean();
    } catch (error) {
        logger.error(`Error resolving target audience: ${error.message}`);
        return [];
    }
};
