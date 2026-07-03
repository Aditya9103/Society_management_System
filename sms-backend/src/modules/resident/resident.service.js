import mongoose from 'mongoose';
import * as residentRepo from './resident.repository.js';
import * as userRepo from '../auth/user.repository.js';
import * as unitRepo from '../../shared/repositories/unit.repository.js';
import * as societyRepo from '../society/society.repository.js';
import ApiError from '../../utils/ApiError.js';
import { uploadFile } from '../../services/storage.service.js';
import { uploadToCloudinary } from '../../middleware/upload.middleware.js';

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

    // Update user status to PENDING_APPROVAL and bind societyId immediately for fast response
    const updatedUser = await userRepo.updateUser(userId, {
        registrationStatus: 'PENDING_APPROVAL',
        societyId: unit.societyId,
    });

    // Upload profile photo asynchronously in the background if provided
    if (profileData.profilePhotoBuffer) {
        uploadToCloudinary(profileData.profilePhotoBuffer, 'avatars')
            .then(uploadResult => {
                userRepo.updateUser(userId, { profilePhotoUrl: uploadResult.secure_url })
                    .catch(err => console.error('Failed to update user with profile photo URL:', err));
            })
            .catch(err => console.error('Failed to upload profile photo to Cloudinary:', err));
    }

    // Fetch society admins to notify
    const admins = await userRepo.findByRoleInSociety(unit.societyId, ['SOCIETY_ADMIN']);
    if (admins.length > 0) {
        import('../../services/notification.service.js').then(({ sendNotification }) => {
            sendNotification({
                users: admins,
                societyId: unit.societyId,
                type: 'RESIDENT_APPROVAL_PENDING',
                title: 'New Resident Registration',
                message: `${user.firstName} ${user.lastName} has applied to join Unit ${unit.unitNumber}. Pending approval.`,
                priority: 'HIGH',
                referenceType: 'USER',
                referenceId: user._id,
            }).catch(err => console.error('Failed to notify admins of resident reg:', err));
        });
    }

    return { profile, user: updatedUser };
};

/**
 * Get the authenticated resident's own profile.
 * Populates unit and society for dashboard display.
 *
 * @param {string} userId
 * @returns {Promise<ResidentProfileDocument>}
 */
export const getMyResidentProfile = async (userId) => {
    const profile = await residentRepo.findByUserId(userId);
    if (!profile) return null; // Resident hasn't completed step 3 yet

    // Populate references
    await profile.populate('unitId', 'unitNumber bhkType unitType ownershipStatus');
    await profile.populate('societyId', 'name address city state emergencyContacts logoUrl');
    await profile.populate('userId', 'firstName lastName email phone registrationStatus');

    return profile;
};

// ── Update own profile ────────────────────────────────────────────────────────

export const updateMyProfile = async (userId, data) => {
    const user = await userRepo.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    const allowedFields = ['firstName', 'lastName', 'phone'];
    const updates = Object.fromEntries(
        Object.entries(data).filter(([k]) => allowedFields.includes(k))
    );

    return userRepo.updateUser(userId, updates);
};

export const updateMyAvatar = async (userId, imageBuffer) => {
    const uploadResult = await uploadFile(imageBuffer, { folder: 'resident_avatars' });

    // Save photo to User document
    const updatedUser = await userRepo.updateUser(userId, { profilePhotoUrl: uploadResult.secure_url });
    const profile = await residentRepo.findByUserId(userId);

    return { profile, user: updatedUser };
};

// ── Family Members ────────────────────────────────────────────────────────────

export const addFamilyMember = async (userId, memberData) => {
    const resident = await residentRepo.findByUserId(userId);
    if (!resident) throw ApiError.notFound('Resident profile not found.');
    return residentRepo.addFamilyMember(resident._id, memberData);
};

export const updateFamilyMember = async (userId, memberId, memberData) => {
    const resident = await residentRepo.findByUserId(userId);
    if (!resident) throw ApiError.notFound('Resident profile not found.');
    const updated = await residentRepo.updateFamilyMember(resident._id, memberId, memberData);
    if (!updated) throw ApiError.notFound('Family member not found.');
    return updated;
};

export const removeFamilyMember = async (userId, memberId) => {
    const resident = await residentRepo.findByUserId(userId);
    if (!resident) throw ApiError.notFound('Resident profile not found.');
    return residentRepo.removeFamilyMember(resident._id, memberId);
};

// ── Emergency Contacts ────────────────────────────────────────────────────────

export const addEmergencyContact = async (userId, contactData) => {
    const resident = await residentRepo.findByUserId(userId);
    if (!resident) throw ApiError.notFound('Resident profile not found.');
    if (resident.emergencyContacts && resident.emergencyContacts.length >= 10) {
        throw ApiError.badRequest('Maximum limit of 10 emergency contacts reached.');
    }
    return residentRepo.addEmergencyContact(resident._id, contactData);
};

export const updateEmergencyContact = async (userId, contactId, contactData) => {
    const resident = await residentRepo.findByUserId(userId);
    if (!resident) throw ApiError.notFound('Resident profile not found.');
    const updated = await residentRepo.updateEmergencyContact(resident._id, contactId, contactData);
    if (!updated) throw ApiError.notFound('Emergency contact not found.');
    return updated;
};

export const removeEmergencyContact = async (userId, contactId) => {
    const resident = await residentRepo.findByUserId(userId);
    if (!resident) throw ApiError.notFound('Resident profile not found.');
    return residentRepo.removeEmergencyContact(resident._id, contactId);
};
