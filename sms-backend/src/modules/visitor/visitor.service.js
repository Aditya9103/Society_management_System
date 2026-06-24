/**
 * visitor.service.js — Business logic for the Visitor module.
 */

import * as visitorRepo from './visitor.repository.js';
import * as residentRepo from '../resident/resident.repository.js';
import * as logRepo from './visitorLog.repository.js';
import DomesticStaff from '../resident/domesticStaff.model.js';
import mongoose from 'mongoose';
import ApiError from '../../utils/ApiError.js';
import { generateQRCodeDataURI } from '../../services/qr.service.js';
import { sendNotification } from '../../services/notification.service.js';
import { getIO } from '../../socket/socket.server.js';
import { ROOMS } from '../../socket/rooms.js';
import Unit from '../../shared/models/Unit.js';
import User from '../auth/user.model.js';

const getQrExpiry = (type) => {
    const now = new Date();
    switch (type) {
        case 'GUEST': now.setHours(now.getHours() + 24); break;
        case 'DELIVERY': now.setHours(now.getHours() + 4); break;
        case 'CAB': now.setHours(now.getHours() + 2); break;
        case 'SERVICE': now.setHours(now.getHours() + 8); break;
        case 'CONTRACTOR': now.setDate(now.getDate() + 7); break; // Multi-day generic
        case 'DOMESTIC_STAFF': return null; // Controlled by time schedules
        default: now.setHours(now.getHours() + 24); break;
    }
    return now;
};

// ── Resident — create visitor pass (Flow A) ──────────────────────────────────

export const createVisitorPass = async (userId, societyId, data) => {
    const resident = await residentRepo.findByUserId(userId);
    if (!resident) throw ApiError.notFound('Resident profile not found.');

    const qrCode = `INV-${Date.now()}-${Math.floor(Math.random()*10000)}`;
    const qrExpiresAt = getQrExpiry(data.visitorType);

    const visitor = await visitorRepo.create({
        ...data,
        societyId,
        hostResidentId: resident._id,
        hostUnitId: resident.unitId,
        status: 'PENDING',
        qrCode,
        qrExpiresAt,
        approvalMethod: 'QR_SCAN'
    });

    // Skipping email dispatch as per user spec (only FCM/Sockets)
    return visitor;
};

// ── Resident — Walk-In Approval (Flow B) ──────────────────────────────────────

export const approveWalkIn = async (visitorId, userId) => {
    const resident = await residentRepo.findByUserId(userId);
    if (!resident) throw ApiError.notFound('Resident profile not found.');

    let visitor = await visitorRepo.findById(visitorId);
    const hostIdStr = visitor?.hostResidentId?._id ? visitor.hostResidentId._id.toString() : visitor?.hostResidentId?.toString();
    if (!visitor || hostIdStr !== resident._id.toString()) {
        throw ApiError.forbidden('Access denied.');
    }
    if (visitor.status !== 'PENDING') {
        throw ApiError.badRequest('Visitor is not pending approval.');
    }

    visitor = await visitorRepo.updateById(visitorId, { status: 'APPROVED', residentResponse: 'APPROVED' });
    await logRepo.createLog({ visitorId, societyId: visitor.societyId, eventType: 'APPROVED_BY_RESIDENT' });

    getIO().to(ROOMS.GUARD).emit('visitor:approved', { visitorId, visitorName: visitor.visitorName, flatId: visitor.hostUnitId });
    return visitor;
};

export const denyWalkIn = async (visitorId, userId) => {
    const resident = await residentRepo.findByUserId(userId);
    if (!resident) throw ApiError.notFound('Resident profile not found.');

    let visitor = await visitorRepo.findById(visitorId);
    const hostIdStr = visitor?.hostResidentId?._id ? visitor.hostResidentId._id.toString() : visitor?.hostResidentId?.toString();
    if (!visitor || hostIdStr !== resident._id.toString()) {
        throw ApiError.forbidden('Access denied.');
    }

    visitor = await visitorRepo.updateById(visitorId, { status: 'DENIED', residentResponse: 'DENIED' });
    await logRepo.createLog({ visitorId, societyId: visitor.societyId, eventType: 'DENIED_BY_RESIDENT' });

    getIO().to(ROOMS.GUARD).emit('visitor:denied', { visitorId, visitorName: visitor.visitorName, flatId: visitor.hostUnitId });
    return visitor;
};

// ── Guard — Process Walk-In (Flow B) ──────────────────────────────────────────

