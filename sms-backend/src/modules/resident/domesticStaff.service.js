import * as dsRepo from './domesticStaff.repository.js';
import * as residentRepo from './resident.repository.js';
import ApiError from '../../utils/ApiError.js';
import { generateQRCodeDataURI } from '../../services/qr.service.js';

export const addDomesticStaff = async (userId, societyId, data) => {
    const resident = await residentRepo.findByUserId(userId);
    if (!resident) throw ApiError.notFound('Resident profile not found.');

    const qrCodeStr = `DS-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const staffData = {
        ...data,
        societyId,
        registeredBy: resident._id,
        qrCode: qrCodeStr,
    };

    const staff = await dsRepo.create(staffData);
    return staff;
};

export const getMyDomesticStaff = async (userId) => {
    const resident = await residentRepo.findByUserId(userId);
    if (!resident) throw ApiError.notFound('Resident profile not found.');

    const staffList = await dsRepo.findByResident(resident._id);
    
    // Attach QR code URI for frontend display
    for (let staff of staffList) {
        if (staff.qrCode) {
            staff.qrCodeUri = await generateQRCodeDataURI(staff.qrCode);
        }
    }
    
    return staffList;
};

export const updateDomesticStaff = async (id, userId, data) => {
    const resident = await residentRepo.findByUserId(userId);
    if (!resident) throw ApiError.notFound('Resident profile not found.');

    const staff = await dsRepo.findById(id);
    if (!staff || staff.registeredBy.toString() !== resident._id.toString()) {
        throw ApiError.notFound('Domestic staff not found or access denied.');
    }

    return dsRepo.updateById(id, data);
};

export const removeDomesticStaff = async (id, userId) => {
    const resident = await residentRepo.findByUserId(userId);
    if (!resident) throw ApiError.notFound('Resident profile not found.');

    const staff = await dsRepo.findById(id);
    if (!staff || staff.registeredBy.toString() !== resident._id.toString()) {
        throw ApiError.notFound('Domestic staff not found or access denied.');
    }

    return dsRepo.deleteById(id);
};
