/**
 * complaint.service.js — Business logic for the Complaint module.
 */

import * as complaintRepo from './complaint.repository.js';
import * as residentRepo from '../resident/resident.repository.js';
import ApiError from '../../utils/ApiError.js';
import { ROLES } from '../../config/constants.js';
import { getIO } from '../../socket/socket.server.js';
import { ROOMS } from '../../socket/rooms.js';
import User from '../auth/user.model.js';
import { sendNotification } from '../../services/notification.service.js';
import logger from '../../utils/logger.js';

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

    const status = data.status === 'DRAFT' ? 'DRAFT' : 'OPEN';

    const complaint = await complaintRepo.create({
        ...data,
        societyId,
        raisedBy: resident._id,
        unitId: data.isCommonArea ? null : resident.unitId,
        complaintNumber: genComplaintNumber(),
        status,
    });

    getIO().to(ROOMS.GLOBAL).emit('complaint_updated', { id: complaint._id });

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

// ── Change Status ──────────────────────────────────────

export const changeStatus = async (id, userId, role, societyId, data) => {
    const { status, notes, assignedTo } = data;

    const complaint = await complaintRepo.findById(id);
    if (!complaint) throw ApiError.notFound('Complaint not found.');
    if (complaint.societyId?.toString() !== societyId.toString()) {
        throw ApiError.forbidden('Complaint does not belong to your society.');
    }

    const updates = { status };

    if (status === 'OPEN') {
        // Only Resident can submit DRAFT to OPEN
        if (complaint.status !== 'DRAFT') throw ApiError.badRequest('Can only transition to OPEN from DRAFT');
        const resident = await residentRepo.findByUserId(userId);
        if (!resident || (complaint.raisedBy._id || complaint.raisedBy).toString() !== resident._id.toString()) {
            throw ApiError.forbidden('You can only submit your own drafts');
        }
    } else if (status === 'ASSIGNED') {
        // Admin or FM can assign
        if (![ROLES.SOCIETY_ADMIN, ROLES.FACILITY_MANAGER].includes(role)) {
            throw ApiError.forbidden('You cannot assign complaints');
        }
        if (!assignedTo) throw ApiError.badRequest('assignedTo is required to assign a complaint');
        updates.assignedTo = assignedTo;
        if (!complaint.firstResponseAt) updates.firstResponseAt = new Date();
    } else if (status === 'IN_PROGRESS') {
        // Handler or Admin or Resident (when responding to PENDING_RESIDENT)
        if (complaint.status === 'PENDING_RESIDENT') {
            const resident = await residentRepo.findByUserId(userId);
            if (!resident || (complaint.raisedBy._id || complaint.raisedBy).toString() !== resident._id.toString()) {
                throw ApiError.forbidden('Only the resident can respond to a PENDING_RESIDENT complaint');
            }
        }
    } else if (status === 'PENDING_RESIDENT') {
        // Handler needs info
    } else if (status === 'RESOLVED') {
        updates.actualResolutionDate = new Date();
        updates.resolvedAt = new Date(); // for auto-close tracking
        if (notes) updates.resolutionNotes = notes;
    } else if (status === 'CLOSED') {
        // Resident confirms resolution, or admin forces close
    } else if (status === 'REOPENED') {
        // Resident rejects resolution
        const resident = await residentRepo.findByUserId(userId);
        if (resident && (complaint.raisedBy._id || complaint.raisedBy).toString() !== resident._id.toString() && role !== ROLES.SOCIETY_ADMIN) {
            throw ApiError.forbidden('Only the resident can reopen their complaint');
        }
    } else if (status === 'REJECTED') {
        if (role !== ROLES.SOCIETY_ADMIN && role !== ROLES.FACILITY_MANAGER) {
            throw ApiError.forbidden('Only admin/FM can reject complaints');
        }
    }

    if (notes) {
        updates.latestNote = notes;
    }

    // Add a comment to track status change
    await complaintRepo.addComment(id, userId, {
        content: notes || `Status changed to ${status}`,
        isStatusUpdate: true,
        statusChangedTo: status,
    });

    const updatedComplaint = await complaintRepo.updateById(id, updates);
    getIO().to(ROOMS.GLOBAL).emit('complaint_updated', { id });

    // Sync Notification Logic
    try {
        if (status === 'ASSIGNED' && updatedComplaint.assignedTo) {
            const staffUser = await User.findById(updatedComplaint.assignedTo).select('_id fcmTokens').lean();
            if (staffUser) {
                await sendNotification({
                    users: [staffUser],
                    societyId,
                    type: 'COMPLAINT_ASSIGNED',
                    title: 'Complaint Assigned',
                    message: `You have been assigned complaint ${updatedComplaint.complaintNumber}.`,
                    referenceType: 'COMPLAINT',
                    referenceId: updatedComplaint._id
                });
            }
        } else if (status === 'RESOLVED' || status === 'PENDING_RESIDENT' || status === 'CLOSED' || status === 'REJECTED') {
            const residentObj = await residentRepo.findById(updatedComplaint.raisedBy);
            if (residentObj) {
                const resUser = await User.findById(residentObj.userId).select('_id fcmTokens').lean();
                if (resUser) {
                    await sendNotification({
                        users: [resUser],
                        societyId,
                        type: status === 'RESOLVED' ? 'COMPLAINT_RESOLVED' : 'COMPLAINT_UPDATED',
                        title: `Complaint ${status}`,
                        message: `Your complaint ${updatedComplaint.complaintNumber} is now ${status}.`,
                        referenceType: 'COMPLAINT',
                        referenceId: updatedComplaint._id
                    });
                }
            }
        }
    } catch (notifErr) {
        // We log but don't fail the request if notifications fail
        logger.error(`Failed to send complaint notification: ${notifErr.message}`);
    }

    return updatedComplaint;
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

    const updatedComplaint = await complaintRepo.updateById(id, { status: "ESCALATED", escalationNotes: data.escalationNotes });
    getIO().to(ROOMS.GLOBAL).emit('complaint_updated', { id });
    return updatedComplaint;
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
    
    const updatedComplaint = await complaintRepo.updateById(id, data);
    getIO().to(ROOMS.GLOBAL).emit('complaint_updated', { id });
    return updatedComplaint;
}
