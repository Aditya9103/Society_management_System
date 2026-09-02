import Complaint from './complaint.model.js';
import ComplaintComment from './complaint.comment.model.js';

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

export const findBySociety = async (societyId, { page = 1, limit = 20, status, category, assignedTo, priority, search } = {}) => {
    const filter = { societyId };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (priority) filter.priority = priority;

    let [data, total] = await Promise.all([
        Complaint.find(filter)
            .populate({
                path: 'raisedBy',
                select: 'residentCode userId unitId',
                populate: [
                    { path: 'userId', select: 'firstName lastName email phone profilePhotoUrl' },
                    { path: 'unitId', select: 'unitNumber' }
                ]
            })
            .populate('assignedTo', 'firstName lastName role profilePhotoUrl')
            .sort({ createdAt: -1 })
            .lean(),
        Complaint.countDocuments(filter),
    ]);

    // Client-side filtering for search
    if (search) {
        data = data.filter(c => {
            const s = search.toLowerCase();
            const id = (c.complaintNumber || '').toLowerCase();
            const title = (c.title || '').toLowerCase();
            const name = `${c.raisedBy?.userId?.firstName || ''} ${c.raisedBy?.userId?.lastName || ''}`.toLowerCase();
            return id.includes(s) || title.includes(s) || name.includes(s);
        });
        total = data.length;
    }

    // Apply pagination after filtering
    const skip = (page - 1) * limit;
    data = data.slice(skip, skip + Number(limit));

    return { data, total };
};

export const findCommentsByComplaintId = (complaintId) =>
    ComplaintComment.find({ complaintId })
        .populate('authorId', 'firstName lastName role profilePhotoUrl')
        .sort({ createdAt: -1 })
        .lean();

export const updateById = (id, update) =>
    Complaint.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();

export const countBySociety = (filter) => Complaint.countDocuments(filter);

export const addComment = (complaintId, userId, { content, statusChangedFrom, statusChangedTo, isInternal = false }) =>
    ComplaintComment.create({
        complaintId,
        authorId: userId,
        commentText: content,
        isInternal,
        statusChangedFrom,
        statusChangedTo,
    });

export const deleteById = (id) => Complaint.findByIdAndDelete(id).lean();

export const deleteCommentsByComplaintId = (complaintId) => ComplaintComment.deleteMany({ complaintId });
