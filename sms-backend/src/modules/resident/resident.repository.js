import Resident from './resident.model.js';

export const findByUserId = (userId) => {
    return Resident.findOne({ userId });
};

export const findById = (id) => Resident.findById(id);

export const createResident = (data) => {
    return Resident.create(data);
};

export const updateResident = (id, updates) => {
    return Resident.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean();
};

export const addFamilyMember = (id, member) =>
    Resident.findByIdAndUpdate(id, { $push: { familyMembers: member } }, { new: true }).lean();

export const removeFamilyMember = (id, memberId) =>
    Resident.findByIdAndUpdate(id, { $pull: { familyMembers: { _id: memberId } } }, { new: true }).lean();

export const updateFamilyMember = (id, memberId, updates) =>
    Resident.findOneAndUpdate(
        { _id: id, 'familyMembers._id': memberId },
        { $set: Object.fromEntries(Object.entries(updates).map(([k, v]) => [`familyMembers.$.${k}`, v])) },
        { new: true }
    ).lean();

