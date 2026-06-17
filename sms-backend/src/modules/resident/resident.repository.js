import Resident from './resident.model.js';

export const findByUserId = (userId) => {
    return Resident.findOne({ userId });
};

export const createResident = (data) => {
    return Resident.create(data);
};

export const updateResident = (id, updates) => {
    return Resident.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean();
};
