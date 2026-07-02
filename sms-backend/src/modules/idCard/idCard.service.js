import crypto from 'crypto';
import env from '../../config/env.js';
import * as idCardRepo from './idCard.repository.js';
import * as residentRepo from '../resident/resident.repository.js';
import { uploadToCloudinary } from '../../middleware/upload.middleware.js';
import ApiError from '../../utils/ApiError.js';
import { sendEmail } from '../../services/email.service.js';
import { sendNotification } from '../../services/notification.service.js';

const generateSignature = (payload) => {
    return crypto
        .createHmac('sha256', env.idCardSecret || 'fallback_secret')
        .update(JSON.stringify(payload))
        .digest('hex');
};

const verifySignature = (payload, signature) => {
    const expectedSignature = generateSignature(payload);
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
};

export const generateAndUploadIdCard = async (residentId) => {
    const resident = await residentRepo.findById(residentId);
    if (!resident) throw ApiError.notFound('Resident not found');

    // Populate needed fields
    await resident.populate('userId', 'firstName lastName email');
    await resident.populate('societyId', 'name address');
    await resident.populate('unitId', 'unitNumber');

    // 1. Create lightweight QR Code Payload
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 1); // Valid for 1 year

    // Only include essential identifiers to keep the QR code matrix small and highly scannable
    const payload = {
        r: resident.residentCode, // residentCode
    };

    const qrDataString = JSON.stringify(payload);

    // 2. Save to Database
    const idCard = await idCardRepo.createIdCard({
        residentId: resident._id,
        userId: resident.userId._id,
        societyId: resident.societyId._id,
        unitId: resident.unitId._id,
        idCardUrl: '', // Will be uploaded by frontend later
        storageKey: '',
        validUntil,
    });

    // 3. Update Resident model for backward compatibility
    await residentRepo.updateResident(resident._id, {
        idCardGeneratedAt: new Date(),
        qrData: qrDataString,
    });

    // Attach qrData so frontend can render the QR
    return { ...idCard.toObject(), qrData: qrDataString };
};

export const uploadIdCardPdf = async (residentId, fileBuffer) => {
    const resident = await residentRepo.findById(residentId).populate('userId');
    if (!resident) throw ApiError.notFound('Resident not found');

    const uploadResult = await uploadToCloudinary(fileBuffer, 'id_cards');

    const updatedCard = await idCardRepo.updateByResidentId(residentId, {
        idCardUrl: uploadResult.secure_url,
        storageKey: uploadResult.public_id,
    });

    await residentRepo.updateResident(residentId, {
        idCardUrl: uploadResult.secure_url,
    });

    // Send email with the generated ID Card URL asynchronously
    if (resident.userId?.email) {
        sendEmail({
            to: resident.userId.email,
            subject: 'Your Digital ID Card is Ready',
            html: `
                <h3>Hello ${resident.userId.firstName},</h3>
                <p>Your Digital ID Card has been generated and is ready to use.</p>
                <p>You can download or print it to show at the gate.</p>
                <p><a href="${uploadResult.secure_url}" target="_blank">Download ID Card PDF</a></p>
                <br/>
                <p>Thank you,</p>
                <p>Society Management System</p>
            `,
        }).catch(error => console.error('Failed to send ID Card email:', error));
    }

    // Send in-app notification asynchronously
    if (resident.userId?._id) {
        sendNotification({
            users: [resident.userId],
            societyId: resident.societyId,
            type: 'ID_CARD_GENERATED',
            title: 'Digital ID Card Generated',
            message: 'Your official Digital ID Card has been generated and is ready to download.',
            priority: 'NORMAL',
        }).catch(error => console.error('Failed to send ID Card notification:', error));
    }

    return updatedCard;
};

export const verifyIdCard = async (qrData) => {
    try {
        if (typeof qrData === 'string') {
            qrData = JSON.parse(qrData);
        }

        // Support both old heavy payloads and new lightweight payloads
        const residentCode = qrData.r || qrData.resident_id;

        if (!residentCode) {
            throw ApiError.badRequest('Invalid QR Code format.');
        }

        // Fetch Resident details
        const resident = await residentRepo.findByResidentCode(residentCode);
        if (!resident) {
            throw ApiError.notFound('Resident not found in the system.');
        }

        await resident.populate('userId', 'firstName lastName email phone photoUrl');
        await resident.populate('unitId', 'unitNumber block');

        return {
            isValid: true,
            resident: {
                id: resident._id,
                name: `${resident.userId.firstName} ${resident.userId.lastName}`,
                unit: resident.unitId.unitNumber,
                status: resident.status,
                photoUrl: resident.userId.photoUrl,
            },
        };
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw ApiError.badRequest('Failed to parse or verify QR Code.');
    }
};

export const emailIdCard = async (userId) => {
    const idCard = await idCardRepo.findByUserId(userId);
    if (!idCard) throw ApiError.notFound('ID Card not found for this user.');

    const resident = await residentRepo.findById(idCard.residentId).populate('userId');
    if (!resident || !resident.userId) throw ApiError.notFound('Resident user not found.');

    await sendEmail({
        to: resident.userId.email,
        subject: 'Your Digital ID Card',
        html: `
            <h3>Hello ${resident.userId.firstName},</h3>
            <p>Your Digital ID Card is attached below as a link.</p>
            <p>You can download or print it to show at the gate.</p>
            <p><a href="${idCard.idCardUrl}" target="_blank">Download ID Card PDF</a></p>
            <br/>
            <p>Thank you,</p>
            <p>Society Management System</p>
        `,
    });

    return true;
};
