import mongoose from 'mongoose';
import * as residentRepo from './resident.repository.js';
import * as userRepo from '../auth/user.repository.js';
import * as unitRepo from '../../shared/repositories/unit.repository.js';
import ApiError from '../../utils/ApiError.js';

/**
 * Step 3: Complete Resident Profile
 * 
 * @param {string} userId - ID of the resident
 * @param {object} profileData - Flat details and documents
 * @returns {Promise<ResidentProfileDocument>}
 */
export const completeResidentProfile = async (userId, profileData) => {
    const user = await userRepo.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    if (user.registrationStatus !== 'INCOMPLETE_PROFILE') {
        throw ApiError.badRequest(`Cannot complete profile. Current status is: ${user.registrationStatus}`);
    }

    if (!profileData.unitId) {
        throw ApiError.badRequest('unitId is required to complete profile.');
    }

    const unit = await unitRepo.findById(profileData.unitId);
    if (!unit) {
        throw ApiError.notFound('Unit not found. Please select a valid unit.');
    }

    // Generate a unique resident code safely
    const residentCode = `RES-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const profile = await residentRepo.createResident({
        userId,
        unitId: unit._id,
        societyId: unit.societyId,
        residentCode,
        ownershipType: profileData.ownershipType,
        uploadedDocuments: [profileData.aadhaarUrl, profileData.agreementUrl].filter(Boolean),
    });

    // Update user status to PENDING_APPROVAL and bind societyId
    await userRepo.updateUser(userId, {
        registrationStatus: 'PENDING_APPROVAL',
        societyId: unit.societyId
    });

    return profile;
};
