import Visitor from './visitor.model.js';

/**
 * visitor.repository.js — Data access layer for the Visitor module.
 */

export const create = (data) => Visitor.create(data);

export const findById = (id) =>
    Visitor.findById(id)
        .populate('hostResidentId', 'residentCode unitId')
        .lean();

export const findByQrCode = (qrCode) => 
    Visitor.findOne({ qrCode })
        .populate('hostResidentId', 'residentCode unitId')
        .lean();

export const findByResident = async (hostResidentId, { page = 1, limit = 20, status } = {}) => {
    const filter = { hostResidentId };
    if (status) filter.status = status;

    const [data, total] = await Promise.all([
        Visitor.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean(),
        Visitor.countDocuments(filter),
    ]);
    return { data, total };
};

export const findBySociety = async (societyId, { page = 1, limit = 20, status } = {}) => {
    const filter = { societyId };
    if (status) filter.status = status;

    const [data, total] = await Promise.all([
        Visitor.find(filter)
            .populate('hostResidentId', 'residentCode')
            .populate('hostUnitId', 'unitNumber')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean(),
        Visitor.countDocuments(filter),
    ]);
    return { data, total };
};

export const updateById = (id, update) =>
    Visitor.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();
