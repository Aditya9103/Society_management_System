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

    const [data, total] = await Promise.all([
        Notice.find(filter)
            .populate('createdBy', 'firstName lastName role')
            .sort({ isPinned: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean(),
        Notice.countDocuments(filter),
    ]);
    return { data, total };
};

export const updateById = (id, update) =>
    Notice.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();
