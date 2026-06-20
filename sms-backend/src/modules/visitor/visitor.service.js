/**
 * visitor.service.js — Business logic for the Visitor module.
 */

import * as visitorRepo from './visitor.repository.js';
import * as residentRepo from '../resident/resident.repository.js';
import ApiError from '../../utils/ApiError.js';

// ── Resident — create visitor pass ────────────────────────────────────────────

export const createVisitorPass = async (userId, societyId, data) => {
    const resident = await residentRepo.findByUserId(userId);
    if (!resident) throw ApiError.notFound('Resident profile not found.');

    const visitor = await visitorRepo.create({
        ...data,
        societyId,
        hostResidentId: resident._id,
        hostUnitId: resident.unitId,
        status: 'PENDING',
    });

    return visitor;
};

// ── Resident — list own visitors ──────────────────────────────────────────────

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

// ── Resident — get single visitor ─────────────────────────────────────────────

export const getVisitorById = async (id, userId) => {
    const visitor = await visitorRepo.findById(id);
    if (!visitor) throw ApiError.notFound('Visitor record not found.');

    const resident = await residentRepo.findByUserId(userId);
    if (!resident || visitor.hostResidentId?.toString() !== resident._id.toString()) {
        throw ApiError.forbidden('Access denied.');
    }
    return visitor;
};

// ── Resident — cancel a visitor pass ──────────────────────────────────────────

export const cancelVisitorPass = async (id, userId) => {
    const visitor = await visitorRepo.findById(id);
    if (!visitor) throw ApiError.notFound('Visitor record not found.');

    const resident = await residentRepo.findByUserId(userId);
    if (!resident || visitor.hostResidentId?.toString() !== resident._id.toString()) {
        throw ApiError.forbidden('Access denied.');
    }
    if (!['PENDING', 'APPROVED'].includes(visitor.status)) {
        throw ApiError.badRequest(`Cannot cancel a visitor pass with status: ${visitor.status}`);
    }

    return visitorRepo.updateById(id, { status: 'CANCELLED' });
};