export const processWalkIn = async (guardId, societyId, data) => {
    if (!data.hostResidentId) {
        let unitIdToSearch = data.hostUnitId;

        // If the guard types "101" instead of a Mongo ID, look up the Unit first
        if (!mongoose.Types.ObjectId.isValid(data.hostUnitId)) {
            const unitDoc = await Unit.findOne({ societyId, unitNumber: data.hostUnitId });
            if (!unitDoc) throw ApiError.badRequest(`No unit found with number ${data.hostUnitId}`);
            unitIdToSearch = unitDoc._id;
            data.hostUnitId = unitDoc._id; // Replace the string with the ObjectId so creation doesn't fail
        }

        const resident = await residentRepo.findByUnitId(unitIdToSearch);
        if (!resident) throw ApiError.badRequest('No resident found for the specified unit');
        data.hostResidentId = resident._id;
    }

    const visitor = await visitorRepo.create({
        ...data,
        societyId,
        entryGuardId: guardId,
        status: 'PENDING',
        approvalMethod: 'REAL_TIME_APPROVAL'
    });

    await logRepo.createLog({
        visitorId: visitor._id,
        societyId,
        guardId,
        eventType: 'APPROVAL_SENT'
    });

    // Notify Resident
    if (visitor.hostResidentId) {
        const residentHost = await residentRepo.findById(visitor.hostResidentId);
        
        if (residentHost && residentHost.userId) {
            getIO().to(ROOMS.USER(residentHost.userId)).emit('visitor:approval_request', {
                visitorId: visitor._id,
                flatId: visitor.hostUnitId,
                name: visitor.visitorName,
                purpose: visitor.purpose
            });

            // Also push notification
            const resUser = await User.findById(residentHost.userId).select('_id fcmTokens').lean();
            if (resUser) {
                await sendNotification({
                    users: [resUser],
                    societyId: societyId,
                    title: 'Visitor at Gate',
                    message: `${visitor.visitorName} is at the gate.`,
                    type: 'VISITOR_APPROVAL_REQUEST',
                    priority: 'HIGH',
                    referenceType: 'VISITOR',
                    referenceId: visitor._id
                });
            }
        }
    }

    return visitor;
};

// ── Guard — Scan QR (Flow A & C) ──────────────────────────────────────────────

export const scanQrCode = async (guardId, societyId, qrCode) => {
    let visitor = await visitorRepo.findByQrCode(qrCode);
    
    if (!visitor) {
        // Look up static QR from Domestic Staff
        const ds = await DomesticStaff.findOne({ qrCode, societyId }).populate('registeredBy', 'unitId residentCode');
        
        if (ds) {
            if (!ds.isActive) throw ApiError.badRequest('Domestic Staff profile is inactive.');
            
            // Note: Timings are soft-enforced per user request, so we only strictly check allowedDays
            const today = new Date().getDay();
            if (ds.allowedDays && ds.allowedDays.length > 0 && !ds.allowedDays.includes(today)) {
                throw ApiError.badRequest('Staff is not allowed on this day.');
            }

            // Create a temporary daily pass on the fly
            visitor = await visitorRepo.create({
                societyId,
                hostUnitId: ds.registeredBy?.unitId,
                hostResidentId: ds.registeredBy?._id,
                visitorName: ds.name,
                visitorPhone: ds.phone,
                visitorType: 'DOMESTIC_STAFF',
                visitorPhotoUrl: ds.photoUrl,
                status: 'APPROVED',
                approvalMethod: 'DOMESTIC_RECURRING',
                domesticStaffId: ds._id,
            });

            await logRepo.createLog({ visitorId: visitor._id, societyId, guardId, eventType: 'QR_SCAN' });
            return visitor;
        }
    }

    if (!visitor || visitor.societyId.toString() !== societyId.toString()) {
        throw ApiError.notFound('Invalid QR Code');
    }

    await logRepo.createLog({ visitorId: visitor._id, societyId, guardId, eventType: 'QR_SCAN' });

    if (['DENIED', 'EXPIRED', 'CANCELLED', 'EXITED'].includes(visitor.status)) {
        throw ApiError.badRequest(`QR Code is invalid. Status is ${visitor.status}`);
    }

    if (visitor.qrExpiresAt && new Date() > new Date(visitor.qrExpiresAt)) {
        await visitorRepo.updateById(visitor._id, { status: 'EXPIRED' });
        throw ApiError.badRequest('QR Code has expired.');
    }

    // If domestic staff from old flow, check timings
    if (visitor.visitorType === 'DOMESTIC_STAFF' && visitor.domesticStaffId) {
        const staff = await DomesticStaff.findById(visitor.domesticStaffId);
        if (staff) {
            const today = new Date().getDay();
            if (staff.allowedDays && staff.allowedDays.length > 0 && !staff.allowedDays.includes(today)) {
                throw ApiError.badRequest('Staff is not allowed on this day.');
            }
        }
    }

    return visitor;
};

