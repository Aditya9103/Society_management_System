import Emergency from './emergency.model.js';

export const create = (data) => Emergency.create(data);

export const findById = (id) => Emergency.findById(id)
    .populate('triggeredBy', 'firstName lastName residentCode phone')
    .populate('locationUnitId', 'unitNumber')
    .populate('responders.userId', 'firstName lastName role')
    .populate('resolvedBy', 'firstName lastName role')
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
        .populate('locationUnitId', 'unitNumber')
        .populate('responders.userId', 'firstName lastName role')
        .lean();
