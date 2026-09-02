import Notice from './notice.model.js';

/**
 * notice.repository.js — Data access layer for the Notice module.
 */

export const create = (data) => Notice.create(data);

export const findById = (id) =>
    Notice.findById(id).populate('createdBy', 'firstName lastName').lean();

export const findPublished = async (societyId, { page = 1, limit = 20, noticeType } = {}) => {
    const filter = { societyId, status: 'PUBLISHED' };
    if (noticeType) filter.noticeType = noticeType;

    const [data, total] = await Promise.all([
        Notice.find(filter)
            .populate('createdBy', 'firstName lastName role')
            .sort({ isPinned: -1, publishedAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean(),
        Notice.countDocuments(filter),
    ]);
    return { data, total };
};

export const findBySociety = async (societyId, { page = 1, limit = 20, status, noticeType } = {}) => {
    const filter = { societyId };
    if (status) filter.status = status;
    if (noticeType) filter.noticeType = noticeType;

    const [data, total, statsResult] = await Promise.all([
        Notice.find(filter)
            .populate('createdBy', 'firstName lastName role')
            .sort({ isPinned: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean(),
        Notice.countDocuments(filter),
        Notice.aggregate([
            { $match: { societyId } },
            { $group: {
                _id: null,
                total: { $sum: 1 },
                published: { $sum: { $cond: [{ $eq: ["$status", "PUBLISHED"] }, 1, 0] } },
                scheduled: { $sum: { $cond: [{ $eq: ["$status", "SCHEDULED"] }, 1, 0] } },
                archived: { $sum: { $cond: [{ $eq: ["$status", "ARCHIVED"] }, 1, 0] } },
                drafts: { $sum: { $cond: [{ $eq: ["$status", "DRAFT"] }, 1, 0] } }
            }}
        ])
    ]);
    
    const stats = statsResult[0] || { total: 0, published: 0, scheduled: 0, archived: 0, drafts: 0 };
    delete stats._id;

    return { data, total, stats };
};

export const updateById = (id, update) =>
    Notice.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();
export const deleteById = (id) => Notice.findByIdAndDelete(id);
