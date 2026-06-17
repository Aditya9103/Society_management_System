import bcrypt from 'bcryptjs';
import ApiError from '../../utils/ApiError.js';
import { sendEmail } from '../../services/email.service.js';
import * as userRepo from '../auth/user.repository.js';
import * as residentRepo from '../resident/resident.repository.js';
import Tower from '../../shared/models/Tower.js';

export const createStaff = async (staffData) => {
    const { firstName, lastName, email, phone, role, societyId } = staffData;

    const existing = await userRepo.findByEmail(email);
    if (existing) throw ApiError.badRequest('Email already in use.');

    const generatedPassword = Math.random().toString(36).slice(-8) + 'B2@';
    const passwordHash = await bcrypt.hash(generatedPassword, 10);

    const user = await userRepo.createUser({
        firstName,
        lastName,
        email,
        phone,
        societyId,
        passwordHash,
        role,
        registrationStatus: 'APPROVED',
        isEmailVerified: true,
    });

    await sendEmail({
        to: email,
        subject: `Welcome to SMS - Your ${role} Credentials`,
        text: `Hello ${firstName},\n\nYou have been added as a ${role}.\nLogin: ${email}\nPassword: ${generatedPassword}\n\nPlease log in and change your password.`,
    });

    return user;
};

export const approveResident = async (residentUserId, adminUserId, adminComments) => {
    const user = await userRepo.findById(residentUserId);
    if (!user) throw ApiError.notFound('Resident user not found.');

    if (user.role !== 'RESIDENT') throw ApiError.badRequest('User is not a resident.');
    if (user.registrationStatus !== 'PENDING_APPROVAL') {
        throw ApiError.badRequest(`Resident status is ${user.registrationStatus}, cannot approve.`);
    }

    const residentDoc = await residentRepo.findByUserId(residentUserId);
    if (!residentDoc) throw ApiError.notFound('Resident profile not found.');

    // Update User
    await userRepo.updateUser(residentUserId, { registrationStatus: 'APPROVED' });

    // Update Resident schema
    await residentRepo.updateResident(residentDoc._id, {
        approvalStatus: 'APPROVED',
        approvedBy: adminUserId,
        approvedAt: new Date(),
        ...(adminComments && { rejectionReason: adminComments })
    });

    await sendEmail({
        to: user.email,
        subject: 'SMS Registration Approved',
        text: `Hello ${user.firstName},\n\nYour resident registration has been approved! You can now log into the portal.\n\nRegards,\nSociety Management`,
        html: `<h3>Hello ${user.firstName},</h3><p>Your resident registration has been approved!</p><p>You can now log into the portal.</p><br><p>Regards,<br>Society Management</p>`,
    });

    return user;
};

