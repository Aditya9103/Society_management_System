import IdCard from './idCard.model.js';

export const createIdCard = async (data) => {
    return IdCard.create(data);
};

export const findById = async (id) => {
    return IdCard.findById(id).populate('residentId').populate('userId').populate('societyId').populate('unitId');
};

export const findByResidentId = async (residentId) => {
    return IdCard.findOne({ residentId }).sort({ createdAt: -1 });
};

export const findByUserId = async (userId) => {
    return IdCard.findOne({ userId }).sort({ createdAt: -1 });
};

export const revokeIdCard = async (id) => {
    return IdCard.findByIdAndUpdate(id, { status: 'REVOKED' }, { new: true });
};

export const updateStatus = async (id, status) => {
    return IdCard.findByIdAndUpdate(id, { status }, { new: true });
};

export const updateIdCard = async (id, updateData) => {
    return await IdCard.findByIdAndUpdate(id, updateData, { new: true });
};

export const updateByResidentId = async (residentId, updateData) => {
    return await IdCard.findOneAndUpdate({ residentId }, updateData, { new: true, sort: { createdAt: -1 } });
};
