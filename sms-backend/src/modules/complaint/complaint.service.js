/**
 * complaint.service.js — Business logic for the Complaint module.
 */

import * as complaintRepo from './complaint.repository.js';
import * as residentRepo from '../resident/resident.repository.js';
import ApiError from '../../utils/ApiError.js';
import { ROLES } from '../../config/constants.js';

const STAFF_WHO_CAN_READ = [
    ROLES.SOCIETY_ADMIN,
    ROLES.COMMITTEE_MEMBER,
    ROLES.FACILITY_MANAGER,
    ROLES.HELP_DESK,
];

// Auto-generate complaint number: CMP-YYYYMM-XXXX
const genComplaintNumber = () => {
    const d = new Date();
    const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `CMP-${ym}-${rand}`;
};

// ── Resident — raise a complaint ──────────────────────────────────────────────

export const raiseComplaint = async (userId, societyId, data) => {
    // Look up resident record to link residentId
    const resident = await residentRepo.findByUserId(userId);
    if (!resident) throw ApiError.notFound('Resident profile not found. Please complete registration first.');

    const complaint = await complaintRepo.create({
        ...data,
        societyId,
        raisedBy: resident._id,
        unitId: data.isCommonArea ? null : resident.unitId,
        complaintNumber: genComplaintNumber(),
        status: 'OPEN',
    });

    return complaint;
};

// ── Resident — list own complaints ────────────────────────────────────────────

export const listMyComplaints = async (userId, query = {}) => {
    const resident = await residentRepo.findByUserId(userId);
    if (!resident) throw ApiError.notFound('Resident profile not found.');

    const { page = 1, limit = 20, status } = query;
    const { data, total } = await complaintRepo.findByResident(resident._id, { page, limit, status });

    return {
        data,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// ── Resident — get single complaint ──────────────────────────────────────────

export const getComplaintById = async (id, userId, role) => {
    const complaint = await complaintRepo.findById(id);
    if (!complaint) throw ApiError.notFound('Complaint not found.');

    // Staff and admin can read any complaint in their society
    if (STAFF_WHO_CAN_READ.includes(role) || role === ROLES.SOCIETY_ADMIN) {
        return complaint;
    }

    // Resident can only read own complaint
    const resident = await residentRepo.findByUserId(userId);
    if (!resident || complaint.raisedBy?.toString() !== resident._id.toString()) {
        throw ApiError.forbidden('You do not have access to this complaint.');
    }

    return complaint;
};

// ── Admin/Staff — list all society complaints ─────────────────────────────────

export const listAllComplaints = async (societyId, query = {}) => {
    const { page = 1, limit = 20, status, category, assignedTo } = query;

    const { data, total } = await complaintRepo.findBySociety(societyId, {
        page, limit, status, category, assignedTo,
    });

    return {
        data,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// ── Admin/FM — assign complaint to staff ──────────────────────────────────────

export const assignComplaint = async (id, societyId, assignedTo) => {
    const complaint = await complaintRepo.findById(id);
    if (!complaint) throw ApiError.notFound('Complaint not found.');
    if (complaint.societyId?.toString() !== societyId.toString()) {
        throw ApiError.forbidden('Complaint does not belong to your society.');
    }
    if (['CLOSED', 'RESOLVED', 'REJECTED'].includes(complaint.status)) {
        throw ApiError.badRequest(`Cannot assign a complaint with status: ${complaint.status}`);
    }

    return complaintRepo.updateById(id, {
        assignedTo,
        status: 'ASSIGNED',
        firstResponseAt: complaint.firstResponseAt ?? new Date(),
    });
};

// ── Admin — close/resolve complaint ───────────────────────────────────────────

export const closeComplaint = async (id, societyId, { resolutionNotes } = {}) => {
    const complaint = await complaintRepo.findById(id);
    if (!complaint) throw ApiError.notFound('Complaint not found.');
    if (complaint.societyId?.toString() !== societyId.toString()) {
        throw ApiError.forbidden('Complaint does not belong to your society.');
    }

    return complaintRepo.updateById(id, {
        status: 'RESOLVED',
        resolutionNotes,
        actualResolutionDate: new Date(),
    });
};

// ── Admin/FM — escalate complaint ───────────────────────────────────────────

export const escalateComplaint = async (id, societyId, data) => {
    const complaint = await complaintRepo.findById(id);
    if (!complaint) throw ApiError.notFound('Complaint not found');
    if (complaint.societyId.toString() !== societyId.toString()) {
        throw ApiError.forbidden('Complaint does not belong to your society');
    }
    if (['CLOSED', 'RESOLVED', 'REJECTED'].includes(complaint.status)) {
        throw ApiError.badRequest('Complaint is already closed');
    }

    return complaintRepo.updateById(id, { status: "ESCALATED", escalationNotes: data.escalationNotes });
}

// ── Admin/FM — update complaint ────────────────────────────────────────────

export const updateComplaint = async (id, societyId, data) => {
    const complaint = await complaintRepo.findById(id);
    if (!complaint) throw ApiError.notFound('Complaint not found')
    if (complaint.societyId?.toString() !== societyId.toString()) {
        throw ApiError.forbiden('Complaint does not belong to your society');
    }
    if (['CLOSED', 'REJECTED'].includes(complaint.status)) {
        throw ApiError.badRequest(`Cannot update complaint with status: ${complaint.status}`);
    }
    if (data.status === 'RESOLVED') {
        data.actualResolutionDate = new Date();
    }
    return complaintRepo.updateById(id, data)
}