// ── Guard — Log Physical Entry / Exit ─────────────────────────────────────────

export const getActiveVisitors = async (societyId, query = {}) => {
    const { page = 1, limit = 50 } = query;
    const { data, total } = await visitorRepo.findBySociety(societyId, { page, limit, status: ['APPROVED', 'INSIDE'] });
    return { data, total };
};

export const logEntry = async (guardId, societyId, visitorId, gateId) => {
    let visitor = await visitorRepo.findById(visitorId);
    if (!visitor) throw ApiError.notFound('Visitor not found');
    
    if (visitor.status !== 'APPROVED' && visitor.status !== 'PENDING') {
        throw ApiError.badRequest(`Cannot grant entry. Status is ${visitor.status}`);
    }

    visitor = await visitorRepo.updateById(visitorId, { 
        status: 'INSIDE', 
        entryTime: new Date(),
        entryGuardId: guardId,
        entryGateId: gateId
    });

    await logRepo.createLog({ visitorId, societyId, guardId, gateId, eventType: 'ENTRY' });

    if (visitor.hostResidentId) {
        const residentHost = await residentRepo.findById(visitor.hostResidentId);
        if (residentHost && residentHost.userId) {
            const resUser = await User.findById(residentHost.userId).select('_id fcmTokens').lean();
            if (resUser) {
                await sendNotification({
                    users: [resUser],
                    societyId: societyId,
                    title: 'Visitor Entered',
                    message: `${visitor.visitorName} has entered the premises.`,
                    type: 'VISITOR_ENTRY',
                    referenceType: 'VISITOR',
                    referenceId: visitor._id
                });
            }
        }
    }

    return visitor;
};

export const logExit = async (guardId, societyId, visitorId, gateId) => {
    let visitor = await visitorRepo.findById(visitorId);
    if (!visitor) throw ApiError.notFound('Visitor not found');
    if (visitor.status !== 'INSIDE') throw ApiError.badRequest('Visitor is not inside.');

    visitor = await visitorRepo.updateById(visitorId, { 
        status: 'EXITED', 
        exitTime: new Date(),
        exitGuardId: guardId
    });

    await logRepo.createLog({ visitorId, societyId, guardId, gateId, eventType: 'EXIT' });

    if (visitor.hostResidentId) {
        const residentHost = await residentRepo.findById(visitor.hostResidentId);
        if (residentHost && residentHost.userId) {
            const resUser = await User.findById(residentHost.userId).select('_id fcmTokens').lean();
            if (resUser) {
                await sendNotification({
                    users: [resUser],
                    societyId: societyId,
                    title: 'Visitor Exited',
                    message: `${visitor.visitorName} has left the premises.`,
                    type: 'VISITOR_EXIT',
                    referenceType: 'VISITOR',
                    referenceId: visitor._id
                });
            }
        }
    }

    return visitor;
};

// ── Resident — List and Get ───────────────────────────────────────────────────

export const listMyVisitors = async (userId, query = {}) => {
    const resident = await residentRepo.findByUserId(userId);
    if (!resident) throw ApiError.notFound('Resident profile not found.');

    const { page = 1, limit = 20, status } = query;
    const { data, total } = await visitorRepo.findByResident(resident._id, { page, limit, status });

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

export const getVisitorById = async (id, userId) => {
    const visitor = await visitorRepo.findById(id);
    if (!visitor) throw ApiError.notFound('Visitor record not found.');

    const resident = await residentRepo.findByUserId(userId);
    const hostIdStr = visitor?.hostResidentId?._id ? visitor.hostResidentId._id.toString() : visitor?.hostResidentId?.toString();
    if (!resident || hostIdStr !== resident._id.toString()) {
        throw ApiError.forbidden('Access denied.');
    }
    return visitor;
};

export const cancelVisitorPass = async (id, userId) => {
    const visitor = await visitorRepo.findById(id);
    if (!visitor) throw ApiError.notFound('Visitor record not found.');

    const resident = await residentRepo.findByUserId(userId);
    const hostIdStr = visitor?.hostResidentId?._id ? visitor.hostResidentId._id.toString() : visitor?.hostResidentId?.toString();
    if (!resident || hostIdStr !== resident._id.toString()) {
        throw ApiError.forbidden('Access denied.');
    }
    if (!['PENDING', 'APPROVED'].includes(visitor.status)) {
        throw ApiError.badRequest(`Cannot cancel a visitor pass with status: ${visitor.status}`);
    }

    return visitorRepo.updateById(id, { status: 'CANCELLED' });
};

