import Emergency from './emergency.model.js';

export const create = (data) => Emergency.create(data);

export const findById = (id) => Emergency.findById(id)
    .populate('triggeredBy', 'firstName lastName residentCode phone profilePhotoUrl')
    .populate({
        path: 'locationUnitId',
        select: 'unitNumber towerId floorId',
        populate: [
            { path: 'towerId', select: 'name code' },
            { path: 'floorId', select: 'floorName' }
        ]
    })
    .populate('responders.userId', 'firstName lastName role phone profilePhotoUrl')
    .populate('resolvedBy', 'firstName lastName role')
    .populate('updates.authorId', 'firstName lastName role profilePhotoUrl')
    .lean();

export const findActiveBySociety = (societyId) => 
    Emergency.find({ 
        societyId, 
        status: { $in: ['ACTIVE', 'RESPONDING'] } 
    })
    .populate('triggeredBy', 'firstName lastName residentCode phone')
    .populate('locationUnitId', 'unitNumber')
    .populate('responders.userId', 'firstName lastName role')
    .sort({ createdAt: -1 })
    .lean();

export const updateById = (id, update) => 
    Emergency.findByIdAndUpdate(id, update, { new: true, runValidators: true })
        .populate('triggeredBy', 'firstName lastName residentCode phone')
        .populate({
            path: 'locationUnitId',
            select: 'unitNumber towerId',
            populate: { path: 'towerId', select: 'name code' }
        })
        .populate('responders.userId', 'firstName lastName role phone profilePhotoUrl')
        .populate('updates.authorId', 'firstName lastName role')
        .lean();

export const findAllBySociety = (filter = {}, opts = {}) => {
    const { skip = 0, limit = 50, sort = { createdAt: -1 } } = opts;
    return Emergency.find(filter)
        .populate('triggeredBy', 'firstName lastName residentCode phone profilePhotoUrl')
        .populate({
            path: 'locationUnitId',
            select: 'unitNumber towerId floorId',
            populate: [
                { path: 'towerId', select: 'name code' },
                { path: 'floorId', select: 'floorName' }
            ]
        })
        .populate('responders.userId', 'firstName lastName role phone profilePhotoUrl')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();
};

export const countDocuments = (filter = {}) => Emergency.countDocuments(filter);
