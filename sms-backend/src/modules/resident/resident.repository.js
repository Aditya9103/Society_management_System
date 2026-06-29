import Resident from './resident.model.js';

export const findByUserId = (userId) => {
    return Resident.findOne({ userId });
};

export const findResidentsBySocietyId = (societyId) => {
    return Resident.find({ societyId });
};

export const findByUnitId = (unitId) => {
    return Resident.findOne({ unitId });
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

export const addEmergencyContact = (id, contact) =>
    Resident.findByIdAndUpdate(id, { $push: { emergencyContacts: contact } }, { new: true }).lean();

export const removeEmergencyContact = (id, contactId) =>
    Resident.findByIdAndUpdate(id, { $pull: { emergencyContacts: { _id: contactId } } }, { new: true }).lean();

export const updateEmergencyContact = (id, contactId, updates) =>
    Resident.findOneAndUpdate(
        { _id: id, 'emergencyContacts._id': contactId },
        { $set: Object.fromEntries(Object.entries(updates).map(([k, v]) => [`emergencyContacts.$.${k}`, v])) },
        { new: true }
    ).lean();
