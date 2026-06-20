import Complaint from './complaint.model.js';

/**
 * complaint.repository.js — Data access layer for the Complaint module.
 */

export const create = (data) => Complaint.create(data);

export const findById = (id) =>
    Complaint.findById(id)
        .populate('raisedBy', 'residentCode unitId societyId userId')
        .populate('assignedTo', 'firstName lastName email role')
        .lean();

export const findByResident = async (residentId, { page = 1, limit = 20, status } = {}) => {
    const filter = { raisedBy: residentId };
    if (status) filter.status = status;

    const [data, total] = await Promise.all([
        Complaint.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean(),
        Complaint.countDocuments(filter),
    ]);
    return { data, total };
};

export const findBySociety = async (societyId, { page = 1, limit = 20, status, category, assignedTo } = {}) => {
    const filter = { societyId };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (assignedTo) filter.assignedTo = assignedTo;

    const [data, total] = await Promise.all([
        Complaint.find(filter)
            .populate('raisedBy', 'residentCode userId')
            .populate('assignedTo', 'firstName lastName role')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean(),
        Complaint.countDocuments(filter),
    ]);
    return { data, total };
};

export const updateById = (id, update) =>
    Complaint.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();

export const countBySociety = (filter) => Complaint.countDocuments(filter);
